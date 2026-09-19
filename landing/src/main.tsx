// Independent public landing and in-memory synthetic demo; no authenticated API is required.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  CheckCircle,
  WarningCircle,
  Question,
  FilePdf,
  Files,
  ChatText,
  Quotes,
  List,
  X,
  Plus,
  Minus,
  ArrowLeft,
  Download,
  ShieldCheck,
  CaretDown,
} from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import '@fontsource-variable/golos-text';
import { FIELDS, type Case, type Cell, type FieldKey } from '../../shared/types';
import demoJson from './demo-data.json';
import './style.css';

const demo = demoJson as Case;
const statusText = {
  match: 'Соответствует запросу',
  mismatch: 'Есть расхождение',
  unknown: 'Нужно уточнить',
  neutral: 'Для информации',
};
const StatusIcon = ({ status }: { status: Cell['status'] }) =>
  status === 'match' ? (
    <CheckCircle weight="fill" />
  ) : status === 'mismatch' ? (
    <WarningCircle weight="fill" />
  ) : status === 'unknown' ? (
    <Question weight="fill" />
  ) : (
    <Check />
  );

function Brand() {
  return (
    <a className="lp-brand" href="/" aria-label="Polis — главная">
      <span>p</span>polis<span className="brand-dot">.</span>
    </a>
  );
}
function DemoLink({
  children = 'Открыть демо',
  secondary = false,
}: {
  children?: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <a className={`lp-button ${secondary ? 'lp-secondary' : ''}`} href="/demo.html">
      {children}
      <ArrowUpRight size={18} />
    </a>
  );
}

// Keep review and selection state per mounted demo without modifying the shared fixtures.
function Comparison({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<{ offer: number; field: FieldKey } | null>(null);
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [mobileOffer, setMobileOffer] = useState(1);
  const [downloaded, setDownloaded] = useState(false);
  const [recommendation, setRecommendation] = useState('offer-1');
  const [comment, setComment] = useState('');
  const chosen = selected ? demo.offers[selected.offer] : null;
  const cell = selected && chosen ? chosen.cells[selected.field] : null;
  const field = selected ? FIELDS.find((f) => f.key === selected.field) : null;
  const rows = FIELDS.filter((f) =>
    compact
      ? ['premium', 'property', 'deductible'].includes(f.key)
      : !issuesOnly ||
        demo.offers.some((o) => ['mismatch', 'unknown'].includes(o.cells[f.key].status)),
  );
  const allChecked = reviewed.length === FIELDS.length * demo.offers.length;
  function markReviewed() {
    if (selected) {
      const key = `${selected.offer}-${selected.field}`;
      setReviewed((prev) => (prev.includes(key) ? prev : [...prev, key]));
      setSelected(null);
    }
  }
  function download() {
    if (!allChecked) return;
    const escape = (value: string) =>
      value.replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
      );
    const rowsHtml = FIELDS.map(
      (f) =>
        `<tr><th>${f.label}</th>${demo.offers
          .map((o) => {
            const c = o.cells[f.key];
            return `<td><strong>${escape(c.value)}</strong><p>${statusText[c.status]}</p><p>${escape(c.note)}</p><small>${c.evidence ? `Источник: ${escape(o.documents[0].name)}, страница ${c.evidence.page}. ${escape(c.evidence.text)}` : 'Источник не найден: необходимо уточнение.'}</small></td>`;
          })
          .join('')}</tr>`,
    ).join('');
    const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Polis · Демонстрационное предложение</title><style>body{font:15px/1.6 Arial,sans-serif;color:#182a2b;margin:48px}table{width:100%;border-collapse:collapse}th,td{padding:16px;border:1px solid #cdd9d2;text-align:left;vertical-align:top}small{font-size:12px}h1{font-size:32px}p{white-space:pre-wrap}@media print{body{margin:12px}}</style><h1>Предложение для магазина «Точка»</h1><p><strong>ДЕМОНСТРАЦИЯ. Все компании, документы и условия вымышлены. Не является страховым предложением.</strong></p><p>${escape(demo.requirements)}</p><p>Выбранный вариант: ${escape(demo.offers.find((o) => o.id === recommendation)!.name)}. Условия сверены пользователем в демонстрации.</p><p>${escape(comment)}</p><table><thead><tr><th>Условие</th>${demo.offers.map((o) => `<th>${escape(o.name)}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Polis-demo-предложение.html';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setDownloaded(true);
  }
  return (
    <div className={`compare ${compact ? 'compare-compact' : 'compare-full'}`}>
      <div className="compare-head">
        <div>
          <span className="sheet-symbol">
            <Files size={19} />
          </span>
          <strong>Магазин «Точка»</strong>
        </div>
        <span className="sample-label">Демо</span>
      </div>
      {!compact && (
        <>
          <p className="demo-requirements">
            <strong>Запрос клиента</strong>
            {demo.requirements}
          </p>
          <div className="demo-tools">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={issuesOnly}
                onChange={(e) => setIssuesOnly(e.target.checked)}
              />
              Только расхождения
            </label>
            <span>{reviewed.length} из 24 условий проверено</span>
          </div>
        </>
      )}
      <label className="demo-mobile-picker">
        Предложение страховщика
        <select value={mobileOffer} onChange={(e) => setMobileOffer(Number(e.target.value))}>
          {demo.offers.map((o, i) => (
            <option key={o.id} value={i}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <div className="compare-scroll">
        <table>
          <caption className="visually-hidden">
            Сравнение вымышленных предложений страхования магазина
          </caption>
          <thead>
            <tr>
              <th scope="col">Условия</th>
              {demo.offers.map((o, i) => (
                <th scope="col" key={o.id} className={i === mobileOffer ? 'chosen-mobile' : ''}>
                  <span>{o.name}</span>
                  {compact && <small>Предложение {i + 1}</small>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.key}>
                <th scope="row">{f.label}</th>
                {demo.offers.map((o, i) => {
                  const c = o.cells[f.key];
                  const checked = reviewed.includes(`${i}-${f.key}`);
                  return (
                    <td
                      key={o.id}
                      className={`${i === mobileOffer ? 'chosen-mobile' : ''} status-${c.status}`}
                    >
                      <button
                        className="evidence-button"
                        onClick={() => setSelected({ offer: i, field: f.key })}
                        aria-label={`${f.label}, ${o.name}: ${c.value}. ${statusText[c.status]}`}
                      >
                        <span className="cell-value">
                          {f.key !== 'premium' && (
                            <span className={`condition-status ${c.status}`}>
                              <StatusIcon status={c.status} />
                            </span>
                          )}
                          <strong>{c.value}</strong>
                        </span>
                        {!compact && <span className="cell-note">{c.note}</span>}
                        {!compact && (
                          <span className="cell-source">
                            {checked ? (
                              <>
                                <Check size={13} />
                                Проверено
                              </>
                            ) : c.evidence ? (
                              <>
                                <FilePdf size={13} />
                                стр. {c.evidence.page}
                              </>
                            ) : (
                              <>Нужно уточнить</>
                            )}
                          </span>
                        )}
                        {compact && f.key === 'deductible' && i === 1 && (
                          <span className="cell-note">
                            Выше запроса клиента
                            <ArrowUpRight size={13} />
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {compact ? (
        <div className="compare-foot">
          <span>
            <span className="condition-status mismatch">
              <WarningCircle weight="fill" />
            </span>
            Разница в условиях важнее разницы в цене.
          </span>
          <a href="/demo.html" aria-label="Открыть полное сравнение">
            <ArrowUpRight size={19} />
          </a>
        </div>
      ) : (
        <div className="demo-export">
          <div>
            <h2>Ваше предложение клиенту</h2>
            <p>
              Сверьте условия с источниками. Расхождения и неизвестные условия сохранятся в
              предложении.
            </p>
          </div>
          <div className="review-offers">
            {demo.offers.map((o, i) => (
              <label key={o.id}>
                <input
                  type="checkbox"
                  checked={FIELDS.every((f) => reviewed.includes(`${i}-${f.key}`))}
                  onChange={(e) => {
                    const keys = FIELDS.map((f) => `${i}-${f.key}`);
                    setReviewed((prev) =>
                      e.target.checked
                        ? Array.from(new Set([...prev, ...keys]))
                        : prev.filter((key) => !keys.includes(key)),
                    );
                  }}
                />
                Я сверил все условия «{o.name}»
              </label>
            ))}
          </div>
          <div className="export-fields">
            <label>
              Выбранный вариант
              <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)}>
                {demo.offers.map((o) => (
                  <option value={o.id} key={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Комментарий клиенту
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Что нужно учесть при выборе"
                rows={3}
              />
            </label>
          </div>
          <button className="lp-button" disabled={!allChecked} onClick={download}>
            <Download size={18} />
            Скачать пример предложения
          </button>
          <p className="export-note" role="status">
            {downloaded
              ? 'Файл HTML скачан. Его можно открыть и сохранить в PDF через печать браузера.'
              : allChecked
                ? 'Все условия отмечены как проверенные. Можно скачать HTML-файл.'
                : 'Скачивание откроется после проверки всех трёх предложений.'}
          </p>
        </div>
      )}
      <Dialog.Root
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="source-overlay" />
          <Dialog.Content className="landing-source">
            <div className="source-title">
              <div>
                <Dialog.Title>{field?.label}</Dialog.Title>
                <Dialog.Description>{chosen?.name} · демонстрационный документ</Dialog.Description>
              </div>
              <Dialog.Close className="round-control" aria-label="Закрыть источник">
                <X size={23} />
              </Dialog.Close>
            </div>
            {cell && (
              <>
                <div className={`source-finding ${cell.status}`}>
                  <StatusIcon status={cell.status} />
                  <div>
                    <strong>{statusText[cell.status]}</strong>
                    <p>{cell.note}</p>
                  </div>
                </div>
                <h3>Основание в документе</h3>
                {cell.evidence ? (
                  <>
                    <blockquote>{cell.evidence.text}</blockquote>
                    <a
                      className="pdf-link"
                      href={`/demo/${cell.evidence.fileId}.pdf#page=${cell.evidence.page}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FilePdf size={20} />
                      Открыть PDF · страница {cell.evidence.page}
                      <ArrowUpRight size={17} />
                    </a>
                  </>
                ) : (
                  <p className="missing-source">
                    В документе нет подтверждения этого условия. Его нужно уточнить у страховщика.
                  </p>
                )}
                <p className="source-disclosure">
                  Компании и условия вымышлены. В рабочем процессе вывод нужно сверять с полным
                  текстом документа.
                </p>
                <button className="lp-button" onClick={markReviewed}>
                  <Check size={18} />
                  {compact ? 'Понятно' : 'Условие проверено'}
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

const faqs = [
  [
    'Для кого создан Polis?',
    'Для страховых брокеров и небольших команд, которые сравнивают предложения нескольких страховщиков для бизнес-клиента. Первая версия посвящена страхованию коммерческого имущества.',
  ],
  [
    'Что именно делает AI?',
    'В рабочем прототипе AI извлекает условия из PDF, сопоставляет их с запросом клиента и указывает страницы-источники. Выводы остаются редактируемыми и требуют проверки брокером. На этом сайте показан готовый вымышленный пример без вызова AI.',
  ],
  [
    'Можно ли загрузить свои документы?',
    'Публичное демо работает на примере магазина «Точка». Загрузка своих PDF и AI-анализ доступны в локальном рабочем прототипе при подключении API-ключа. Публичный кабинет для клиентских документов ещё не запущен.',
  ],
  [
    'Что происходит с документами в демо?',
    'Все три PDF заранее созданы для демонстрации. Сайт не запрашивает ваши документы или персональные данные. Отметки проверки и комментарий существуют только в текущей вкладке и сбрасываются при обновлении страницы.',
  ],
  [
    'Сколько стоит использование?',
    'Демонстрацию можно попробовать бесплатно, без регистрации. Тарифы для рабочей версии пока не определены.',
  ],
  [
    'Polis выбирает страховщика за меня?',
    'Выбор и итоговая проверка остаются за брокером. Polis помогает увидеть различия, найти основание в документах и подготовить понятное предложение клиенту.',
  ],
];

function Landing() {
  const [menu, setMenu] = useState(false);
  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <header className="lp-header">
        <div className="lp-container nav-inner">
          <Brand />
          <nav className={menu ? 'nav-links open' : 'nav-links'} aria-label="Основная навигация">
            <a href="#how" onClick={() => setMenu(false)}>
              Как работает
            </a>
            <a href="#evidence" onClick={() => setMenu(false)}>
              Что внутри
            </a>
            <a href="#questions" onClick={() => setMenu(false)}>
              Вопросы
            </a>
          </nav>
          <a className="text-link nav-login" href="/app">
            Войти
            <ArrowUpRight size={16} />
          </a>
          <a className="nav-demo" href="/demo.html">
            Попробовать демо
            <ArrowUpRight size={17} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menu ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero lp-container">
          <div className="hero-copy">
            <h1>
              Разные полисы.
              <br />
              <span>Ясный выбор.</span>
            </h1>
            <p>
              Из предложений страховщиков&nbsp;— в&nbsp;понятное сравнение. С&nbsp;расхождениями,
              источниками и&nbsp;решением, которое остаётся за&nbsp;вами.
            </p>
            <div className="hero-actions">
              <DemoLink>Посмотреть в деле</DemoLink>
              <span>
                Для страховых брокеров
                <br />
                Без регистрации
              </span>
            </div>
          </div>
          <div className="hero-product">
            <div className="product-note">
              <Files size={17} />
              <span>Три предложения. Все условия рядом.</span>
            </div>
            <Comparison compact />
            <p className="product-hint">Нажмите на условие и посмотрите, откуда взялся вывод.</p>
          </div>
        </section>
        <div className="context-line lp-container">
          <span>Создан для работы с условиями</span>
          <span>PDF-предложения</span>
          <span>Имущество бизнеса</span>
          <span>Проверка брокером</span>
        </div>
        <section className="how-section lp-container" id="how">
          <div className="section-intro">
            <h2>
              От документов
              <br />к предложению клиенту.
            </h2>
            <p>Один последовательный процесс, в котором каждый вывод можно проверить.</p>
          </div>
          <ol className="workflow-story">
            <li>
              <span className="step-number">1</span>
              <div>
                <Files size={30} weight="light" />
                <h3>Соберите предложения</h3>
                <p>Укажите запрос клиента и добавьте PDF от двух или трёх страховщиков.</p>
                <span className="step-detail">Запрос + документы</span>
              </div>
            </li>
            <li>
              <span className="step-number">2</span>
              <div>
                <Quotes size={30} weight="light" />
                <h3>Проверьте различия</h3>
                <p>Сопоставьте лимиты, риски и исключения. Откройте источник спорного условия.</p>
                <span className="step-detail">Сравнение + проверка</span>
              </div>
            </li>
            <li>
              <span className="step-number">3</span>
              <div>
                <ChatText size={30} weight="light" />
                <h3>Подготовьте решение</h3>
                <p>
                  Уточните недостающие условия и соберите предложение с комментарием для клиента.
                </p>
                <span className="step-detail">Уточнения + предложение</span>
              </div>
            </li>
          </ol>
          <p className="workflow-note">
            В онлайн-демо документы уже загружены. Начните сразу со сравнения.
          </p>
        </section>
        <section className="evidence-section" id="evidence">
          <div className="lp-container evidence-layout">
            <div className="evidence-copy">
              <h2>
                За каждой цифрой
                <br />
                есть условие.
              </h2>
              <p>
                Одинаковая страховая сумма ещё не означает одинаковое покрытие. Polis помогает
                увидеть то, что меняет выбор.
              </p>
              <a href="/demo.html" className="text-link">
                Разобрать пример
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="difference-list">
              <article>
                <span className="difference-icon">
                  <WarningCircle weight="fill" />
                </span>
                <div>
                  <h3>Франшиза: 100 000 ₸ или 1%?</h3>
                  <p>
                    В примере 1% от страховой суммы превращается в 800 000 ₸. Такое расхождение
                    видно в таблице.
                  </p>
                </div>
              </article>
              <article>
                <span className="difference-icon">
                  <Question weight="fill" />
                </span>
                <div>
                  <h3>Не указано — значит, нужно уточнить</h3>
                  <p>
                    Отсутствующее условие остаётся вопросом к страховщику. Оно не становится
                    покрытием по умолчанию.
                  </p>
                </div>
              </article>
              <article>
                <span className="difference-icon">
                  <FilePdf />
                </span>
                <div>
                  <h3>Вывод связан с документом</h3>
                  <p>
                    Цитата и номер страницы помогают быстро найти основание и проверить контекст.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="human-section lp-container">
          <div className="human-image">
            <img
              src="/images/broker-desk.webp"
              width="1536"
              height="1024"
              loading="lazy"
              alt="Документы, зелёная папка и ручка на освещённом рабочем столе"
            />
            <span>
              Polis берёт на себя сравнение.
              <br />
              Вы сохраняете контроль.
            </span>
          </div>
          <div className="human-copy">
            <ShieldCheck size={35} weight="light" />
            <h2>
              Экспертиза — ваша.
              <br />
              Рутина — наша.
            </h2>
            <p>
              Проверяйте выводы, уточняйте детали, объясняйте выбор клиенту. Именно для этой работы
              мы создаём Polis.
            </p>
            <ul>
              <li>
                <Check size={17} />
                Условия можно сверить с источником
              </li>
              <li>
                <Check size={17} />
                Неизвестное явно отмечено
              </li>
              <li>
                <Check size={17} />
                Итог подтверждает брокер
              </li>
            </ul>
          </div>
        </section>
        <section className="faq-section lp-container" id="questions">
          <h2>До первого сравнения.</h2>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus className="faq-plus" size={21} />
                  <Minus className="faq-minus" size={21} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-section lp-container">
          <div className="closing-inner">
            <h2>
              Посмотрите на полис
              <br />с полной картиной.
            </h2>
            <p>
              Три предложения. Один магазин.
              <br />
              Несколько условий, которые меняют выбор.
            </p>
            <DemoLink>Сравнить предложения</DemoLink>
            <span className="closing-note">Бесплатный демопример · Без регистрации</span>
          </div>
          <div className="closing-mark" aria-hidden="true">
            p<span>.</span>
          </div>
        </section>
      </main>
      <footer className="lp-footer lp-container">
        <div>
          <Brand />
          <p>Ясность в страховых условиях.</p>
        </div>
        <nav aria-label="Навигация в подвале">
          <a href="#how">Как работает</a>
          <a href="#questions">Вопросы</a>
          <a href="/demo.html">
            Открыть демо
            <ArrowUpRight size={15} />
          </a>
        </nav>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Polis</span>
          <span>Прототип для страховых брокеров. Не является страховым предложением.</span>
        </div>
      </footer>
    </>
  );
}

function Demo() {
  return (
    <>
      <header className="lp-header">
        <div className="lp-container nav-inner">
          <Brand />
          <a href="/" className="text-link">
            <ArrowLeft size={17} />
            На главную
          </a>
        </div>
      </header>
      <main className="demo-page lp-container">
        <div className="demo-page-title">
          <h1>Попробуйте Polis в работе.</h1>
          <p>
            Сравните предложения для магазина «Точка». Откройте любое условие, проверьте источник и
            подготовьте пример предложения.
          </p>
        </div>
        <div className="demo-notice">
          <ShieldCheck size={22} />
          <p>
            <strong>Это демонстрация.</strong> Все компании, PDF и условия вымышлены. Отметки и
            комментарии сохраняются только до обновления страницы.
          </p>
        </div>
        <Comparison />
        <a className="demo-back" href="/">
          <ArrowLeft size={17} />
          Вернуться к описанию Polis
        </a>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {['/demo', '/demo.html'].includes(location.pathname.replace(/\/$/, '')) ? (
      <Demo />
    ) : (
      <Landing />
    )}
  </React.StrictMode>,
);
