import test from 'node:test';
import assert from 'node:assert/strict';
import {askLegalAssistant} from '../server/legal-assistant.js';

test('a question with no matching articles never calls the model',async t=>{
 process.env.GEMINI_API_KEY='test-key';
 const fetchMock=t.mock.method(globalThis,'fetch',async()=>{throw new Error('fetch should not be called');});
 const result=await askLegalAssistant('рецепт борща');
 assert.equal(fetchMock.mock.calls.length,0);
 assert.equal(result.citations.length,0);
 assert.equal(result.inScope,true);
});

test('citations are only accepted for articles that were actually sent to the model',async t=>{
 process.env.GEMINI_API_KEY='test-key';
 t.mock.method(globalThis,'fetch',async(url:string,init:RequestInit)=>{
  const body=JSON.parse(init.body as string);
  const sentIds=(JSON.parse(body.contents[0].parts[0].text).articles as {articleId:string}[]).map(a=>a.articleId);
  assert.ok(sentIds.length>0);
  const fabricated={inScope:true,summary:'Нашлась одна подходящая статья.',citations:[{articleId:sentIds[0],why:'Прямо регулирует вопрос.'},{articleId:'not-a-real-article-id',why:'Модель выдумала эту статью.'}]};
  return new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(fabricated)}]}}]}));
 });
 const result=await askLegalAssistant('какая франшиза допустима по договору страхования имущества');
 assert.equal(result.citations.length,1);
 assert.ok(result.citations[0].sourceUrl.startsWith('https://zan.gov.kz/'));
});

test('an out-of-scope answer from the model is passed through as inScope=false',async t=>{
 process.env.GEMINI_API_KEY='test-key';
 t.mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify({inScope:false,summary:'Это не вопрос о страховом праве.',citations:[]})}]}}]})));
 const result=await askLegalAssistant('франшиза по договору страхования — как её обсудить с клиентом по чату');
 assert.equal(result.inScope,false);
 assert.equal(result.citations.length,0);
});

test('a missing API key fails clearly instead of calling the model',async()=>{
 delete process.env.GEMINI_API_KEY;
 await assert.rejects(()=>askLegalAssistant('какая франшиза допустима по договору страхования имущества'),/не настроен/);
});

test('an unauthorized response from the model does not leak upstream details',async t=>{
 process.env.GEMINI_API_KEY='test-key';
 t.mock.method(globalThis,'fetch',async()=>new Response('invalid api key details',{status:401}));
 await assert.rejects(()=>askLegalAssistant('какая франшиза допустима по договору страхования имущества'),e=>e instanceof Error&&e.message.includes('не принят')&&!e.message.includes('invalid api key details'));
});
