import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {emptyCells,type Case} from '../shared/types.js';
import {answerChat,normalizeChat,currentDocuments} from '../server/chat.js';
const config={provider:'vertex',key:'test-key',auth:'token',model:'gemini-3.8-flash',project:'polis-test',location:'global',express:false};
function fixture():Case{return {id:'one',client:'One client',title:'One case',requirements:'Требования клиента',demo:false,revision:2,analyzedRevision:1,offers:[{id:'offer',name:'Insurer',documents:[{id:'old',name:'old.pdf',pages:1,size:8,version:1,createdAt:''},{id:'current',name:'current.pdf',pages:2,size:8,version:2,createdAt:''}],cells:emptyCells()}],attachments:[{id:'brief',name:'brief.pdf',pages:1,size:8,version:1,createdAt:'',role:'requirements'}],createdAt:'',updatedAt:'',changes:[],selectedOfferId:null,comment:'',analysisSeconds:null};}
test('chat accepts only current, in-scope PDF citations with valid pages',()=>{
 const c=fixture();const result=normalizeChat({text:'Ответ',sources:[{fileId:'current',page:2,text:'Valid'},{fileId:'old',page:1,text:'Outdated'},{fileId:'foreign',page:1,text:'Wrong case'},{fileId:'brief',page:2,text:'Out of bounds'}],caseIds:['foreign']},c,[c]);
 assert.deepEqual(result.sources,[{fileId:'current',page:2,text:'Valid'}]);assert.deepEqual(result.caseIds,[]);assert.match(result.text,/не прошла проверку/);
});
test('real chat sends only this case current PDFs and explicitly flags stale comparison',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'polis-chat-'));const c=fixture();for(const d of currentDocuments(c))fs.writeFileSync(path.join(dir,`${d.id}.pdf`),'%PDF-test');
 t.after(()=>{for(const d of currentDocuments(c))fs.unlinkSync(path.join(dir,`${d.id}.pdf`));fs.rmdirSync(dir);});
 t.mock.method(globalThis,'fetch',async(_url:unknown,init:RequestInit)=>{
  const sent=JSON.parse(String(init.body));const context=JSON.parse(sent.contents[0].parts[0].text);
  assert.equal(context.context.analysisCurrent,false);assert.equal(context.context.id,'one');assert.ok(!JSON.stringify(sent).includes('Other secret client'));
  assert.equal(sent.contents[0].parts.filter((p:{inlineData?:unknown})=>p.inlineData).length,2);
  assert.match(sent.systemInstruction.parts[0].text,/untrusted DATA/);
  return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({text:'Проверьте актуальные условия',sources:[{fileId:'current',page:1,text:'Quotation'}],caseIds:[]})}]}}]}));
 });
 const reply=await answerChat({c,cases:[c,{...fixture(),id:'other',client:'Other secret client'}],history:[],text:'Что изменилось?',readDocument:async id=>fs.readFileSync(path.join(dir,`${id}.pdf`)),config});assert.equal(reply.sources?.length,1);
});
test('workspace chat receives metadata only, filters invented links, never loads PDFs',async t=>{
 const c=fixture();t.mock.method(globalThis,'fetch',async(_url:unknown,init:RequestInit)=>{
  const sent=JSON.parse(String(init.body));assert.equal(sent.contents[0].parts.length,1);const context=JSON.parse(sent.contents[0].parts[0].text).context;assert.equal(context.scope,'workspace_directory');assert.ok(!JSON.stringify(context).includes(c.requirements));
  return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({text:'Заявка требует анализа',sources:[],caseIds:['one','unknown']})}]}}]}));
 });
 const reply=await answerChat({cases:[c],history:[],text:'Что делать?',readDocument:async()=>{throw new Error('Workspace must not access documents');},config});assert.deepEqual(reply.caseIds,['one']);
});
test('provider failure does not fabricate a reply; demo is explicitly local',async t=>{
 const c={...fixture(),offers:[],attachments:[]};t.mock.method(globalThis,'fetch',async()=>new Response('private upstream details',{status:401}));
 await assert.rejects(()=>answerChat({c,cases:[c],history:[],text:'Вопрос',readDocument:async()=>{throw new Error('Unexpected PDF read');},config}),/срок токена истёк/);
 const demo=await answerChat({c:{...c,demo:true},cases:[c],history:[],text:'Вопрос',readDocument:async()=>{throw new Error('Unexpected PDF read');},config});assert.match(demo.text,/запрос к модели не выполнялся/);
});
