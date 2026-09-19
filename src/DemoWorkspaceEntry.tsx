// Use the actual workspace UI with an isolated, in-memory demo transport.
import { useState } from 'react';
import App from './App';
import { allReviewed, FIELDS, type Case, type Cell, type FieldKey } from '../shared/types';
import fixture from '../landing/src/demo-data.json';
import './styles.css';

const pdfUrls: Record<string, string> = {
  'demo-1': new URL('../landing/public/demo/demo-1.pdf', import.meta.url).href,
  'demo-2': new URL('../landing/public/demo/demo-2.pdf', import.meta.url).href,
  'demo-3': new URL('../landing/public/demo/demo-3.pdf', import.meta.url).href,
};
const documentUrl = (id: string) => pdfUrls[id] ?? '';
function createDemoRequest() {
  let cases: Case[] = [structuredClone(fixture) as Case];
  return async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const method = options?.method ?? 'GET';
    const data = typeof options?.body === 'string' ? JSON.parse(options.body) : {};
    let result: unknown;
    if (path === '/auth/me') result = { user: { id: 'public-demo', email: 'demo@polis.local' } };
    else if (path === '/config')
      result = {
        configured: false,
        model: 'Учебный пример',
        local: true,
        provider: '',
        project: '',
        express: false,
      };
    else if (path === '/demo/reset') {
      cases = [structuredClone(fixture) as Case];
      result = cases[0];
    } else if (path === '/cases' && method === 'GET') result = cases;
    else if (path === '/cases' && method === 'POST') {
      const now = new Date().toISOString();
      const item: Case = {
        id: crypto.randomUUID(),
        title: data.title,
        client: data.client,
        requirements: data.requirements,
        demo: false,
        createdAt: now,
        updatedAt: now,
        revision: 0,
        analyzedRevision: null,
        offers: [],
        changes: [],
        selectedOfferId: null,
        comment: '',
        analysisSeconds: null,
      };
      cases.push(item);
      result = item;
    } else {
      const match = path.match(/^\/cases\/([^/]+)(?:\/(cells|review|analyze|documents))?$/);
      const item = cases.find((c) => c.id === match?.[1]);
      if (!match || !item)
        throw new Error(
          'В публичном демо доступны учебные заявки. Настройки AI и аккаунта — в рабочем кабинете.',
        );
      if (match[2] === 'cells') {
        const offer = item.offers.find((o) => o.id === data.offerId);
        if (!offer || !FIELDS.some((f) => f.key === data.field))
          throw new Error('Условие не найдено.');
        const key = data.field as FieldKey;
        offer.cells[key] = {
          ...offer.cells[key],
          value: data.value,
          status: data.status,
          note: data.note,
          reviewed: true,
          edited: true,
        } as Cell;
      } else if (match[2] === 'review') {
        const offer = item.offers.find((o) => o.id === data.offerId);
        if (offer)
          FIELDS.forEach((f) => {
            offer.cells[f.key].reviewed = Boolean(data.reviewed);
          });
      } else if (match[2] === 'documents' || match[2] === 'analyze') {
        throw new Error(
          'Публичное демо использует подготовленные PDF. Загрузка и AI-анализ своих файлов доступны в рабочем кабинете.',
        );
      } else if (method === 'PATCH') {
        if (typeof data.comment === 'string') item.comment = data.comment;
        if ('selectedOfferId' in data) item.selectedOfferId = data.selectedOfferId;
        if (typeof data.requirements === 'string') {
          item.requirements = data.requirements;
          item.revision += 1;
        }
      }
      result = item;
    }
    return structuredClone(result) as T;
  };
}
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
function exportDocument(item: Case) {
  if (!allReviewed(item)) throw new Error('Сначала проверьте все условия.');
  const rows = FIELDS.map(
    (f) =>
      `<tr><th>${f.label}</th>${item.offers.map((o) => `<td><strong>${escape(o.cells[f.key].value)}</strong><p>${escape(o.cells[f.key].note)}</p><small>${escape(o.cells[f.key].evidence?.text ?? 'Источник не найден — нужно уточнение.')}</small></td>`).join('')}</tr>`,
  ).join('');
  return new Blob(
    [
      `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Polis — учебное предложение</title><style>body{font:16px/1.5 sans-serif;margin:40px;color:#182a2b}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd8ce;padding:14px;text-align:left}p{white-space:pre-wrap}</style><h1>${escape(item.title)}</h1><p>Учебный пример. Все компании и условия вымышлены.</p><p>${escape(item.requirements)}</p><p>Выбор: ${escape(item.offers.find((o) => o.id === item.selectedOfferId)?.name ?? 'Оставлен клиенту')}</p><p>${escape(item.comment)}</p><table><tr><th>Условие</th>${item.offers.map((o) => `<th>${escape(o.name)}</th>`).join('')}</tr>${rows}</table></html>`,
    ],
    { type: 'text/html;charset=utf-8' },
  );
}
export default function DemoWorkspaceEntry() {
  const [request] = useState(createDemoRequest);
  return <App request={request} documentUrl={documentUrl} exportDocument={exportDocument} />;
}
