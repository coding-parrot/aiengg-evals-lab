// Initial private preparation, not an automatic anonymization or release gate.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function decode(s) {
  for (let n = 0; n < 3; n++) s = s.replace(/&(?:amp|lt|gt|quot|apos|nbsp);|&#(?:x[0-9a-f]+|\d+);/gi, m => {
    const names = {'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '};
    if (names[m.toLowerCase()] !== undefined) return names[m.toLowerCase()];
    const hex = m[2].toLowerCase() === 'x';
    const value = parseInt(m.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    return value <= 0x10ffff ? String.fromCodePoint(value) : '[invalid character]';
  });
  return s;
}
export function scrub(text, names = []) {
  let s = decode(text);
  s = s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, '[person or link removed]')
    .replace(/<[@#!][^>]+>/g, '[mention removed]')
    .replace(/<https?:[^>]+>/gi, '[link removed]')
    .replace(/<\/?(?:p|div|br|li|pre|h[1-6])\b[^>]*>/gi, '\n')
    .replace(/<\/?[a-z][^>]*>/gi, '');
  s = s.replace(/\b(?:https?:\/\/|www\.)[^\s<>]+/gi, '[link removed]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email removed]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP removed]')
    .replace(/(?<!\w)\+?\d[\d ()-]{7,}\d(?!\w)/g, '[number removed]')
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]+)\b/g, '[credential removed]')
    .replace(/\bBearer\s+\S+/gi, 'Bearer [credential removed]')
    .replace(/\b(?:order|account|payment|transaction|user|customer)[ _-]*(?:id|reference)\s*[:=]\s*[A-Za-z0-9_-]+/gi, '[identifier removed]');
  for (const name of [...new Set(names.filter(Boolean))].sort((a,b) => b.length-a.length)) {
    if (name.length < 2) continue;
    s = s.replace(new RegExp('(?<![\\p{L}\\p{N}])' + escape(name) + '(?![\\p{L}\\p{N}])', 'giu'), '[person removed]');
  }
  return s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export function prepare(rows) {
  if (!Array.isArray(rows)) throw new Error('Expected a JSON array');
  const ids = new Set();
  for (const r of rows) {
    if (typeof r.id !== 'string' || !r.id || ids.has(r.id)) throw new Error('Missing or duplicate source ID');
    ids.add(r.id);
    if (typeof r.body !== 'string') throw new Error('Every record needs a string body (empty is allowed)');
    if (![true,false,null].includes(r.is_hidden)) throw new Error('is_hidden must be true, false or null');
    if (!['learner','staff','ai','unknown'].includes(r.author_role)) throw new Error('Explicit author_role required');
    if (typeof r.created_at !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(r.created_at) || !Number.isFinite(Date.parse(r.created_at))) throw new Error('Valid source timestamp required');
    if (r.author_id != null && typeof r.author_id !== 'string') throw new Error('author_id must be a string or null');
  }
  for (const r of rows) if (r.parent_id != null && !ids.has(r.parent_id)) throw new Error('Parent outside export; resolve the coverage gap first');
  const ordered = [...rows].sort((a,b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  const publicIds = new Map(ordered.map((r,i) => [r.id, 'D' + String(i+1).padStart(6,'0')]));
  const names = ordered.map(r => r.author_display_name).filter(n => typeof n === 'string');
  const actors = new Map(), profiles = [], identityMap = [];
  const first = ['Mira','Arun','Nila','Dev','Tara','Rohan','Isha','Kabir','Leela','Ayan'];
  const last = ['Vale','Brook','Reed','Lake','Grove','Field','Stone','Hill','Dale','Wren'];
  const rootFor = row => {
    const seen = new Set(); let at = row;
    while (at.parent_id != null) {
      if (seen.has(at.id)) throw new Error('Cyclic parent relationship');
      seen.add(at.id); at = byId.get(at.parent_id);
    }
    return publicIds.get(at.id);
  };
  const byId = new Map(ordered.map(r => [r.id,r]));
  const candidates = ordered.map(r => {
    // Missing actor IDs are not merged by display name.
    const actorKey = r.author_id == null ? 'record:' + r.id : 'actor:' + r.author_id;
    if (!actors.has(actorKey)) {
      const n = actors.size, profile_id = 'FICTIONAL-P' + String(n+1).padStart(5,'0');
      actors.set(actorKey, profile_id);
      profiles.push({profile_id, display_name:first[n%10] + ' ' + last[Math.floor(n/10)%10] + ' (fictional ' + (n+1) + ')', email:profile_id.toLowerCase()+'@example.invalid', is_fictional:true, demographics:'not_inferred'});
    }
    const content = scrub(r.body,names), profile_id = actors.get(actorKey);
    const support = /\b(refund|subscription|enroll(?:ment)?|invoice|certificate|checkout|buffering)\b|(?:video|lesson|course|quiz|document).{0,45}(?:not loading|not playing|missing|blank|access)|(?:unable|cannot|can't).{0,25}(?:access|watch|download|log in)/i.test(content);
    identityMap.push({record_id:publicIds.get(r.id), source_id:r.id, source_author_id:r.author_id??null, source_author_name:r.author_display_name??null, profile_id});
    return {record_id:publicIds.get(r.id), parent_id:r.parent_id == null ? null : publicIds.get(r.parent_id), family_id:rootFor(r), profile_id, source_month:r.created_at.slice(0,7), visibility:r.is_hidden===null?'unknown':r.is_hidden?'hidden':'visible', author_role:r.author_role,
      message_kind:r.author_role==='ai'?'ai_reply':r.parent_id!=null?'reply':'unreviewed_root', route:support?'customer_support':'ai_tutor', secondary_route:null, routing_review:'pending', content, privacy_review:'pending', flags:content?[]:['empty_content'], expected_response:null, sme_status:'not_labeled', profile_is_synthetic:true, is_synthetic:false};
  });
  return {candidates, profiles, identityMap, manifest:{status:'PRIVATE_REVIEW_REQUIRED', source_rows:rows.length, output_rows:candidates.length, hidden:candidates.filter(r=>r.visibility==='hidden').length, visible:candidates.filter(r=>r.visibility==='visible').length, unknown_visibility:candidates.filter(r=>r.visibility==='unknown').length, fictional_profiles:profiles.length, export_scope:'as_supplied_not_verified_against_database', privacy_reviewed_rows:0, routing_reviewed_rows:0}};
}

async function main() {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: node tools/prepare-discussions.mjs private-data/discussions.raw.json');
  const privateRoot = path.resolve('private-data');
  const resolvedInput = path.resolve(input), relative = path.relative(privateRoot,resolvedInput);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Raw input must be inside private-data/');
  const result = prepare(JSON.parse(await fs.readFile(resolvedInput,'utf8')));
  const out = path.join(privateRoot,'discussion-import');
  // Avoid accidentally overwriting an earlier review session.
  await fs.mkdir(privateRoot,{recursive:true});
  await fs.mkdir(out);
  for (const [filename,value] of [['candidates.json',result.candidates],['profiles.json',result.profiles],['identity-map.private.json',result.identityMap],['manifest.json',result.manifest]]) {
    await fs.writeFile(path.join(out,filename),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
  }
  console.log(JSON.stringify(result.manifest,null,2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error=>{console.error(error.message);process.exitCode=1;});
