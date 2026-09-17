import fs from 'node:fs/promises';
const base='http://127.0.0.1:5174/api';
async function request(path,options){const res=await fetch(base+path,options);const body=await res.json();if(!res.ok)throw new Error(body.error);return body;}
const json=data=>({headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
const demo=await request('/cases/demo');
const cases=await request('/cases');
let c=cases.find(c=>c.title==='Gemini · учебный кейс для презентации');
if(!c){
 c=await request('/cases',{method:'POST',...json({title:'Gemini · учебный кейс для презентации',client:'Вымышленный магазин «Точка»',requirements:demo.requirements})});
 for(const offer of demo.offers){
  const file=offer.documents.at(-1);const pdf=await fetch(base+'/documents/'+file.id).then(r=>r.arrayBuffer());
  const form=new FormData();form.append('name',offer.name);form.append('file',new Blob([pdf],{type:'application/pdf'}),file.name);
  c=await request('/cases/'+c.id+'/documents',{method:'POST',body:form});
 }
}
await fs.mkdir('artifacts/gemini',{recursive:true});
await fs.writeFile('artifacts/gemini/presentation-case.json',JSON.stringify({id:c.id,title:c.title}));
console.log('Prepared synthetic PDF case:',c.id);
if(process.argv.includes('--analyze')){
 const connection=await request('/config/test',{method:'POST'});console.log('Live Google connection:',connection);
 const started=Date.now();c=await request('/cases/'+c.id+'/analyze',{method:'POST'});
 const report={caseId:c.id,seconds:Math.round((Date.now()-started)/1000),offers:c.offers.map(o=>({name:o.name,cells:o.cells}))};
 await fs.writeFile('artifacts/gemini/live-analysis.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({seconds:report.seconds,offers:report.offers.map(o=>({name:o.name,premium:o.cells.premium.value,deductible:o.cells.deductible.value,water:o.cells.water.status,citations:Object.values(o.cells).filter(c=>c.evidence).length}))}));
}
