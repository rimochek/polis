import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn,type ChildProcess} from 'node:child_process';
import {once} from 'node:events';
import {caseQuestions,FIELDS,type Case} from '../shared/types.js';

test('workspace API persists chat, questions, drafts and history; changes invalidate review',async t=>{
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'polis-workspace-'));
 const server=net.createServer();server.listen(0,'127.0.0.1');await once(server,'listening');const port=(server.address() as net.AddressInfo).port;await new Promise<void>(resolve=>server.close(()=>resolve()));
 let child:ChildProcess|undefined;
 async function start(){child=spawn(process.execPath,['--import','tsx','server/index.ts'],{cwd:process.cwd(),env:{...process.env,POLIS_DATA_DIR:dataDir,POLIS_PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Test server startup timed out')),20000);child!.stdout!.on('data',chunk=>{if(String(chunk).includes('Polis API')){clearTimeout(timer);resolve();}});child!.on('exit',code=>{clearTimeout(timer);reject(new Error(`Test server exited ${code}`));});});}
 async function stop(){if(child&&child.exitCode===null){const ended=once(child,'exit');child.kill();await ended;}}
 t.after(async()=>{await stop();const checked=path.resolve(dataDir);if(path.dirname(checked)===path.resolve(os.tmpdir())&&path.basename(checked).startsWith('polis-workspace-'))fs.rmSync(checked,{recursive:true,force:true});});
 async function request(route:string,method='GET',body?:unknown){const r=await fetch(`http://127.0.0.1:${port}/api${route}`,{method,...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});return {r,data:await r.json()};}
 await start();let c=(await request('/cases/demo')).data as Case;const q=caseQuestions(c)[0];
 assert.equal((await request('/cases/demo/export')).r.status,409);
 c=(await request('/cases/demo/details','PATCH',{owner:'QA broker',dueDate:'2026-10-01'})).data;
 c=(await request('/cases/demo/clarifications','PATCH',{questionId:q.id,resolved:true})).data;assert.ok(c.resolvedQuestions?.includes(q.id));
 assert.equal((await request('/cases/demo/clarifications','PATCH',{questionId:'other-case:water',resolved:true})).r.status,404);
 await request('/cases/demo/drafts','PUT',{offerId:'assistant',text:'Persisted draft'});
 const chat=await request('/cases/demo/chat','POST',{message:'Что нужно проверить?'});assert.equal(chat.r.status,200);assert.equal(chat.data.length,2);assert.match(chat.data[1].text,/Учебный ответ/);
 for(const o of c.offers)await request('/cases/demo/review','POST',{offerId:o.id,reviewed:true});
 const exportResult=await fetch(`http://127.0.0.1:${port}/api/cases/demo/export`);assert.equal(exportResult.status,200);assert.match(await exportResult.text(),/Ответ отмечен/);
 await stop();await start();c=(await request('/cases/demo')).data;
 assert.equal(c.owner,'QA broker');assert.equal(c.drafts?.assistant,'Persisted draft');assert.equal(c.messages?.length,2);assert.ok(c.activity?.length);
 c=(await request('/cases/demo','PATCH',{requirements:'Новые требования клиента, страховая сумма 90 млн тенге.'})).data;
 assert.deepEqual(c.resolvedQuestions,[]);assert.ok(c.offers.every(o=>FIELDS.every(f=>!o.cells[f.key].reviewed)));assert.notEqual(c.revision,c.analyzedRevision);assert.equal((await request('/cases/demo/export')).r.status,409);
 const created=(await request('/cases','POST',{title:'QA created',client:'QA company',requirements:'Страхование имущества магазина на год'})).data as Case;
 const form=new FormData();form.append('role','requirements');form.append('file',new Blob([fs.readFileSync(path.join(dataDir,'demo-1.pdf'))],{type:'application/pdf'}),'requirements.pdf');
 const uploaded=await fetch(`http://127.0.0.1:${port}/api/cases/${created.id}/attachments`,{method:'POST',body:form});assert.equal(uploaded.status,200);const updated=await uploaded.json() as Case;assert.equal(updated.attachments?.[0].role,'requirements');assert.equal(updated.revision,1);
 const doc=updated.attachments![0];assert.equal((await fetch(`http://127.0.0.1:${port}/api/documents/${doc.id}`)).status,200);
 assert.equal((await request(`/cases/${created.id}/attachments/${doc.id}`,'PATCH',{role:'rules'})).data.revision,2);
 assert.equal((await request(`/cases/${created.id}/attachments/${doc.id}`,'PATCH',{role:'invalid'})).r.status,400);
 assert.deepEqual((await request(`/cases/${created.id}/chat`)).data,[]);
});
