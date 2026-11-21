import fs from 'node:fs/promises';
export async function readJson(path){return JSON.parse(await fs.readFile(path,'utf8'));}
export async function saveJson(path,data){await fs.writeFile(path,JSON.stringify(data,null,2),'utf8');}
export function toCsv(rows){
  const fields=[...new Set(rows.flatMap(r=>Object.keys(r)))];
  const cell=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  return [fields.map(cell).join(','),...rows.map(r=>fields.map(k=>cell(typeof r[k]==='object'&&r[k]!==null?JSON.stringify(r[k]):r[k])).join(','))].join('\r\n')+'\r\n';
}
export function parseCsv(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(field);field='';}
    else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x!==''))rows.push(row);row=[];field='';}
    else field+=c;
  }
  if(quoted)throw new Error('Unclosed CSV quote');
  if(field||row.length){row.push(field);rows.push(row);}
  const header=rows.shift(); if(!header)return [];
  return rows.map(r=>{if(r.length!==header.length)throw new Error('CSV width mismatch');return Object.fromEntries(header.map((h,i)=>[h,r[i]]));});
}
