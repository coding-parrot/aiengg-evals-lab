import test from 'node:test';
import assert from 'node:assert/strict';
import {build,notificationTime,suggestRoute,safeCsvCell} from './build-slack-dataset.mjs';
import {scrub} from './prepare-discussions.mjs';
const event={ts:'1794338343.262009',date:'2026-11-11',author:'Real Test Person',content:'<p>My video is not loading. Hi Real Test Person.</p>'};
test('notification timestamps retain all six fractional digits',()=>{
  assert.equal(notificationTime(event.ts),'2026-11-10T19:19:03.262009Z');
  assert.equal(notificationTime('1794338343.2'),'2026-11-10T19:19:03.200000Z');
  assert.throws(()=>notificationTime('yesterday'),/Invalid/);
});
test('all records and AI replies survive; fictional profiles are consistent',()=>{
  const result=build([event,{...event,ts:'1794338344.262009'},{...event,ts:'1794338345.262009',author:'AI Assistant'}]);
  assert.equal(result.records.length,3);assert.equal(result.profiles.length,2);
  assert.equal(result.records[0].profile_id,result.records[1].profile_id);
  assert.equal(result.records[0].duplicate_group,result.records[1].duplicate_group);
  assert.equal(result.records[2].message_kind,'ai_reply');
  assert.ok(result.records.every(r=>r.visibility==='unknown'&&r.expected_response===null));
  assert.ok(!JSON.stringify(result.records).includes('Real Test Person'));
  assert.ok(JSON.stringify(result.identityMap).includes('Real Test Person'));
  assert.throws(()=>build([event,event]),/Duplicate/);
});
test('redaction placeholders do not create false support routing',()=>{
  assert.equal(suggestRoute('[person or link removed] Why is a cache not persistent?'),'ai_tutor');
  assert.equal(suggestRoute('The course video is not loading.'),'customer_support');
  const result=build([event],{'SLK-00001':{route:'ai_tutor',secondary_route:'customer_support'}});
  assert.equal(result.records[0].route,'ai_tutor');assert.equal(result.records[0].route_review,'assistant_reviewed');
});
test('safe exports preserve programming comparisons and prevent spreadsheet formulas',()=>{
  assert.equal(scrub('if (a < b && b > c) Map<User,Amount>'), 'if (a < b && b > c) Map<User,Amount>');
  assert.equal(scrub('0  0  0  1, 2, 3'),'0 0 0 1, 2, 3');
  assert.equal(safeCsvCell('=1+1'),"'=1+1");assert.equal(safeCsvCell('  @SUM(A1)'),"'  @SUM(A1)");
  assert.equal(safeCsvCell('What is O(1)?'),'What is O(1)?');
});
