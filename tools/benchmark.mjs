// Real HTTP bot + real Jev. The IDE assistant builds the bot endpoint contract.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readJson,saveJson,toCsv} from './io.mjs';
import {checkResponse} from './checks.mjs';
import {scoreRun} from './jev.mjs';
const [datasetPath,outputDir,...flags]=process.argv.slice(2);
if(!datasetPath||!outputDir)throw new Error('Usage: node tools/benchmark.mjs dataset.json output-dir [--draft] [--smoke]');
if(!process.env.BOT_ENDPOINT)throw new Error('BOT_ENDPOINT must identify the actual built support agent');
if(!process.env.TYPESAFE_API_KEY||!process.env.JEV_MODEL)throw new Error('Set TYPESAFE_API_KEY and pinned JEV_MODEL');
const all=await readJson(datasetPath);const rows=flags.includes('--smoke')?all.slice(0,3):all;
if(!flags.includes('--draft')&&rows.some(r=>r.sme_status!=='approved'))throw new Error('Approve dataset first or explicitly use --draft for an unvalidated classroom run');
const definitions=await readJson(new URL('../config/judge-questions.json',import.meta.url));
const thresholds=process.env.JUDGE_CONFIG?await readJson(process.env.JUDGE_CONFIG):null;
if(!thresholds&&!flags.includes('--draft'))throw new Error('Set JUDGE_CONFIG to calibrated metric thresholds');
const fixtures=await readJson(new URL('../samples/context-overrides.json',import.meta.url));
await fs.mkdir(outputDir,{recursive:true});
const raw=[],scores=[];const experimentId=new Date().toISOString().replaceAll(':','-');
for(const row of rows){
  const started=performance.now();
  try{
    const headers={'Content-Type':'application/json'};if(process.env.BOT_API_KEY)headers.Authorization=`Bearer ${process.env.BOT_API_KEY}`;
    // No expected answer, SME label, source answer key or case ID enters the bot.
    const payload={query:row.query,brand:row.brand,scenario:{context_mode:row.context_mode??'snapshot'}};
    if(row.context_mode==='conflicting_fixture')payload.scenario.documents=fixtures.find(f=>f.case_id===row.case_id)?.documents??[];
    const response=await fetch(process.env.BOT_ENDPOINT,{method:'POST',headers,body:JSON.stringify(payload),signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw new Error(`Bot HTTP ${response.status}`);
    const run=await response.json();
    run.query=row.query;run.total_latency_ms=performance.now()-started;
    const code=checkResponse(run);
    run.reference_criteria={expected_response:row.expected_response,required_behaviors:row.required_behaviors};
    const judged=await scoreRun(run,definitions);
    raw.push({case_id:row.case_id,family_id:row.family_id,run,judged});
    const add=(metric,value,verdict,status)=>scores.push({experiment_id:experimentId,case_id:row.case_id,family_id:row.family_id,origin:row.origin,split:row.split,metric,value,verdict,status});
    for(const [key,value]of Object.entries(code))add(key,value.value,value.pass===null?'unavailable':value.pass?'pass':'fail',value.status);
    for(const record of judged.records)for(const [metric,answer]of Object.entries(record.result.answers)){
      const p=typeof answer.noul==='number'?answer.noul:null;
      const t=thresholds?.metrics?.[metric]?.threshold;
      add(metric,p??answer.choice,p!==null&&Number.isFinite(t)?(p>=t?'pass':'fail'):'unthresholded',`${record.scope}:${record.source_id??record.claim_id??'answer'}`);
    }
    if(!run.claims?.length)add('faithfulness',null,'unavailable','claim_extraction_missing');
    if(!run.retrieved_context?.length)add('context_relevance',null,'unavailable','no_context');
    add('image_quality',null,'unavailable',run.image_artifact?'vision_judge_required':'not_applicable');
    if(run.storyflow_applicable!==true)add('storyflow',null,'not_applicable','not_applicable');
  }catch(error){scores.push({experiment_id:experimentId,case_id:row.case_id,family_id:row.family_id,origin:row.origin,split:row.split,metric:'execution',value:0,verdict:'fail',status:error.message.replace(/Bearer\s+\S+/g,'Bearer [REDACTED]')});}
  // Persist each completed case. Interrupted runs keep evidence and can be resumed by the assistant.
  await saveJson(`${outputDir}/raw-runs.json`,raw);
  await fs.writeFile(`${outputDir}/eval-results.csv`,toCsv(scores));
  console.log(`${row.case_id}: recorded (${scores.filter(s=>s.case_id===row.case_id&&s.verdict==='fail').length} failures)`);
}
await saveJson(`${outputDir}/manifest.json`,{experimentId,datasetHash:createHash('sha256').update(JSON.stringify(rows)).digest('hex'),rowCount:rows.length,
  status:flags.includes('--draft')?'REAL_EXECUTION_UNVALIDATED_DATA_OR_THRESHOLDS':'REAL_EXECUTION',judgeModel:process.env.JEV_MODEL,judgeConfigPresent:!!thresholds,servingCost:'from_bot_usage',judgeCost:'usage_saved_in_raw_runs_price_separately'});
console.log('Saved actual bot and Jev outputs. Ask the assistant to generate the scorecard with applicability and family-balanced aggregation.');
