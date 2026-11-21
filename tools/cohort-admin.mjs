import './env.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {Ledger} from './cohort-server.mjs';
const [action,arg,expiry]=process.argv.slice(2);
const dir=path.resolve(process.env.COHORT_STATE_DIR??'private-data/cohort-state');
fs.mkdirSync(dir,{recursive:true,mode:0o700});
if(action==='pause'){fs.writeFileSync(path.join(dir,'PAUSED'),'Paused by instructor');console.log('New provider calls paused.');}
else if(action==='resume'){fs.rmSync(path.join(dir,'PAUSED'),{force:true});console.log('Provider calls resumed within existing limits.');}
else{
  if(fs.existsSync(path.join(dir,'server.lock')))throw new Error('Stop the server before editing invitations. Pause can be used while running.');
  const ledger=new Ledger(dir);
  if(action==='invite'){
    const count=Number(arg??20);if(!Number.isSafeInteger(count)||count<1||count>500)throw new Error('Invite count must be 1–500');
    const url=new URL(process.env.COHORT_PUBLIC_URL??'http://localhost:8787');
    if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw new Error('Use an HTTPS public URL');
    if(url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('Use the server origin without path/query/credentials');
    const expiresAt=expiry??new Date(Date.now()+7*86400000).toISOString();
    const start=Object.keys(ledger.state.students).length;const invitations=[];
    for(let i=1;i<=count;i++){
      const id='student-'+String(start+i).padStart(3,'0');
      invitations.push({student:id,expires_at:expiresAt,invitation:url.origin+'/#invite='+ledger.invite(id,expiresAt,process.env.COHORT_STUDENT_MAX_CALLS)});
    }
    const file=path.join(dir,`invitations-${Date.now()}.private.json`);fs.writeFileSync(file,JSON.stringify(invitations,null,2),{mode:0o600});
    console.log(`Created ${count} individual invitations in the private state directory. Share one per learner; never commit the file.`);
  }else if(action==='revoke'){
    const s=Object.values(ledger.state.students).find(s=>s.id===arg);if(!s)throw new Error('Unknown student ID');s.revoked=true;ledger.save();console.log('Student access revoked.');
  }else if(action==='status')console.log(JSON.stringify({total_calls:ledger.state.total,students:Object.values(ledger.state.students).map(({id,calls,maxCalls,expiresAt,revoked})=>({id,calls,maxCalls,expiresAt,revoked}))},null,2));
  else throw new Error('Usage: node tools/cohort-admin.mjs invite [count] [expiry] | pause | resume | revoke student-ID | status');
}
