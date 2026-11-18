// ============================================================
//  ДАННЫЕ КЛУБА (бета).
//  Всё, что видно на сайте, меняется здесь: контакты, столы,
//  цены, бар, тренеры, группы, турниры и чемпионы.
//  Сейчас это примеры: замените на реальные данные клуба.
// ============================================================

const CLUB = Object.freeze({
  name: 'TopSpin',
  tagline: 'Клуб настольного тенниса',
  city: 'Шымкент',
  address: 'ул. Примерная, 1',
  hoursLabel: 'Ежедневно, 10:00–23:00',
  openHour: 10,  // первый слот аренды
  closeHour: 23, // клуб закрывается (последний слот 22:00–23:00)
  whatsapp: '77000000000', // только цифры, с кодом страны
  phoneLabel: '+7 (700) 000-00-00',
  instagram: 'topspin_club', // без @
  mapQuery: 'Шымкент, ул. Примерная, 1',
});

const TABLES = Object.freeze([
  Object.freeze({ id: 1, name: 'Стол 1', title: 'Центральный', tag: 'Турнирный',
    text: 'Профессиональный стол стандарта ITTF, 25 мм. На нём проходят финалы турниров.' }),
  Object.freeze({ id: 2, name: 'Стол 2', title: 'Тренировочный', tag: 'Для тренировок',
    text: 'Свой робот-подавальщик и корзина мячей: удобно отрабатывать удары.' }),
  Object.freeze({ id: 3, name: 'Стол 3', title: 'У бара', tag: 'Для компании',
    text: 'Рядом с баром и диваном: играйте с друзьями и болейте за своих.' }),
]);

const PRICING = Object.freeze({
  day: 2500,       // ₸ за час, будни до 17:00
  evening: 3500,   // ₸ за час, будни с 17:00 и выходные
  eveningFrom: 17,
  currency: '₸',
  includes: ['Ракетки и мячи бесплатно', 'Раздевалка и душ', 'Можно продлить на месте'],
});

const BAR_MENU = Object.freeze([
  Object.freeze({ title: 'Кофе', items: Object.freeze([
    ['Американо', 900], ['Капучино', 1200], ['Латте', 1300], ['Раф', 1500],
  ]) }),
  Object.freeze({ title: 'Холодное', items: Object.freeze([
    ['Лимонад домашний', 1200], ['Айс-латте', 1400], ['Изотоник', 800], ['Вода 0,5', 400],
  ]) }),
  Object.freeze({ title: 'Перекусы', items: Object.freeze([
    ['Сэндвич с курицей', 1800], ['Протеиновый батончик', 900], ['Фруктовая тарелка', 1600], ['Орешки', 700],
  ]) }),
]);

const PLANS = Object.freeze([
  Object.freeze({ name: 'Разовое', price: 4000, unit: 'занятие',
    perks: ['Групповая тренировка 90 мин', 'Инвентарь включён', 'Без обязательств'] }),
  Object.freeze({ name: '8 занятий', price: 24000, unit: 'месяц', featured: true,
    perks: ['2 тренировки в неделю', 'Скидка 10% на аренду', 'Участие в клубном рейтинге'] }),
  Object.freeze({ name: 'Безлимит', price: 38000, unit: 'месяц',
    perks: ['Любые группы своего уровня', 'Скидка 20% на аренду', 'Турниры без взноса'] }),
  Object.freeze({ name: 'Индивидуально', price: 7000, unit: 'час',
    perks: ['Один на один с тренером', 'Разбор техники на видео', 'Время под вас'] }),
]);

const TRAINERS = Object.freeze([
  Object.freeze({ id: 'aidar', name: 'Айдар Нурланов', rank: 'Мастер спорта',
    years: 12, focus: 'Продвинутые, подготовка к турнирам' }),
  Object.freeze({ id: 'elena', name: 'Елена Ким', rank: 'КМС',
    years: 8, focus: 'Дети 7–14 лет' }),
  Object.freeze({ id: 'timur', name: 'Тимур Сапаров', rank: 'КМС',
    years: 6, focus: 'Начинающие взрослые' }),
  Object.freeze({ id: 'dana', name: 'Дана Ахметова', rank: '1 взрослый разряд',
    years: 5, focus: 'Средний уровень, техника подачи' }),
]);

// Уровни групп: ключ используется в фильтре расписания
const LEVELS = Object.freeze({
  kids: 'Дети',
  beginner: 'Начинающие',
  middle: 'Средний',
  pro: 'Продвинутые',
});

// day: 1 = понедельник ... 7 = воскресенье
const GROUPS = Object.freeze([
  Object.freeze({ day: 1, time: '16:00–17:30', level: 'kids', trainer: 'elena', spots: 3 }),
  Object.freeze({ day: 1, time: '19:00–20:30', level: 'beginner', trainer: 'timur', spots: 5 }),
  Object.freeze({ day: 2, time: '18:00–19:30', level: 'middle', trainer: 'dana', spots: 2 }),
  Object.freeze({ day: 2, time: '20:00–21:30', level: 'pro', trainer: 'aidar', spots: 1 }),
  Object.freeze({ day: 3, time: '16:00–17:30', level: 'kids', trainer: 'elena', spots: 4 }),
  Object.freeze({ day: 3, time: '19:00–20:30', level: 'beginner', trainer: 'timur', spots: 0 }),
  Object.freeze({ day: 4, time: '18:00–19:30', level: 'middle', trainer: 'dana', spots: 3 }),
  Object.freeze({ day: 4, time: '20:00–21:30', level: 'pro', trainer: 'aidar', spots: 2 }),
  Object.freeze({ day: 5, time: '16:00–17:30', level: 'kids', trainer: 'elena', spots: 2 }),
  Object.freeze({ day: 5, time: '19:00–20:30', level: 'middle', trainer: 'dana', spots: 4 }),
  Object.freeze({ day: 6, time: '11:00–12:30', level: 'kids', trainer: 'elena', spots: 1 }),
  Object.freeze({ day: 6, time: '13:00–14:30', level: 'beginner', trainer: 'timur', spots: 6 }),
  Object.freeze({ day: 7, time: '12:00–14:00', level: 'pro', trainer: 'aidar', spots: 3 }),
]);

// Даты в формате ГГГГ-ММ-ДД, время ЧЧ:ММ (местное).
// Прошедшие турниры автоматически скрываются из «Ближайших».
const TOURNAMENTS = Object.freeze([
  Object.freeze({ name: 'Осенний кубок TopSpin', date: '2026-11-29', time: '11:00',
    format: 'Одиночный разряд, группы + плей-офф', level: 'Открытый', fee: 3000, prize: 'Кубок и 50 000 ₸', spots: 32 }),
  Object.freeze({ name: 'Новогодний парный турнир', date: '2026-12-20', time: '12:00',
    format: 'Пары, олимпийская система', level: 'Любители', fee: 5000, prize: 'Призы от бара и кубки', spots: 16 }),
  Object.freeze({ name: 'Детское первенство клуба', date: '2027-01-10', time: '10:00',
    format: 'До 14 лет, круговая система', level: 'Дети', fee: 2000, prize: 'Медали всем участникам', spots: 24 }),
  Object.freeze({ name: 'Зимний рейтинговый турнир', date: '2027-01-31', time: '11:00',
    format: 'Одиночный разряд, по рейтингу клуба', level: 'Средний и выше', fee: 3000, prize: 'Кубок и 40 000 ₸', spots: 32 }),
]);

const CHAMPIONS = Object.freeze([
  Object.freeze({ tournament: 'Летний кубок TopSpin', date: '2026-08-23', champion: 'Ерлан Жумабаев', runnerUp: 'Артём Ли', score: '3:2' }),
  Object.freeze({ tournament: 'Турнир выходного дня', date: '2026-07-12', champion: 'Мадина Сейткали', runnerUp: 'Ольга Пак', score: '3:1' }),
  Object.freeze({ tournament: 'Весенний рейтинговый', date: '2026-04-19', champion: 'Артём Ли', runnerUp: 'Ерлан Жумабаев', score: '3:0' }),
  Object.freeze({ tournament: 'Парный турнир «Наурыз»', date: '2026-03-22', champion: 'Ли / Жумабаев', runnerUp: 'Пак / Ким', score: '3:2' }),
  Object.freeze({ tournament: 'Новогодний кубок', date: '2025-12-21', champion: 'Ерлан Жумабаев', runnerUp: 'Санжар Омаров', score: '3:1' }),
]);
