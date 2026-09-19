// Edit the order, captions and actual element selectors here to change the pitch.
export type DemoStep = { id: string; target: string; title: string; hint: string };
export const demoSteps: DemoStep[] = [
  {
    id: 'story',
    target: '#story .story-wish',
    title: 'Надеюсь, вы любите сказки.',
    hint: 'Жил да был брокер. Файлы, сравнения, законодательство — и ни минуты свободного времени.',
  },
  {
    id: 'solution',
    target: '#solution .pitch-audiences',
    title: 'Боги послали ему Polis.',
    hint: 'Сегодня — AI-ассистент брокера. Следующий этап — понятный выбор страховки для физических лиц.',
  },
  {
    id: 'timing',
    target: '#why-now .regulation-grid',
    title: 'Почему именно сейчас?',
    hint: 'Цифровая инфраструктура, новая роль посредников и страховые маркетплейсы — направления реформы до 2030 года.',
  },
  {
    id: 'workspace',
    target: '#workspace-demo-frame',
    title: 'А теперь — сам Polis.',
    hint: 'Это рабочий кабинет. Переключите вкладки, откройте условие и проверьте источник. Далее — только когда захотите.',
  },
  {
    id: 'market',
    target: '#market .pitch-table-scroll',
    title: 'Начинаем с 20–40 команд.',
    hint: 'Наша цель на 24 месяца: 24–48 млн ₸ годовой регулярной выручки. Это оценка команды.',
  },
  {
    id: 'pricing',
    target: '#pricing .pitch-table-scroll',
    title: 'Подписка за сэкономленное время.',
    hint: 'Три планируемых тарифа: для специалиста, команды и бизнеса.',
  },
  {
    id: 'budget',
    target: '#budget .budget-donut',
    title: '6 млн ₸ на первый год.',
    hint: 'Основатели ведут разработку. Бюджет — на AI, инфраструктуру и первые продажи.',
  },
  {
    id: 'website',
    target: '#finale .pitch-qr-grid > a:first-child',
    title: 'Продолжите знакомство.',
    hint: 'Отсканируйте QR-код или откройте сайт по ссылке.',
  },
  {
    id: 'github',
    target: '#finale .pitch-qr-grid > a:last-child',
    title: 'Посмотрите, как всё устроено.',
    hint: 'Код проекта — на GitHub. Сказка продолжается.',
  },
];
