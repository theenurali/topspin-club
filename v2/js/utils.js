// Общие помощники: форматирование, даты, ссылки.

const WEEKDAYS_SHORT = Object.freeze(['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']);
const MONTHS_GEN = Object.freeze(['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']);

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function money(amount) {
  return `${Math.round(amount).toLocaleString('ru-RU')} ${PRICING.currency}`;
}

const pad2 = (n) => String(n).padStart(2, '0');
const hourLabel = (h) => `${pad2(h)}:00`;

function isoDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function addDays(date, days) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

function humanDate(date) {
  return `${date.getDate()} ${MONTHS_GEN[date.getMonth()]}`;
}

function pluralize(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function whatsappUrl(text) {
  return `https://wa.me/${CLUB.whatsapp}?text=${encodeURIComponent(text)}`;
}

// Детерминированный хэш строки → [0, 1): FNV-1a + перемешивание murmur3.
// В бете им имитируется занятость столов, пока нет настоящей базы броней.
function seededRandom(key) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
