// Native Node env loading: no provider secrets in source or browser bundles.
import fs from 'node:fs';
if(fs.existsSync('.env')){
  if(typeof process.loadEnvFile!=='function')throw new Error('Use Node 22+ for automatic .env loading');
  process.loadEnvFile('.env');
}
export function cohortUrl(route){
  const url=new URL(process.env.COHORT_URL);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw new Error('Cohort access requires HTTPS (except localhost)');
  if(url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('COHORT_URL must be the server origin');
  return new URL(route,url).href;
}
export async function cohortCall(route,payload){
  if(!process.env.COHORT_ACCESS_TOKEN)throw new Error('Open your instructor invitation and download the private .env connection file');
  const response=await fetch(cohortUrl(route),{method:payload===undefined?'GET':'POST',headers:{Authorization:`Bearer ${process.env.COHORT_ACCESS_TOKEN}`,'Content-Type':'application/json'},...(payload===undefined?{}:{body:JSON.stringify(payload)}),redirect:'error',signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw new Error(`Cohort HTTP ${response.status}; check access, quota and instructor service status`);
  return response.json();
}
