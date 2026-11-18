// Онлайн-бронирование по шагам: стол → день → длительность → время,
// затем имя и телефон. Заявка уходит администратору в WhatsApp.

const NAME_RE = /^[\p{L}\s'-]{2,40}$/u;

/** Приводит телефон к +7XXXXXXXXXX или возвращает null */
function normalizePhone(raw) {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) return `+7${digits.slice(1)}`;
  if (digits.length === 10 && digits[0] === '7') return `+7${digits}`;
  return null;
}

function validateContact(name, phone) {
  const errors = {};
  if (!NAME_RE.test(name.trim())) errors.name = 'Введите имя: от 2 букв.';
  if (!normalizePhone(phone)) errors.phone = 'Введите номер в формате +7 7XX XXX XX XX.';
  return errors;
}

function createBooking(root) {
  const $ = (key) => root.querySelector(`[data-bk="${key}"]`);
  const els = {
    tables: $('tables'), days: $('days'), durations: $('durations'), times: $('times'),
    hint: $('hint'), rows: $('rows'), total: $('total'), form: $('form'), done: $('done'),
    wa: $('wa'), edit: $('edit'), summary: $('summary'), bar: $('bar'), barText: $('bar-text'),
  };
  const days = Array.from({ length: BOOKING_DAYS }, (_, i) => addDays(new Date(), i));

  const firstOpenDay = () => {
    const now = new Date();
    const idx = days.findIndex((d) => TABLES.some((t) =>
      startOptions(d, t.id, 1, now).some((o) => o.available)));
    return Math.max(0, idx);
  };

  let state = Object.freeze({ tableId: TABLES[0].id, dayIndex: firstOpenDay(), duration: 1, start: null, done: false });

  function setState(patch) {
    const next = { ...state, ...patch };
    // если выбранное время перестало подходить, сбрасываем его
    if (next.start !== null && !canStartAt(days[next.dayIndex], next.tableId, next.start, next.duration, new Date())) {
      next.start = null;
    }
    state = Object.freeze(next);
    render();
  }

  function renderTables() {
    const now = new Date();
    els.tables.innerHTML = TABLES.map((t) => {
      const st = tableStatusNow(t.id, now);
      const on = t.id === state.tableId;
      return `<button type="button" class="opt${on ? ' is-on' : ''}" role="radio" aria-checked="${on}" data-table="${t.id}">
        <span class="opt__title">${esc(t.name)}</span>
        <span class="opt__sub">${esc(t.title)}</span>
        <span class="dot dot--${st.state}">${st.state === 'free' ? 'Свободен' : st.state === 'busy' ? 'Занят' : 'Закрыто'}</span>
      </button>`;
    }).join('');
  }

  function renderDays() {
    els.days.innerHTML = days.map((d, i) => {
      const on = i === state.dayIndex;
      const label = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : WEEKDAYS_SHORT[d.getDay()];
      return `<button type="button" class="day${on ? ' is-on' : ''}" role="radio" aria-checked="${on}" data-day="${i}">
        <span class="day__w">${label}</span><span class="day__n">${d.getDate()}</span>
      </button>`;
    }).join('');
  }

  function renderDurations() {
    els.durations.innerHTML = DURATIONS.map((h) => {
      const on = h === state.duration;
      return `<button type="button" class="seg__btn${on ? ' is-on' : ''}" role="radio" aria-checked="${on}" data-duration="${h}">
        ${h} ${pluralize(h, 'час', 'часа', 'часов')}</button>`;
    }).join('');
  }

  function renderTimes() {
    const date = days[state.dayIndex];
    const options = startOptions(date, state.tableId, state.duration, new Date());
    const free = options.filter((o) => o.available).length;
    els.hint.textContent = free === 0
      ? 'На этот день свободного времени нет. Выберите другой стол или день.'
      : `Свободно ${free} ${pluralize(free, 'вариант', 'варианта', 'вариантов')}. Вечером и в выходные ${money(PRICING.evening)}/ч, днём в будни ${money(PRICING.day)}/ч.`;
    els.times.innerHTML = options.map((o) => {
      const on = o.hour === state.start;
      return `<button type="button" class="time${on ? ' is-on' : ''}" data-hour="${o.hour}"
        ${o.available ? '' : 'disabled'} aria-pressed="${on}"
        aria-label="${hourLabel(o.hour)}${o.available ? `, ${money(o.total)}` : ', занято'}">
        <span class="time__h">${hourLabel(o.hour)}</span>
        <span class="time__p">${o.available ? money(o.total) : 'Занято'}</span>
      </button>`;
    }).join('');
  }

  function selection() {
    const date = days[state.dayIndex];
    const table = TABLES.find((t) => t.id === state.tableId);
    const range = state.start === null ? null
      : `${hourLabel(state.start)}–${hourLabel(state.start + state.duration)}`;
    const total = state.start === null ? null : bookingTotal(date, state.start, state.duration);
    const dayLabel = `${WEEKDAYS_SHORT[date.getDay()]}, ${humanDate(date)}`;
    return { date, table, range, total, dayLabel };
  }

  function renderSummary() {
    const s = selection();
    const rows = [
      ['Стол', `${s.table.name} · ${s.table.title}`],
      ['Дата', s.dayLabel],
      ['Время', s.range || 'Не выбрано'],
      ['Длительность', `${state.duration} ${pluralize(state.duration, 'час', 'часа', 'часов')}`],
    ];
    els.rows.innerHTML = rows.map(([k, v]) =>
      `<div><dt>${esc(k)}</dt><dd${v === 'Не выбрано' ? ' class="is-empty"' : ''}>${esc(v)}</dd></div>`).join('');
    els.total.textContent = s.total === null ? '—' : money(s.total);
    els.form.hidden = state.done;
    els.done.hidden = !state.done;
    els.bar.classList.toggle('is-visible', s.range !== null && !state.done);
    els.barText.innerHTML = s.range
      ? `<strong>${esc(s.range)}</strong><span>${esc(s.dayLabel)} · ${money(s.total)}</span>` : '';
  }

  function render() {
    renderTables();
    renderDays();
    renderDurations();
    renderTimes();
    renderSummary();
  }

  function showErrors(errors) {
    ['name', 'phone'].forEach((key) => {
      const msg = errors[key] || '';
      root.querySelector(`[data-err="${key}"]`).textContent = msg;
      els.form.elements[key].setAttribute('aria-invalid', String(Boolean(msg)));
    });
  }

  function submit(e) {
    e.preventDefault();
    const name = els.form.elements.name.value;
    const phone = els.form.elements.phone.value;
    if (state.start === null) {
      els.hint.textContent = 'Сначала выберите время начала.';
      els.hint.classList.add('is-error');
      els.times.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const errors = validateContact(name, phone);
    showErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const s = selection();
    const text = [
      `Здравствуйте! Хочу забронировать стол в ${CLUB.name}.`,
      `${s.table.name} (${s.table.title})`,
      `Дата: ${s.dayLabel}`,
      `Время: ${s.range}`,
      `Сумма: ${money(s.total)}`,
      `Имя: ${name.trim()}`,
      `Телефон: ${normalizePhone(phone)}`,
    ].join('\n');
    els.wa.setAttribute('href', whatsappUrl(text));
    setState({ done: true });
  }

  const pick = (attr, key, parse = Number) => (e) => {
    const btn = e.target.closest(`[${attr}]`);
    if (!btn || btn.disabled) return;
    els.hint.classList.remove('is-error');
    setState({ [key]: parse(btn.getAttribute(attr)), done: false });
  };

  els.tables.addEventListener('click', pick('data-table', 'tableId'));
  els.days.addEventListener('click', pick('data-day', 'dayIndex'));
  els.durations.addEventListener('click', pick('data-duration', 'duration'));
  els.times.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-hour]');
    if (!btn || btn.disabled) return;
    const hour = Number(btn.dataset.hour);
    els.hint.classList.remove('is-error');
    setState({ start: hour === state.start ? null : hour, done: false });
  });
  els.form.addEventListener('submit', submit);
  // ошибка поля исчезает, как только значение стало корректным
  els.form.addEventListener('input', (e) => {
    const field = e.target;
    if (field.getAttribute('aria-invalid') !== 'true') return;
    const errors = validateContact(els.form.elements.name.value, els.form.elements.phone.value);
    if (errors[field.name]) return;
    root.querySelector(`[data-err="${field.name}"]`).textContent = '';
    field.setAttribute('aria-invalid', 'false');
  });
  els.edit.addEventListener('click', () => setState({ done: false }));
  root.querySelector('[data-bk="bar-go"]').addEventListener('click', () => {
    els.summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Нижняя плашка на телефоне видна только внутри раздела бронирования
  // и прячется, когда карточка брони уже на экране
  if ('IntersectionObserver' in window) {
    const seen = { section: false, summary: false };
    const sync = () => els.bar.classList.toggle('is-hidden', !seen.section || seen.summary);
    new IntersectionObserver(([entry]) => { seen.section = entry.isIntersecting; sync(); })
      .observe(root);
    new IntersectionObserver(([entry]) => { seen.summary = entry.isIntersecting; sync(); }, { threshold: 0.25 })
      .observe(els.summary);
  }

  render();

  return Object.freeze({
    selectTable(id) { setState({ tableId: id, done: false }); },
  });
}
