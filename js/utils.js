// Общие помощники: форматирование, ссылки, даты.

const WEEKDAYS_SHORT = Object.freeze(['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']);
const WEEKDAYS_FULL = Object.freeze(['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']);
const MONTHS_GEN = Object.freeze(['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']);

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function money(amount) {
  return `${amount.toLocaleString('ru-RU')} ${PRICING.currency}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function hourLabel(h) {
  return `${pad2(h)}:00`;
}

// ГГГГ-ММ-ДД в местном времени (без сдвига UTC)
function isoDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseLocal(dateStr, time = '00:00') {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

function addDays(date, days) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function humanDate(date) {
  return `${date.getDate()} ${MONTHS_GEN[date.getMonth()]}`;
}

function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('');
}

function whatsappUrl(text) {
  return `https://wa.me/${CLUB.whatsapp}?text=${encodeURIComponent(text)}`;
}

// Детерминированный псевдослучайный хэш (FNV-1a) → [0, 1).
// Нужен, чтобы в бета-версии занятость столов выглядела живой,
// но не менялась при каждой перезагрузке страницы.
function seededRandom(key) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // финальное перемешивание (murmur3 fmix32): без него соседние ключи коррелируют
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function pluralize(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
