import fs from 'node:fs';
import path from 'node:path';
import type {LegalArticle} from '../shared/types.js';

const rawBase='https://raw.githubusercontent.com/kazakhstan-law/codes/main';
const apiBase='https://api.github.com/repos/kazakhstan-law/codes/contents';
const outDir=path.resolve('data/legal');

type SourceMeta={requisite:string;title:{rus:string};source:{rus:string};version_date:{rus:string}};

function parseMeta(yaml:string):SourceMeta{
 const scalar=(key:string)=>yaml.match(new RegExp(`^${key}:\\s*'?([^'\\n]+)'?$`,'m'))?.[1]?.trim()??'';
 const nested=(key:string,field:string)=>yaml.match(new RegExp(`^${key}:\\n(?:\\s+\\S+:.*\\n)*\\s+${field}:\\s*(.+)$`,'m'))?.[1]?.trim()??'';
 return {requisite:scalar('requisite'),title:{rus:nested('title','rus')},source:{rus:nested('source','rus')},version_date:{rus:nested('version_date','rus')}};
}

const fetchTimeoutMs=20000;
async function fetchText(url:string){const response=await fetch(url,{signal:AbortSignal.timeout(fetchTimeoutMs)});if(!response.ok)throw new Error(`Failed to fetch ${url}: ${response.status}`);return response.text();}
async function fetchJson<T>(url:string){const response=await fetch(url,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(fetchTimeoutMs)});if(!response.ok)throw new Error(`Failed to fetch ${url}: ${response.status}`);return response.json() as Promise<T>;}

async function chapterFiles(dir:string){
 const entries=await fetchJson<{name:string;type:string}[]>(`${apiBase}/${dir}/rus`);
 return entries.filter(entry=>entry.type==='file'&&entry.name.endsWith('.md')).map(entry=>entry.name);
}

function parseArticles(markdown:string,meta:SourceMeta):Omit<LegalArticle,'id'>[]{
 const articles:Omit<LegalArticle,'id'>[]=[];
 const chapterMatch=markdown.match(/^## (.+)$/m);
 const chapterTitle=chapterMatch?.[1]?.trim()??'';
 const articleBlocks=markdown.split(/(?=^### Статья )/m).slice(1);
 for(const block of articleBlocks){
  const headerMatch=block.match(/^### Статья ([\d-]+(?:-\d+)?)\.\s*(.+)$/m);
  if(!headerMatch)continue;
  const [,articleNumber,articleTitle]=headerMatch;
  const text=block.replace(/^### Статья [\d-]+(?:-\d+)?\.\s*.+$/m,'').replace(/<a id="[^"]*"><\/a>\s*/g,'').trim();
  articles.push({documentTitle:meta.title.rus,documentRequisite:meta.requisite,chapterTitle,articleNumber:articleNumber.trim(),articleTitle:articleTitle.trim(),text,sourceUrl:meta.source.rus,versionDate:meta.version_date.rus});
 }
 return articles;
}

async function loadDocument(dir:string,idPrefix:string):Promise<LegalArticle[]>{
 const metaYaml=await fetchText(`${rawBase}/${dir}/meta.yaml`);
 const meta=parseMeta(metaYaml);
 const files=await chapterFiles(dir);
 const articles:LegalArticle[]=[];
 for(const file of files){
  const markdown=await fetchText(`${rawBase}/${dir}/rus/${file}`);
  for(const article of parseArticles(markdown,meta)){
   articles.push({...article,id:`${idPrefix}-st${article.articleNumber}`});
  }
 }
 return articles;
}

const sources=[
 {dir:'03-laws/2000/1218-o-strakhovoi-deiatelnosti-7832',idPrefix:'insurance-law'},
 {dir:'02-codes/1999/0701-grazhdanskii-kodeks-respubliki-kazakhstan-osobennaia-chast-3559',idPrefix:'civil-code',chaptersOnly:['sec004-ch040.md']},
];

async function main(){
 fs.mkdirSync(outDir,{recursive:true});
 const all:LegalArticle[]=[];
 for(const source of sources){
  if(source.chaptersOnly){
   const metaYaml=await fetchText(`${rawBase}/${source.dir}/meta.yaml`);
   const meta=parseMeta(metaYaml);
   for(const file of source.chaptersOnly){
    const markdown=await fetchText(`${rawBase}/${source.dir}/rus/${file}`);
    for(const article of parseArticles(markdown,meta))all.push({...article,id:`${source.idPrefix}-st${article.articleNumber}`});
   }
  }else{
   all.push(...await loadDocument(source.dir,source.idPrefix));
  }
 }
 fs.writeFileSync(path.join(outDir,'articles.json'),JSON.stringify(all,null,2));
 console.log(`Saved ${all.length} articles from ${sources.length} documents to data/legal/articles.json`);
}

await main();
