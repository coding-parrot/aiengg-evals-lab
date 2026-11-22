// Retry only explicit temporary throttles; never replay an uncertain paid request.
export async function cohortJson(url,options,{fetchImpl=fetch,sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms)),random=Math.random,now=Date.now,onRetry=()=>{},maxRetries=3}={}){
  for(let attempt=0;;attempt++){
    const response=await fetchImpl(url,{...options,signal:AbortSignal.timeout(120000)});
    let data;try{data=await response.json();}catch{throw new Error(`Cohort HTTP ${response.status}; invalid service response`);}
    if(response.ok)return data;
    if(response.status===429&&data.retryable===true&&attempt<maxRetries){
      const header=response.headers.get('Retry-After');
      const seconds=header===null?NaN:Number(header);
      const delay=Number.isFinite(seconds)?seconds*1000:header?Date.parse(header)-now():NaN;
      const wait=Number.isFinite(delay)?Math.max(0,delay):1000*2**attempt;
      // Do not retry earlier than a server-requested delay over our wait budget.
      if(wait<=120000){const ms=wait+Math.floor(random()*1000);onRetry({attempt:attempt+1,waitMs:ms});await sleep(ms);continue;}
    }
    const details=data.code==='cohort_quota_exhausted'?'Class usage cap reached; contact the instructor':data.retryable===true?'Temporary rate limit; retry shortly':'Check access, quota and instructor service status';
    throw Object.assign(new Error(`Cohort HTTP ${response.status}; ${details}`),{status:response.status,code:data.code,retryable:data.retryable});
  }
}
