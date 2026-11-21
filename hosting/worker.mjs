// Cloudflare Worker adapter for the same frozen v0 prompt and source cards.
// Build embeds assets and Decisions mappings; runtime secrets never enter source.
import {HTML,PROMPT,CARDS} from './assets.mjs';
import {decisionRequest,decisionResult} from '../tools/decisions.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const fail=(status,message)=>Object.assign(new Error(message),{status});
function text(value,max){if(typeof value!=='string'||!value.trim()||new TextEncoder().encode(value).length>max)throw fail(400,'Invalid or oversized input');return value;}
async function relay(env,body){
  if(!env?.RELAY_URL||!env?.RELAY_PLATFORM_TOKEN||!env?.RELAY_SECRET)throw fail(503,'Relay configuration missing');
  const response=await fetch(env.RELAY_URL,{method:body?'POST':'GET',headers:{'OAI-Sites-Authorization':'Bearer '+env.RELAY_PLATFORM_TOKEN,'x-eval-relay-secret':env.RELAY_SECRET,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'manual',signal:AbortSignal.timeout(110000)});
  let data;try{data=await response.json();}catch{throw fail(502,'Model service unavailable');}
  if(!response.ok)throw fail(response.status===429?429:502,data.provider_code?'Provider error: '+data.provider_code:data.error??'Model service unavailable');
  return data;
}
async function generate(env,input,instructions){
  text(input,24000);text(instructions,8000);
  const result=await relay(env,{operation:'responses',input,instructions});
  const answer=(result.output??[]).filter(o=>o.type==='message').flatMap(o=>o.content??[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\n');
  if(!answer||result.status==='incomplete')throw fail(502,'Generation empty or incomplete');
  return {text:answer,model:result.model,usage:result.usage??null,id:result.id};
}
export default {async fetch(request,env){
  try{
    const route=new URL(request.url).pathname;
    if(request.method==='GET'&&route==='/')return new Response(HTML,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});
    if(route==='/health'&&request.method==='GET'){const status=await relay(env);return json({status:status.openai_configured&&status.database_configured?'ready':'unavailable',agent_model:status.agent_model,judge_model:status.judge_model});}
    const token=request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];
    if(!env.STUDENT_API_KEY||!token||await hash(token)!==await hash(env.STUDENT_API_KEY))throw fail(401,'Use the shared student API key');
    if(route==='/api/info'&&request.method==='GET'){
      const info=await relay(env);
      return json({access_mode:'shared_student_key',student:'shared-student-access',expires_at:null,calls:null,max_calls:20000,quota_scope:'class-wide durable relay quota',openai_model:info.agent_model,judge_provider:'openai_decisions',judge_model:info.judge_model});
    }
    if(request.method!=='POST'||!['/api/bot','/api/generate','/api/judge'].includes(route))throw fail(404,'Not found');
    const reader=request.body?.getReader();if(!reader)throw fail(400,'Missing body');const decoder=new TextDecoder();let raw='',bytes=0;
    while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>40000){await reader.cancel();throw fail(413,'Request too large');}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();
    let body;try{body=JSON.parse(raw);}catch{throw fail(400,'Invalid JSON');}
    if(!body||typeof body!=='object'||Array.isArray(body))throw fail(400,'Expected JSON object');
    if(route==='/api/generate')return json(await generate(env,body.input,body.instructions));
    if(route==='/api/judge'){
      text(body.state,24000);if(!body.questions||Array.isArray(body.questions)||Object.keys(body.questions).length<1||Object.keys(body.questions).length>12)throw fail(400,'Invalid questions');
      let typed;try{typed=decisionRequest(body.state,body.questions,env.JUDGE_MODEL||'gpt-6-luna');}catch{throw fail(400,'Invalid typed questions');}
      const result=await relay(env,{operation:'decisions',input:typed.input,questions:typed.questions});return json(decisionResult(result,body.questions));
    }
    const started=performance.now(),runStartedAt=new Date().toISOString(),query=text(body.query,6000),mode=body.scenario?.context_mode??'snapshot';
    let context;
    if(mode==='empty')context=[];
    else if(mode==='conflicting_fixture'&&Array.isArray(body.scenario.documents))context=body.scenario.documents;
    else if(mode==='snapshot'){
      const words=new Set(query.toLowerCase().match(/[a-z]{3,}/g)??[]);
      context=CARDS.map(c=>({c,n:[...words].filter(w=>c.text.toLowerCase().includes(w)).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,3).map(x=>x.c);
    }else throw fail(400,'Invalid classroom context mode');
    const prompt=body.system_prompt===undefined?PROMPT:text(body.system_prompt,8000);
    const result=await generate(env,JSON.stringify({query,brand:body.brand??'AIEngg',retrieved_context:context}),prompt);
    return json({query,answer:result.text,retrieved_context:context,citations:context.filter(c=>result.text.includes(`[${c.id}]`)).map(c=>({source_id:c.id,url:c.url})),tool_results:[],claims:[],faithfulness_status:'claim_extraction_required',storyflow_applicable:false,image_artifact:null,ttft_ms:null,total_latency_ms:performance.now()-started,cost_usd:null,usage:result.usage,model:result.model,agent_version:body.system_prompt===undefined?'v0':'v1_candidate',run_id:crypto.randomUUID(),run_started_at:runStartedAt,prompt_hash:await hash(prompt),source_snapshot_hash:await hash(JSON.stringify(context))});
  }catch(error){return json({error:error.status?error.message:'Lab service unavailable',kind:error.name},error.status??502);}
}};
