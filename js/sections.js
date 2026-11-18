// Рендер разделов из data.js: столы, бар, абонементы, тренеры,
// расписание групп, турниры, чемпионы.

const trainerById = (id) => TRAINERS.find((t) => t.id === id);

function renderTables(el) {
  el.innerHTML = TABLES.map((t) => `
    <article class="table-card">
      <div class="table-card__art" aria-hidden="true"><span class="mini-table"><i></i></span></div>
      <p class="chip">${esc(t.tag)}</p>
      <h3>${esc(t.name)} · ${esc(t.title)}</h3>
      <p class="muted">${esc(t.text)}</p>
    </article>`).join('');
}

function renderBar(el) {
  el.innerHTML = BAR_MENU.map((group) => `
    <div class="menu">
      <h3>${esc(group.title)}</h3>
      <ul>${group.items.map(([name, price]) =>
        `<li><span>${esc(name)}</span><i aria-hidden="true"></i><strong>${money(price)}</strong></li>`).join('')}</ul>
    </div>`).join('');
}

function renderPricing(el) {
  el.innerHTML = `
    <div class="price-pill"><span>Будни до ${PRICING.eveningFrom}:00</span><strong>${money(PRICING.day)}<small>/час</small></strong></div>
    <div class="price-pill price-pill--hot"><span>Вечер и выходные</span><strong>${money(PRICING.evening)}<small>/час</small></strong></div>
    <ul class="includes">${PRICING.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
}

function renderPlans(el) {
  el.innerHTML = PLANS.map((p) => `
    <article class="plan${p.featured ? ' plan--featured' : ''}">
      ${p.featured ? '<span class="plan__badge">Популярный</span>' : ''}
      <h3>${esc(p.name)}</h3>
      <p class="plan__price">${money(p.price)}<small> / ${esc(p.unit)}</small></p>
      <ul>${p.perks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <a class="btn ${p.featured ? '' : 'btn--ghost'} btn--block" target="_blank" rel="noopener"
        href="${whatsappUrl(`Здравствуйте! Хочу абонемент «${p.name}» в ${CLUB.name}.`)}">Оформить</a>
    </article>`).join('');
}

function renderTrainers(el) {
  el.innerHTML = TRAINERS.map((t) => {
    const groups = GROUPS.filter((g) => g.trainer === t.id);
    // g.day: 1 = пн … 7 = вс; WEEKDAYS_SHORT индексируется как Date#getDay (0 = вс)
    const days = [...new Set(groups.map((g) => WEEKDAYS_SHORT[g.day % 7]))].join(', ');
    return `
      <article class="trainer">
        <div class="trainer__avatar" aria-hidden="true">${esc(initials(t.name))}</div>
        <div>
          <h3>${esc(t.name)}</h3>
          <p class="trainer__rank">${esc(t.rank)} · стаж ${t.years} ${pluralize(t.years, 'год', 'года', 'лет')}</p>
          <p class="muted">${esc(t.focus)}</p>
          ${days ? `<p class="trainer__days">Ведёт группы: ${esc(days)}</p>` : ''}
        </div>
      </article>`;
  }).join('');
}

function createSchedule(root) {
  const filtersEl = root.querySelector('[data-schedule="filters"]');
  const listEl = root.querySelector('[data-schedule="list"]');
  let level = 'all';

  const todayIso = ((new Date().getDay() + 6) % 7) + 1; // 1 = пн

  function renderFilters() {
    const options = [['all', 'Все'], ...Object.entries(LEVELS)];
    filtersEl.innerHTML = options.map(([key, label]) =>
      `<button type="button" class="filter${key === level ? ' is-active' : ''}" data-level="${key}"
        aria-pressed="${key === level}">${esc(label)}</button>`).join('');
  }

  function renderList() {
    const visible = GROUPS.filter((g) => level === 'all' || g.level === level);
    const byDay = [1, 2, 3, 4, 5, 6, 7]
      .map((day) => ({ day, groups: visible.filter((g) => g.day === day) }))
      .filter((d) => d.groups.length > 0);

    listEl.innerHTML = byDay.length === 0
      ? '<p class="muted">Групп этого уровня пока нет. Напишите нам, и мы подберём время.</p>'
      : byDay.map(({ day, groups }) => `
        <div class="sched-day${day === todayIso ? ' is-today' : ''}">
          <h4>${WEEKDAYS_FULL[day]}${day === todayIso ? ' <span class="chip chip--live">сегодня</span>' : ''}</h4>
          ${groups.map((g) => {
            const coach = trainerById(g.trainer);
            const spots = g.spots === 0
              ? '<span class="spots spots--full">Мест нет</span>'
              : `<span class="spots${g.spots <= 2 ? ' spots--low' : ''}">${g.spots} ${pluralize(g.spots, 'место', 'места', 'мест')}</span>`;
            return `
              <div class="sched-row">
                <span class="sched-row__time">${esc(g.time)}</span>
                <span class="level level--${g.level}">${esc(LEVELS[g.level])}</span>
                <span class="sched-row__coach">${esc(coach ? coach.name : '—')}</span>
                ${spots}
              </div>`;
          }).join('')}
        </div>`).join('');
  }

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-level]');
    if (!btn || btn.dataset.level === level) return;
    level = btn.dataset.level;
    renderFilters();
    renderList();
  });

  renderFilters();
  renderList();
}

function upcomingTournaments(now = new Date()) {
  return TOURNAMENTS
    .map((t) => ({ ...t, start: parseLocal(t.date, t.time) }))
    .filter((t) => t.start > now)
    .sort((a, b) => a.start - b.start);
}

function renderTournaments(featuredEl, listEl) {
  const list = upcomingTournaments();
  if (list.length === 0) {
    featuredEl.innerHTML = '<p class="muted">Новые турниры скоро появятся. Следите за Instagram.</p>';
    listEl.innerHTML = '';
    return;
  }
  const [next, ...rest] = list;
  const regLink = (t) => whatsappUrl(`Здравствуйте! Хочу зарегистрироваться на турнир «${t.name}» (${humanDate(t.start)}).`);

  featuredEl.innerHTML = `
    <div class="next-t__info">
      <p class="chip chip--live">Ближайший турнир</p>
      <h3>${esc(next.name)}</h3>
      <p class="next-t__date">${humanDate(next.start)}, ${WEEKDAYS_FULL[((next.start.getDay() + 6) % 7) + 1].toLowerCase()} · начало в ${esc(next.time)}</p>
      <dl class="facts">
        <div><dt>Формат</dt><dd>${esc(next.format)}</dd></div>
        <div><dt>Уровень</dt><dd>${esc(next.level)}</dd></div>
        <div><dt>Взнос</dt><dd>${money(next.fee)}</dd></div>
        <div><dt>Призы</dt><dd>${esc(next.prize)}</dd></div>
      </dl>
      <a class="btn" target="_blank" rel="noopener" href="${regLink(next)}">Зарегистрироваться</a>
    </div>
    <div class="countdown" data-countdown="${next.start.getTime()}" aria-live="off">
      <p class="countdown__label">До старта</p>
      <div class="countdown__grid">
        <div><strong data-cd="d">0</strong><span>дней</span></div>
        <div><strong data-cd="h">00</strong><span>часов</span></div>
        <div><strong data-cd="m">00</strong><span>минут</span></div>
        <div><strong data-cd="s">00</strong><span>секунд</span></div>
      </div>
      <p class="countdown__spots">${next.spots} мест в сетке</p>
    </div>`;

  listEl.innerHTML = rest.map((t) => `
    <article class="t-card">
      <div class="t-card__date"><strong>${t.start.getDate()}</strong><span>${MONTHS_GEN[t.start.getMonth()].slice(0, 3)}</span></div>
      <div class="t-card__body">
        <h4>${esc(t.name)}</h4>
        <p class="muted">${esc(t.time)} · ${esc(t.format)}</p>
        <p class="t-card__meta"><span class="chip">${esc(t.level)}</span><span>Взнос ${money(t.fee)}</span></p>
      </div>
      <a class="link-arrow" target="_blank" rel="noopener" href="${regLink(t)}">Участвовать</a>
    </article>`).join('');

  startCountdown(featuredEl.querySelector('[data-countdown]'));
}

function startCountdown(el) {
  if (!el) return;
  const target = Number(el.dataset.countdown);
  const parts = {
    d: el.querySelector('[data-cd="d"]'), h: el.querySelector('[data-cd="h"]'),
    m: el.querySelector('[data-cd="m"]'), s: el.querySelector('[data-cd="s"]'),
  };
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const sec = Math.floor(diff / 1000);
    parts.d.textContent = String(Math.floor(sec / 86400));
    parts.h.textContent = pad2(Math.floor((sec % 86400) / 3600));
    parts.m.textContent = pad2(Math.floor((sec % 3600) / 60));
    parts.s.textContent = pad2(sec % 60);
    if (diff === 0) clearInterval(timer);
  };
  const timer = setInterval(tick, 1000);
  tick();
}

function renderChampions(podiumEl, tableEl, leadersEl) {
  const sorted = [...CHAMPIONS].sort((a, b) => b.date.localeCompare(a.date));
  const [latest] = sorted;

  podiumEl.innerHTML = latest ? `
    <div class="trophy" aria-hidden="true">🏆</div>
    <p class="chip">Действующий чемпион</p>
    <h3>${esc(latest.champion)}</h3>
    <p class="muted">${esc(latest.tournament)} · ${humanDate(parseLocal(latest.date))} ${parseLocal(latest.date).getFullYear()}</p>
    <p class="podium__final">Финал против ${esc(latest.runnerUp)} — <strong>${esc(latest.score)}</strong></p>` : '';

  tableEl.innerHTML = sorted.map((c) => {
    const d = parseLocal(c.date);
    return `<tr>
      <td><span class="t-name">${esc(c.tournament)}</span><span class="t-date">${humanDate(d)} ${d.getFullYear()}</span></td>
      <td class="winner">🥇 ${esc(c.champion)}</td>
      <td class="hide-sm">🥈 ${esc(c.runnerUp)}</td>
      <td class="score">${esc(c.score)}</td>
    </tr>`;
  }).join('');

  // считаем титулы только в одиночном разряде (пары пишутся через «/»)
  const titles = sorted
    .filter((c) => !c.champion.includes('/'))
    .reduce((acc, c) => ({ ...acc, [c.champion]: (acc[c.champion] || 0) + 1 }), {});
  const leaders = Object.entries(titles).sort((a, b) => b[1] - a[1]).slice(0, 3);

  leadersEl.innerHTML = leaders.map(([name, count], i) => `
    <li><span class="rank">${i + 1}</span><span>${esc(name)}</span>
      <strong>${count} ${pluralize(count, 'титул', 'титула', 'титулов')}</strong></li>`).join('');
}
