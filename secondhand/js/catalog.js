// Каталог: фильтры, поиск, сортировка, карточки и быстрый просмотр.

const Catalog = (() => {
  const grid = document.getElementById('grid');
  const chips = document.getElementById('chips');
  const search = document.getElementById('search');
  const condSelect = document.getElementById('filter-cond');
  const sortSelect = document.getElementById('sort');
  const countEl = document.getElementById('result-count');
  const emptyEl = document.getElementById('empty');
  const modal = document.getElementById('product-modal');
  const modalBody = document.getElementById('product-modal-body');

  let state = Object.freeze({ cat: 'all', query: '', cond: 'all', sort: 'fresh' });
  const setState = (patch) => {
    state = Object.freeze({ ...state, ...patch });
    render();
  };

  const SORTS = Object.freeze({
    fresh: (a, b) => Number(b.fresh) - Number(a.fresh) || a.id.localeCompare(b.id),
    cheap: (a, b) => a.price - b.price,
    expensive: (a, b) => b.price - a.price,
    saving: (a, b) => savingPercent(b.price, b.retail) - savingPercent(a.price, a.retail),
  });

  function matches(p) {
    if (state.cat !== 'all' && p.cat !== state.cat) return false;
    if (state.cond !== 'all' && p.cond !== state.cond) return false;
    if (!state.query) return true;
    const haystack = `${p.brand} ${p.title} ${categoryLabel(p.cat)}`.toLowerCase();
    return state.query.split(/\s+/).every((word) => haystack.includes(word));
  }

  function visibleProducts() {
    const available = (p) => (p.status === 'available' ? 0 : 1);
    return [...PRODUCTS].filter(matches).sort((a, b) => available(a) - available(b) || SORTS[state.sort](a, b));
  }

  function pluralItems(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'вещь';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'вещи';
    return 'вещей';
  }

  function badges(p) {
    const list = [];
    if (p.status === 'reserved') list.push('<span class="badge badge--muted">Забронировано</span>');
    else if (p.fresh) list.push('<span class="badge badge--new">Новинка</span>');
    if (p.verified) list.push('<span class="badge">Подлинность ✓</span>');
    return list.join('');
  }

  function priceBlock(p) {
    const save = savingPercent(p.price, p.retail);
    return `<strong>${money(p.price)}</strong><s>${money(p.retail)}</s>${save ? `<em>−${save}%</em>` : ''}`;
  }

  function addButton(p) {
    if (p.status !== 'available') return '';
    const inCart = Cart.has(p.id);
    return `<button class="add-btn ${inCart ? 'is-added' : ''}" type="button" data-add="${esc(p.id)}"
      aria-pressed="${inCart}" aria-label="${inCart ? 'Убрать из корзины' : 'В корзину'}: ${esc(p.title)}">${inCart ? '✓' : '+'}</button>`;
  }

  function card(p, index) {
    return `
      <li class="product ${p.status === 'reserved' ? 'is-reserved' : ''}" style="animation-delay:${Math.min(index, 12) * 35}ms">
        ${addButton(p)}
        <button class="product__open" type="button" data-open="${esc(p.id)}">
          <div class="product__media">
            <img src="${IMG(p.photo, 600)}" alt="${esc(`${p.brand}, ${p.title}`)}" loading="lazy" width="600" height="750">
            <div class="product__badges">${badges(p)}</div>
          </div>
          <div class="product__body">
            <div class="product__brand">${esc(p.brand)}</div>
            <div class="product__title">${esc(p.title)}</div>
            <div class="product__meta">${esc(p.size)} · ${esc(CONDITIONS[p.cond].label)}</div>
            <div class="product__price">${priceBlock(p)}</div>
          </div>
        </button>
      </li>`;
  }

  function render() {
    const items = visibleProducts();
    grid.innerHTML = items.map(card).join('');
    emptyEl.hidden = items.length > 0;
    countEl.textContent = `${items.length} ${pluralItems(items.length)}`;
    chips.querySelectorAll('.chip').forEach((chip) => {
      chip.setAttribute('aria-selected', String(chip.dataset.cat === state.cat));
    });
  }

  function renderChips() {
    chips.innerHTML = CATEGORIES.map((c) =>
      `<button class="chip" type="button" role="tab" data-cat="${esc(c.id)}" aria-selected="false">${esc(c.label)}</button>`,
    ).join('');
    condSelect.insertAdjacentHTML('beforeend', Object.entries(CONDITIONS)
      .map(([id, c]) => `<option value="${esc(id)}">${esc(c.label)}</option>`).join(''));
  }

  function modalHtml(p) {
    const cond = CONDITIONS[p.cond];
    const available = p.status === 'available';
    const inCart = Cart.has(p.id);
    const ask = whatsappUrl(`Здравствуйте! Вопрос по вещи: ${p.brand} — ${p.title}, ${p.size} (арт. ${p.id}).`);
    return `
      <figure class="modal__media"><img src="${IMG(p.photo, 1000)}" alt="${esc(`${p.brand}, ${p.title}`)}"></figure>
      <div class="modal__info">
        <button class="icon-btn modal__close" type="button" data-close-modal aria-label="Закрыть">✕</button>
        <div class="product__badges" style="position:static">${badges(p)}</div>
        <div class="product__brand">${esc(p.brand)}</div>
        <h2 class="modal__title" id="pm-title">${esc(p.title)}</h2>
        <div class="modal__price">${priceBlock(p)}</div>
        <dl class="spec">
          <div><dt>Размер</dt><dd>${esc(p.size)}</dd></div>
          <div><dt>Состояние</dt><dd>${esc(cond.label)}</dd></div>
          <div><dt>Категория</dt><dd>${esc(categoryLabel(p.cat))}</dd></div>
          <div><dt>Артикул</dt><dd>${esc(p.id.toUpperCase())}</dd></div>
        </dl>
        <p class="modal__note">${esc(cond.hint)} Вещь в одном экземпляре, обработана озоном.</p>
        <div class="modal__actions">
          ${available
            ? `<button class="pill pill--block" type="button" data-modal-add="${esc(p.id)}">${inCart ? 'Уже в корзине — открыть' : 'Добавить в корзину'}</button>`
            : '<button class="pill pill--block" type="button" disabled>Забронировано</button>'}
          <a class="pill pill--ghost pill--block" href="${ask}" target="_blank" rel="noopener">Спросить в WhatsApp</a>
        </div>
      </div>`;
  }

  function openModal(id) {
    const product = productById(id);
    if (!product) return;
    modalBody.innerHTML = modalHtml(product);
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    document.body.classList.add('is-locked');
  }

  function closeModal() {
    if (modal.open) modal.close();
  }

  function onAdd(id) {
    const added = Cart.toggle(id);
    if (added) {
      CartView.bump();
      toast('Добавили в корзину');
    }
  }

  function bind() {
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-cat]');
      if (chip) setState({ cat: chip.dataset.cat });
    });
    let timer;
    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => setState({ query: search.value.trim().toLowerCase().slice(0, 60) }), 150);
    });
    condSelect.addEventListener('change', () => setState({ cond: condSelect.value }));
    sortSelect.addEventListener('change', () => {
      if (SORTS[sortSelect.value]) setState({ sort: sortSelect.value });
    });
    grid.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) return onAdd(add.dataset.add);
      const open = e.target.closest('[data-open]');
      if (open) openModal(open.dataset.open);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-close-modal]')) return closeModal();
      const add = e.target.closest('[data-modal-add]');
      if (!add) return;
      if (!Cart.has(add.dataset.modalAdd)) onAdd(add.dataset.modalAdd);
      closeModal();
      CartView.open();
    });
    modal.addEventListener('close', () => {
      // событие close приходит асинхронно: не снимаем блокировку, если уже открыта корзина
      if (!document.getElementById('cart').classList.contains('is-open')) {
        document.body.classList.remove('is-locked');
      }
    });
    Cart.subscribe(render);
  }

  function init() {
    renderChips();
    bind();
    render();
  }

  return Object.freeze({ init });
})();
