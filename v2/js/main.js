// Точка входа: контакты, меню, статус клуба, разделы.

const LINKS = Object.freeze({
  whatsapp: whatsappUrl(`Здравствуйте! У меня вопрос по клубу ${CLUB.name}.`),
  instagram: `https://instagram.com/${CLUB.instagram}`,
  map: `https://2gis.kz/search/${encodeURIComponent(CLUB.mapQuery)}`,
});

const TEXTS = Object.freeze({
  address: `${CLUB.city}, ${CLUB.address}`,
  hours: CLUB.hoursLabel,
  phone: CLUB.phoneLabel,
  instagram: `@${CLUB.instagram}`,
  priceFrom: money(PRICING.day),
  year: String(new Date().getFullYear()),
});

function applyContent() {
  document.querySelectorAll('[data-link]').forEach((el) => {
    const url = LINKS[el.dataset.link];
    if (!url) return;
    el.setAttribute('href', url);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });
  document.querySelectorAll('[data-text]').forEach((el) => {
    const text = TEXTS[el.dataset.text];
    if (text) el.textContent = text;
  });
}

function renderHeroStatus(el) {
  const free = freeTablesNow(new Date());
  if (free === null) {
    el.innerHTML = `<span class="dot dot--closed">Сейчас закрыто. Откроемся в ${hourLabel(CLUB.openHour)}</span>`;
  } else if (free === 0) {
    el.innerHTML = '<span class="dot dot--busy">Сейчас все столы заняты</span>';
  } else {
    el.innerHTML = `<span class="dot dot--free">Сейчас свободно ${free} из ${TABLES.length}</span>`;
  }
}

function setupMenu() {
  const header = document.querySelector('.gnav');
  const toggle = header.querySelector('.gnav__toggle');
  const close = () => {
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('is-open');
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  header.querySelectorAll('.gnav__links a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// Подсветка текущего раздела в меню. Только классы, без прокрутки страницы.
function highlightNav() {
  if (!('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('.gnav__links a')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('is-active', a === byId.get(entry.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach((s) => io.observe(s));
}

function safely(label, fn) {
  try {
    return fn();
  } catch (error) {
    console.error(`[${label}]`, error);
    return null;
  }
}

function init() {
  const $ = (sel) => document.querySelector(sel);
  safely('content', applyContent);
  safely('menu', setupMenu);
  safely('status', () => renderHeroStatus($('[data-hero-status]')));
  const booking = safely('booking', () => createBooking($('#booking')));
  safely('tables', () => renderTableCards($('[data-render="tables"]'), (id) => {
    if (booking) booking.selectTable(id);
    $('#booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  safely('plans', () => createPlans($('#plans')));
  safely('compare', () => renderCompare($('[data-render="compare"]')));
  safely('coaches', () => createCoachSchedule($('#coaches')));
  safely('tournaments', () => renderTournaments($('[data-render="t-next"]'), $('[data-render="t-list"]'), $('[data-render="winners"]')));
  safely('rating', () => createRating($('#rating')));
  safely('faq', () => renderFaq($('[data-render="faq"]')));
  safely('nav', highlightNav);
  // анимации запускаем последними, когда все блоки уже на странице
  safely('rally', setupHeroRally);
  safely('reveal', setupReveal);
}

init();
