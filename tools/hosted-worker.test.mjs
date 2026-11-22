import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('public adapter forwards retry timing and exposes the active shared limit',async()=>{
  let result=Response.json({error:'Busy',code:'cohort_rate_limited',retryable:true},{status:429,headers:{'Retry-After':'12'}});
  globalThis.__workerFetch=async()=>result;
  try{
    const source='const fetch=globalThis.__workerFetch;\n'+fs.readFileSync(new URL('../hosting/worker.mjs',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
    const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
    const env={STUDENT_API_KEY:'fixture',RELAY_URL:'https://relay.test',RELAY_PLATFORM_TOKEN:'fixture',RELAY_SECRET:'fixture'};
    const request=()=>new Request('https://lab.test/api/info',{headers:{Authorization:'Bearer fixture'}});
    const response=await worker.fetch(request(),env);
    assert.equal(response.status,429);assert.equal(response.headers.get('Retry-After'),'12');assert.equal((await response.json()).retryable,true);
    result=Response.json({calls_per_minute:1200});
    const info=await (await worker.fetch(request(),env)).json();assert.equal(info.calls_per_minute,1200);assert.equal(info.max_calls,20000);
    result=Response.json({error:'Cap reached',code:'cohort_quota_exhausted',retryable:false},{status:429});
    const exhausted=await worker.fetch(request(),env);assert.equal(exhausted.headers.get('Retry-After'),null);assert.equal((await exhausted.json()).retryable,false);
  }finally{delete globalThis.__workerFetch;}
});
