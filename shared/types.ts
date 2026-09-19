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
export const DOCUMENT_ROLES = {
  requirements: 'Требования клиента',
  policy: 'Полис',
  rules: 'Правила страхования',
  correspondence: 'Переписка',
} as const;
export type DocumentRole = keyof typeof DOCUMENT_ROLES;
export type Attachment = DocumentInfo & { role: DocumentRole };
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  revision?: number;
  sources?: Evidence[];
  caseIds?: string[];
  draft?: string;
  demo?: boolean;
};
export type LegalArticle = {
  id: string;
  documentTitle: string;
  documentRequisite: string;
  chapterTitle: string;
  articleNumber: string;
  articleTitle: string;
  text: string;
  sourceUrl: string;
  versionDate: string;
};
export type LegalCitation = Pick<LegalArticle,
  'documentTitle' | 'articleNumber' | 'articleTitle' | 'sourceUrl' | 'versionDate'
> & { articleId: string; excerpt: string };
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
  attachments?: Attachment[];
  messages?: ChatMessage[];
  owner?: string;
  dueDate?: string;
  resolvedQuestions?: string[];
  drafts?: Record<string, string>;
  activity?: { id: string; at: string; text: string }[];
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

export const caseQuestions = (c: Case) =>
  c.offers.flatMap((offer) =>
    FIELDS.filter(({ key }) => ['mismatch', 'unknown'].includes(offer.cells[key].status))
      .map(({ key, label }) => {
        const id = `${c.revision}:${offer.id}:${key}`;
        return {
          id, offerId: offer.id, offer: offer.name, field: key, title: label,
          text: offer.cells[key].note,
          resolved: c.resolvedQuestions?.includes(id) ?? false,
        };
      }),
  );

export const caseStage = (c: Case) => {
  if (c.offers.length < 2) return 'Сбор предложений';
  if (!isCurrent(c)) return 'Требуется анализ';
  if (!allReviewed(c)) return 'Проверка условий';
  return 'Сравнение проверено';
};
