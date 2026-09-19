import {prisma} from '../server/db.js';
import {createDocumentStorage,documentStorageKey} from '../server/storage.js';

const storage=createDocumentStorage();
const documents=await prisma.document.findMany({where:{bytes:{not:null}}});
let migrated=0;
try{
  await storage.ensureBucket();
  for(const document of documents){
    if(!document.bytes)continue;
    await storage.put(document.id,Buffer.from(document.bytes));
    await prisma.document.update({where:{id:document.id},data:{storageKey:documentStorageKey(document.id)}});
    migrated++;
  }
  console.log(`Backfilled ${migrated} of ${documents.length} documents.`);
}finally{
  await prisma.$disconnect();
}