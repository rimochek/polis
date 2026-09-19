import express from 'express';
import {randomUUID} from 'node:crypto';
import multer from 'multer';
import {PDFDocument} from 'pdf-lib';
import {z} from 'zod';
import {DOCUMENT_ROLES,caseQuestions,isCurrent,type Case,type ChatMessage,type Attachment} from '../shared/types.js';
import {answerChat,chatMessage} from './chat.js';

export type WorkspaceStore={
 owner:()=>string;
 list:()=>Case[];
 get:(id:string)=>Case;
 editable:(c:Case)=>void;
 touch:(c:Case,invalidate?:boolean,event?:string)=>Promise<void>;
 readDocument:(c:Case,id:string)=>Promise<Buffer>;
 addAttachment:(c:Case,doc:Attachment,bytes:Buffer)=>Promise<void>;
 loadMessages:()=>Promise<{messages:ChatMessage[];revision:number}>;
 saveMessages:(messages:ChatMessage[],revision:number)=>Promise<void>;
};
export function workspaceRoutes(store:WorkspaceStore){
 const router=express.Router();
 const run=(f:express.RequestHandler):express.RequestHandler=>(req,res,next)=>Promise.resolve(f(req,res,next)).catch(next);
 const cFor=(req:express.Request)=>store.get(String(req.params.id));
 const role=z.enum(Object.keys(DOCUMENT_ROLES) as ['requirements','policy','rules','correspondence']);
 const chatBusy=new Set<string>();
 router.get('/chat',run(async(_req,res)=>res.json((await store.loadMessages()).messages)));
 router.get('/cases/:id/chat',run((req,res)=>res.json(cFor(req).messages||[])));
 const chat=run(async(req,res)=>{
  const c=req.params.id?cFor(req):undefined;const key=store.owner()+':'+(c?.id||'workspace');
  if(chatBusy.has(key))return res.status(409).json({error:'Помощник уже отвечает. Дождитесь ответа.'});
  if(c)store.editable(c);
  const {message}=z.object({message:z.string().trim().min(1).max(6000)}).parse(req.body);
  const workspace=c?undefined:await store.loadMessages();const history=c?.messages||workspace?.messages||[];const revision=c?.revision;
  chatBusy.add(key);
  try{
   const snapshot=c?structuredClone(c):undefined;
   const answer=await answerChat({c:snapshot,cases:store.list(),history:[...history],text:message,readDocument:id=>{if(!snapshot)throw new Error('Нет контекста заявки.');return store.readDocument(snapshot,id);}});
   if(c&&(store.get(c.id)!==c||c.revision!==revision))return res.status(409).json({error:'Документы или требования изменились во время ответа. Повторите вопрос по актуальной версии.'});
   const next=[...history,chatMessage('user',message,revision),{...chatMessage('assistant',answer.text,revision),...answer,demo:!!c?.demo}].slice(-100);
   if(c){c.messages=next;await store.touch(c);}else{await store.saveMessages(next,workspace!.revision);}
   res.json(next);
  }finally{chatBusy.delete(key);}
 });
 router.post('/chat',chat);router.post('/cases/:id/chat',chat);
 router.patch('/cases/:id/details',run(async(req,res)=>{
  const c=cFor(req);store.editable(c);
  const input=z.object({owner:z.string().trim().max(100),dueDate:z.string().refine(v=>!v||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))))}).parse(req.body);
  Object.assign(c,input);await store.touch(c,false,'Обновлены срок и ответственный');res.json(c);
 }));
 router.patch('/cases/:id/clarifications',run(async(req,res)=>{
  const c=cFor(req);store.editable(c);if(!isCurrent(c))return res.status(409).json({error:'Обновите анализ перед изменением уточнений.'});
  const input=z.object({questionId:z.string(),resolved:z.boolean()}).parse(req.body);
  const q=caseQuestions(c).find(q=>q.id===input.questionId);if(!q)return res.status(404).json({error:'Вопрос не найден.'});
  const resolved=new Set(c.resolvedQuestions||[]);input.resolved?resolved.add(q.id):resolved.delete(q.id);c.resolvedQuestions=[...resolved];
  await store.touch(c,false,`${input.resolved?'Отмечен ответ':'Возобновлён вопрос'}: ${q.offer}, ${q.title}`);res.json(c);
 }));
 router.put('/cases/:id/drafts',run(async(req,res)=>{
  const c=cFor(req);store.editable(c);const input=z.object({offerId:z.string(),text:z.string().max(10000)}).parse(req.body);
  if(input.offerId!=='assistant'&&!c.offers.some(o=>o.id===input.offerId))return res.status(404).json({error:'Страховщик не найден.'});
  c.drafts={...c.drafts,[input.offerId]:input.text};await store.touch(c,false,'Сохранён черновик уточнений');res.json(c);
 }));
 const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:12*1024*1024,files:1}});
 router.post('/cases/:id/attachments',upload.single('file'),run(async(req,res)=>{
  const c=cFor(req);store.editable(c);if(c.demo)return res.status(400).json({error:'Для своих документов создайте отдельную заявку.'});
  if((c.attachments?.length||0)>=6)return res.status(400).json({error:'В заявке поддерживается до шести дополнительных PDF.'});
  const documentRole=role.parse(req.body.role);const file=req.file;
  if(!file||!file.originalname.toLowerCase().endsWith('.pdf')||!file.buffer.subarray(0,5).equals(Buffer.from('%PDF-')))return res.status(400).json({error:'Выберите PDF до 12 МБ.'});
  let pdf;try{pdf=await PDFDocument.load(file.buffer);}catch{return res.status(400).json({error:'Не удалось открыть PDF. Проверьте файл и снимите пароль.'});}
  const pages=pdf.getPageCount();if(pages<1||pages>40)return res.status(400).json({error:'Поддерживаются PDF от 1 до 40 страниц.'});
  store.editable(c);
  if((c.attachments?.length||0)>=6)return res.status(400).json({error:'В заявке поддерживается до шести дополнительных PDF.'});
  const doc:Attachment={id:randomUUID(),name:Buffer.from(file.originalname,'latin1').toString('utf8'),role:documentRole,pages,size:file.size,version:1,createdAt:new Date().toISOString()};
  await store.addAttachment(c,doc,file.buffer);res.json(c);
 }));
 router.patch('/cases/:id/attachments/:documentId',run(async(req,res)=>{
  const c=cFor(req);store.editable(c);if(c.demo)return res.status(400).json({error:'Учебные документы менять нельзя.'});
  const doc=c.attachments?.find(d=>d.id===req.params.documentId);if(!doc)return res.status(404).json({error:'Документ не найден.'});
  doc.role=role.parse(req.body.role);await store.touch(c,true,`Изменена роль документа «${doc.name}»`);res.json(c);
 }));
 return router;
}
