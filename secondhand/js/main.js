// Точка входа: контакты, фото, статус магазина, неделя скидок, анимации.

const LINKS = Object.freeze({
  whatsapp: whatsappUrl(`Здравствуйте! У меня вопрос по магазину ${STORE.name}.`),
  instagram: `https://instagram.com/${STORE.instagram}`,
  map: `https://2gis.kz/search/${encodeURIComponent(STORE.mapQuery)}`,
  phone: `tel:+${STORE.phone}`,
});

const TEXTS = Object.freeze({
  address: `${STORE.city}, ${STORE.address}`,
  hours: STORE.hoursLabel,
  phone: STORE.phoneLabel,
  instagram: `@${STORE.instagram}`,
  share: `${Math.round(STORE.consignShare * 100)}%`,
  year: String(new Date().getFullYear()),
});

function applyContent() {
  document.querySelectorAll('[data-link]').forEach((el) => {
    const url = LINKS[el.dataset.link];
    if (!url) return;
    el.setAttribute('href', url);
    if (!url.startsWith('tel:')) {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    }
  });
  document.querySelectorAll('[data-text]').forEach((el) => {
    const text = TEXTS[el.dataset.text];
    if (text) el.textContent = text;
  });
  document.getElementById('hero-img').src = IMG(PHOTOS.hero, 1800);
  document.getElementById('hall-img').src = IMG(PHOTOS.hall, 1000);
  document.getElementById('store-img').src = IMG(PHOTOS.store, 1000);
}

function hallPrice(discount) {
  return HALL.pricePerKg * (1 - discount / 100);
}

function renderStatus(now) {
  const hour = now.getHours();
  const open = hour >= STORE.openHour && hour < STORE.closeHour;
  const today = HALL.days[now.getDay()];
  const sale = today.discount ? ` · сегодня в зале −${today.discount}%` : ' · сегодня новый завоз';
  const el = document.getElementById('hero-status');
  el.innerHTML = open
    ? `<span class="dot">Открыто до ${STORE.closeHour}:00${esc(sale)}</span>`
    : `<span class="dot dot--closed">Сейчас закрыто, откроемся в ${STORE.openHour}:00</span>`;
  el.title = today.discount ? `Скидка в зале на вес сегодня: ${today.discount}%` : 'Сегодня новый завоз';
}

function renderWeek(now) {
  const todayIdx = now.getDay();
  const order = [1, 2, 3, 4, 5, 6, 0]; // неделя с понедельника
  document.getElementById('week').innerHTML = order.map((i) => {
    const d = HALL.days[i];
    const label = d.discount ? `−${d.discount}%` : 'Завоз';
    return `<li class="${i === todayIdx ? 'is-today' : ''}" ${i === todayIdx ? 'aria-current="date"' : ''}>
      <span>${esc(d.short)}</span><strong>${label}</strong><small>${money(hallPrice(d.discount))}/кг</small>
    </li>`;
  }).join('');

  const today = HALL.days[todayIdx];
  document.getElementById('hall-today').innerHTML = today.discount
    ? `<span class="muted">Сегодня ${esc(today.note || 'в зале')}</span><strong>${money(hallPrice(today.discount))} за кг</strong>вместо ${money(HALL.pricePerKg)}, скидка ${today.discount}%`
    : `<span class="muted">Сегодня</span><strong>Новый завоз</strong>${money(HALL.pricePerKg)} за кг — лучший выбор`;
}

function renderFacts() {
  document.getElementById('facts').innerHTML = FACTS.map((f) =>
    `<li class="reveal"><strong>${esc(f.value)}</strong><span>${esc(f.label)}</span></li>`).join('');
}

function initReveal() {
  const items = document.querySelectorAll('.reveal, .hero__media');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el, i) => {
    el.style.transitionDelay = el.closest('.hero') ? `${i * 80}ms` : '';
    io.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  applyContent();
  renderFacts();
  renderStatus(now);
  renderWeek(now);
  CartView.init();
  Catalog.init();
  Consign.init();
  Wholesale.init();
  initReveal();
});
