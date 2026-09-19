import {z} from 'zod';
import type {LegalArticle,LegalCitation} from '../shared/types.js';
import {findRelevantArticles} from './legal-data.js';

const model='gemini-3.6-flash';
const responseSchema={
 type:'OBJECT',required:['inScope','summary','citations'],properties:{
  inScope:{type:'BOOLEAN'},
  summary:{type:'STRING'},
  citations:{type:'ARRAY',maxItems:6,items:{type:'OBJECT',required:['articleId','why'],properties:{articleId:{type:'STRING'},why:{type:'STRING'}}}}
 }
};
const resultSchema=z.object({inScope:z.boolean(),summary:z.string().max(1500),citations:z.array(z.object({articleId:z.string(),why:z.string().max(400)})).max(6)});

function endpoint(){
 const key=process.env.GEMINI_API_KEY;
 if(!key)throw Object.assign(new Error('Юридический ассистент не настроен. Обратитесь к администратору для подключения GEMINI_API_KEY.'),{status:503});
 return {url:`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`};
}

const instructions=`Ты — навигатор по казахстанскому страховому законодательству для брокера. Ты НЕ даёшь юридических консультаций и НЕ формулируешь готовый юридический вывод. Твоя единственная задача — по вопросу брокера найти среди присланных статей закона те, что напрямую относятся к вопросу, и объяснить в одном-двух предложениях, почему каждая статья релевантна. Работай ТОЛЬКО с присланными статьями — они единственный источник правды. Никогда не используй общие знания о законодательстве, не додумывай номера статей, не упоминай законы, которых нет в присланном списке. Если ни одна из присланных статей не относится к вопросу — верни пустой список citations и в summary честно скажи, что подходящих статей не нашлось. Если вопрос не касается страхового права Казахстана (например, общий вопрос, другая отрасль права, не по теме) — верни inScope=false и коротко объясни в summary, что ассистент отвечает только на вопросы о страховом законодательстве. Никогда не давай окончательной юридической оценки ситуации, не говори "у вас есть право" или "вы обязаны" — только указывай, какая статья может быть relevant и почему, оставляя трактовку брокеру.`;

export type LegalAssistantResult={inScope:boolean;summary:string;citations:LegalCitation[]};

export async function askLegalAssistant(question:string):Promise<LegalAssistantResult>{
 const candidates=findRelevantArticles(question,8);
 if(!candidates.length)return {inScope:true,summary:'Подходящих статей не нашлось. Уточните вопрос или проверьте формулировку.',citations:[]};
 const {url}=endpoint();
 const context=candidates.map(article=>({articleId:article.id,document:article.documentTitle,article:`Статья ${article.articleNumber}. ${article.articleTitle}`,text:article.text}));
 const body={
  systemInstruction:{parts:[{text:instructions}]},
  contents:[{role:'user',parts:[{text:JSON.stringify({question,articles:context})}]}],
  generationConfig:{responseMimeType:'application/json',responseSchema,maxOutputTokens:2048}
 };
 let response:Response;
 try{
  let attempt=0;
  for(;;){
   response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(60000)});
   if(![429,503].includes(response.status)||attempt>=2)break;
   await response.arrayBuffer();
   attempt++;
   await new Promise(resolve=>setTimeout(resolve,attempt*2000));
  }
 }catch{
  throw new Error('Не удалось связаться с сервисом ассистента. Проверьте интернет и повторите запрос.');
 }
 if(!response.ok){
  const status=response.status;
  throw new Error(status===401||status===403?'Ключ ассистента не принят. Обратитесь к администратору.':status===429?'Превышен лимит запросов к ассистенту. Повторите позже.':`Сервис ассистента вернул ошибку ${status}. Повторите запрос.`);
 }
 const payload=await response.json() as {candidates?:{finishReason?:string;content?:{parts?:{text?:string}[]}}[]};
 const candidate=payload.candidates?.[0];
 if(candidate?.finishReason!=='STOP')throw new Error('Ассистент не завершил ответ. Повторите вопрос короче.');
 const raw=candidate.content?.parts?.map(part=>part.text??'').join('')??'';
 if(!raw)throw new Error('Ассистент не вернул ответ.');
 let parsed:unknown;
 try{parsed=JSON.parse(raw);}catch{throw new Error('Ассистент вернул некорректный ответ. Повторите запрос.');}
 const result=resultSchema.parse(parsed);
 const byId=new Map(candidates.map(article=>[article.id,article] as [string,LegalArticle]));
 const citations:LegalCitation[]=[];
 for(const citation of result.citations){
  const article=byId.get(citation.articleId);
  if(!article)continue;
  citations.push({articleId:article.id,documentTitle:article.documentTitle,articleNumber:article.articleNumber,articleTitle:article.articleTitle,excerpt:citation.why,sourceUrl:article.sourceUrl,versionDate:article.versionDate});
 }
 return {inScope:result.inScope,summary:result.summary,citations};
}
