import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {AsyncLocalStorage} from 'node:async_hooks';
import {once} from 'node:events';
import {PDFDocument} from 'pdf-lib';
import {createAccessToken,requireAuth,requireCsrf} from '../server/auth.js';
import {workspaceRoutes,type WorkspaceStore} from '../server/workspace.js';
import {emptyCells,caseQuestions,FIELDS,isCurrent,type Case,type ChatMessage} from '../shared/types.js';

// Actual protected router, async owner-scoped adapter; no external DB or cloud.
test('workspace routes enforce owner/CSRF boundaries and await persistence',async t=>{
 process.env.AUTH_SECRET='workspace-integration-test-secret-at-least-32-chars';
 const fixture=(id:string):Case=>({id,title:'Учебная заявка',client:'Test client',requirements:'Страхование имущества на год',demo:true,revision:0,analyzedRevision:0,offers:[{id:'offer',name:'Страховщик',documents:[],cells:emptyCells()}],changes:[],selectedOfferId:null,comment:'',analysisSeconds:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
 const db=new Map([['a',[fixture('case-a')]],['b',[fixture('case-b')]]]);
 const conversations=new Map<string,{messages:ChatMessage[];revision:number}>([['a',{messages:[{id:'private-a',role:'user',text:'Account A private chat',createdAt:''}],revision:1}],['b',{messages:[],revision:0}]]);
 const context=new AsyncLocalStorage<{owner:string;cases:Case[]}>();let failSave=false;
 const ctx=()=>context.getStore()!;const docs=new Map<string,{owner:string;bytes:Buffer}>();
 const touch:WorkspaceStore['touch']=async(c,invalidate,event)=>{
  await new Promise(r=>setTimeout(r,20));
  if(failSave)throw Object.assign(new Error('Persistence unavailable'),{status:503});
  const stored=db.get(ctx().owner)!.find(item=>item.id===c.id)!;
  if(stored.updatedAt!==c.updatedAt)throw Object.assign(new Error('Concurrent update'),{status:409});
  c.updatedAt=new Date(new Date(c.updatedAt).getTime()+1).toISOString();
  if(invalidate){c.revision++;c.resolvedQuestions=[];for(const o of c.offers)for(const cell of Object.values(o.cells))cell.reviewed=false;}
  if(event)(c.activity??=[]).push({id:'event',at:c.updatedAt,text:event});
  db.set(ctx().owner,db.get(ctx().owner)!.map(item=>item.id===c.id?structuredClone(c):item));
 };
 const store:WorkspaceStore={owner:()=>ctx().owner,list:()=>ctx().cases,get:id=>{const c=ctx().cases.find(c=>c.id===id);if(!c)throw Object.assign(new Error('Case not found'),{status:404});return c;},editable:()=>{},touch,
  readDocument:async(c,id)=>{const doc=docs.get(id);if(!doc||doc.owner!==ctx().owner||!c.attachments?.some(d=>d.id===id))throw Error('Foreign document');return doc.bytes;},
  addAttachment:async(c,doc,bytes)=>{(c.attachments??=[]).push(doc);await touch(c,true,'Uploaded');docs.set(doc.id,{owner:ctx().owner,bytes});},
  loadMessages:async()=>structuredClone(conversations.get(ctx().owner)!),
  saveMessages:async(messages,revision)=>{if(conversations.get(ctx().owner)!.revision!==revision)throw Object.assign(new Error('Concurrent conversation'),{status:409});conversations.set(ctx().owner,{messages,revision:revision+1});}
 };
 const app=express();app.use(express.json());app.use('/api',requireAuth,requireCsrf,(req,_res,next)=>context.run({owner:req.user!.id,cases:structuredClone(db.get(req.user!.id)!)},next));app.use('/api',workspaceRoutes(store));
 app.use((error:Error&{status?:number},_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(error.status||400).json({error:error.message}));
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve())));
 const port=(server.address() as {port:number}).port;
 const tokens={a:createAccessToken({id:'a',email:'a@example.test'}),b:createAccessToken({id:'b',email:'b@example.test'})};
 async function request(owner:'a'|'b'|null,route:string,method='GET',body?:unknown,csrf=true){
  const headers:Record<string,string>={};if(owner){headers.Cookie=`polis_access=${tokens[owner]}; polis_csrf=test-csrf`;if(csrf)headers['X-CSRF-Token']='test-csrf';}
  if(body&&!(body instanceof FormData))headers['Content-Type']='application/json';
  const response=await fetch(`http://127.0.0.1:${port}/api${route}`,{method,headers,body:body instanceof FormData?body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json()};
 }
 assert.equal((await request(null,'/chat')).status,401);
 assert.equal((await request('b','/cases/case-a/chat')).status,404);
 assert.deepEqual((await request('b','/chat')).data,[]);
 assert.equal((await request('a','/chat')).data[0].text,'Account A private chat');
 assert.equal((await request('a','/cases/case-a/details','PATCH',{owner:'Broker',dueDate:''},false)).status,403);
 const saved=await request('a','/cases/case-a/details','PATCH',{owner:'Broker A',dueDate:'2026-10-01'});assert.equal(saved.status,200);assert.equal(db.get('a')![0].owner,'Broker A');assert.equal(db.get('b')![0].owner,undefined);
 const q=caseQuestions(db.get('a')![0])[0];await request('a','/cases/case-a/clarifications','PATCH',{questionId:q.id,resolved:true});assert.ok(db.get('a')![0].resolvedQuestions?.includes(q.id));
 assert.equal((await request('b','/cases/case-a/clarifications','PATCH',{questionId:q.id,resolved:true})).status,404);
 await request('a','/cases/case-a/drafts','PUT',{offerId:'assistant',text:'Saved draft'});assert.equal(db.get('a')![0].drafts?.assistant,'Saved draft');
 const chat=await request('a','/cases/case-a/chat','POST',{message:'Что нужно проверить?'});assert.equal(chat.status,200);assert.equal(db.get('a')![0].messages?.length,2);assert.match(chat.data[1].text,/Учебный ответ/);
 assert.equal((await request('a','/cases/case-a/chat')).data.length,2);assert.deepEqual((await request('b','/cases/case-b/chat')).data,[]);
 failSave=true;const failed=await request('a','/cases/case-a/drafts','PUT',{offerId:'assistant',text:'Must not persist'});assert.equal(failed.status,503);assert.equal(db.get('a')![0].drafts?.assistant,'Saved draft');failSave=false;
 const races=await Promise.all([request('a','/cases/case-a/details','PATCH',{owner:'First',dueDate:''}),request('a','/cases/case-a/details','PATCH',{owner:'Second',dueDate:''})]);assert.deepEqual(races.map(r=>r.status).sort(),[200,409]);
 db.get('a')![0].demo=false;for(const f of FIELDS)db.get('a')![0].offers[0].cells[f.key].reviewed=true;
 const pdf=await PDFDocument.create();pdf.addPage();const bytes=await pdf.save();const form=new FormData();form.append('role','requirements');form.append('file',new Blob([Buffer.from(bytes)],{type:'application/pdf'}),'requirements.pdf');
 const upload=await request('a','/cases/case-a/attachments','POST',form);assert.equal(upload.status,200);const doc=upload.data.attachments[0];assert.equal(docs.get(doc.id)?.owner,'a');assert.ok(!isCurrent(db.get('a')![0]));assert.deepEqual(db.get('a')![0].resolvedQuestions,[]);assert.ok(FIELDS.every(f=>!db.get('a')![0].offers[0].cells[f.key].reviewed));
 assert.equal((await request('b',`/cases/case-a/attachments/${doc.id}`,'PATCH',{role:'rules'})).status,404);
 assert.equal((await request('a',`/cases/case-a/attachments/${doc.id}`,'PATCH',{role:'rules'})).data.attachments[0].role,'rules');
 assert.equal((await request('a','/cases/case-a/clarifications','PATCH',{questionId:q.id,resolved:true})).status,409);
});
