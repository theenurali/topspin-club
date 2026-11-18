// Разделы без сложной логики: столы, абонементы, сравнение, «Скоро», вопросы.

function statusText(st) {
  if (st.state === 'closed') return `Откроемся в ${hourLabel(CLUB.openHour)}`;
  if (st.state === 'free') return st.until ? `Свободен до ${hourLabel(st.until)}` : 'Свободен до закрытия';
  return st.until ? `Занят до ${hourLabel(st.until)}` : 'Занят до закрытия';
}

function renderTableCards(el, onBook) {
  const now = new Date();
  el.innerHTML = TABLES.map((t) => {
    const st = tableStatusNow(t.id, now);
    return `
      <article class="tcard tcard--${t.tone}">
        <div class="tcard__art" aria-hidden="true"><span class="ptable"><i></i></span></div>
        <div class="tcard__body">
          <p class="tcard__tag">${esc(t.tag)}</p>
          <h3>${esc(t.name)}. ${esc(t.title)}.</h3>
          <p class="tcard__text">${esc(t.text)}</p>
          <p class="dot dot--${st.state}">${esc(statusText(st))}</p>
          <button type="button" class="link-chev" data-book-table="${t.id}">Забронировать этот стол</button>
        </div>
      </article>`;
  }).join('');
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-book-table]');
    if (btn) onBook(Number(btn.dataset.bookTable));
  });
}

function planPrice(plan, billingKey) {
  const b = BILLING[billingKey];
  const perMonth = plan.monthly * (1 - b.discount);
  return { perMonth, total: perMonth * b.months, months: b.months };
}

function createPlans(root) {
  const switchEl = root.querySelector('[data-plans="billing"]');
  const cardsEl = root.querySelector('[data-plans="cards"]');
  let billing = 'month';

  function renderSwitch() {
    switchEl.innerHTML = Object.entries(BILLING).map(([key, b]) => {
      const on = key === billing;
      return `<button type="button" class="seg__btn${on ? ' is-on' : ''}" role="radio" aria-checked="${on}" data-billing="${key}">
        ${esc(b.label)}${b.discount ? ` <span class="save">−${Math.round(b.discount * 100)}%</span>` : ''}</button>`;
    }).join('');
  }

  function renderCards() {
    cardsEl.innerHTML = PLANS.map((p) => {
      const price = planPrice(p, billing);
      const note = price.months > 1
        ? `${money(price.total)} за ${price.months} ${pluralize(price.months, 'месяц', 'месяца', 'месяцев')}`
        : 'Оплата помесячно';
      const msg = `Здравствуйте! Хочу абонемент «${p.name}» (${BILLING[billing].label}) в ${CLUB.name}.`;
      return `
        <article class="plan${p.featured ? ' plan--featured' : ''}">
          ${p.featured ? '<p class="plan__badge">Выбор большинства</p>' : ''}
          <h3>${esc(p.name)}</h3>
          <p class="plan__lead">${esc(p.lead)}</p>
          <p class="plan__price"><span>${money(price.perMonth)}</span>/мес.</p>
          <p class="plan__note">${esc(note)}</p>
          <ul>${p.perks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <a class="pill${p.featured ? '' : ' pill--soft'}" target="_blank" rel="noopener" href="${whatsappUrl(msg)}">Оформить</a>
        </article>`;
    }).join('');
  }

  switchEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-billing]');
    if (!btn || btn.dataset.billing === billing) return;
    billing = btn.dataset.billing;
    renderSwitch();
    renderCards();
  });

  renderSwitch();
  renderCards();
}

function renderCompare(el) {
  const cell = (v) => {
    if (v === true) return '<span class="yes" aria-label="Есть">✓</span>';
    if (v === false) return '<span class="no" aria-label="Нет">—</span>';
    return esc(v);
  };
  el.innerHTML = `
    <thead><tr><th scope="col"><span class="sr-only">Возможность</span></th>
      ${PLANS.map((p) => `<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead>
    <tbody>${COMPARE.map((row) => `<tr><th scope="row">${esc(row.label)}</th>
      ${row.values.map((v) => `<td>${cell(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;
}

function renderSoon(el) {
  el.innerHTML = COMING_SOON.map((s) => `
    <article class="soon">
      <p class="soon__tag">Скоро</p>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
    </article>`).join('');
}

function renderFaq(el) {
  el.innerHTML = FAQ.map((f) => `
    <details class="faq">
      <summary>${esc(f.q)}<span class="faq__icon" aria-hidden="true"></span></summary>
      <p>${esc(f.a)}</p>
    </details>`).join('');
}
