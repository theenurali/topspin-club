// Калькулятор приёма вещей на комиссию и оптовая заявка.

const Consign = (() => {
  const tierBox = document.getElementById('consign-tier');
  const condBox = document.getElementById('consign-cond');
  const retailInput = document.getElementById('consign-retail');
  const saleEl = document.getElementById('consign-sale');
  const payoutEl = document.getElementById('consign-payout');
  const errorEl = document.getElementById('consign-error');
  const sendLink = document.getElementById('consign-send');
  const RETAIL_MIN = 1000;
  const RETAIL_MAX = 10000000;

  function radios(name, options, checkedId) {
    return options.map((o) => `
      <label><input type="radio" name="${name}" value="${esc(o.id)}" ${o.id === checkedId ? 'checked' : ''}>
      <span>${esc(o.label)}${o.hint ? `<small>${esc(o.hint)}</small>` : ''}</span></label>`).join('');
  }

  const selected = (name) => document.querySelector(`input[name="${name}"]:checked`).value;

  /** Оценка: цена перепродажи и выплата продавцу. */
  function estimate(tierId, condId, retail) {
    const tier = CONSIGN.tiers.find((t) => t.id === tierId);
    const factor = CONSIGN.condFactor[condId];
    const raw = Math.max(tier.min, retail * tier.rate * factor);
    const sale = Math.round(raw / 100) * 100; // круглые цены на бирках
    return { sale, payout: Math.round(sale * STORE.consignShare) };
  }

  function update() {
    const retail = Number(retailInput.value);
    const valid = Number.isFinite(retail) && retail >= RETAIL_MIN && retail <= RETAIL_MAX;
    retailInput.setAttribute('aria-invalid', String(!valid));
    sendLink.setAttribute('aria-disabled', String(!valid));
    if (!valid) {
      errorEl.textContent = `Введите цену от ${money(RETAIL_MIN)} до ${money(RETAIL_MAX)}.`;
      saleEl.textContent = '—';
      payoutEl.textContent = '—';
      return;
    }
    errorEl.textContent = '';
    const tierId = selected('tier');
    const condId = selected('cond');
    const { sale, payout } = estimate(tierId, condId, retail);
    saleEl.textContent = money(sale);
    payoutEl.textContent = money(payout);
    const tier = CONSIGN.tiers.find((t) => t.id === tierId);
    sendLink.href = whatsappUrl(
      `Здравствуйте! Хочу сдать вещи в ${STORE.name}.\nСегмент: ${tier.label}\n` +
      `Состояние: ${CONDITIONS[condId].label}\nЦена в магазине: ${money(retail)}\n` +
      `Ваша оценка: выплата ${money(payout)}.\nПрикладываю фото:`,
    );
  }

  function init() {
    tierBox.insertAdjacentHTML('beforeend', radios('tier', CONSIGN.tiers, 'mid'));
    const conds = Object.entries(CONDITIONS).map(([id, c]) => ({ id, label: c.label }));
    condBox.insertAdjacentHTML('beforeend', radios('cond', conds, 'excellent'));
    document.getElementById('consign-form').addEventListener('input', update);
    document.getElementById('consign-form').addEventListener('submit', (e) => e.preventDefault());
    update();
  }

  return Object.freeze({ init, estimate });
})();

const Wholesale = (() => {
  const listEl = document.getElementById('lots');
  const totalEl = document.getElementById('lots-total');
  const weightEl = document.getElementById('lots-weight');
  const sendLink = document.getElementById('lots-send');
  const MAX_QTY = 50;

  let qty = Object.freeze(Object.fromEntries(WHOLESALE.map((l) => [l.id, 0])));

  const lotPrice = (lot) => lot.pricePerKg * lot.weight;

  function render() {
    listEl.innerHTML = WHOLESALE.map((lot) => `
      <li class="lot">
        <span class="lot__grade">${esc(lot.grade)} · ${esc(lot.origin)}</span>
        <h3>${esc(lot.title)}</h3>
        <p>${esc(lot.unit)} · ${money(lot.pricePerKg)}/кг</p>
        <div class="lot__price">${money(lotPrice(lot))} <small>за ${esc(lot.unit.split(' ')[0])}</small></div>
        <div class="stepper">
          <button type="button" data-step="-1" data-lot="${esc(lot.id)}" aria-label="Меньше: ${esc(lot.title)}" ${qty[lot.id] === 0 ? 'disabled' : ''}>−</button>
          <output aria-live="polite">${qty[lot.id]} шт.</output>
          <button type="button" data-step="1" data-lot="${esc(lot.id)}" aria-label="Больше: ${esc(lot.title)}" ${qty[lot.id] >= MAX_QTY ? 'disabled' : ''}>+</button>
        </div>
      </li>`).join('');

    const chosen = WHOLESALE.filter((l) => qty[l.id] > 0);
    const total = chosen.reduce((s, l) => s + lotPrice(l) * qty[l.id], 0);
    const weight = chosen.reduce((s, l) => s + l.weight * qty[l.id], 0);
    totalEl.textContent = money(total);
    weightEl.textContent = weight ? `· ${weight} кг` : '';
    sendLink.setAttribute('aria-disabled', String(chosen.length === 0));
    sendLink.href = chosen.length
      ? whatsappUrl([
        `Здравствуйте! Оптовая заявка в ${STORE.name}:`,
        ...chosen.map((l) => `• ${l.title} (${l.grade}), ${l.unit} × ${qty[l.id]} = ${money(lotPrice(l) * qty[l.id])}`),
        `Итого: ${money(total)}, ${weight} кг.`,
        'Прошу выставить счёт. Компания / ИИН:',
      ].join('\n'))
      : '#';
  }

  function init() {
    listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-step]');
      if (!btn) return;
      const id = btn.dataset.lot;
      const next = Math.min(MAX_QTY, Math.max(0, (qty[id] || 0) + Number(btn.dataset.step)));
      qty = Object.freeze({ ...qty, [id]: next });
      render();
      const again = listEl.querySelector(`[data-lot="${id}"][data-step="${btn.dataset.step}"]`);
      if (again && !again.disabled) again.focus();
    });
    render();
  }

  return Object.freeze({ init });
})();
