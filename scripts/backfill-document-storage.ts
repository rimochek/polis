import {prisma} from '../server/db.js';
import {createDocumentStorage,documentStorageKey} from '../server/storage.js';

const storage=createDocumentStorage();
const batchSize=100;
const total=await prisma.document.count({where:{bytes:{not:null},storageKey:null}});
let migrated=0;
try{
  await storage.ensureBucket();
  let cursor:string|undefined;
  while(true){
    const documents=await prisma.document.findMany({
      where:{bytes:{not:null},storageKey:null},
      orderBy:{id:'asc'},
      take:batchSize,
      ...(cursor?{cursor:{id:cursor},skip:1}:{}),
    });
    if(!documents.length)break;
    for(const document of documents){
      if(!document.bytes)continue;
      await storage.put(document.id,Buffer.from(document.bytes));
      await prisma.document.update({where:{id:document.id},data:{storageKey:documentStorageKey(document.id),bytes:null}});
      migrated++;
    }
    cursor=documents.at(-1)?.id;
  }
  console.log(`Backfilled ${migrated} of ${total} documents.`);
}finally{
  await prisma.$disconnect();
}