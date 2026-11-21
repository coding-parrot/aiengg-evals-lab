// Build a private release candidate from the previously collected Slack feed.
// Public publication follows corpus review; never copy raw source records to datasets/.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {decode,scrub} from './prepare-discussions.mjs';
import {toCsv} from './io.mjs';

export function notificationTime(ts) {
  if (!/^\d{10}\.\d{1,6}$/.test(ts)) throw new Error('Invalid notification timestamp');
  const [seconds,fraction]=ts.split('.');
  return new Date(Number(seconds)*1000).toISOString().slice(0,19)+'.'+fraction.padEnd(6,'0')+'Z';
}
export const safeCsvCell = value => typeof value==='string' && /^\s*[=+@-]/u.test(value) ? "'"+value : value;

// Broad candidate detector. Private per-record review overrides resolve ambiguity.
export function suggestRoute(content) {
  content=content.replace(/\[[^\]]*(?:removed|redacted)[^\]]*\]/gi,'');
  return /\b(refund|reimburse|enroll|subscription|certificate|buffering|lagging|audio|sound|volume|typo|spelling|outdated)\b|(?:video|lesson|course|quiz|document|pdf|recording|link|screen|assignment).{0,65}(?:not |missing|blank|access|download|upload|available|complete|completion|navigate|issue|wrong|error|incorrect|poor|bad|fix|quality)|(?:unable|cannot|can't|cant|couldn't|not able).{0,35}(?:access|watch|download|view|open|play|load|navigate|mark)|(?:add|upload|provide|share|fix|where|missing|unable).{0,55}(?:recording|pdf|notes|assignment|code|video|link)|(?:course|teaching|explanation).{0,50}(?:terrible|poor|waste|bad|scam)/i.test(content) ? 'customer_support' : 'ai_tutor';
}
function suggestKind(content,ai) {
  if(ai)return 'ai_reply';
  if(/^(?:\[person[^\]]*\]\s*)?(?:thanks?(?: you)?|thankyou|great|awesome|nice|got it|understood|okay|ok|yes|no|agreed|correct|excellent|amazing)[\s!.😊🙏👍]*$/i.test(content))return 'acknowledgment';
  if(/\?|\b(?:how|why|what|when|where|which|explain|please|pls|help|unable|cannot|can't|not able|missing|issue|problem|wrong|error|bad|refund)\b/i.test(content))return 'query_or_request';
  return 'reply_or_feedback';
}
const ignoredIdentityLabels=new Set(['ai assistant','system design']);
export function build(rows,overrides={}) {
  if(!Array.isArray(rows)||rows.some(r=>typeof r.content!=='string'))throw new Error('Expected collected discussion records, not membership events');
  if(new Set(rows.map(r=>r.ts)).size!==rows.length)throw new Error('Duplicate source notification');
  const ordered=[...rows].sort((a,b)=>a.ts.localeCompare(b.ts));
  const names=new Set();
  for(const r of ordered){
    if(r.author&&!ignoredIdentityLabels.has(r.author.trim().toLowerCase()))names.add(r.author.trim());
    for(const m of decode(r.content).matchAll(/<a\b[^>]*data-userid[^>]*>([\s\S]*?)<\/a>/gi))names.add(m[1].replace(/<[^>]+>/g,'').trim());
  }
  // Additional unlinked names discovered in review stay in the private review file.
  for(const name of overrides._extra_names||[])names.add(name);
  const profiles=[],profileMap=new Map(),identityMap=[],duplicates=new Map(),records=[];
  const first=['Mira','Nila','Tara','Isha','Leela','Ayan','Rohan','Kabir','Dev','Arun'];
  const last=['Vale','Brook','Reed','Lake','Grove','Field','Stone','Hill','Dale','Wren'];
  for(const [i,r] of ordered.entries()){
    const id='SLK-'+String(i+1).padStart(5,'0'),ai=r.author?.trim()==='AI Assistant';
    const actorKey=r.author?.trim().toLowerCase()||'unknown:'+id;
    if(!profileMap.has(actorKey)){
      const n=profiles.length,profile_id='SLACK-DEMO-P'+String(n+1).padStart(4,'0');
      profileMap.set(actorKey,profile_id);
      profiles.push({profile_id,display_name:ai?'Demo AI Tutor':`${first[n%10]} ${last[Math.floor(n/10)%10]} (demo ${n+1})`,email:ai?null:profile_id.toLowerCase()+'@example.invalid',is_fictional:true,profile_type:ai?'ai_assistant':'discussion_participant',demographics:'not_inferred',identity_grouping:'source_display_label_not_verified_account'});
    }
    let content=scrub(r.content,[...names]);
    // Bare domains and unlinked handles must not leak addresses or user profiles.
    content=content.replace(/\b(?:[a-z0-9-]+\.)+(?:com|io|dev|net|org|edu|co|in|ai)(?:\/[\w./?%=&+#:@~-]*)?/gi,'[domain removed]')
      .replace(/(?<!\w)@[\p{L}\p{N}_][\p{L}\p{N}_.-]*/gu,'[mention removed]')
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,'[identifier removed]');
    const review=overrides[id]||{};
    for(const replacement of review.redactions||[]) {
      if(!content.includes(replacement.text))throw new Error(`Stale redaction for ${id}`);
      content=content.replaceAll(replacement.text,replacement.replacement||'[personal detail removed]');
    }
    const key=createHash('sha256').update(content.toLowerCase().replace(/\s+/g,' ').trim()).digest('hex');
    if(!duplicates.has(key))duplicates.set(key,'TEXT-'+String(duplicates.size+1).padStart(5,'0'));
    const route=review.route||suggestRoute(content),kind=review.message_kind||suggestKind(content,ai);
    if(!['customer_support','ai_tutor'].includes(route))throw new Error(`Invalid route for ${id}`);
    if(ai&&kind!=='ai_reply')throw new Error('AI replies cannot become learner queries');
    const profile=profiles.find(p=>p.profile_id===profileMap.get(actorKey));
    records.push({record_id:id,profile_id:profile.profile_id,profile_name:profile.display_name,created_at:notificationTime(r.ts),timestamp_kind:'slack_notification_time',timestamp_timezone:'UTC',source_month:r.date.slice(0,7),visibility:'unknown',source_kind:'original_discussion_relayed_to_slack',author_kind:ai?'ai_assistant':'not_marked_ai',message_kind:kind,message_kind_review:ai?'source_ai_label':review.message_kind?'assistant_reviewed':'heuristic',route,secondary_route:review.secondary_route||null,route_review:review.route?'assistant_reviewed':'rule_assigned',content,content_provenance:'original_wording_html_normalized_identifiers_redacted',duplicate_group:duplicates.get(key),parent_id:null,thread_linkage:'not_exposed_in_collected_feed',privacy_processing:'identity_and_pattern_scrub_plus_targeted_corpus_review',expected_response:null,sme_status:'not_labeled',is_synthetic:false,profile_is_synthetic:true});
    identityMap.push({record_id:id,source_ts:r.ts,source_author:r.author,profile_id:profileMap.get(actorKey)});
  }
  return {records,profiles,identityMap};
}
async function main(){
  const [input,reviewFile]=process.argv.slice(2);
  if(!input)throw new Error('Usage: node tools/build-slack-dataset.mjs private-data/slack-discussions.raw.private.json [review.json]');
  const privateRoot=path.resolve('private-data');
  const relative=path.relative(privateRoot,path.resolve(input));
  if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Raw input must be inside private-data/');
  const overrides=reviewFile?JSON.parse(await fs.readFile(reviewFile,'utf8')):{};
  const result=build(JSON.parse(await fs.readFile(input,'utf8')),overrides);
  const out=path.join(privateRoot,'slack-release');await fs.mkdir(out,{recursive:true});
  const save=async(name,value)=>fs.writeFile(path.join(out,name),JSON.stringify(value,null,2)+'\n');
  await save('discussions.all.json',result.records);await save('fictional-profiles.all.json',result.profiles);
  await save('identity-map.private.json',result.identityMap);
  for(const [name,rows]of [['discussions.all',result.records],['customer-support',result.records.filter(r=>r.route==='customer_support')],['ai-tutor',result.records.filter(r=>r.route==='ai_tutor')]]){
    await fs.writeFile(path.join(out,name+'.jsonl'),rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
    await fs.writeFile(path.join(out,name+'.csv'),toCsv(rows.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,safeCsvCell(v)])))));
  }
  console.log(JSON.stringify({records:result.records.length,profiles:result.profiles.length,support:result.records.filter(r=>r.route==='customer_support').length,tutor:result.records.filter(r=>r.route==='ai_tutor').length,output:'private-data/slack-release'},null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(e=>{console.error(e.message);process.exitCode=1;});
