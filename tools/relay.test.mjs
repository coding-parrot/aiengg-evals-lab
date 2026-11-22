import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';

test('hosted relay admits requests past 120 and enforces 1200 without resetting the lifetime cap',async()=>{
  const source=stripTypeScriptTypes(fs.readFileSync(new URL('../hosting/relay-route.ts',import.meta.url),'utf8')).replace("import { database, setting } from '@/lib/runtime-env';",'const {database,setting,fetch}=globalThis.__relayFixture;');
  let calls=121,minuteCalls=121,providerCalls=0,rate;
  const config={OPENAI_API_KEY:'fixture-key',AIENGG_EVAL_RELAY_SECRET:'fixture-relay'};
  const db={prepare(sql){let args;return {bind(...values){args=values;return this;},async run(){},async first(){
    if(sql.startsWith('SELECT'))return {calls};
    assert.match(sql,/minute_calls<\?/);rate=args[4];
    if(calls>=args[2]||minuteCalls>=rate)return null;
    calls++;minuteCalls++;return {calls};
  }};}};
  globalThis.__relayFixture={database:()=>db,setting:name=>config[name],fetch:async()=>{providerCalls++;return Response.json({ok:true});}};
  try{
    const relay=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
    const request=()=>new Request('https://relay.test',{method:'POST',headers:{'x-eval-relay-secret':'fixture-relay'},body:JSON.stringify({operation:'responses',input:'Question',instructions:'Tutor'})});
    assert.equal((await relay.POST(request())).status,200);assert.equal(rate,1200);
    minuteCalls=1199;assert.equal((await relay.POST(request())).status,200);
    const throttled=await relay.POST(request());assert.equal(throttled.status,429);assert.ok(Number(throttled.headers.get('Retry-After'))>0);assert.equal((await throttled.json()).retryable,true);
    calls=20000;minuteCalls=0;const capped=await relay.POST(request());assert.equal(capped.status,429);assert.equal((await capped.json()).code,'cohort_quota_exhausted');assert.equal(providerCalls,2);
    assert.equal((await (await relay.GET(new Request('https://relay.test',{headers:{'x-eval-relay-secret':'fixture-relay'}}))).json()).calls_per_minute,1200);
  }finally{delete globalThis.__relayFixture;}
});
