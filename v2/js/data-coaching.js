// ============================================================
//  Тренеры и их расписание (примеры, замените на реальные).
// ============================================================

const COACHES = Object.freeze([
  Object.freeze({ id: 'aidar', name: 'Айдар Нурланов', rank: 'Мастер спорта', years: 12,
    focus: 'Продвинутые игроки, подготовка к турнирам', tone: 'blue' }),
  Object.freeze({ id: 'elena', name: 'Елена Ким', rank: 'КМС', years: 8,
    focus: 'Дети 7–14 лет, первые шаги в спорте', tone: 'orange' }),
  Object.freeze({ id: 'timur', name: 'Тимур Сапаров', rank: 'КМС', years: 6,
    focus: 'Взрослые с нуля, постановка удара', tone: 'green' }),
  Object.freeze({ id: 'dana', name: 'Дана Ахметова', rank: '1 взрослый разряд', years: 5,
    focus: 'Средний уровень, подача и приём', tone: 'purple' }),
]);

const LEVELS = Object.freeze({
  kids: 'Дети',
  beginner: 'Начинающие',
  middle: 'Средний',
  pro: 'Продвинутые',
});

const PRIVATE_PRICE = 7000; // ₸ за индивидуальную тренировку (60 мин)

// day: 1 = понедельник … 7 = воскресенье
const GROUP_CLASSES = Object.freeze([
  Object.freeze({ coach: 'elena', day: 1, start: '16:00', end: '17:30', level: 'kids', capacity: 8 }),
  Object.freeze({ coach: 'timur', day: 1, start: '19:00', end: '20:30', level: 'beginner', capacity: 8 }),
  Object.freeze({ coach: 'dana', day: 2, start: '18:00', end: '19:30', level: 'middle', capacity: 6 }),
  Object.freeze({ coach: 'aidar', day: 2, start: '20:00', end: '21:30', level: 'pro', capacity: 6 }),
  Object.freeze({ coach: 'elena', day: 3, start: '16:00', end: '17:30', level: 'kids', capacity: 8 }),
  Object.freeze({ coach: 'timur', day: 3, start: '19:00', end: '20:30', level: 'beginner', capacity: 8 }),
  Object.freeze({ coach: 'dana', day: 4, start: '18:00', end: '19:30', level: 'middle', capacity: 6 }),
  Object.freeze({ coach: 'aidar', day: 4, start: '20:00', end: '21:30', level: 'pro', capacity: 6 }),
  Object.freeze({ coach: 'elena', day: 5, start: '16:00', end: '17:30', level: 'kids', capacity: 8 }),
  Object.freeze({ coach: 'dana', day: 5, start: '19:00', end: '20:30', level: 'middle', capacity: 6 }),
  Object.freeze({ coach: 'elena', day: 6, start: '11:00', end: '12:30', level: 'kids', capacity: 8 }),
  Object.freeze({ coach: 'timur', day: 6, start: '13:00', end: '14:30', level: 'beginner', capacity: 8 }),
  Object.freeze({ coach: 'aidar', day: 7, start: '12:00', end: '14:00', level: 'pro', capacity: 6 }),
]);

// Часы, когда тренер берёт индивидуальные тренировки (начало часа)
const PRIVATE_HOURS = Object.freeze({
  aidar: Object.freeze({ 1: [10, 11, 12], 3: [10, 11], 5: [12, 13, 14], 6: [15, 16] }),
  elena: Object.freeze({ 2: [12, 13], 4: [12, 13, 14], 6: [14] }),
  timur: Object.freeze({ 2: [10, 11], 4: [17, 18], 5: [10, 11], 7: [15, 16] }),
  dana: Object.freeze({ 1: [14, 15], 3: [14, 15, 16], 6: [10, 11], 7: [11] }),
});
