import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {Ledger,configuration,createGateway} from './cohort-server.mjs';
import {decisionRequest,decisionResult} from './decisions.mjs';

async function fixture(t,options={}){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aiengg-cohort-test-'));
  const ledger=new Ledger(dir),config={...configuration({OPENAI_API_KEY:'test-only-not-a-real-key'}),...options};
  const token=ledger.invite('student-test',new Date(Date.now()+60000).toISOString(),100);
  const calls=[];
  const fakeFetch=async(url,opts)=>{
    const body=JSON.parse(opts.body);calls.push({url,body,headers:opts.headers});
    if(options.fail)throw new Error('test-only-not-a-real-key should never reach a client');
    return {ok:true,json:async()=>url.endsWith('/decisions')?{model:'gpt-6-luna',answers:body.questions.map(q=>({name:q.name,type:'predicate',probability:0.9})),usage:{input_tokens:20}}:{model:'gpt-6-luna',status:'completed',output:[{type:'message',content:[{type:'output_text',text:'Please contact support. [S01]'}]}],usage:{input_tokens:10,output_tokens:8}}};
  };
  const server=createGateway({config,ledger,fetchImpl:fakeFetch,cards:[{id:'S01',text:'Support handles access issues.',url:'source://S01',citation_allowed:true}],prompt:'Exact starting prompt',html:'<!doctype html><title>Test lab</title>'});
  server.listen(0,'127.0.0.1');await once(server,'listening');const url='http://127.0.0.1:'+server.address().port;
  t.after(async()=>{server.closeAllConnections();await new Promise(r=>server.close(r));assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep+'aiengg-cohort-test-'));fs.rmSync(dir,{recursive:true});});
  const req=(route,body,auth=token)=>fetch(url+route,{method:body===undefined?'GET':'POST',headers:{...(auth?{Authorization:'Bearer '+auth}:{}),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
  return {dir,ledger,token,config,calls,req,url};
}
test('default configuration needs only OpenAI key; decision mappings preserve probabilities and refusals',()=>{
  assert.equal(configuration({OPENAI_API_KEY:'test'}).judgeProvider,'openai_decisions');
  const qs={faithfulness:{type:'noul',instructions:'Supported?'},flow:{type:'choice',instructions:'Rate',criteria:{0:'Poor',4:'Clear'}},missing:{type:'noul',instructions:'Missing?'}};
  const request=decisionRequest('Evidence',qs);assert.equal(request.questions[0].type,'predicate');assert.equal(request.questions[1].choices[1].value,'4');
  const result=decisionResult({answers:[{name:'faithfulness',type:'predicate',probability:0.8},{name:'flow',type:'refusal'}]},qs);
  assert.equal(result.answers.faithfulness.noul,0.8);assert.equal(result.answers.flow.reason,'judge_refusal');assert.equal(result.answers.missing.unavailable,true);
});
test('access control, expiry, revocation and private errors prevent unpaid/unauthorized calls',async t=>{
  const f=await fixture(t,{fail:true});
  assert.equal((await f.req('/api/bot',{query:'access'},null)).status,401);
  const r=await f.req('/api/bot',{query:'access'});assert.equal(r.status,502);assert.ok(!(await r.text()).includes('test-only'));
  f.ledger.student(f.token).revoked=true;assert.equal((await f.req('/api/info')).status,401);
  f.ledger.state.students[Object.keys(f.ledger.state.students)[0]].revoked=false;
  f.ledger.student(f.token).expiresAt='2000-01-01T00:00:00Z';assert.equal((await f.req('/api/info')).status,401);
  assert.equal(f.calls.length,1);
});
test('durable call caps and pause stop provider calls, including after ledger reload',async t=>{
  const f=await fixture(t,{maxCalls:1});
  assert.equal((await f.req('/api/bot',{query:'access'})).status,200);
  assert.equal((await f.req('/api/bot',{query:'access'})).status,429);
  const reload=new Ledger(f.dir);assert.equal(reload.state.total,1);assert.throws(()=>reload.reserve(f.token,f.config),/limit/);
  fs.writeFileSync(path.join(f.dir,'PAUSED'),'');assert.equal((await f.req('/api/bot',{query:'access'})).status,503);
  assert.equal(f.calls.length,1);
});
test('same server key powers bot and Decisions, with fixed provider URLs and no arbitrary tools',async t=>{
  const f=await fixture(t);
  const r=await f.req('/api/bot',{query:'access',model:'expensive-model',url:'https://example.invalid',api_key:'student-supplied',tools:[{}]});
  const run=await r.json();assert.equal(run.cost_usd,null);assert.equal(run.citations[0].source_id,'S01');
  assert.equal(f.calls[0].body.instructions,'Exact starting prompt');assert.equal(f.calls[0].body.model,'gpt-6-luna');assert.equal(f.calls[0].body.tools,undefined);
  const j=await f.req('/api/judge',{state:'Actual response',questions:{relevance:{type:'noul',instructions:'Relevant?'}}});
  assert.equal((await j.json()).answers.relevance.noul,0.9);
  assert.deepEqual(f.calls.map(c=>c.url),['https://api.openai.com/v1/responses','https://api.openai.com/v1/decisions']);
  assert.equal(f.calls[0].headers.Authorization,f.calls[1].headers.Authorization);
  assert.ok(!JSON.stringify(run).includes('test-only'));
  assert.equal((await f.req('/api/generate',{input:'x'.repeat(25000),instructions:'hi'})).status,400);
  assert.equal(f.calls.length,2);
});
test('rate limit and custom prompt apply without changing retrieved context',async t=>{
  const f=await fixture(t,{perMinute:2});
  const a=await (await f.req('/api/bot',{query:'access'})).json();
  const b=await (await f.req('/api/bot',{query:'access',system_prompt:'Improved prompt'})).json();
  assert.deepEqual(a.retrieved_context,b.retrieved_context);assert.notEqual(a.prompt_hash,b.prompt_hash);
  assert.equal((await f.req('/api/bot',{query:'access'})).status,429);assert.equal(f.calls.length,2);
});
test('one shared student key opens v0 and judging without an invitation; limits remain global',async t=>{
  const key='test_student_shared_access_123456';
  const f=await fixture(t,{studentKey:key,maxCalls:2});
  assert.equal((await f.req('/api/info')).status,401,'old individual invitation must not bypass shared-key mode');
  const info=await (await f.req('/api/info',undefined,key)).json();
  assert.equal(info.access_mode,'shared_student_key');assert.equal(info.max_calls,2);
  assert.ok(!JSON.stringify(info).includes(key));
  assert.equal((await f.req('/api/bot',{query:'access'},key)).status,200);
  const judge=await f.req('/api/judge',{state:'Actual answer',questions:{quality:{type:'noul',instructions:'Helpful?'}}},key);
  assert.equal((await judge.json()).answers.quality.noul,0.9);
  assert.equal((await f.req('/api/bot',{query:'access'},key)).status,429);
  assert.equal(f.calls.length,2);assert.equal(new Ledger(f.dir).state.total,2);
});
test('benchmark smoke path works with classroom access only and actual adapter shapes',async t=>{
  const f=await fixture(t);const output=path.join(f.dir,'results');
  const env={...process.env,COHORT_URL:f.url,COHORT_ACCESS_TOKEN:f.token};
  for(const k of ['OPENAI_API_KEY','TYPESAFE_API_KEY','JEV_MODEL','BOT_ENDPOINT','JUDGE_CONFIG','COHORT_PROMPT_FILE'])delete env[k];
  const child=spawn(process.execPath,['tools/benchmark.mjs','samples/benchmark.draft.json',output,'--draft','--smoke'],{env,stdio:['ignore','pipe','pipe']});
  let errors='';child.stderr.on('data',x=>errors+=x);child.stdout.resume();const [code]=await once(child,'exit');assert.equal(code,0,errors);
  const manifest=JSON.parse(fs.readFileSync(path.join(output,'manifest.json'),'utf8'));assert.equal(manifest.judgeProvider,'openai_decisions');assert.equal(manifest.rowCount,3);
  const raw=JSON.parse(fs.readFileSync(path.join(output,'raw-runs.json'),'utf8'));assert.equal(raw.length,3);assert.ok(raw.every(r=>r.judged.records[0].result.provider==='openai_decisions'));
});
