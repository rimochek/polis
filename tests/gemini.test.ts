import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeGemini,vertexEndpoint,callGemini} from '../server/gemini.js';
import {FIELDS,emptyCells,type Offer,type Case} from '../shared/types.js';
const config={provider:'vertex',key:'test-secret',auth:'token',model:'gemini-3.8-flash',project:'polis-test',location:'global',express:false};
const offer:Offer={id:'offer',name:'Synthetic',documents:[{id:'pdf-1',name:'sample.pdf',pages:2,size:100,version:1,createdAt:''}],cells:emptyCells()};
const c={requirements:'Лимит 80 млн тенге'} as Case;
const fields=()=>FIELDS.map(f=>({key:f.key,value:'80 млн ₸',status:'neutral',note:'Проверить',evidence:{fileId:'pdf-1',page:1,text:'80 млн тенге'}}));
test('Vertex receives PDF and server-side token; citations remain unreviewed',async t=>{
 t.mock.method(globalThis,'fetch',async(url:string,init:RequestInit)=>{
  assert.equal(url,vertexEndpoint(config));assert.equal((init.headers as Record<string,string>).Authorization,'Bearer test-secret');assert.ok(!url.includes('test-secret'));
  const sent=JSON.parse(init.body as string);assert.equal(sent.contents[0].parts[1].inlineData.mimeType,'application/pdf');assert.equal(sent.generationConfig.responseMimeType,'application/json');
  return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({fields:fields()})}]}}],usageMetadata:{totalTokenCount:100}}));
 });
 const r=await analyzeGemini(c,offer,Buffer.from('%PDF-test'),config);assert.equal(r.cells.sum.reviewed,false);assert.equal(r.cells.sum.evidence?.fileId,'pdf-1');assert.equal(r.tokens,100);
});
test('truncated output cannot be accepted as an analysis',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'{}'}]}}]})));
 await assert.rejects(()=>analyzeGemini(c,offer,Buffer.from('pdf'),config),/не завершил/);
});
test('Google errors do not echo sensitive upstream data',async t=>{
 t.mock.method(globalThis,'fetch',async()=>new Response('test-secret',{status:403}));
 await assert.rejects(()=>callGemini(config,{}),e=>e instanceof Error&&e.message.includes('доступе')&&!e.message.includes('test-secret'));
});
test('project and region cannot redirect credentials to another host',()=>{
 assert.throws(()=>vertexEndpoint({...config,location:'attacker.example'}));assert.throws(()=>vertexEndpoint({...config,project:'../../bad'}));
 assert.equal(new URL(vertexEndpoint(config)).hostname,'aiplatform.googleapis.com');
});

test('supplemental PDF roles reach Gemini without replacing the primary offer citation',async t=>{
 const attachment={id:'requirements-pdf',name:'requirements.pdf',role:'requirements' as const,pages:1,size:12,version:1,createdAt:''};
 t.mock.method(globalThis,'fetch',async(_url:unknown,init:RequestInit)=>{
  const sent=JSON.parse(init.body as string);assert.equal(sent.contents[0].parts.length,4);
  assert.equal(JSON.parse(sent.contents[0].parts[2].text).contextDocument.role,'requirements');
  assert.match(sent.systemInstruction.parts[0].text,/primary offer PDF/);
  const result=fields();result[0].evidence.fileId=attachment.id;
  return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({fields:result})}]}}]}));
 });
 const result=await analyzeGemini(c,offer,Buffer.from('primary'),config,[{doc:attachment,pdf:Buffer.from('requirements')}]);
 assert.equal(result.cells.premium.status,'unknown');assert.equal(result.cells.sum.evidence?.fileId,'pdf-1');
});
