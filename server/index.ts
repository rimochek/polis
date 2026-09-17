import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {PDFDocument} from 'pdf-lib';
import {z} from 'zod';
import {FIELDS,emptyCells,allReviewed,type Case,type FieldKey,type Cell} from '../shared/types.js';
import {analyzeOffer,questionText} from './analysis.js';
import {makeDemo} from './demo.js';
import {getAIConfig,publicAIConfig,saveGoogleConfig} from './ai-config.js';
import {analyzeGemini,testGemini} from './gemini.js';

const app=express();const dataDir=path.resolve('data');fs.mkdirSync(dataDir,{recursive:true});
const dbFile=path.join(dataDir,'cases.json');let cases:Case[]=fs.existsSync(dbFile)?JSON.parse(fs.readFileSync(dbFile,'utf8')):[];
const save=()=>{fs.writeFileSync(`${dbFile}.tmp`,JSON.stringify(cases,null,2));fs.renameSync(`${dbFile}.tmp`,dbFile);};
if(!cases.some(c=>c.id==='demo')){cases.unshift(await makeDemo(dataDir));save();}
const busy=new Set<string>();const port=5174;
app.disable('x-powered-by');app.use(express.json({limit:'1mb'}));
app.use((req,res,next)=>{const host=(req.headers.host||'').split(':')[0];if(!['127.0.0.1','localhost'].includes(host))return res.status(403).json({error:'Разрешён только локальный доступ.'});const origin=req.headers.origin;if(origin&&!['http://127.0.0.1:5173','http://localhost:5173',`http://127.0.0.1:${port}`].includes(origin))return res.status(403).json({error:'Источник запроса не разрешён.'});res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');next();});
const getCase=(id:string)=>{const c=cases.find(c=>c.id===id);if(!c)throw Object.assign(new Error('Заявка не найдена.'),{status:404});return c;};
const editable=(c:Case)=>{if(busy.has(c.id))throw Object.assign(new Error('Дождитесь окончания анализа.'),{status:409});};
const touch=(c:Case,invalidate=false)=>{c.updatedAt=new Date().toISOString();if(invalidate){c.revision++;c.selectedOfferId=null;for(const o of c.offers)for(const cell of Object.values(o.cells))cell.reviewed=false;}save();};
const wrap=(handler:express.RequestHandler):express.RequestHandler=>(req,res,next)=>Promise.resolve(handler(req,res,next)).catch(next);
app.get('/api/config',(_req,res)=>res.json(publicAIConfig()));
app.post('/api/config/google',wrap((req,res)=>res.json(saveGoogleConfig(req.body))));
app.post('/api/config/test',wrap(async(_req,res)=>{const config=getAIConfig();if(config.provider!=='vertex')return res.status(400).json({error:'Сначала выберите подключение Google Cloud.'});if(!config.key)return res.status(503).json({error:'Сначала сохраните ключ или токен Google Cloud.'});res.json(await testGemini(config));}));
app.get('/api/cases',(_req,res)=>res.json(cases));
app.get('/api/cases/:id',(req,res)=>res.json(getCase(req.params.id)));
app.delete('/api/cases/:id',wrap((req,res)=>{const c=getCase(req.params.id as string);editable(c);if(c.demo)return res.status(400).json({error:'Демо-заявку можно только сбросить.'});cases=cases.filter(x=>x.id!==c.id);save();for(const o of c.offers)for(const doc of o.documents)fs.rmSync(path.join(dataDir,`${doc.id}.pdf`),{force:true});res.json({deleted:true});}));
app.post('/api/cases',wrap((req,res)=>{const input=z.object({title:z.string().trim().min(2).max(150),client:z.string().trim().min(2).max(150),requirements:z.string().trim().min(10).max(10000)}).parse(req.body);const now=new Date().toISOString();const c:Case={...input,id:randomUUID(),demo:false,createdAt:now,updatedAt:now,revision:0,analyzedRevision:null,offers:[],changes:[],selectedOfferId:null,comment:'',analysisSeconds:null};cases.push(c);save();res.status(201).json(c);}));
app.patch('/api/cases/:id',wrap((req,res)=>{const c=getCase(req.params.id as string);editable(c);const input=z.object({requirements:z.string().trim().min(10).max(10000).optional(),comment:z.string().max(4000).optional(),selectedOfferId:z.string().nullable().optional()}).parse(req.body);if(input.selectedOfferId&&!c.offers.some(o=>o.id===input.selectedOfferId))return res.status(400).json({error:'Предложение не найдено.'});const invalidate=input.requirements!==undefined&&input.requirements!==c.requirements;Object.assign(c,input);touch(c,invalidate);res.json(c);}));
app.post('/api/demo/reset',wrap(async(_req,res)=>{const old=getCase('demo');editable(old);const c=await makeDemo(dataDir);cases=cases.map(x=>x.id==='demo'?c:x);save();res.json(c);}));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:12*1024*1024,files:1}});
app.post('/api/cases/:id/documents',upload.single('file'),wrap(async(req,res)=>{
 const c=getCase(req.params.id as string);editable(c);if(c.demo)return res.status(400).json({error:'Создайте отдельную заявку для своих документов.'});
 const file=req.file;if(!file||!file.originalname.toLowerCase().endsWith('.pdf')||!file.buffer.subarray(0,5).equals(Buffer.from('%PDF-')))return res.status(400).json({error:'Загрузите PDF размером до 12 МБ.'});
 let pdf;try{pdf=await PDFDocument.load(file.buffer);}catch{return res.status(400).json({error:'Не удалось открыть PDF. Проверьте файл и снимите пароль.'});}
 const pages=pdf.getPageCount();if(pages<1||pages>40)return res.status(400).json({error:'В первой версии поддерживаются PDF от 1 до 40 страниц.'});
 editable(c);let offer=req.body.offerId?c.offers.find(o=>o.id===req.body.offerId):undefined;
 if(req.body.offerId&&!offer)return res.status(404).json({error:'Предложение не найдено.'});
 if(!offer){if(c.offers.length>=3)return res.status(400).json({error:'В одной заявке можно сравнить до трёх страховщиков.'});const name=z.string().trim().min(2).max(120).parse(req.body.name);offer={id:randomUUID(),name,documents:[],cells:emptyCells()};c.offers.push(offer);}
 const id=randomUUID();fs.writeFileSync(path.join(dataDir,`${id}.pdf`),file.buffer);offer.documents.push({id,name:Buffer.from(file.originalname,'latin1').toString('utf8'),pages,size:file.size,version:offer.documents.length+1,createdAt:new Date().toISOString()});touch(c,true);res.json(c);
}));
app.get('/api/documents/:id',(req,res)=>{const doc=cases.flatMap(c=>c.offers.flatMap(o=>o.documents)).find(d=>d.id===req.params.id);if(!doc)return res.status(404).end();res.type('application/pdf');res.setHeader('Content-Disposition',`inline; filename="${doc.id}.pdf"`);res.sendFile(path.join(dataDir,`${doc.id}.pdf`));});
app.post('/api/cases/:id/analyze',wrap(async(req,res)=>{
 const c=getCase(req.params.id as string);editable(c);if(c.demo)return res.json(c);
 const ai=getAIConfig();if(!ai.key)return res.status(503).json({error:'Подключите Google Cloud в настройках анализа. Готовый пример доступен без ключа.'});
 if(c.offers.length<2||c.offers.some(o=>!o.documents.length))return res.status(400).json({error:'Загрузите предложения минимум двух страховщиков.'});
 busy.add(c.id);const started=Date.now();try{
  const results:Awaited<ReturnType<typeof analyzeOffer>>[]=[];
  for(const o of c.offers){const pdf=fs.readFileSync(path.join(dataDir,`${o.documents.at(-1)!.id}.pdf`));results.push(ai.provider==='vertex'?await analyzeGemini(c,o,pdf,ai):await analyzeOffer(c,o,pdf,ai.key,ai.model));}

  c.changes=[];c.offers.forEach((o,i)=>{if(c.analyzedRevision!==null)for(const f of FIELDS){const old=o.cells[f.key].value;const fresh=results[i].cells[f.key].value;if(old!==fresh)c.changes.push({offer:o.name,field:f.label,before:old,after:fresh});}o.cells=results[i].cells;});c.analyzedRevision=c.revision;c.analysisSeconds=Math.round((Date.now()-started)/1000);touch(c);res.json(c);
 }finally{busy.delete(c.id);}
}));
app.patch('/api/cases/:id/cells',wrap((req,res)=>{const c=getCase(req.params.id as string);editable(c);if(c.revision!==c.analyzedRevision)return res.status(409).json({error:'Сначала обновите анализ после изменения документов или требований.'});const input=z.object({offerId:z.string(),field:z.enum(FIELDS.map(f=>f.key) as [FieldKey,...FieldKey[]]),value:z.string().trim().min(1).max(1500),status:z.enum(['match','mismatch','unknown','neutral']),note:z.string().max(2000),reviewed:z.boolean()}).parse(req.body);const o=c.offers.find(o=>o.id===input.offerId);if(!o)return res.status(404).json({error:'Предложение не найдено.'});const old=o.cells[input.field];const edited=old.value!==input.value||old.note!==input.note||old.status!==input.status;o.cells[input.field]={value:input.value,status:input.status,note:input.note,reviewed:input.reviewed,edited:old.edited||edited,evidence:old.evidence};touch(c);res.json(c);}));
app.get('/api/cases/:id/questions',(req,res)=>{const c=getCase(req.params.id);res.json(c.offers.map(o=>({offerId:o.id,name:o.name,questions:questionText(o)})));});
app.post('/api/cases/:id/review',wrap((req,res)=>{const c=getCase(req.params.id as string);editable(c);if(c.revision!==c.analyzedRevision)return res.status(409).json({error:'Перед проверкой обновите анализ.'});const input=z.object({offerId:z.string(),reviewed:z.boolean()}).parse(req.body);const offer=c.offers.find(o=>o.id===input.offerId);if(!offer)return res.status(404).json({error:'Предложение не найдено.'});for(const cell of Object.values(offer.cells))cell.reviewed=input.reviewed;touch(c);res.json(c);}));
const esc=(s:string)=>s.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
app.get('/api/cases/:id/export',(req,res)=>{const c=getCase(req.params.id);if(!allReviewed(c))return res.status(409).json({error:'Проверьте все условия актуального сравнения перед экспортом.'});const body=`<!doctype html><html lang="ru"><meta charset="utf-8"><title>${esc(c.title)} — страховое предложение</title><style>body{font:14px/1.5 system-ui,sans-serif;color:#182a2b;max-width:1120px;margin:40px auto;padding:24px}h1{font-size:28px}table{border-collapse:collapse;width:100%;margin:28px 0}th,td{padding:14px;border:1px solid #ccd5d2;text-align:left;vertical-align:top}small{color:#52635f}td p{margin:5px 0}header{display:flex;justify-content:space-between}mark{background:#e8f0d7}footer{margin-top:28px;border-top:1px solid #ccc;padding-top:16px}@media print{body{margin:0;padding:0}tr{break-inside:avoid}thead{display:table-header-group}}</style><header><strong>POLIS</strong><span>${c.demo?'Демонстрационный пример':'Проверено брокером'}</span></header><h1>${esc(c.title)}</h1><p>${esc(c.client)}</p><p>${esc(c.requirements)}</p>${c.demo?'<p><strong>Все компании и условия вымышлены. Не является реальным страховым предложением.</strong></p>':''}<table><thead><tr><th>Условие</th>${c.offers.map(o=>`<th>${esc(o.name)}${c.selectedOfferId===o.id?'<br><mark>Выбор брокера</mark>':''}</th>`).join('')}</tr></thead><tbody>${FIELDS.map(f=>`<tr><th>${esc(f.label)}</th>${c.offers.map(o=>{const cell=o.cells[f.key];return `<td><strong>${esc(cell.value)}</strong><p>${esc(cell.note)}</p><small>${cell.status==='mismatch'?'Есть расхождение с запросом. ':cell.status==='unknown'?'Требует уточнения. ':''}${cell.edited?'Редакция брокера. ':''}${cell.evidence?`Источник: ${esc(o.documents.find(d=>d.id===cell.evidence!.fileId)?.name??'PDF')}, стр. ${cell.evidence.page}.`:'Нет подтверждения в документах.'}</small></td>`;}).join('')}</tr>`).join('')}</tbody></table>${c.comment?`<h2>Комментарий брокера</h2><p>${esc(c.comment).replace(/\n/g,'<br>')}</p>`:''}<footer>Подготовлено ${new Date().toLocaleDateString('ru-RU')}. Основание — загруженные предложения и указанные источники. Окончательные условия определяются договором страховщика.</footer></html>`;res.type('html').setHeader('Content-Disposition',`attachment; filename="polis-${c.id}.html"`);res.send(body);});
app.use((err:Error&{status?:number;code?:string},_req:express.Request,res:express.Response,_next:express.NextFunction)=>{res.status(err instanceof z.ZodError?400:err.code==='LIMIT_FILE_SIZE'?413:err.status??500).json({error:err instanceof z.ZodError?'Проверьте заполненные поля.':err.code==='LIMIT_FILE_SIZE'?'Файл больше 12 МБ. Загрузите PDF меньшего размера.':err.message||'Не удалось выполнить действие.'});});
app.listen(port,'127.0.0.1',()=>console.log(`Polis API: http://127.0.0.1:${port} | AI ${getAIConfig().key?'configured':'not configured'}`));
