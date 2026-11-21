// Single-instance classroom gateway. Persist the state directory on durable storage.
import './env.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {decisionRequest,decisionResult} from './decisions.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=s=>createHash('sha256').update(s).digest('hex');
const fail=(status,message)=>Object.assign(new Error(message),{status});
function integer(value,fallback){const n=Number(value??fallback);if(!Number.isSafeInteger(n)||n<1)throw new Error('Limits must be positive integers');return n;}
export function configuration(env=process.env){
  if(env.STUDENT_API_KEY&&!/^[A-Za-z0-9_-]{24,200}$/.test(env.STUDENT_API_KEY))throw new Error('STUDENT_API_KEY must contain 24–200 letters, digits, underscores or hyphens');
  const judgeProvider=env.JUDGE_PROVIDER??'openai_decisions';
  if(!['openai_decisions','jev'].includes(judgeProvider))throw new Error('Unsupported JUDGE_PROVIDER');
  const required=judgeProvider==='jev'?['OPENAI_API_KEY','TYPESAFE_API_KEY','JEV_MODEL']:['OPENAI_API_KEY'];
  for(const key of required)if(!env[key])throw new Error(`Instructor must configure ${key}`);
  const openaiModel=env.OPENAI_MODEL||'gpt-6-luna',judgeModel=judgeProvider==='jev'?env.JEV_MODEL:env.DECISIONS_MODEL||'gpt-6-luna';
  if(/latest/i.test(openaiModel+' '+judgeModel))throw new Error('Avoid moving latest aliases; record resolved versions');
  return {studentKey:env.STUDENT_API_KEY||null,openaiKey:env.OPENAI_API_KEY,jevKey:env.TYPESAFE_API_KEY,openaiModel,judgeProvider,judgeModel,maxCalls:integer(env.COHORT_MAX_CALLS,20000),studentCalls:integer(env.COHORT_STUDENT_MAX_CALLS,5000),maxInputBytes:integer(env.COHORT_MAX_INPUT_BYTES,24000),maxOutput:integer(env.COHORT_MAX_OUTPUT_TOKENS,1200),concurrency:integer(env.COHORT_CONCURRENCY,4),perMinute:integer(env.COHORT_CALLS_PER_MINUTE,120),inputPrice:env.OPENAI_INPUT_USD_PER_MILLION||undefined,outputPrice:env.OPENAI_OUTPUT_USD_PER_MILLION||undefined};
}
export class Ledger{
  constructor(dir){
    this.dir=dir;fs.mkdirSync(dir,{recursive:true,mode:0o700});this.file=path.join(dir,'ledger.private.json');
    this.state=fs.existsSync(this.file)?JSON.parse(fs.readFileSync(this.file,'utf8')):{total:0,students:{}};
  }
  save(){const temp=this.file+'.tmp';fs.writeFileSync(temp,JSON.stringify(this.state),{mode:0o600});fs.renameSync(temp,this.file);}
  invite(id,expiresAt,maxCalls){
    if(!/^[a-zA-Z0-9_-]{1,60}$/.test(id)||!Number.isFinite(Date.parse(expiresAt))||Date.parse(expiresAt)<=Date.now())throw new Error('Use a pseudonymous ID and a future expiry');
    if(Object.values(this.state.students).some(s=>s.id===id))throw new Error('Student ID exists; revoke it before creating a new ID');
    const token=randomBytes(32).toString('base64url');
    this.state.students[hash(token)]={id,expiresAt,maxCalls:integer(maxCalls,5000),calls:0,revoked:false};this.save();return token;
  }
  student(token){const s=typeof token==='string'?this.state.students[hash(token)]:null;if(!s||s.revoked||Date.parse(s.expiresAt)<=Date.now())throw fail(401,'Invalid or expired classroom access');return s;}
  reserve(token,cfg){
    if(fs.existsSync(path.join(this.dir,'PAUSED')))throw fail(503,'Classroom calls paused');
    const s=this.student(token);
    if(this.state.total>=cfg.maxCalls||s.calls>=Math.min(s.maxCalls,cfg.studentCalls))throw fail(429,'Classroom call limit reached');
    // Synchronous reservation is durable before the paid request; failed calls count too.
    s.calls++;this.state.total++;this.save();return s;
  }
}
function asText(value,name,max){if(typeof value!=='string'||!value.trim()||Buffer.byteLength(value)>max)throw fail(400,`Invalid ${name}`);return value;}
function validateJudge(body,cfg){
  const state=asText(body.state,'state',cfg.maxInputBytes);
  const questions=body.questions;
  if(!questions||Array.isArray(questions)||typeof questions!=='object'||Object.keys(questions).length<1||Object.keys(questions).length>12)throw fail(400,'Use 1–12 typed questions');
  for(const q of Object.values(questions))if(!q||!['noul','choice'].includes(q.type)||typeof q.instructions!=='string'||!q.instructions.trim())throw fail(400,'Unsupported text question definition');
  if(Buffer.byteLength(JSON.stringify({state,questions}))>cfg.maxInputBytes)throw fail(413,'Judge input too large');
  return {state,questions};
}
function outputText(result){return (result.output??[]).filter(o=>o.type==='message').flatMap(o=>o.content??[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\n');}
export function createGateway({config,ledger,fetchImpl=fetch,cards,prompt,html}){
  if(config.studentKey){
    const id=hash(config.studentKey);
    ledger.state.students[id]={id:'shared-student-access',expiresAt:'9999-12-31T23:59:59Z',maxCalls:config.maxCalls,calls:ledger.state.students[id]?.calls??0,revoked:false};ledger.save();
  }
  const quotaConfig=config.studentKey?{...config,studentCalls:config.maxCalls}:config;
  let active=0;const windows=new Map();
  const upstream=async(token,url,key,body)=>{
    const minute=Math.floor(Date.now()/60000),id=hash(token),w=windows.get(id);
    if(w?.minute===minute&&w.count>=config.perMinute)throw fail(429,'Classroom rate limit reached');
    if(active>=config.concurrency)throw fail(429,'Classroom busy; retry later');
    ledger.reserve(token,quotaConfig);windows.set(id,{minute,count:w?.minute===minute?w.count+1:1});active++;
    try{
      const response=await fetchImpl(url,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(90000)});
      if(!response.ok)throw fail(502,`Provider returned HTTP ${response.status}; instructor should check billing and models`);
      return await response.json();
    }catch(e){if(e.status)throw e;throw fail(502,'Provider request failed');}finally{active--;}
  };
  const generate=async(token,input,instructions)=>{
    asText(input,'input',config.maxInputBytes);asText(instructions,'instructions',8000);
    if(Buffer.byteLength(input+instructions)>config.maxInputBytes)throw fail(413,'Generation input too large');
    const result=await upstream(token,'https://api.openai.com/v1/responses',config.openaiKey,{model:config.openaiModel,instructions,input,max_output_tokens:config.maxOutput,store:false});
    const text=outputText(result);if(!text||result.status==='incomplete')throw fail(502,'Generation empty or incomplete; review output limit');
    return {text,model:result.model,usage:result.usage??null,id:result.id};
  };
  const retrieve=query=>{const words=new Set(query.toLowerCase().match(/[a-z]{3,}/g)??[]);return cards.map(c=>({c,n:[...words].filter(w=>c.text.toLowerCase().includes(w)).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,3).map(x=>x.c);};
  const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  return http.createServer(async(req,res)=>{
    try{
      const route=new URL(req.url,'http://localhost').pathname;
      if(req.method==='GET'&&route==='/health'){send(res,200,{status:'ready'});return;}
      if(req.method==='GET'&&route==='/'){
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"});res.end(html);return;
      }
      if(!['/api/info','/api/generate','/api/judge','/api/bot'].includes(route))throw fail(404,'Not found');
      const token=req.headers.authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];
      if(config.studentKey&&(!token||hash(token)!==hash(config.studentKey)))throw fail(401,'Enter the shared student API key');
      const student=ledger.student(token);
      if(req.method==='GET'&&route==='/api/info'){send(res,200,{access_mode:config.studentKey?'shared_student_key':'individual_invite',student:student.id,expires_at:config.studentKey?null:student.expiresAt,calls:config.studentKey?ledger.state.total:student.calls,max_calls:Math.min(student.maxCalls,quotaConfig.studentCalls),openai_model:config.openaiModel,judge_provider:config.judgeProvider,judge_model:config.judgeModel});return;}
      if(req.method!=='POST'||route==='/api/info')throw fail(405,'Method not allowed');
      const chunks=[];let bytes=0;
      for await(const chunk of req){bytes+=chunk.length;if(bytes>config.maxInputBytes+16000)throw fail(413,'Request too large');chunks.push(chunk);}
      let body;try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{throw fail(400,'Invalid JSON');}
      if(!body||Array.isArray(body)||typeof body!=='object')throw fail(400,'Expected object');
      if(route==='/api/generate'){send(res,200,await generate(token,body.input,body.instructions));return;}
      if(route==='/api/judge'){
        const data=validateJudge(body,config);let result;
        if(config.judgeProvider==='openai_decisions'){
          let request;try{request=decisionRequest(data.state,data.questions,config.judgeModel);}catch{throw fail(400,'Invalid typed judge questions');}
          result=decisionResult(await upstream(token,'https://api.openai.com/v1/decisions',config.openaiKey,request),data.questions);
        }else result=await upstream(token,'https://api.typesafe.ai/v1/systemone',config.jevKey,{model:config.judgeModel,...data});
        if(!result.answers)throw fail(502,'Judge response lacks answers');
        send(res,200,result);return;
      }
      const start=performance.now(),startedAt=new Date().toISOString(),query=asText(body.query,'query',6000);
      const mode=body.scenario?.context_mode??'snapshot';let context;
      if(mode==='empty')context=[];
      else if(mode==='snapshot')context=retrieve(query);
      else if(mode==='conflicting_fixture'&&Array.isArray(body.scenario.documents))context=body.scenario.documents;
      else throw fail(400,'Invalid classroom context mode');
      const instructions=body.system_prompt===undefined?prompt:asText(body.system_prompt,'system_prompt',8000);
      const result=await generate(token,JSON.stringify({query,brand:body.brand??'AIEngg',retrieved_context:context}),instructions);
      const citations=context.filter(c=>result.text.includes(`[${c.id}]`)).map(c=>({source_id:c.id,url:c.url}));
      const a=Number(config.inputPrice),b=Number(config.outputPrice);
      const cost=config.inputPrice!==undefined&&config.outputPrice!==undefined&&Number.isFinite(a)&&Number.isFinite(b)&&a>=0&&b>=0&&Number.isFinite(result.usage?.input_tokens)&&Number.isFinite(result.usage?.output_tokens)?(result.usage.input_tokens*a+result.usage.output_tokens*b)/1e6:null;
      send(res,200,{query,answer:result.text,retrieved_context:context,citations,tool_results:[],claims:[],faithfulness_status:'claim_extraction_required',storyflow_applicable:false,image_artifact:null,ttft_ms:null,total_latency_ms:performance.now()-start,cost_usd:cost,usage:result.usage,model:result.model,agent_version:body.system_prompt===undefined?'v0':'v1_candidate',run_id:randomBytes(12).toString('hex'),run_started_at:startedAt,prompt_hash:hash(instructions),source_snapshot_hash:hash(JSON.stringify(context))});
    }catch(e){send(res,e.status??500,{error:e.status?e.message:'Classroom service error'});}
  });
}
export function start(){
  const config=configuration();const dir=path.resolve(process.env.COHORT_STATE_DIR??'private-data/cohort-state');
  if(!config.studentKey&&process.env.COHORT_INDIVIDUAL_INVITES!=='true')throw new Error('Set STUDENT_API_KEY to the shared student key. Individual invitations are optional and require COHORT_INDIVIDUAL_INVITES=true.');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'config/v0-manifest.json'),'utf8'));
  for(const [file,expected]of Object.entries(manifest.frozen_inputs))if(hash(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'))!==expected)throw new Error('Packaged v0 input changed; restore it and use a separate improved prompt for v1');
  fs.mkdirSync(dir,{recursive:true});
  // A second process could race the file ledger. Refuse it; deploy one replica.
  const lock=path.join(dir,'server.lock');const fd=fs.openSync(lock,'wx');fs.writeFileSync(fd,String(process.pid));fs.closeSync(fd);
  const cleanup=()=>{try{fs.unlinkSync(lock);}catch{}};process.on('exit',cleanup);
  const server=createGateway({config,ledger:new Ledger(dir),cards:JSON.parse(fs.readFileSync(path.join(root,'samples/sanitized-source-cards.json'),'utf8')),prompt:fs.readFileSync(path.join(root,'prompts/support-starting-system.txt'),'utf8').replace(/\r\n/g,'\n'),html:fs.readFileSync(path.join(root,'cohort.html'),'utf8')});
  server.requestTimeout=120000;server.headersTimeout=15000;
  server.on('error',()=>{console.error('Unable to start cohort server');process.exitCode=1;cleanup();});
  server.listen(Number(process.env.PORT??8787),process.env.HOST??'127.0.0.1',()=>console.log('Cohort server ready; provider keys remain server-side.'));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
  return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)start();
