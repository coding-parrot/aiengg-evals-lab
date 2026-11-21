import test from 'node:test';
import assert from 'node:assert/strict';
import {prepare,scrub} from './prepare-discussions.mjs';
const row = {id:'raw-1',parent_id:null,author_id:'person-1',author_display_name:'Real Test Person',author_role:'learner',created_at:'2026-11-01T10:30:00Z',is_hidden:false,body:'Why does a cache need a database?'};
test('all visibility states and parent/family relationships survive preparation',()=>{
  const result=prepare([row,{...row,id:'raw-2',parent_id:'raw-1',is_hidden:true,author_role:'ai'},{...row,id:'raw-3',is_hidden:null}]);
  assert.equal(result.candidates.length,3);
  assert.deepEqual(result.candidates.map(r=>r.visibility),['visible','hidden','unknown']);
  assert.equal(result.candidates[1].parent_id,result.candidates[0].record_id);
  assert.equal(result.candidates[1].family_id,result.candidates[0].family_id);
  assert.equal(result.candidates[1].message_kind,'ai_reply');
  assert.ok(result.candidates.every(r=>r.privacy_review==='pending'&&r.expected_response===null));
});
test('PII patterns and HTML mentions are removed; fictional identity is consistent',()=>{
  const body='Real Test Person &lt;a data-userid="9"&gt;Another Person&lt;/a&gt; test@example.com +1 (212) 555-0199 https://example.com/private/42 account_id=secret123 192.168.1.2';
  const result=prepare([{...row,body},{...row,id:'raw-2',body}]);
  const publicText=JSON.stringify({candidates:result.candidates,profiles:result.profiles});
  for(const token of ['Real Test Person','Another Person','test@example.com','212','secret123','192.168.1.2','raw-1','person-1'])assert.ok(!publicText.includes(token),token);
  assert.equal(result.profiles.length,1);
  assert.ok(result.profiles[0].email.endsWith('@example.invalid'));
  assert.equal(scrub('What is O(1)? 319 / 215 = 2.552'), 'What is O(1)? 319 / 215 = 2.552');
});
test('incomplete exports and bad visibility cannot masquerade as complete imports',()=>{
  assert.throws(()=>prepare([row,row]),/duplicate/);
  assert.throws(()=>prepare([{...row,parent_id:'missing'}]),/coverage/);
  assert.throws(()=>prepare([{...row,is_hidden:'false'}]),/is_hidden/);
  assert.throws(()=>prepare([{...row,parent_id:'raw-1'}]),/Cyclic/);
  assert.throws(()=>prepare([{...row,is_hidden:undefined}]),/is_hidden/);
});
test('unidentified authors are not merged by matching display names',()=>{
  const result=prepare([{...row,author_id:null},{...row,id:'raw-2',author_id:null}]);
  assert.equal(result.profiles.length,2);
});
