// Native Node env loading: no provider secrets in source or browser bundles.
import fs from 'node:fs';
import {cohortJson} from './cohort-http.mjs';
if(fs.existsSync('.env')){
  if(typeof process.loadEnvFile!=='function')throw new Error('Use Node 22+ for automatic .env loading');
  process.loadEnvFile('.env');
}
const savedPath=new URL('../config/student.connection.local.json',import.meta.url);
const saved=fs.existsSync(savedPath)?JSON.parse(fs.readFileSync(savedPath,'utf8')):{};
const defaults=JSON.parse(fs.readFileSync(new URL('../config/classroom.json',import.meta.url),'utf8'));
const studentToken=saved.token??process.env.STUDENT_API_KEY;
if(studentToken)process.env.COHORT_ACCESS_TOKEN??=studentToken;
if(!process.env.BOT_ENDPOINT&&!process.env.OPENAI_API_KEY)process.env.COHORT_URL??=saved.url??defaults.url;
export function cohortUrl(route){
  const url=new URL(process.env.COHORT_URL);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw new Error('Cohort access requires HTTPS (except localhost)');
  if(url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('COHORT_URL must be the server origin');
  return new URL(route,url).href;
}
export async function cohortCall(route,payload){
  if(!process.env.COHORT_ACCESS_TOKEN)throw new Error('Run node tools/lab.mjs connect and enter the shared student API key. No browser or OpenAI key is needed.');
  return cohortJson(cohortUrl(route),{method:payload===undefined?'GET':'POST',headers:{Authorization:`Bearer ${process.env.COHORT_ACCESS_TOKEN}`,'Content-Type':'application/json'},...(payload===undefined?{}:{body:JSON.stringify(payload)}),redirect:'error'},{onRetry:({attempt,waitMs})=>console.error(`Shared service busy; retry ${attempt}/3 in ${Math.ceil(waitMs/1000)}s.`)});
}
