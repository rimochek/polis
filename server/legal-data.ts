import fs from 'node:fs';
import path from 'node:path';
import type {LegalArticle} from '../shared/types.js';

const dataFile=path.resolve('data/legal/articles.json');
let cached:LegalArticle[]|null=null;

export function loadLegalArticles():LegalArticle[]{
 if(cached)return cached;
 if(!fs.existsSync(dataFile))throw new Error('База законодательства не загружена. Выполните scripts/fetch-legal-sources.ts.');
 cached=JSON.parse(fs.readFileSync(dataFile,'utf8')) as LegalArticle[];
 return cached;
}

const stopWords=new Set(['и','в','на','с','по','о','об','от','для','как','что','это','к','за','из','не','или','а','но','же','ли','до','при','его','их','она','он','оно','мне','мой','моя']);

function tokenize(text:string):string[]{
 return text.toLowerCase().replace(/[^a-zа-яё0-9\s-]/gi,' ').split(/\s+/).filter(word=>word.length>2&&!stopWords.has(word));
}

function articleWordCounts(article:LegalArticle):Map<string,number>{
 const counts=new Map<string,number>();
 for(const word of tokenize(`${article.articleTitle} ${article.text} ${article.chapterTitle}`))counts.set(word,(counts.get(word)??0)+1);
 return counts;
}

function documentFrequency(articles:LegalArticle[],token:string):number{
 let count=0;
 for(const article of articles)if(articleWordCounts(article).has(token))count++;
 return count;
}

function score(counts:Map<string,number>,titleLower:string,queryTokens:string[],idf:Map<string,number>):number{
 let total=0;
 for(const token of queryTokens){
  const hits=counts.get(token)??0;
  if(!hits)continue;
  const weight=idf.get(token)??1;
  total+=Math.min(hits,3)*weight;
  if(titleLower.includes(token))total+=3*weight;
 }
 return total;
}

export function findRelevantArticles(question:string,limit=6):LegalArticle[]{
 const queryTokens=[...new Set(tokenize(question))];
 if(!queryTokens.length)return [];
 const articles=loadLegalArticles();
 const idf=new Map(queryTokens.map(token=>{const df=documentFrequency(articles,token);return [token,df>0?Math.log(1+articles.length/df):0];}));
 const scored=articles.map(article=>({article,points:score(articleWordCounts(article),article.articleTitle.toLowerCase(),queryTokens,idf)})).filter(entry=>entry.points>0);
 scored.sort((a,b)=>b.points-a.points);
 return scored.slice(0,limit).map(entry=>entry.article);
}

export function findArticleById(id:string):LegalArticle|undefined{
 return loadLegalArticles().find(article=>article.id===id);
}
