// Clone synthetic fixtures into account-specific documents and update their citations.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { makeDemo } from './demo.js';
import type { Case } from '../shared/types.js';

export async function makeOwnedDemo(dataDir: string): Promise<Case> {
  const demo = await makeDemo(dataDir);
  const owned = structuredClone(demo);
  owned.id = randomUUID();
  for (const offer of owned.offers)
    for (const document of offer.documents) {
      const sourceId = document.id;
      const documentId = randomUUID();
      document.id = documentId;
      fs.copyFileSync(
        path.join(dataDir, `${sourceId}.pdf`),
        path.join(dataDir, `${documentId}.pdf`),
      );
      for (const cell of Object.values(offer.cells))
        if (cell.evidence?.fileId === sourceId) cell.evidence.fileId = documentId;
    }
  return owned;
}
