// ============================================================
//  TopSpin, бета 2. Все данные сайта в одном месте.
//  Сейчас это примеры: замените на реальные данные клуба.
// ============================================================

const CLUB = Object.freeze({
  name: 'TopSpin',
  city: 'Шымкент',
  address: 'ул. Примерная, 1',
  hoursLabel: 'Ежедневно, 10:00–23:00',
  openHour: 10,
  closeHour: 23,
  whatsapp: '77000000000', // только цифры, с кодом страны
  phoneLabel: '+7 (700) 000-00-00',
  instagram: 'topspin_club',
  mapQuery: 'Шымкент, ул. Примерная, 1',
});

const PRICING = Object.freeze({
  day: 2500,        // ₸/час, будни до 17:00
  evening: 3500,    // ₸/час, будни с 17:00 и выходные
  eveningFrom: 17,
  currency: '₸',
});

const TABLES = Object.freeze([
  Object.freeze({ id: 1, name: 'Стол 1', title: 'Центральный', tag: 'Турнирный',
    text: 'Стол стандарта ITTF, 25 мм. Ровный отскок, как на соревнованиях.', tone: 'blue' }),
  Object.freeze({ id: 2, name: 'Стол 2', title: 'Тренировочный', tag: 'С роботом',
    text: 'Робот-подавальщик и корзина мячей для отработки ударов.', tone: 'indigo' }),
  Object.freeze({ id: 3, name: 'Стол 3', title: 'У бара', tag: 'Для компании',
    text: 'Рядом диван и бар. Удобно играть с друзьями и болеть за своих.', tone: 'teal' }),
]);

const DURATIONS = Object.freeze([1, 2, 3]); // часы
const BOOKING_DAYS = 7;

const PLANS = Object.freeze([
  Object.freeze({ id: 'start', name: 'Старт', lead: 'Для тех, кто только начинает.',
    monthly: 24000, perks: ['8 групповых тренировок', 'Скидка 10% на аренду', 'Инвентарь включён'] }),
  Object.freeze({ id: 'unlim', name: 'Безлимит', lead: 'Играйте столько, сколько хочется.', featured: true,
    monthly: 38000, perks: ['Любые группы своего уровня', 'Скидка 20% на аренду', 'Заморозка до 14 дней'] }),
  Object.freeze({ id: 'pro', name: 'Персональный', lead: 'Один на один с тренером.',
    monthly: 26000, perks: ['4 индивидуальные тренировки', 'Разбор техники на видео', 'Время под ваш график'] }),
]);

const BILLING = Object.freeze({
  month: Object.freeze({ label: '1 месяц', months: 1, discount: 0 }),
  quarter: Object.freeze({ label: '3 месяца', months: 3, discount: 0.1 }),
});

// Сравнение: true = есть, false = нет, строка = значение
const COMPARE = Object.freeze([
  Object.freeze({ label: 'Групповые тренировки', values: ['8 в месяц', 'Без ограничений', false] }),
  Object.freeze({ label: 'Индивидуальные тренировки', values: [false, false, '4 в месяц'] }),
  Object.freeze({ label: 'Скидка на аренду стола', values: ['10%', '20%', '15%'] }),
  Object.freeze({ label: 'Заморозка абонемента', values: [false, 'До 14 дней', 'До 7 дней'] }),
  Object.freeze({ label: 'Ракетки и мячи', values: [true, true, true] }),
  Object.freeze({ label: 'Видеоразбор техники', values: [false, false, true] }),
]);

const COMING_SOON = Object.freeze([
  Object.freeze({ title: 'Расписание тренеров', text: 'Свободные окна каждого тренера и запись на тренировку в пару касаний.' }),
  Object.freeze({ title: 'Турниры и рейтинги', text: 'Календарь турниров, онлайн-регистрация и рейтинг игроков клуба.' }),
]);

const FAQ = Object.freeze([
  Object.freeze({ q: 'Нужна ли своя ракетка?', a: 'Нет. Ракетки и мячи выдаём бесплатно. Со своей ракеткой тоже можно.' }),
  Object.freeze({ q: 'Сколько человек может играть за одним столом?', a: 'До четырёх: двое в одиночке или четверо в парной игре. Цена за стол не меняется.' }),
  Object.freeze({ q: 'Можно ли отменить или перенести бронь?', a: 'Да, бесплатно, если предупредить минимум за 3 часа. Просто напишите нам в WhatsApp.' }),
  Object.freeze({ q: 'Как оплатить?', a: 'На месте картой, переводом или наличными. Предоплата для брони не нужна.' }),
  Object.freeze({ q: 'Есть ли раздевалка и душ?', a: 'Да, есть раздевалка, душ и шкафчики для вещей.' }),
]);
