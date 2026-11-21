import fs from 'node:fs/promises';
import {cohortCall,cohortUrl} from './env.mjs';
const [command,...args]=process.argv.slice(2);
const config=new URL('../config/student.connection.local.json',import.meta.url);
process.env.COHORT_URL??=JSON.parse(await fs.readFile(new URL('../config/classroom.json',import.meta.url),'utf8')).url;
async function secret(){
  if(!process.stdin.isTTY)throw new Error('Use an interactive terminal for hidden key entry, or connect --key-file PATH to a private file.');
  process.stdout.write('Shared student API key (hidden): ');
  return new Promise((resolve,reject)=>{
    let value='';process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
    const done=()=>{process.stdin.setRawMode(false);process.stdin.pause();process.stdin.off('data',read);process.stdout.write('\n');};
    const read=chunk=>{for(const ch of chunk){if(ch==='\u0003'){done();reject(new Error('Cancelled'));return;}if(ch==='\r'||ch==='\n'){done();resolve(value.trim());return;}if(ch==='\u007f'||ch==='\b')value=value.slice(0,-1);else if(ch>=' ')value+=ch;}};
    process.stdin.on('data',read);
  });
}
try{
  if(command==='connect'){
    const index=args.indexOf('--key-file');
    const token=index>=0?await fs.readFile(args[index+1],'utf8'):await secret();
    if(!/^[A-Za-z0-9_-]{16,256}$/.test(token.trim()))throw new Error('Invalid student key format');
    process.env.COHORT_ACCESS_TOKEN=token.trim();
    const info=await cohortCall('/api/info');
    await fs.writeFile(config,JSON.stringify({url:cohortUrl('/').replace(/\/$/,''),token:token.trim()},null,2)+'\n',{mode:0o600});
    console.log('Connected. Key saved only in ignored config/student.connection.local.json.');
    console.log(JSON.stringify(info,null,2));
  }else if(command==='doctor'){
    const response=await fetch(cohortUrl('/health'),{redirect:'error',signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw new Error('Lab health HTTP '+response.status);
    console.log(JSON.stringify({url:cohortUrl('/'),health:await response.json(),access:await cohortCall('/api/info')},null,2));
  }else if(command==='ask'){
    if(!args.length)throw new Error('Usage: node tools/lab.mjs ask "Your question"');
    const result=await cohortCall('/api/bot',{query:args.join(' ')});
    const dir=new URL('../artifacts/checkpoint-0/',import.meta.url);await fs.mkdir(dir,{recursive:true});
    const filename=new Date().toISOString().replaceAll(':','-')+'.json';
    await fs.writeFile(new URL(filename,dir),JSON.stringify(result,null,2)+'\n');
    console.log(result.answer);console.log('\nSaved actual trace: artifacts/checkpoint-0/'+filename);
  }else console.log('Commands: connect [--key-file PATH], doctor, ask "Question". Run from the repo root. No browser or provider API key needed.');
}catch(error){console.error(error.message);process.exitCode=1;}
