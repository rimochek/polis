// Domain contracts shared by the API, authenticated workspace, and static demo.
export type Status = 'match' | 'mismatch' | 'unknown' | 'neutral';
export type Evidence = { fileId: string; page: number; text: string };
export type Cell = {
  value: string;
  status: Status;
  note: string;
  evidence: Evidence | null;
  reviewed: boolean;
  edited?: boolean;
};
export type FieldKey =
  'premium' | 'sum' | 'period' | 'property' | 'water' | 'fire' | 'deductible' | 'exclusions';
export const FIELDS: { key: FieldKey; label: string; hint: string }[] = [
  { key: 'premium', label: 'Стоимость полиса', hint: 'За весь период страхования' },
  { key: 'sum', label: 'Страховая сумма', hint: 'Общий лимит покрытия' },
  { key: 'period', label: 'Срок страхования', hint: 'Период действия' },
  { key: 'property', label: 'Имущество и товары', hint: 'Что входит в покрытие' },
  { key: 'water', label: 'Затопление', hint: 'В том числе аварии коммуникаций' },
  { key: 'fire', label: 'Пожар', hint: 'Объём покрытия' },
  { key: 'deductible', label: 'Франшиза', hint: 'Часть убытка за счёт клиента' },
  { key: 'exclusions', label: 'Исключения и подлимиты', hint: 'Особые условия договора' },
];
export type DocumentInfo = {
  id: string;
  name: string;
  pages: number;
  size: number;
  version: number;
  createdAt: string;
};
export type Offer = {
  id: string;
  name: string;
  documents: DocumentInfo[];
  cells: Record<FieldKey, Cell>;
};
export type Change = { offer: string; field: string; before: string; after: string };
export type Case = {
  id: string;
  title: string;
  client: string;
  requirements: string;
  demo: boolean;
  createdAt: string;
  updatedAt: string;
  revision: number;
  analyzedRevision: number | null;
  offers: Offer[];
  changes: Change[];
  selectedOfferId: string | null;
  comment: string;
  analysisSeconds: number | null;
};
export const emptyCells = () =>
  Object.fromEntries(
    FIELDS.map((f) => [
      f.key,
      {
        value: 'Не найдено в документах',
        status: 'unknown',
        note: 'Загрузите предложение и запустите анализ.',
        evidence: null,
        reviewed: false,
      },
    ]),
  ) as Record<FieldKey, Cell>;
export const isCurrent = (c: Case) => c.analyzedRevision === c.revision;
// A review from an older document/requirements revision cannot unlock export.
export const allReviewed = (c: Case) =>
  isCurrent(c) &&
  c.offers.length >= 2 &&
  c.offers.every((o) => FIELDS.every((f) => o.cells[f.key].reviewed));
