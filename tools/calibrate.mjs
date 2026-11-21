import fs from 'node:fs/promises';
import {parseCsv,saveJson} from './io.mjs';
import {pathToFileURL} from 'node:url';

export function binaryMetrics(rows,threshold){
  const m={n:rows.length,tp:0,fp:0,tn:0,fn:0,brier:0};
  for(const r of rows){const y=Number(r.human_label),p=Number(r.p_pass),pred=Number(p>=threshold);
    m[y?(pred?'tp':'fn'):(pred?'fp':'tn')]++;m.brier+=(p-y)**2;}
  if(!rows.length)throw new Error('Empty labels');
  m.brier/=m.n;m.agreement=(m.tp+m.tn)/m.n;
  m.false_accept_rate=m.fp+m.tn?m.fp/(m.fp+m.tn):null;
  m.bad_answer_recall=m.tn+m.fp?m.tn/(m.tn+m.fp):null;
  m.good_answer_recall=m.tp+m.fn?m.tp/(m.tp+m.fn):null;
  const chance=((m.tp+m.fn)*(m.tp+m.fp)+(m.fp+m.tn)*(m.fn+m.tn))/m.n**2;
  m.kappa=chance<1?(m.agreement-chance)/(1-chance):null;
  return m;
}

export function calibrate(rows){
  const groups=new Map();
  for(const r of rows){
    if(!['0','1'].includes(String(r.human_label))||r.p_pass===''||!Number.isFinite(Number(r.p_pass))||Number(r.p_pass)<0||Number(r.p_pass)>1)throw new Error('Missing or invalid human label/probability');
    if(!r.human_reviewer||!r.family_id||!r.metric)throw new Error('Human reviewer, family and metric are required');
    if(!['calibration','validation'].includes(r.split))throw new Error('split must be calibration or validation');
    if(groups.has(r.family_id)&&groups.get(r.family_id)!==r.split)throw new Error('Family leakage');
    groups.set(r.family_id,r.split);
  }
  const report={status:'preliminary_small_sample_alignment',objective:'minimize 3*false_accept_rate + false_reject_rate on calibration families only',metrics:{}};
  for(const metric of new Set(rows.map(r=>r.metric))){
    const fit=rows.filter(r=>r.metric===metric&&r.split==='calibration');
    const held=rows.filter(r=>r.metric===metric&&r.split==='validation');
    for(const part of [fit,held])if(new Set(part.map(r=>String(r.human_label))).size!==2)throw new Error(`${metric}: both labels required in both partitions`);
    const candidates=Array.from({length:91},(_,i)=>(i+5)/100);
    let threshold=0.5,loss=Infinity;
    for(const t of candidates){const m=binaryMetrics(fit,t);const l=3*m.false_accept_rate+1-m.good_answer_recall;if(l<loss){threshold=t;loss=l;}}
    report.metrics[metric]={threshold,calibration_families:new Set(fit.map(r=>r.family_id)).size,validation_families:new Set(held.map(r=>r.family_id)).size,
      fit_before:binaryMetrics(fit,0.5),fit_after:binaryMetrics(fit,threshold),validation_before:binaryMetrics(held,0.5),validation_after:binaryMetrics(held,threshold)};
  }
  report.note='Threshold alignment only; probabilities are unchanged. Rubric revisions, probability calibration and ordinal/image analysis are separate steps. Do not tune against validation results.';
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [input,output]=process.argv.slice(2);if(!input||!output)throw new Error('Usage: node tools/calibrate.mjs labeled-probabilities.csv report.json');
  await saveJson(output,calibrate(parseCsv(await fs.readFile(input,'utf8'))));
  console.log(`Saved ${output}`);
}
