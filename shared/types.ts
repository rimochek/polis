export type Status = 'match'|'mismatch'|'unknown'|'neutral';
export type Evidence = {fileId:string;page:number;text:string};
export type Cell = {value:string;status:Status;note:string;evidence:Evidence|null;reviewed:boolean;edited?:boolean};
export type FieldKey = 'premium'|'sum'|'period'|'property'|'water'|'fire'|'deductible'|'exclusions';
export const FIELDS: {key:FieldKey;label:string;hint:string}[] = [
 {key:'premium',label:'Стоимость полиса',hint:'За весь период страхования'},
 {key:'sum',label:'Страховая сумма',hint:'Общий лимит покрытия'},
 {key:'period',label:'Срок страхования',hint:'Период действия'},
 {key:'property',label:'Имущество и товары',hint:'Что входит в покрытие'},
 {key:'water',label:'Затопление',hint:'В том числе аварии коммуникаций'},
 {key:'fire',label:'Пожар',hint:'Объём покрытия'},
 {key:'deductible',label:'Франшиза',hint:'Часть убытка за счёт клиента'},
 {key:'exclusions',label:'Исключения и подлимиты',hint:'Особые условия договора'}
];
export type DocumentInfo = {id:string;name:string;pages:number;size:number;version:number;createdAt:string};
export type Offer = {id:string;name:string;documents:DocumentInfo[];cells:Record<FieldKey,Cell>};
export type Change = {offer:string;field:string;before:string;after:string};
export const DOCUMENT_ROLES={requirements:'Требования клиента',policy:'Действующий полис',rules:'Правила страхования',correspondence:'Переписка'} as const;
export type DocumentRole=keyof typeof DOCUMENT_ROLES;
export type Attachment=DocumentInfo & {role:DocumentRole};
export type Activity={id:string;at:string;text:string};
export type ChatMessage={id:string;role:'user'|'assistant';text:string;createdAt:string;revision?:number;sources?:Evidence[];caseIds?:string[];draft?:string;demo?:boolean};
export type Case = {id:string;title:string;client:string;requirements:string;demo:boolean;createdAt:string;updatedAt:string;revision:number;analyzedRevision:number|null;offers:Offer[];changes:Change[];selectedOfferId:string|null;comment:string;analysisSeconds:number|null;attachments?:Attachment[];messages?:ChatMessage[];activity?:Activity[];resolvedQuestions?:string[];drafts?:Record<string,string>;dueDate?:string;owner?:string};
export const caseStage=(c:Case)=>allReviewed(c)?'Проверено':isCurrent(c)?'На проверке':c.offers.length>=2?'Нужен анализ':c.offers.length?'Ждём документы':'Черновик';
export const caseQuestions=(c:Case)=>c.offers.flatMap(o=>FIELDS.filter(f=>['mismatch','unknown'].includes(o.cells[f.key].status)).map(f=>({id:`${o.id}:${f.key}`,offerId:o.id,offer:o.name,field:f.key,title:f.label,text:o.cells[f.key].note,resolved:(c.resolvedQuestions||[]).includes(`${o.id}:${f.key}`)})));
export const emptyCells=()=>Object.fromEntries(FIELDS.map(f=>[f.key,{value:'Не найдено в документах',status:'unknown',note:'Загрузите предложение и запустите анализ.',evidence:null,reviewed:false}])) as Record<FieldKey,Cell>;
export const isCurrent=(c:Case)=>c.analyzedRevision===c.revision;
export const allReviewed=(c:Case)=>isCurrent(c)&&c.offers.length>=2&&c.offers.every(o=>FIELDS.every(f=>o.cells[f.key].reviewed));
