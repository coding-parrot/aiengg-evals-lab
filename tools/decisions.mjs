// Typed OpenAI Decisions adapter. This makes no claim about encoder architecture.
export function decisionRequest(state,questions,model='gpt-6-luna'){
  if(typeof state!=='string'||!state.trim())throw new Error('Decision evidence must be a nonempty string');
  const converted=Object.entries(questions).map(([name,q])=>{
    if(q.type==='noul')return {name,type:'predicate',instructions:q.instructions};
    if(q.type==='choice'&&q.criteria&&typeof q.criteria==='object'&&!Array.isArray(q.criteria))return {name,type:'choice',instructions:q.instructions,choices:Object.entries(q.criteria).map(([value,description])=>({value,description:String(description)}))};
    throw new Error('Adapter supports binary and categorical classroom rubrics; define ordered score mappings explicitly');
  });
  return {model,input:state,questions:converted};
}
export function decisionResult(result,questions){
  if(!Array.isArray(result.answers))throw new Error('Decision response is missing answers');
  const answers={};
  for(const [name,q]of Object.entries(questions)){
    const a=result.answers.find(a=>a.name===name);
    if(a?.type==='predicate'&&q.type==='noul'&&Number.isFinite(a.probability)&&a.probability>=0&&a.probability<=1)answers[name]={noul:a.probability};
    else if(a?.type==='choice'&&q.type==='choice'&&Object.hasOwn(q.criteria??{},a.choice))answers[name]={choice:a.choice,probabilities:a.probabilities??null,confidence:a.confidence??null};
    else answers[name]={unavailable:true,reason:a?.type==='refusal'?'judge_refusal':'missing_or_invalid_answer'};
  }
  return {answers,model:result.model,usage:result.usage??null,provider:'openai_decisions',raw_answers:result.answers};
}
