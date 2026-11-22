import test from 'node:test';
import assert from 'node:assert/strict';
import {cohortJson} from './cohort-http.mjs';
const limited=(retryable=true)=>Response.json({code:retryable?'cohort_rate_limited':'cohort_quota_exhausted',retryable},{status:429,headers:{'Retry-After':'2'}});
test('temporary 429 waits for Retry-After and retries the identical request',async()=>{
  const waits=[],requests=[];
  const result=await cohortJson('https://lab.test/api/judge',{method:'POST',body:'same request'},{fetchImpl:async(url,options)=>{requests.push({url,body:options.body});return requests.length===1?limited():Response.json({score:1});},sleep:async ms=>waits.push(ms),random:()=>0});
  assert.deepEqual(result,{score:1});assert.deepEqual(waits,[2000]);assert.deepEqual(requests[0],requests[1]);
});
test('quota exhaustion and ambiguous provider failures never replay a paid call',async()=>{
  for(const response of [limited(false),Response.json({error:'Provider failed'},{status:502})]){
    let calls=0;await assert.rejects(cohortJson('https://lab.test',{}, {fetchImpl:async()=>{calls++;return response;}}),/Cohort HTTP/);assert.equal(calls,1);
  }
});
test('retry budget is bounded even under sustained throttling',async()=>{
  let calls=0;await assert.rejects(cohortJson('https://lab.test',{}, {fetchImpl:async()=>{calls++;return limited();},sleep:async()=>{},random:()=>0}),/Temporary rate limit/);assert.equal(calls,4);
});
