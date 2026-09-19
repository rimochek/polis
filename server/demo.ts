// Generate fictional PDF proposals and deterministic comparison cells without AI requests.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'node:fs';
import path from 'node:path';
import { FIELDS, emptyCells, type Case, type Status } from '../shared/types.js';

const names = ['Орбита Страхование', 'Вектор Полис', 'Сфера Защита'];
const values = [
  [
    '420 000 ₸',
    '80 000 000 ₸',
    '12 месяцев',
    'Помещение, оборудование и товары',
    'Включено',
    'Включено',
    '100 000 ₸',
    'Износ и постепенное воздействие',
  ],
  [
    '365 000 ₸',
    '80 000 000 ₸',
    '12 месяцев',
    'Помещение и оборудование',
    'Не найдено в документах',
    'Включено',
    '1% страховой суммы',
    'Износ; товарные запасы исключены',
  ],
  [
    '485 000 ₸',
    '80 000 000 ₸',
    '12 месяцев',
    'Помещение, оборудование и товары',
    'Включено, лимит 5 000 000 ₸',
    'Включено',
    '50 000 ₸',
    'Износ; затопление до 5 000 000 ₸',
  ],
];
const notes = [
  [
    'Стоимость за год.',
    'Соответствует запрошенной сумме.',
    'Соответствует требованиям.',
    'Товарные запасы включены.',
    'Аварии водопровода включены без отдельного подлимита.',
    'Пожар включён.',
    'В пределах требования до 100 000 ₸.',
    'Проверить исключение износа с клиентом.',
  ],
  [
    'Стоимость за год.',
    'Соответствует запрошенной сумме.',
    'Соответствует требованиям.',
    'Клиент просил включить товары, но они исключены.',
    'В предложении нет условия о затоплении. Запросите подтверждение покрытия.',
    'Пожар включён.',
    '1% от 80 000 000 ₸ = 800 000 ₸. Выше требуемых 100 000 ₸.',
    'Товарные запасы исключены, хотя требуются клиенту.',
  ],
  [
    'Стоимость за год.',
    'Соответствует запрошенной сумме.',
    'Соответствует требованиям.',
    'Товарные запасы включены.',
    'Подлимит 5 000 000 ₸. Клиент просил без отдельного подлимита.',
    'Пожар включён.',
    'В пределах требования до 100 000 ₸.',
    'Подлимит по затоплению не соответствует запросу.',
  ],
];
const statuses: Status[][] = [
  ['neutral', 'match', 'match', 'match', 'match', 'match', 'match', 'neutral'],
  ['neutral', 'match', 'match', 'mismatch', 'unknown', 'match', 'mismatch', 'mismatch'],
  ['neutral', 'match', 'match', 'match', 'mismatch', 'match', 'match', 'mismatch'],
];

export async function makeDemo(dataDir: string): Promise<Case> {
  const now = new Date().toISOString();
  const c: Case = {
    id: 'demo',
    title: 'Магазин «Точка»',
    client: 'ТОО «Точка Маркет»',
    requirements:
      'Страхование магазина в Алматы на 12 месяцев. Страховая сумма 80 000 000 ₸. Включить помещение, оборудование и товарные запасы. Покрыть пожар и затопление при аварии водопровода без отдельного подлимита. Франшиза не более 100 000 ₸.',
    demo: true,
    createdAt: now,
    updatedAt: now,
    revision: 1,
    analyzedRevision: 1,
    offers: [],
    changes: [],
    selectedOfferId: null,
    comment: '',
    analysisSeconds: null,
  };
  const cyr = fs.readFileSync(
    path.resolve('node_modules/@fontsource/noto-sans/files/noto-sans-cyrillic-400-normal.woff'),
  );
  for (let i = 0; i < 3; i++) {
    const fileId = `demo-${i + 1}`;
    const cells = emptyCells();
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);
    const latin = await pdf.embedFont(StandardFonts.Helvetica);
    const russian = await pdf.embedFont(cyr, { subset: true });
    const getFont = (char: string) => (char.codePointAt(0)! > 255 ? russian : latin);
    for (let p = 0; p < 2; p++) {
      const page = pdf.addPage([595, 842]);
      let y = 786;
      const line = (text: string, size = 11) => {
        let x = 44;
        for (const char of text) {
          const font = getFont(char);
          const w = font.widthOfTextAtSize(char, size);
          if (x + w > 550) {
            y -= 19;
            x = 44;
          }
          page.drawText(char, { x, y, size, font, color: rgb(0.13, 0.19, 0.2) });
          x += w;
        }
        y -= size + 14;
      };
      line('POLIS / ДЕМОНСТРАЦИОННЫЙ ДОКУМЕНТ', 10);
      line(names[i], 21);
      line('Вымышленные условия. Не является страховым предложением.', 10);
      line('Страхование имущества магазина «Точка»', 12);
      y -= 18;
      for (let n = p * 4; n < (p + 1) * 4; n++) {
        const f = FIELDS[n];
        const text = `${f.label}: ${values[i][n]}. ${notes[i][n]}`.replaceAll('₸', 'тенге');
        if (statuses[i][n] === 'unknown') {
          line(`${f.label}: условие в этом документе не приведено.`);
          cells[f.key] = {
            value: values[i][n],
            status: 'unknown',
            note: notes[i][n],
            evidence: null,
            reviewed: false,
          };
        } else {
          line(text);
          cells[f.key] = {
            value: values[i][n],
            status: statuses[i][n],
            note: notes[i][n],
            evidence: { fileId, page: p + 1, text },
            reviewed: false,
          };
        }
        y -= 24;
      }
      y = 45;
      line(`Синтетический пример / Страница ${p + 1} из 2`, 9);
    }
    const bytes = await pdf.save();
    fs.writeFileSync(path.join(dataDir, `${fileId}.pdf`), bytes);
    c.offers.push({
      id: `offer-${i + 1}`,
      name: names[i],
      documents: [
        {
          id: fileId,
          name: `Предложение ${names[i]}.pdf`,
          pages: 2,
          size: bytes.length,
          version: 1,
          createdAt: now,
        },
      ],
      cells,
    });
  }
  return c;
}
