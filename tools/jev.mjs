// Legacy Jev-only entry point. New labs use judge.mjs (OpenAI Decisions by default).
import {pathToFileURL} from 'node:url';
import {readJson,saveJson} from './io.mjs';
import './env.mjs';
process.env.JUDGE_PROVIDER='jev';
export {callJudge as callJev,scoreRun} from './judge.mjs';
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [input,output]=process.argv.slice(2);
 if(!input||!output)throw new Error('Usage: node tools/jev.mjs response.json scores.json');
 const {scoreRun}=await import('./judge.mjs');
 await saveJson(output,await scoreRun(await readJson(input),await readJson(new URL('../config/judge-questions.json',import.meta.url))));
 console.log('Saved Jev results.');
}
