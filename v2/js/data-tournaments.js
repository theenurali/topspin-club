// ============================================================
//  Турниры, победители и рейтинг (примеры, замените на реальные).
//  Даты: ГГГГ-ММ-ДД, время ЧЧ:ММ. Прошедшие турниры скрываются сами.
// ============================================================

const TOURNAMENTS = Object.freeze([
  Object.freeze({ name: 'Осенний кубок TopSpin', date: '2026-11-29', time: '11:00',
    format: 'Одиночный разряд, группы и плей-офф', level: 'Открытый', fee: 3000,
    prize: 'Кубок и 50 000 ₸', spots: 32, registered: 24 }),
  Object.freeze({ name: 'Новогодний парный турнир', date: '2026-12-20', time: '12:00',
    format: 'Пары, олимпийская система', level: 'Любители', fee: 5000,
    prize: 'Кубки и призы от бара', spots: 16, registered: 9 }),
  Object.freeze({ name: 'Детское первенство клуба', date: '2027-01-10', time: '10:00',
    format: 'До 14 лет, круговая система', level: 'Дети', fee: 2000,
    prize: 'Медали всем участникам', spots: 24, registered: 11 }),
  Object.freeze({ name: 'Зимний рейтинговый турнир', date: '2027-01-31', time: '11:00',
    format: 'Одиночный разряд, посев по рейтингу', level: 'Средний и выше', fee: 3000,
    prize: 'Кубок и 40 000 ₸', spots: 32, registered: 6 }),
]);

const WINNERS = Object.freeze([
  Object.freeze({ tournament: 'Летний кубок TopSpin', date: '2026-08-23', champion: 'Ерлан Жумабаев', score: '3:2' }),
  Object.freeze({ tournament: 'Турнир выходного дня', date: '2026-07-12', champion: 'Мадина Сейткали', score: '3:1' }),
  Object.freeze({ tournament: 'Весенний рейтинговый', date: '2026-04-19', champion: 'Артём Ли', score: '3:0' }),
]);

// rating: очки рейтинга, delta: изменение после последнего турнира
const PLAYERS = Object.freeze([
  Object.freeze({ name: 'Ерлан Жумабаев', gender: 'm', rating: 1842, delta: 24, played: 38, won: 31 }),
  Object.freeze({ name: 'Артём Ли', gender: 'm', rating: 1815, delta: -12, played: 41, won: 32 }),
  Object.freeze({ name: 'Мадина Сейткали', gender: 'f', rating: 1764, delta: 31, played: 29, won: 22 }),
  Object.freeze({ name: 'Санжар Омаров', gender: 'm', rating: 1720, delta: 8, played: 33, won: 23 }),
  Object.freeze({ name: 'Ольга Пак', gender: 'f', rating: 1698, delta: -5, played: 30, won: 20 }),
  Object.freeze({ name: 'Нурсултан Абенов', gender: 'm', rating: 1655, delta: 15, played: 27, won: 17 }),
  Object.freeze({ name: 'Алия Тлеубаева', gender: 'f', rating: 1630, delta: 0, played: 22, won: 13 }),
  Object.freeze({ name: 'Дмитрий Ким', gender: 'm', rating: 1602, delta: -18, played: 35, won: 19 }),
  Object.freeze({ name: 'Жанна Есенова', gender: 'f', rating: 1577, delta: 22, played: 18, won: 10 }),
  Object.freeze({ name: 'Руслан Бекжанов', gender: 'm', rating: 1550, delta: 6, played: 24, won: 12 }),
  Object.freeze({ name: 'Камила Уразова', gender: 'f', rating: 1512, delta: -9, played: 16, won: 7 }),
  Object.freeze({ name: 'Ильяс Мухамедов', gender: 'm', rating: 1488, delta: 12, played: 20, won: 9 }),
  Object.freeze({ name: 'Анна Цой', gender: 'f', rating: 1455, delta: 4, played: 14, won: 6 }),
  Object.freeze({ name: 'Бауыржан Сатыбалды', gender: 'm', rating: 1420, delta: -3, played: 19, won: 7 }),
]);
