// Турниры (ближайший с отсчётом, остальные списком, победители) и рейтинг игроков.

const WEEKDAYS_FULL_GEN = Object.freeze(['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']);

function parseLocal(dateStr, time = '00:00') {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

function upcomingTournaments(now) {
  return TOURNAMENTS
    .map((t) => ({ ...t, startAt: parseLocal(t.date, t.time) }))
    .filter((t) => t.startAt > now)
    .sort((a, b) => a.startAt - b.startAt);
}

const regLink = (t) => whatsappUrl(`Здравствуйте! Хочу зарегистрироваться на турнир «${t.name}» (${humanDate(t.startAt)}).`);

function spotsBar(t) {
  const pct = Math.round((t.registered / t.spots) * 100);
  const left = t.spots - t.registered;
  return `
    <div class="spots">
      <div class="spots__bar"><span style="width:${pct}%"></span></div>
      <p class="spots__text"><strong>${left} ${pluralize(left, 'место', 'места', 'мест')}</strong> из ${t.spots} свободно</p>
    </div>`;
}

function renderTournaments(nextEl, listEl, winnersEl) {
  const list = upcomingTournaments(new Date());
  if (list.length === 0) {
    nextEl.innerHTML = '<p class="sec-sub">Новые турниры скоро появятся. Следите за Instagram.</p>';
    listEl.innerHTML = '';
  } else {
    const [next, ...rest] = list;
    nextEl.innerHTML = `
      <div class="t-next__info">
        <p class="t-next__kicker">Ближайший турнир</p>
        <h3 class="t-next__name">${esc(next.name)}</h3>
        <p class="t-next__date">${humanDate(next.startAt)}, ${WEEKDAYS_FULL_GEN[next.startAt.getDay()]}, начало в ${esc(next.time)}</p>
        <dl class="t-facts">
          <div><dt>Формат</dt><dd>${esc(next.format)}</dd></div>
          <div><dt>Уровень</dt><dd>${esc(next.level)}</dd></div>
          <div><dt>Взнос</dt><dd>${money(next.fee)}</dd></div>
          <div><dt>Призы</dt><dd>${esc(next.prize)}</dd></div>
        </dl>
        ${spotsBar(next)}
        <a class="pill" target="_blank" rel="noopener" href="${regLink(next)}">Зарегистрироваться</a>
      </div>
      <div class="cd" data-countdown="${next.startAt.getTime()}">
        <p class="cd__label">До старта</p>
        <div class="cd__grid">
          <div><strong data-cd="d">0</strong><span>дн.</span></div>
          <div><strong data-cd="h">00</strong><span>ч</span></div>
          <div><strong data-cd="m">00</strong><span>мин</span></div>
          <div><strong data-cd="s">00</strong><span>сек</span></div>
        </div>
      </div>`;
    listEl.innerHTML = rest.map((t) => `
      <article class="t-row">
        <div class="t-row__date"><strong>${t.startAt.getDate()}</strong><span>${MONTHS_GEN[t.startAt.getMonth()].slice(0, 3)}</span></div>
        <div class="t-row__body">
          <h4>${esc(t.name)}</h4>
          <p>${esc(t.time)} · ${esc(t.format)} · ${esc(t.level)}</p>
          ${spotsBar(t)}
        </div>
        <a class="link-chev" target="_blank" rel="noopener" href="${regLink(t)}">Участвовать</a>
      </article>`).join('');
    startCountdown(nextEl.querySelector('[data-countdown]'));
  }

  winnersEl.innerHTML = `
    <h3 class="winners__title">Последние победители</h3>
    <ul>${WINNERS.map((w) => {
      const d = parseLocal(w.date);
      return `<li><span class="winners__cup" aria-hidden="true">🏆</span>
        <span class="winners__main"><strong>${esc(w.champion)}</strong><span>${esc(w.tournament)} · ${humanDate(d)} ${d.getFullYear()}</span></span>
        <span class="winners__score">${esc(w.score)}</span></li>`;
    }).join('')}</ul>`;
}

function startCountdown(el) {
  if (!el) return;
  const target = Number(el.dataset.countdown);
  const parts = ['d', 'h', 'm', 's'].map((k) => el.querySelector(`[data-cd="${k}"]`));
  const tick = () => {
    const sec = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const values = [Math.floor(sec / 86400), Math.floor((sec % 86400) / 3600), Math.floor((sec % 3600) / 60), sec % 60];
    values.forEach((v, i) => { parts[i].textContent = i === 0 ? String(v) : pad2(v); });
    if (sec === 0) clearInterval(timer);
  };
  const timer = setInterval(tick, 1000);
  tick();
}

function createRating(root) {
  const segEl = root.querySelector('[data-rating="gender"]');
  const searchEl = root.querySelector('[data-rating="search"]');
  const podiumEl = root.querySelector('[data-rating="podium"]');
  const bodyEl = root.querySelector('[data-rating="body"]');
  let state = Object.freeze({ gender: 'all', query: '' });

  // место считается по полному рейтингу выбранной группы, поиск только фильтрует
  const ranked = (gender) => [...PLAYERS]
    .filter((p) => gender === 'all' || p.gender === gender)
    .sort((a, b) => b.rating - a.rating)
    .map((p, i) => ({ ...p, place: i + 1 }));

  const delta = (d) => {
    if (d > 0) return `<span class="delta delta--up">▲ ${d}</span>`;
    if (d < 0) return `<span class="delta delta--down">▼ ${Math.abs(d)}</span>`;
    return '<span class="delta">—</span>';
  };

  function render() {
    const options = [['all', 'Все'], ['m', 'Мужчины'], ['f', 'Женщины']];
    segEl.innerHTML = options.map(([id, label]) => {
      const on = id === state.gender;
      return `<button type="button" class="seg__btn${on ? ' is-on' : ''}" role="radio" aria-checked="${on}" data-gender="${id}">${label}</button>`;
    }).join('');

    const all = ranked(state.gender);
    podiumEl.innerHTML = all.slice(0, 3).map((p) => `
      <div class="podium-card podium-card--${p.place}">
        <span class="podium-card__place">${p.place}</span>
        <strong>${esc(p.name)}</strong>
        <span class="podium-card__rating">${p.rating}</span>
        ${delta(p.delta)}
      </div>`).join('');

    const q = state.query.trim().toLowerCase();
    const rows = q ? all.filter((p) => p.name.toLowerCase().includes(q)) : all;
    bodyEl.innerHTML = rows.length === 0
      ? '<tr><td colspan="5" class="rating__empty">Игрок не найден</td></tr>'
      : rows.map((p) => `
        <tr>
          <td class="rating__place">${p.place}</td>
          <td class="rating__name">${esc(p.name)}</td>
          <td class="rating__pts">${p.rating}</td>
          <td>${delta(p.delta)}</td>
          <td class="rating__wr hide-sm">${Math.round((p.won / p.played) * 100)}%<small> · ${p.played} игр</small></td>
        </tr>`).join('');
  }

  segEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-gender]');
    if (b && b.dataset.gender !== state.gender) { state = Object.freeze({ ...state, gender: b.dataset.gender }); render(); }
  });
  searchEl.addEventListener('input', () => {
    state = Object.freeze({ ...state, query: searchEl.value.slice(0, 40) });
    render();
  });

  render();
}
