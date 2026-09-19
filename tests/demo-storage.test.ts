import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {makeOwnedDemo} from '../server/demo-storage.js';

test('owned demos have unique document ids and remapped evidence',async()=>{
 const dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'polis-demo-'));
 try{
  const first=await makeOwnedDemo(dataDir);const second=await makeOwnedDemo(dataDir);
  const firstIds=first.offers.flatMap(offer=>offer.documents.map(document=>document.id));
  const secondIds=second.offers.flatMap(offer=>offer.documents.map(document=>document.id));
  assert.notEqual(first.id,second.id);
  assert.equal(new Set([...firstIds,...secondIds]).size,6);
  for(const offer of first.offers)for(const cell of Object.values(offer.cells))if(cell.evidence)assert.ok(firstIds.includes(cell.evidence.fileId));
  for(const id of [...firstIds,...secondIds])assert.ok(fs.existsSync(path.join(dataDir,`${id}.pdf`)));
 }finally{fs.rmSync(dataDir,{recursive:true,force:true});}
});