// Verify evidence normalization and current-revision export gates.
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnalysis } from '../server/analysis.js';
import { FIELDS, emptyCells, allReviewed, type Offer, type Case } from '../shared/types.js';
const offer: Offer = {
  id: 'o',
  name: 'test',
  cells: emptyCells(),
  documents: [{ id: 'f', name: 'offer.pdf', pages: 2, size: 100, version: 1, createdAt: '' }],
};
const result = () => ({
  fields: FIELDS.map((f) => ({
    key: f.key,
    value: '100 000 ₸',
    status: 'match',
    note: 'Условие найдено',
    evidence: { fileId: 'f', page: 1, text: 'Лимит 100 000 ₸' },
  })),
});
test('out-of-range and foreign citations cannot produce supported claims', () => {
  const r = result();
  r.fields[0].evidence.page = 3;
  r.fields[1].evidence.fileId = 'foreign';
  const cells = normalizeAnalysis(r, offer);
  assert.equal(cells.premium.status, 'unknown');
  assert.equal(cells.sum.evidence, null);
  assert.equal(cells.period.value, '100 000 ₸');
  assert.equal(cells.period.reviewed, false);
});
test('duplicates and incomplete model output are rejected', () => {
  const r = result();
  r.fields[1].key = r.fields[0].key;
  assert.throws(() => normalizeAnalysis(r, offer));
  assert.throws(() => normalizeAnalysis({ fields: [] }, offer));
});
test('missing source cannot silently be classified as covered', () => {
  const r = result();
  r.fields[0].evidence.text = '';
  assert.equal(normalizeAnalysis(r, offer).premium.value, 'Не найдено в документах');
});
test('export gate requires current revision and every broker review', () => {
  const cells = emptyCells();
  Object.values(cells).forEach((c) => (c.reviewed = true));
  const c = {
    revision: 3,
    analyzedRevision: 3,
    offers: [
      { ...offer, cells },
      { ...offer, id: 'o2', cells: structuredClone(cells) },
    ],
  } as Case;
  assert.equal(allReviewed(c), true);
  c.revision = 4;
  assert.equal(allReviewed(c), false);
  c.revision = 3;
  c.offers[1].cells.water.reviewed = false;
  assert.equal(allReviewed(c), false);
});
