import test from 'node:test';
import assert from 'node:assert/strict';
import {checkResponse,sentenceCount} from './checks.mjs';
import {calibrate} from './calibrate.mjs';
import {toCsv,parseCsv} from './io.mjs';

const response={answer:'Please check the course dashboard. [S01]',citations:[{source_id:'S01'}],retrieved_context:[{id:'S01',citation_allowed:true}],ttft_ms:100,total_latency_ms:1000,cost_usd:0.001};
test('valid rendered citation; missing, forged and hidden citations fail',()=>{
 assert.equal(checkResponse(response).citation_validity.pass,true);
 for(const change of [{answer:'No source.'},{citations:[]},{citations:[{source_id:'S99'}]},{retrieved_context:[{id:'S01',citation_allowed:false}]}])assert.equal(checkResponse({...response,...change}).citation_validity.pass,false);
});
test('20 sentences pass; 21 fail; bare bullet fragments count',()=>{
 assert.equal(checkResponse({...response,answer:'A useful answer. '.repeat(20)}).sentence_limit.pass,true);
 assert.equal(checkResponse({...response,answer:'A useful answer. '.repeat(21)}).sentence_limit.pass,false);
 assert.equal(sentenceCount('- Check access\n- Check purchase\n- Contact support'),3);
 assert.equal(sentenceCount('Read [this source](https://example.com/a.b). [S01]'),1);
});
test('unknown cost and latency are unavailable rather than zero',()=>{
 const c=checkResponse({answer:'Hello',citations:[]});assert.equal(c.serving_cost_usd.pass,null);assert.equal(c.ttft_ms.value,null);
});
test('CSV handles comma, quote and newlines',()=>{
 const rows=[{a:'Hello, "world"',b:'line 1\nline 2'}];assert.deepEqual(parseCsv(toCsv(rows)),rows);
});
const labels=[['A','calibration',0,.7],['A','calibration',1,.9],['B','validation',0,.6],['B','validation',1,.8]].map(([family_id,split,human_label,p_pass])=>({family_id,split,human_label,p_pass,human_reviewer:'test fixture',metric:'faithfulness'}));
test('calibration threshold ignores validation labels',()=>{
 const a=calibrate(labels);const b=calibrate(labels.map(r=>r.split==='validation'?{...r,human_label:1-r.human_label}:r));
 assert.equal(a.metrics.faithfulness.threshold,b.metrics.faithfulness.threshold);
});
test('calibration rejects missing SME labels and family leakage',()=>{
 assert.throws(()=>calibrate(labels.map((r,i)=>i===0?{...r,human_label:''}:r)));
 assert.throws(()=>calibrate(labels.map(r=>({...r,family_id:'SAME'}))));
});
