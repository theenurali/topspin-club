// Аренда столов: выбор дня, сетка «время × стол», расчёт суммы,
// бронь через WhatsApp. В бете занятость генерируется детерминированно;
// позже её заменит API/база.

const BOOKING_DAYS = 7;
const BUSY_RATE = 0.38;

/** @param {Date} date @param {number} tableId @param {number} hour @returns {boolean} */
function isBusy(date, tableId, hour) {
  // вечером занятость выше: реалистичнее для клуба
  const rate = hour >= PRICING.eveningFrom ? BUSY_RATE + 0.2 : BUSY_RATE;
  return seededRandom(`${isoDate(date)}|${tableId}|${hour}`) < rate;
}

/** @returns {'past' | 'busy' | 'free'} */
function slotStatus(date, tableId, hour, now = new Date()) {
  const slotStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
  if (slotStart <= now) return 'past';
  return isBusy(date, tableId, hour) ? 'busy' : 'free';
}

function slotPrice(date, hour) {
  return isWeekend(date) || hour >= PRICING.eveningFrom ? PRICING.evening : PRICING.day;
}

function bookingHours() {
  return Array.from({ length: CLUB.closeHour - CLUB.openHour }, (_, i) => CLUB.openHour + i);
}

// Сколько столов свободно прямо сейчас (для статуса в шапке)
function freeTablesNow(now = new Date()) {
  const hour = now.getHours();
  if (hour < CLUB.openHour || hour >= CLUB.closeHour) return null;
  return TABLES.filter((t) => !isBusy(now, t.id, hour)).length;
}

function createBooking(root) {
  const daysEl = root.querySelector('[data-booking="days"]');
  const gridEl = root.querySelector('[data-booking="grid"]');
  const summaryEl = root.querySelector('[data-booking="summary"]');
  const totalEl = root.querySelector('[data-booking="total"]');
  const listEl = root.querySelector('[data-booking="list"]');
  const submitEl = root.querySelector('[data-booking="submit"]');
  const clearEl = root.querySelector('[data-booking="clear"]');

  const days = Array.from({ length: BOOKING_DAYS }, (_, i) => addDays(new Date(), i));

  let state = Object.freeze({ dayIndex: 0, selected: Object.freeze([]) });

  const setState = (patch) => {
    state = Object.freeze({ ...state, ...patch });
    render();
  };

  const slotKey = (tableId, hour) => `${tableId}-${hour}`;

  function renderDays() {
    daysEl.innerHTML = days.map((d, i) => {
      const label = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : WEEKDAYS_SHORT[d.getDay()];
      return `<button type="button" class="day${i === state.dayIndex ? ' is-active' : ''}${isWeekend(d) ? ' is-weekend' : ''}"
        data-day="${i}" aria-pressed="${i === state.dayIndex}">
        <span class="day__w">${label}</span><span class="day__d">${d.getDate()}</span>
        <span class="day__m">${MONTHS_GEN[d.getMonth()].slice(0, 3)}</span>
      </button>`;
    }).join('');
  }

  function renderGrid() {
    const date = days[state.dayIndex];
    const now = new Date();
    const head = `<div class="grid__corner">Время</div>${TABLES.map((t) =>
      `<div class="grid__head"><strong>${esc(t.name)}</strong><span>${esc(t.title)}</span></div>`).join('')}`;

    const rows = bookingHours().map((h) => {
      const price = slotPrice(date, h);
      const cells = TABLES.map((t) => {
        const status = slotStatus(date, t.id, h, now);
        const key = slotKey(t.id, h);
        const isSel = state.selected.includes(key);
        if (status !== 'free') {
          const text = status === 'busy' ? 'Занято' : 'Прошло';
          return `<span class="slot slot--${status}" aria-label="${esc(t.name)}, ${hourLabel(h)}: ${text}">${text}</span>`;
        }
        return `<button type="button" class="slot slot--free${isSel ? ' is-selected' : ''}" data-slot="${key}"
          aria-pressed="${isSel}" aria-label="${esc(t.name)}, ${hourLabel(h)}, ${money(price)}">
          <span class="slot__price">${isSel ? '✓ Выбрано' : money(price)}</span></button>`;
      }).join('');
      return `<div class="grid__time${price === PRICING.evening ? ' is-evening' : ''}">${hourLabel(h)}</div>${cells}`;
    }).join('');

    gridEl.innerHTML = head + rows;
  }

  function selectedItems() {
    const date = days[state.dayIndex];
    return state.selected
      .map((key) => {
        const [tableId, hour] = key.split('-').map(Number);
        return { table: TABLES.find((t) => t.id === tableId), hour, price: slotPrice(date, hour) };
      })
      .sort((a, b) => a.table.id - b.table.id || a.hour - b.hour);
  }

  function renderSummary() {
    const items = selectedItems();
    const total = items.reduce((sum, item) => sum + item.price, 0);
    const hasItems = items.length > 0;
    summaryEl.classList.toggle('is-empty', !hasItems);
    totalEl.textContent = hasItems ? money(total) : '—';
    listEl.innerHTML = hasItems
      ? items.map((it) => `<li>${esc(it.table.name)} · ${hourLabel(it.hour)}–${hourLabel(it.hour + 1)}<span>${money(it.price)}</span></li>`).join('')
      : '<li class="muted">Выберите свободные слоты в таблице</li>';
    submitEl.setAttribute('aria-disabled', String(!hasItems));
    submitEl.setAttribute('href', hasItems ? whatsappUrl(bookingMessage(items, total)) : '#rent');
  }

  function bookingMessage(items, total) {
    const date = days[state.dayIndex];
    const lines = items.map((it) => `• ${it.table.name}: ${hourLabel(it.hour)}–${hourLabel(it.hour + 1)}`);
    return [
      `Здравствуйте! Хочу забронировать стол в ${CLUB.name}.`,
      `Дата: ${humanDate(date)} (${WEEKDAYS_SHORT[date.getDay()]})`,
      ...lines,
      `Итого: ${money(total)}`,
    ].join('\n');
  }

  function render() {
    renderDays();
    renderGrid();
    renderSummary();
  }

  daysEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-day]');
    if (!btn) return;
    const dayIndex = Number(btn.dataset.day);
    if (dayIndex !== state.dayIndex) setState({ dayIndex, selected: Object.freeze([]) });
  });

  gridEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-slot]');
    if (!btn) return;
    const key = btn.dataset.slot;
    const selected = state.selected.includes(key)
      ? state.selected.filter((k) => k !== key)
      : [...state.selected, key];
    setState({ selected: Object.freeze(selected) });
  });

  clearEl.addEventListener('click', () => setState({ selected: Object.freeze([]) }));

  submitEl.addEventListener('click', (e) => {
    if (submitEl.getAttribute('aria-disabled') === 'true') e.preventDefault();
  });

  render();
}
