// Общие помощники: деньги, WhatsApp, экранирование.

const MONEY_FORMAT = new Intl.NumberFormat('ru-RU');

/** @param {number} value */
function money(value) {
  return value === 0 ? 'Бесплатно' : `${MONEY_FORMAT.format(Math.round(value))} ₸`;
}

/** @param {string} text */
function whatsappUrl(text) {
  return `https://wa.me/${PRO.phone}?text=${encodeURIComponent(text)}`;
}

/** Экранирует текст перед вставкой в innerHTML. */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const pad = (n) => String(n).padStart(2, '0');
