import test from 'node:test';
import assert from 'node:assert/strict';
import {loadLegalArticles,findRelevantArticles,findArticleById} from '../server/legal-data.js';

test('legal corpus is loaded with the expected shape',()=>{
 const articles=loadLegalArticles();
 assert.ok(articles.length>0);
 const sample=articles[0];
 assert.ok(sample.id);
 assert.ok(sample.documentTitle);
 assert.ok(sample.articleNumber);
 assert.ok(sample.text);
 assert.ok(sample.sourceUrl.startsWith('https://zan.gov.kz/'));
});

test('deductible questions surface the deductible article from the insurance law',()=>{
 const results=findRelevantArticles('какая франшиза допустима по договору страхования имущества');
 assert.ok(results.length>0);
 assert.ok(results.some(article=>/франшиз/i.test(article.text)||/франшиз/i.test(article.articleTitle)));
});

test('an unrelated question returns no matches',()=>{
 const results=findRelevantArticles('рецепт борща');
 assert.equal(results.length,0);
});

test('findArticleById resolves a known id and rejects an unknown one',()=>{
 const [first]=loadLegalArticles();
 assert.equal(findArticleById(first.id)?.id,first.id);
 assert.equal(findArticleById('does-not-exist'),undefined);
});
