// Общие помощники: деньги, WhatsApp, безопасная вставка текста, хранилище.

const MONEY_FORMAT = new Intl.NumberFormat('ru-RU');

/** @param {number} value @returns {string} */
function money(value) {
  return `${MONEY_FORMAT.format(Math.round(value))} ₸`;
}

/** @param {string} text @returns {string} */
function whatsappUrl(text) {
  return `https://wa.me/${STORE.phone}?text=${encodeURIComponent(text)}`;
}

/** Экранирует текст перед вставкой в innerHTML. @param {unknown} value */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** @param {number} price @param {number} retail @returns {number} */
function savingPercent(price, retail) {
  if (!retail || retail <= price) return 0;
  return Math.round((1 - price / retail) * 100);
}

/** Казахстанский мобильный: 10 цифр после +7/8. @param {string} raw */
function normalizePhone(raw) {
  const digits = String(raw).replace(/\D/g, '');
  const local = digits.length === 11 && /^[78]/.test(digits) ? digits.slice(1) : digits;
  return /^7\d{9}$/.test(local) ? `+7${local}` : null;
}

const storage = Object.freeze({
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // приватный режим или переполнение: корзина просто не переживёт перезагрузку
    }
  },
});

function productById(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function categoryLabel(id) {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : '';
}

function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-on');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('is-on'), 2200);
}
