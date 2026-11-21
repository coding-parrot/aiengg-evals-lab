import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseCsv} from './io.mjs';
import {tutorCandidate} from './tutor-scope.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
test('active tutor corpus is query-only, has no profiles, and retains exact timestamp strings',()=>{
 const rows=json('datasets/real-world/slack/ai-tutor.json');
 assert.equal(rows.length,1153);assert.equal(new Set(rows.map(r=>r.record_id)).size,rows.length);
 for(const r of rows){assert.ok(tutorCandidate(r));assert.ok(Object.keys(r).every(k=>!/profile|persona|demographic/i.test(k)));assert.match(r.created_at,/\.\d{6}Z$/);assert.equal(r.expected_response,null);}
 assert.deepEqual(json('datasets/real-world/slack/discussions.all.json'),rows);
 const csv=parseCsv(read('datasets/real-world/slack/ai-tutor.csv'));assert.equal(csv.length,rows.length);assert.deepEqual(csv.map(r=>r.created_at),rows.map(r=>r.created_at));
});
test('20 real tutor seeds and 200 variants have sources, honest labels, stable lineage and no split leakage',()=>{
 const corpus=new Map(json('datasets/real-world/slack/ai-tutor.json').map(r=>[r.record_id,r]));
 const seeds=json('samples/golden-set.draft.json'),variants=json('samples/synthetic-queries.draft.json'),all=json('samples/benchmark.draft.json');
 const sources=new Map(json('samples/sanitized-source-cards.json').map(s=>[s.id,s]));
 assert.equal(seeds.length,20);assert.equal(variants.length,200);assert.equal(all.length,220);assert.equal(new Set(all.map(r=>r.case_id)).size,220);
 assert.deepEqual(all,[...seeds,...variants]);
 const families=new Map();
 for(const r of all){assert.equal(r.route,'ai_tutor');assert.equal(r.sme_status,'draft_unreviewed');assert.ok(Object.keys(r).every(k=>!/profile|persona|demographic/i.test(k)));if(families.has(r.family_id))assert.equal(families.get(r.family_id),r.split);families.set(r.family_id,r.split);for(const id of r.source_ids.split(';')){assert.ok(sources.has(id));assert.equal(new URL(sources.get(id).url).protocol,'https:');}}
 for(const s of seeds){const original=corpus.get(s.corpus_record_id);assert.equal(s.query,original.content);assert.equal(s.source_observed_at,original.created_at);const children=variants.filter(v=>v.parent_id===s.case_id);assert.equal(children.length,10);for(const v of children){assert.equal(v.family_id,s.family_id);assert.equal(v.split,s.split);assert.equal(v.source_observed_at,s.source_observed_at);}}
 assert.equal(parseCsv(read('samples/benchmark.draft.csv')).length,220);
});
test('tutor v0 manifest freezes the current tutor prompt and evidence',()=>{
 const m=json('config/v0-manifest.json'),hash=p=>createHash('sha256').update(read(p).replace(/\r\n/g,'\n')).digest('hex');
 assert.equal(m.lab_scope,'tutor_only');
 for(const [p,h]of Object.entries(m.frozen_inputs))assert.equal(hash(p),h);
 assert.equal(hash('tools/cohort-server.mjs'),m.implementation_sha256);
 const prompt=read('prompts/tutor-starting-system.txt');assert.ok(prompt.includes('AI tutor'));assert.ok(!/citation|20 sentences|guardrail/i.test(prompt));
});
