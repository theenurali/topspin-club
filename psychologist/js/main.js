// Точка входа: тексты, фото, блоки из data.js, кнопки WhatsApp, анимации.

const SLOT_TEXT = `Здравствуйте, ${PRO.shortName}! Хочу узнать свободное окошко для консультации.`;

const LINKS = Object.freeze({
  phone: `tel:+${PRO.phone}`,
  instagram: `https://instagram.com/${PRO.instagram}`,
  map: `https://2gis.kz/search/${encodeURIComponent(PRO.mapQuery)}`,
});

const TEXTS = Object.freeze({
  name: PRO.name,
  shortName: PRO.shortName,
  roleCity: `${PRO.role} · ${PRO.city}`,
  address: `${PRO.city}, ${PRO.address}`,
  phone: PRO.phoneLabel,
  instagram: `@${PRO.instagram}`,
  year: String(new Date().getFullYear()),
});

function applyContent() {
  document.querySelectorAll('[data-text]').forEach((el) => {
    const text = TEXTS[el.dataset.text];
    if (text) el.textContent = text;
  });
  document.querySelectorAll('[data-link]').forEach((el) => {
    const url = LINKS[el.dataset.link];
    if (!url) return;
    el.href = url;
    if (!url.startsWith('tel:')) {
      el.target = '_blank';
      el.rel = 'noopener';
    }
  });
  document.querySelectorAll('[data-wa="slot"]').forEach((el) => { el.href = whatsappUrl(SLOT_TEXT); });

  const portrait = document.getElementById('portrait');
  portrait.src = IMG(PHOTOS.portrait, 1000);
  portrait.alt = `${PRO.name}, ${PRO.role.toLowerCase()}`;
  document.getElementById('office').src = IMG(PHOTOS.office, 1000);
  document.getElementById('calm').src = IMG(PHOTOS.calm, 1800);
}

function renderBlocks() {
  document.getElementById('facts').innerHTML = FACTS.map((f) =>
    `<li class="reveal"><strong>${esc(f.value)}</strong><span>${esc(f.label)}</span></li>`).join('');

  const timeline = (items) => items.map((i) =>
    `<li><small>${esc(i.years)}</small><strong>${esc(i.title)}</strong><span>${esc(i.place)}</span></li>`).join('');
  document.getElementById('education').innerHTML = timeline(EDUCATION);
  document.getElementById('experience').innerHTML = timeline(EXPERIENCE);

  document.getElementById('topic-list').innerHTML = TOPICS.map((t, i) =>
    `<li class="reveal"><small>${pad(i + 1)}</small><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></li>`).join('');

  document.getElementById('steps').innerHTML = STEPS.map((s) =>
    `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('');

  document.getElementById('plans').innerHTML = SERVICES.map((s) => `
    <li class="plan reveal">
      <span class="plan__badge ${s.badge ? '' : 'plan__badge--empty'}">${esc(s.badge || '—')}</span>
      <h3>${esc(s.title)}</h3>
      <span class="plan__meta">${s.duration} минут${s.id === 'pack' ? ' × 5' : ''}</span>
      <div class="plan__price">${esc(money(s.price))}</div>
      <p>${esc(s.text)}</p>
      <a class="pill ${s.id === 'single' ? '' : 'pill--ghost'}" href="#booking" data-pick="${esc(s.id)}">Записаться</a>
    </li>`).join('');

  document.getElementById('review-list').innerHTML = REVIEWS.map((r) =>
    `<li><blockquote>${esc(r.text)}</blockquote><cite>${esc(r.who)}</cite></li>`).join('');

  document.getElementById('faq-list').innerHTML = FAQ.map((f) =>
    `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
}

function bindPlans() {
  document.getElementById('plans').addEventListener('click', (e) => {
    const link = e.target.closest('[data-pick]');
    if (link) Booking.selectService(link.dataset.pick);
  });
}

/** Плавающая кнопка WhatsApp: появляется после героя, прячется у блока записи. */
function initFloatingWa() {
  const btn = document.querySelector('.wa-float');
  const hero = document.querySelector('.hero');
  const booking = document.getElementById('booking');
  if (!('IntersectionObserver' in window)) { btn.classList.add('is-on'); return; }
  const visible = { hero: true, booking: false };
  const update = () => btn.classList.toggle('is-on', !visible.hero && !visible.booking);
  new IntersectionObserver(([e]) => { visible.hero = e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { visible.booking = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(booking);
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
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
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el, i) => {
    if (el.closest('.hero')) el.style.transitionDelay = `${i * 70}ms`;
    io.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyContent();
  renderBlocks();
  bindPlans();
  Booking.init();
  initFloatingWa();
  initReveal();
});
