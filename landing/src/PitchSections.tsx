import { ArrowUpRight, Files, MagnifyingGlass, Sparkle } from '@phosphor-icons/react';
import './pitch.css';

export function Story() {
  return (
    <>
      <section className="pitch-section lp-container" id="story">
        <div className="pitch-heading">
          <span className="pitch-eyebrow">01 / Знакомая сказка</span>
          <h2>Жил да был страховой брокер.</h2>
          <p>В далёком 2026 году. И времени ему всё так же не хватало.</p>
        </div>
        <div className="story-stages">
          <article>
            <Files size={27} />
            <span>Предложения</span>
            <h3>
              Разные файлы.
              <br />
              Часы сравнения.
            </h3>
          </article>
          <article>
            <MagnifyingGlass size={27} />
            <span>Законодательство</span>
            <h3>
              Много вопросов.
              <br />
              Долгий поиск.
            </h3>
          </article>
          <article className="story-wish">
            <Sparkle size={27} />
            <span>Одна просьба</span>
            <h3>
              «Дайте мне помощника,
              <br />
              который сбережёт время».
            </h3>
          </article>
        </div>
        <details className="story-script">
          <summary>Рассказать сказку целиком</summary>
          <p>
            Надеюсь, вы любите сказки. Жил да был в далёком 2026 году страховой брокер. Много он
            страдал, разбирая разные форматы файлов да сравнивая предложения. Долго искал он ответы
            в законодательстве по страховым случаям, умаялся и устал. Вскинул руки к небу и попросил
            у богов помощника, который время его сэкономит.
          </p>
          <p>Боги послали ему Polis — и вот мы здесь.</p>
        </details>
        <div className="pitch-reveal" id="solution">
          <span className="pitch-eyebrow">02 / И появился Polis</span>
          <h2>
            Экспертиза — человеку.
            <br />
            Рутина — помощнику.
          </h2>
          <div className="pitch-audiences">
            <div>
              <span>Сейчас · B2B</span>
              <h3>AI-ассистент брокера</h3>
              <p>Сравнение предложений, проверка источников и подготовка решения.</p>
            </div>
            <div>
              <span>Следующий этап · B2C</span>
              <h3>Выбор страховки для каждого</h3>
              <p>Быстрый поиск и понятный выбор страхования для физических лиц.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="pitch-section pitch-regulation lp-container" id="why-now">
        <div className="pitch-heading">
          <span className="pitch-eyebrow">03 / Почему сейчас</span>
          <h2>
            Рынок движется
            <br />к цифровому страхованию.
          </h2>
          <p>Инициативы АРРФР до 2030 года открывают возможности для Polis.</p>
        </div>
        <div className="regulation-grid">
          <article>
            <span>01</span>
            <h3>Цифровой обмен</h3>
            <p>Open API и развитие общей инфраструктуры финансового рынка.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Новая роль посредников</h3>
            <p>Планируется расширение возможностей брокеров и агентов.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Страховые маркетплейсы</h3>
            <p>Планируется закрепление их статуса для сравнения и оформления страховок.</p>
          </article>
        </div>
        <p className="pitch-thesis">
          Наша стратегия: начать с помощника брокера, затем развивать умный выбор страховки для B2C.
        </p>
        <p className="pitch-footnote">
          Планируемые изменения:{' '}
          <a
            href="https://www.gov.kz/memleket/entities/ardfm/press/news/details/1279275?lang=ru"
            target="_blank"
            rel="noreferrer"
          >
            программа страхового рынка до 2030 года
          </a>{' '}
          ·{' '}
          <a
            href="https://www.gov.kz/memleket/entities/ardfm/press/news/details/501254?lang=ru"
            target="_blank"
            rel="noreferrer"
          >
            концепция Open API
          </a>
        </p>
      </section>
    </>
  );
}
const budget = [
  { name: 'Инструменты AI для разработки', value: '1,2 млн', share: 20, color: '#2b6b5b' },
  { name: 'AI внутри Polis', value: '1,8 млн', share: 30, color: '#193c36' },
  { name: 'Сервер, база, файлы и копии', value: '0,6 млн', share: 10, color: '#88ab99' },
  { name: 'Продажи и продвижение', value: '1,2 млн', share: 20, color: '#b9d77b' },
  { name: 'Администрирование', value: '0,3 млн', share: 5, color: '#dce7cf' },
  { name: 'Резерв', value: '0,9 млн', share: 15, color: '#e7d094' },
];
export function Business() {
  return (
    <>
      <section className="pitch-section lp-container" id="market">
        <div className="pitch-heading">
          <span className="pitch-eyebrow">05 / TAM · SAM · SOM</span>
          <h2>
            От первых команд
            <br />к рынку Казахстана.
          </h2>
          <p>Оценка команды. Первые 24 месяца — проверка спроса.</p>
        </div>
        <div className="pitch-table-scroll">
          <table className="pitch-table">
            <caption className="visually-hidden">TAM / SAM / SOM — оценка рынка</caption>
            <thead>
              <tr>
                <th scope="col">Уровень</th>
                <th scope="col">Расчётная база</th>
                <th scope="col">Годовая выручка</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  TAM<small>Целевой рынок КЗ</small>
                </th>
                <td>
                  ~840–1 250 организаций:
                  <br />
                  20–30% базы БНС + брокеры
                </td>
                <td>
                  <strong>1–1,5 млрд ₸</strong>
                </td>
              </tr>
              <tr>
                <th scope="row">
                  SAM<small>Обслуживаемая часть</small>
                </th>
                <td>150–250 организаций с подходящими задачами и бюджетом</td>
                <td>
                  <strong>180–300 млн ₸</strong>
                </td>
              </tr>
              <tr>
                <th scope="row">
                  SOM<small>Цель на 24 месяца</small>
                </th>
                <td>20–40 платящих организаций</td>
                <td>
                  <strong>24–48 млн ₸ ARR</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="pitch-footnote">
          Гипотеза рынка из материалов команды, не подтверждённая выручка. ARR — годовая регулярная
          выручка.
        </p>
      </section>
      <section className="pitch-section lp-container" id="pricing">
        <div className="pitch-heading">
          <span className="pitch-eyebrow">06 / Модель дохода</span>
          <h2>
            Подписка, которая
            <br />
            сэкономит время.
          </h2>
          <p>Ежемесячная оплата за команду + лимиты обработки документов и AI-чата.</p>
        </div>
        <div className="pitch-table-scroll">
          <table className="pitch-table">
            <caption className="visually-hidden">Планируемые тарифы Polis</caption>
            <thead>
              <tr>
                <th scope="col">Тариф / месяц</th>
                <th scope="col">Покупатель</th>
                <th scope="col">Предлагаемая комплектация</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  49 000 ₸<small>Старт</small>
                </th>
                <td>Один специалист</td>
                <td>Сравнение, AI-чат, отчёты</td>
              </tr>
              <tr>
                <th scope="row">
                  99 000 ₸<small>Команда</small>
                </th>
                <td>До 5 сотрудников</td>
                <td>Общие заявки, история и шаблоны</td>
              </tr>
              <tr>
                <th scope="row">
                  от 249 000 ₸<small>Бизнес</small>
                </th>
                <td>Большие объёмы</td>
                <td>Права доступа и интеграции по согласованию</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="pitch-footnote">
          Предлагаемая тарифная модель. Продажи и оплата в прототипе не подключены.
        </p>
      </section>
      <section className="pitch-section lp-container" id="budget">
        <div className="pitch-heading">
          <span className="pitch-eyebrow">07 / План на год</span>
          <h2>
            6 млн ₸<br />
            на первые 12 месяцев.
          </h2>
          <p>Разработку ведут основатели. Деньги идут на AI, инфраструктуру и первые продажи.</p>
        </div>
        <div className="budget-layout">
          <div
            className="budget-donut"
            role="img"
            aria-label="Бюджет 6 млн тенге. Распределение по статьям указано рядом."
          >
            <div>
              <strong>6 млн ₸</strong>
              <span>общий бюджет</span>
            </div>
          </div>
          <ul className="budget-legend">
            {budget.map((item) => (
              <li key={item.name}>
                <span className="budget-color" style={{ background: item.color }} />
                <span>{item.name}</span>
                <strong>
                  {item.value} ₸<small>{item.share}%</small>
                </strong>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
export function Finale() {
  return (
    <section className="pitch-section pitch-finale lp-container" id="finale">
      <span className="pitch-eyebrow">08 / Продолжение — за вами</span>
      <h2>
        Меньше рутины.
        <br />
        Больше ясности.
      </h2>
      <p>Откройте Polis. Посмотрите, как он устроен.</p>
      <div className="pitch-qr-grid">
        <a href="https://polis.depa-team.com" target="_blank" rel="noreferrer">
          <img
            src={new URL('../../imgs/site-qr.png', import.meta.url).href}
            alt="QR-код сайта Polis: polis.depa-team.com"
            width="180"
            height="180"
            loading="lazy"
          />
          <h3>
            Попробовать Polis <ArrowUpRight size={18} />
          </h3>
          <span>polis.depa-team.com</span>
        </a>
        <a href="https://github.com/rimochek/polis" target="_blank" rel="noreferrer">
          <img
            src={new URL('../../imgs/github-qr.png', import.meta.url).href}
            alt="QR-код репозитория github.com/rimochek/polis"
            width="180"
            height="180"
            loading="lazy"
          />
          <h3>
            Код проекта <ArrowUpRight size={18} />
          </h3>
          <span>github.com/rimochek/polis</span>
        </a>
      </div>
    </section>
  );
}
