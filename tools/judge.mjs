import {readJson,saveJson} from './io.mjs';
import {pathToFileURL} from 'node:url';
import {cohortCall} from './env.mjs';
import {decisionRequest,decisionResult} from './decisions.mjs';

export async function callJudge(state,questions,options={}){
  const provider=process.env.JUDGE_PROVIDER??'openai_decisions';
  if(!process.env.COHORT_URL&&provider==='openai_decisions'){
    if(!process.env.OPENAI_API_KEY)throw new Error('Use your instructor invitation or configure OPENAI_API_KEY locally');
    const body=decisionRequest(state,questions,process.env.DECISIONS_MODEL??'gpt-6-luna');
    const response=await fetch('https://api.openai.com/v1/decisions',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(options.timeoutMs??60000)});
    if(!response.ok)throw new Error('OpenAI Decisions HTTP '+response.status);
    return decisionResult(await response.json(),questions);
  }
  if(!process.env.COHORT_URL&&provider!=='jev')throw new Error('Unsupported JUDGE_PROVIDER');
  if(process.env.COHORT_URL)return cohortCall('/api/judge',{state,questions});
  const key=process.env.TYPESAFE_API_KEY;
  if(!key)throw new Error('Set TYPESAFE_API_KEY securely in the environment');
  const model=process.env.JEV_MODEL;
  if(!model)throw new Error('Set JEV_MODEL to the version selected for this experiment');
  const response=await fetch('https://api.typesafe.ai/v1/systemone',{
    method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({model,state,questions}),signal:AbortSignal.timeout(options.timeoutMs??60000)
  });
  if(!response.ok)throw new Error(`Jev HTTP ${response.status}`);
  const result=await response.json();
  if(!result.answers)throw new Error('Jev response is missing answers');
  return result;
}

export async function scoreRun(run,definitions){
  const state=JSON.stringify({query:run.query,answer:run.answer,context:run.retrieved_context??[],tool_results:run.tool_results??[],reference_criteria:run.reference_criteria??null});
  const selected={};
  for(const key of ['answer_relevance','polite_tone'])selected[key]=definitions.questions[key];
  if(run.storyflow_applicable===true)selected.storyflow=definitions.questions.storyflow;
  const root=await callJudge(state,selected);
  const records=[{scope:'answer',result:root}];
  for(const chunk of run.retrieved_context??[]){
    records.push({scope:'context',source_id:chunk.id,result:await callJudge(JSON.stringify({query:run.query,chunk}),{context_relevance:definitions.questions.context_relevance})});
  }
  // Claim extraction belongs to the agent harness and must cover the entire answer.
  // Missing claim extraction is unscored, never automatically faithful.
  for(const claim of run.claims??[]){
    records.push({scope:'claim',claim_id:claim.id,result:await callJudge(JSON.stringify({claim:claim.text,evidence:run.retrieved_context??[],tool_results:run.tool_results??[]}),{claim_supported:definitions.questions.claim_supported})});
    if(claim.source_ids?.length){
      const cited=(run.retrieved_context??[]).filter(s=>claim.source_ids.includes(s.id));
      records.push({scope:'citation',claim_id:claim.id,result:await callJudge(JSON.stringify({claim:claim.text,cited_evidence:cited}),{citation_support:definitions.questions.citation_support})});
    }
  }
  return {records,faithfulness_status:run.claims?.length?'scored_claims_require_coverage_check':'unavailable',image_quality_status:'use_separate_vision_judge',model_versions:[...new Set(records.map(r=>r.result.model))]};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [runPath,outputPath]=process.argv.slice(2);
  if(!runPath||!outputPath)throw new Error('Usage: node tools/judge.mjs response.json scores.json');
  const definitions=await readJson(new URL('../config/judge-questions.json',import.meta.url));
  await saveJson(outputPath,await scoreRun(await readJson(runPath),definitions));
  console.log(`Saved real typed judge results to ${outputPath}`);
}
