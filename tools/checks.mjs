import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function sentenceCount(answer) {
  // Documented classroom convention: each paragraph/bullet fragment counts at least once.
  // Replace links before segmentation so URL dots do not create extra sentences.
  const clean=answer.replace(/```[\s\S]*?```/g,' CODE_BLOCK ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')
    .replace(/https?:\/\/\S+/g,'URL').replace(/\[S\d+\]/g,'');
  const segmenter=new Intl.Segmenter('en',{granularity:'sentence'});
  return clean.split(/\n+/).filter(x=>x.trim()).reduce((n,line)=>
    n+[...segmenter.segment(line.replace(/^\s*(?:[-*#]+|\d+[.)])\s*/,''))].filter(s=>/[\p{L}\p{N}]/u.test(s.segment)).length,0);
}

export function checkResponse(run, budgets={ttft_ms:2000,total_latency_ms:8000,cost_usd:0.02}) {
  if(typeof run.answer!=='string') throw new Error('answer must be a string');
  const sources=new Map((run.retrieved_context??[]).map(s=>[s.id,s]));
  const citations=run.citations??[];
  const visible=[...run.answer.matchAll(/\[(S\d+)\]/g)].map(m=>m[1]);
  const valid=citations.length>0 && visible.length>0 && citations.every(c=>{
    const source=sources.get(c.source_id);
    return source && source.citation_allowed===true && visible.includes(c.source_id) && (!c.url || c.url===source.url);
  }) && visible.every(id=>citations.some(c=>c.source_id===id));
  const sentences=sentenceCount(run.answer);
  const numeric=(name,limit)=>Number.isFinite(run[name]) && run[name]>=0 ? {value:run[name],pass:run[name]<=limit,status:'measured'}:{value:null,pass:null,status:'unavailable'};
  return {
    citation_validity:{value:Number(valid),pass:valid,status:'checked'},
    sentence_limit:{value:sentences,pass:sentences<=20,status:'checked'},
    ttft_ms:numeric('ttft_ms',budgets.ttft_ms),
    total_latency_ms:numeric('total_latency_ms',budgets.total_latency_ms),
    serving_cost_usd:numeric('cost_usd',budgets.cost_usd)
  };
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  if(!process.argv[2]) throw new Error('Provide a response JSON path');
  console.log(JSON.stringify(checkResponse(JSON.parse(await fs.readFile(process.argv[2],'utf8'))),null,2));
}
