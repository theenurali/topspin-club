// Логика занятости и цен без DOM. В бете занятость имитируется
// детерминированно; позже эти функции будут читать реальную базу броней.

const BUSY_RATE = 0.34;
const EVENING_EXTRA = 0.2;

/** @returns {boolean} */
function isBusy(date, tableId, hour) {
  const rate = hour >= PRICING.eveningFrom ? BUSY_RATE + EVENING_EXTRA : BUSY_RATE;
  return seededRandom(`${isoDate(date)}|${tableId}|${hour}`) < rate;
}

/** Час уже начался или прошёл */
function isPast(date, hour, now) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour) <= now;
}

function hourPrice(date, hour) {
  return isWeekend(date) || hour >= PRICING.eveningFrom ? PRICING.evening : PRICING.day;
}

function bookingTotal(date, start, duration) {
  return Array.from({ length: duration }, (_, i) => hourPrice(date, start + i))
    .reduce((sum, price) => sum + price, 0);
}

function canStartAt(date, tableId, start, duration, now) {
  if (start + duration > CLUB.closeHour) return false;
  for (let h = start; h < start + duration; h += 1) {
    if (isPast(date, h, now) || isBusy(date, tableId, h)) return false;
  }
  return true;
}

/** Все стартовые часы дня с признаком доступности и итоговой ценой */
function startOptions(date, tableId, duration, now) {
  const hours = Array.from({ length: CLUB.closeHour - CLUB.openHour }, (_, i) => CLUB.openHour + i);
  return hours.map((hour) => Object.freeze({
    hour,
    available: canStartAt(date, tableId, hour, duration, now),
    total: bookingTotal(date, hour, Math.min(duration, CLUB.closeHour - hour)),
  }));
}

/**
 * Статус стола прямо сейчас.
 * @returns {{ state: 'closed' | 'free' | 'busy', until: number | null }}
 */
function tableStatusNow(tableId, now) {
  const hour = now.getHours();
  if (hour < CLUB.openHour || hour >= CLUB.closeHour) return { state: 'closed', until: null };
  const busyNow = isBusy(now, tableId, hour);
  let h = hour + 1;
  while (h < CLUB.closeHour && isBusy(now, tableId, h) === busyNow) h += 1;
  return { state: busyNow ? 'busy' : 'free', until: h < CLUB.closeHour ? h : null };
}

function freeTablesNow(now) {
  const states = TABLES.map((t) => tableStatusNow(t.id, now).state);
  if (states.includes('closed')) return null;
  return states.filter((s) => s === 'free').length;
}
