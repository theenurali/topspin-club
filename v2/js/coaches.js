// Тренеры и их расписание: группы и свободные окна для индивидуальных
// тренировок на 7 дней вперёд. Запись одной кнопкой через WhatsApp.

const SCHEDULE_DAYS = 7;
const PRIVATE_BUSY_RATE = 0.4;

const coachById = (id) => COACHES.find((c) => c.id === id);
const isoWeekday = (date) => ((date.getDay() + 6) % 7) + 1; // 1 = пн
const atTime = (date, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
};

/** Все занятия на дату: группы и индивидуальные окна, по времени */
function sessionsFor(date, now) {
  const day = isoWeekday(date);
  const key = isoDate(date);

  const groups = GROUP_CLASSES.filter((g) => g.day === day).map((g) => {
    const booked = Math.floor(seededRandom(`${key}|${g.coach}|${g.start}`) * (g.capacity + 1));
    const left = Math.max(0, g.capacity - booked);
    return Object.freeze({
      kind: 'group', coach: g.coach, start: g.start, end: g.end, level: g.level,
      left, past: atTime(date, g.start) <= now,
    });
  });

  const privates = Object.entries(PRIVATE_HOURS).flatMap(([coach, byDay]) =>
    (byDay[day] || []).map((h) => Object.freeze({
      kind: 'private', coach, start: hourLabel(h), end: hourLabel(h + 1),
      left: seededRandom(`${key}|${coach}|p${h}`) < PRIVATE_BUSY_RATE ? 0 : 1,
      past: new Date(date.getFullYear(), date.getMonth(), date.getDate(), h) <= now,
    })));

  return [...groups, ...privates].sort((a, b) => a.start.localeCompare(b.start));
}

function renderCoachCards(el, onPick) {
  el.innerHTML = COACHES.map((c) => `
    <button type="button" class="coach coach--${c.tone}" data-coach="${c.id}" aria-pressed="false">
      <span class="coach__avatar" aria-hidden="true">${esc(c.name.split(' ').map((p) => p[0]).join(''))}</span>
      <span class="coach__name">${esc(c.name)}</span>
      <span class="coach__rank">${esc(c.rank)} · ${c.years} ${pluralize(c.years, 'год', 'года', 'лет')} опыта</span>
      <span class="coach__focus">${esc(c.focus)}</span>
      <span class="coach__cta">Смотреть расписание</span>
    </button>`).join('');
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-coach]');
    if (btn) onPick(btn.dataset.coach);
  });
}

function createCoachSchedule(root) {
  const cardsEl = root.querySelector('[data-coaches="cards"]');
  const filterEl = root.querySelector('[data-coaches="filter"]');
  const kindEl = root.querySelector('[data-coaches="kind"]');
  const daysEl = root.querySelector('[data-coaches="days"]');
  const listEl = root.querySelector('[data-coaches="list"]');
  const schedEl = root.querySelector('.sched');
  const days = Array.from({ length: SCHEDULE_DAYS }, (_, i) => addDays(new Date(), i));

  // открываем ближайший день, где ещё можно записаться
  const firstOpenDay = () => {
    const now = new Date();
    const idx = days.findIndex((d) => sessionsFor(d, now).some((s) => !s.past && s.left > 0));
    return Math.max(0, idx);
  };

  let state = Object.freeze({ coach: 'all', kind: 'all', dayIndex: firstOpenDay() });
  const setState = (patch) => { state = Object.freeze({ ...state, ...patch }); render(); };

  function renderFilter() {
    const options = [['all', 'Все тренеры'], ...COACHES.map((c) => [c.id, c.name.split(' ')[0]])];
    filterEl.innerHTML = options.map(([id, label]) => {
      const on = id === state.coach;
      return `<button type="button" class="chip-btn${on ? ' is-on' : ''}" aria-pressed="${on}" data-filter-coach="${id}">${esc(label)}</button>`;
    }).join('');
    cardsEl.querySelectorAll('[data-coach]').forEach((b) => {
      const on = b.dataset.coach === state.coach;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function renderKind() {
    const options = [['all', 'Все'], ['group', 'Группы'], ['private', 'Индивидуально']];
    kindEl.innerHTML = options.map(([id, label]) => {
      const on = id === state.kind;
      return `<button type="button" class="seg__btn${on ? ' is-on' : ''}" role="radio" aria-checked="${on}" data-kind="${id}">${label}</button>`;
    }).join('');
  }

  function renderDays() {
    daysEl.innerHTML = days.map((d, i) => {
      const on = i === state.dayIndex;
      const label = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : WEEKDAYS_SHORT[d.getDay()];
      return `<button type="button" class="day${on ? ' is-on' : ''}" role="radio" aria-checked="${on}" data-sday="${i}">
        <span class="day__w">${label}</span><span class="day__n">${d.getDate()}</span></button>`;
    }).join('');
  }

  function sessionRow(s, date) {
    const coach = coachById(s.coach);
    const title = s.kind === 'group' ? `Группа · ${LEVELS[s.level]}` : 'Индивидуальная тренировка';
    const meta = s.kind === 'group'
      ? `<span class="lvl lvl--${s.level}">${esc(LEVELS[s.level])}</span>`
      : `<span class="lvl lvl--private">${money(PRIVATE_PRICE)}</span>`;
    const dayLabel = `${WEEKDAYS_SHORT[date.getDay()]}, ${humanDate(date)}`;
    let action;
    if (s.left === 0) {
      action = `<span class="sess__state">${s.kind === 'group' ? 'Мест нет' : 'Занято'}</span>`;
    } else {
      const msg = `Здравствуйте! Хочу записаться: ${title}, тренер ${coach.name}, ${dayLabel}, ${s.start}–${s.end}.`;
      const spots = s.kind === 'group'
        ? `<span class="sess__left${s.left <= 2 ? ' is-low' : ''}">${s.left} ${pluralize(s.left, 'место', 'места', 'мест')}</span>` : '';
      action = `${spots}<a class="pill pill--sm" target="_blank" rel="noopener" href="${whatsappUrl(msg)}">Записаться</a>`;
    }
    return `
      <div class="sess${s.left === 0 ? ' is-off' : ''}">
        <span class="sess__time">${esc(s.start)}<small>${esc(s.end)}</small></span>
        <span class="sess__main"><strong>${esc(title)}</strong><span>${esc(coach.name)}</span></span>
        <span class="sess__meta">${meta}</span>
        <span class="sess__act">${action}</span>
      </div>`;
  }

  function renderList() {
    const date = days[state.dayIndex];
    const list = sessionsFor(date, new Date())
      .filter((s) => !s.past)
      .filter((s) => state.coach === 'all' || s.coach === state.coach)
      .filter((s) => state.kind === 'all' || s.kind === state.kind);
    listEl.innerHTML = list.length === 0
      ? '<p class="sched__empty">На этот день занятий больше нет. Выберите другой день или тренера.</p>'
      : list.map((s) => sessionRow(s, date)).join('');
  }

  function render() {
    renderFilter();
    renderKind();
    renderDays();
    renderList();
  }

  renderCoachCards(cardsEl, (id) => {
    setState({ coach: id === state.coach ? 'all' : id });
    schedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  filterEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter-coach]');
    if (b) setState({ coach: b.dataset.filterCoach });
  });
  kindEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-kind]');
    if (b) setState({ kind: b.dataset.kind });
  });
  daysEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sday]');
    if (b) setState({ dayIndex: Number(b.dataset.sday) });
  });

  render();
}
