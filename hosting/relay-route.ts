// Isolated lab relay: reuses the existing server key without exporting it.
import { database, setting } from '@/lib/runtime-env';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
function callsPerMinute(){const value=Number(setting('AIENGG_EVAL_CALLS_PER_MINUTE')||1200);return Number.isInteger(value)&&value>0?Math.min(value,10000):1200;}
async function digest(value:string){return new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));}
async function authorized(request:Request){
  const expected=setting('AIENGG_EVAL_RELAY_SECRET');
  const supplied=request.headers.get('x-eval-relay-secret');
  if(!expected||!supplied)return false;
  const a=await digest(expected),b=await digest(supplied);let different=0;for(let i=0;i<a.length;i++)different|=a[i]^b[i];return different===0;
}
export async function GET(request:Request){
  if(!await authorized(request))return json({error:'Unauthorized'},401);
  return json({openai_configured:!!setting('OPENAI_API_KEY'),database_configured:!!database(),calls_per_minute:callsPerMinute(),agent_model:setting('AIENGG_EVAL_AGENT_MODEL')||'gpt-6-luna',judge_model:setting('AIENGG_EVAL_JUDGE_MODEL')||'gpt-6-luna'});
}
export async function POST(request:Request){
  if(!await authorized(request))return json({error:'Unauthorized'},401);
  if(setting('AIENGG_EVAL_PAUSED')==='true')return json({error:'Lab paused'},503);
  const key=setting('OPENAI_API_KEY'),db=database();if(!key||!db)return json({error:'Lab runtime unavailable'},503);
  let raw='';const reader=request.body?.getReader();if(!reader)return json({error:'Missing body'},400);
  const decoder=new TextDecoder();let size=0;
  while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>40000){await reader.cancel();return json({error:'Request too large'},413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();
  let input;try{input=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  const operation=input?.operation;let body:Record<string,unknown>|undefined;
  if(operation==='responses'){
    if(typeof input.input!=='string'||typeof input.instructions!=='string'||!input.input.trim()||input.instructions.length>8000||new TextEncoder().encode(input.input+input.instructions).length>24000)return json({error:'Invalid generation input'},400);
    body={model:setting('AIENGG_EVAL_AGENT_MODEL')||'gpt-6-luna',input:input.input,instructions:input.instructions,max_output_tokens:1200,store:false};
  }else if(operation==='decisions'){
    if(typeof input.input!=='string'||!Array.isArray(input.questions)||input.questions.length<1||input.questions.length>12||new TextEncoder().encode(JSON.stringify({input:input.input,questions:input.questions})).length>24000)return json({error:'Invalid judge input'},400);
    if(input.questions.some((q:Record<string,unknown>)=>!q||!['predicate','choice'].includes(String(q.type))||typeof q.instructions!=='string'))return json({error:'Invalid question'},400);
    body={model:setting('AIENGG_EVAL_JUDGE_MODEL')||'gpt-6-luna',input:input.input,questions:input.questions};
  }else if(operation!=='models')return json({error:'Unsupported operation'},400);
  let stage='quota';
  try{
    await db.prepare("INSERT OR IGNORE INTO aiengg_eval_usage (id,calls,minute,minute_calls) VALUES ('class',0,0,0)").run();
    const max=Math.max(1,Math.min(100000,Number(setting('AIENGG_EVAL_MAX_CALLS')||20000))),minute=Math.floor(Date.now()/60000);
    const reserved=await db.prepare("UPDATE aiengg_eval_usage SET calls=calls+1,minute_calls=CASE WHEN minute=? THEN minute_calls+1 ELSE 1 END,minute=? WHERE id='class' AND calls<? AND (minute<>? OR minute_calls<?) RETURNING calls").bind(minute,minute,max,minute,callsPerMinute()).first();
    if(!reserved){
      const usage=await db.prepare("SELECT calls FROM aiengg_eval_usage WHERE id='class'").first<{calls:number}>();
      if(usage&&usage.calls>=max)return json({error:'Class usage cap reached; contact the instructor',code:'cohort_quota_exhausted',retryable:false},429);
      const retryAfter=60-Math.floor(Date.now()/1000)%60;
      return Response.json({error:'Shared minute limit reached; retry shortly',code:'cohort_rate_limited',retryable:true,retry_after_seconds:retryAfter},{status:429,headers:{'Cache-Control':'no-store','Retry-After':String(retryAfter)}});
    }
    stage='provider';
    const response=await fetch('https://api.openai.com/v1/'+operation,{method:operation==='models'?'GET':'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'manual',signal:AbortSignal.timeout(90000)});
    if(!response.ok){let code=null;try{code=(await response.json() as {error?:{code?:string}}).error?.code??null;}catch{}return json({error:'OpenAI request failed',provider_status:response.status,provider_code:code},502);}
    return json(await response.json());
  }catch(error){return json({error:'Lab provider request failed',stage,kind:error instanceof Error?error.name:'unknown'},502);}
}
