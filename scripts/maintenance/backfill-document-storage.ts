// Migrate legacy PDFs; the current analysis path still requires database bytes (see docs/architecture.md).
import { prisma } from '../../server/db.js';
import { createDocumentStorage, documentStorageKey } from '../../server/storage.js';

const storage = createDocumentStorage();
const batchSize = 100;
const total = await prisma.document.count({ where: { bytes: { not: null }, storageKey: null } });
let migrated = 0;
try {
  await storage.ensureBucket();
  let cursor: string | undefined;
  while (true) {
    const documents = await prisma.document.findMany({
      where: { bytes: { not: null }, storageKey: null },
      orderBy: { id: 'asc' },
      take: batchSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (!documents.length) break;
    for (const document of documents) {
      if (!document.bytes) continue;
      // Persist the object before clearing the legacy copy, so a failed upload is retryable.
      await storage.put(document.id, Buffer.from(document.bytes));
      await prisma.document.update({
        where: { id: document.id },
        data: { storageKey: documentStorageKey(document.id), bytes: null },
      });
      migrated++;
    }
    cursor = documents.at(-1)?.id;
  }
  console.log(`Backfilled ${migrated} of ${total} documents.`);
} finally {
  await prisma.$disconnect();
}
