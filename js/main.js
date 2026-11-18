// Точка входа: контакты, статус клуба, разделы, навигация, анимации.

const LINKS = Object.freeze({
  whatsapp: whatsappUrl(`Здравствуйте! У меня вопрос по клубу ${CLUB.name}.`),
  instagram: `https://instagram.com/${CLUB.instagram}`,
  phone: `tel:+${CLUB.whatsapp}`,
  map: `https://2gis.kz/search/${encodeURIComponent(CLUB.mapQuery)}`,
});

const TEXTS = Object.freeze({
  name: CLUB.name,
  tagline: CLUB.tagline,
  address: `${CLUB.city}, ${CLUB.address}`,
  hours: CLUB.hoursLabel,
  phone: CLUB.phoneLabel,
  instagram: `@${CLUB.instagram}`,
  tables: String(TABLES.length),
  trainers: String(TRAINERS.length),
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
}

function renderStatus(el) {
  const free = freeTablesNow();
  if (free === null) {
    el.className = 'status status--closed';
    el.innerHTML = `<i></i>Сейчас закрыто · откроемся в ${hourLabel(CLUB.openHour)}`;
    return;
  }
  el.className = `status${free === 0 ? ' status--busy' : ''}`;
  el.innerHTML = free === 0
    ? '<i></i>Открыто · все столы заняты'
    : `<i></i>Открыто · свободно ${free} из ${TABLES.length} ${pluralize(TABLES.length, 'стола', 'столов', 'столов')}`;
}

// Прокручивает только полоску меню по горизонтали, чтобы активная кнопка
// была по центру. scrollIntoView здесь нельзя: он двигает и саму страницу
// и обрывает переход по якорю и прокрутку пользователя.
function centerNavLink(nav, link) {
  if (nav.scrollWidth <= nav.clientWidth) return;
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const delta = linkRect.left - navRect.left - (nav.clientWidth - linkRect.width) / 2;
  if (Math.abs(delta) > 1) nav.scrollBy({ left: delta, behavior: 'smooth' });
}

function highlightNav() {
  const nav = document.querySelector('.nav__links');
  const links = [...nav.querySelectorAll('a')];
  // .hero без ссылки в меню: когда он в кадре, подсветка снимается
  const sections = [document.querySelector('.hero'), ...links
    .map((a) => document.querySelector(a.getAttribute('href')))]
    .filter(Boolean);
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id ? `#${entry.target.id}` : null;
      links.forEach((a) => {
        const active = a.getAttribute('href') === id;
        a.classList.toggle('is-active', active);
        if (active) centerNavLink(nav, a);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

function revealOnScroll() {
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
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

function safely(label, fn) {
  try {
    fn();
  } catch (error) {
    // Один сломанный раздел не должен ронять всю страницу
    console.error(`[${label}]`, error);
  }
}

function init() {
  const $ = (sel) => document.querySelector(sel);
  safely('content', applyContent);
  safely('status', () => renderStatus($('[data-status]')));
  safely('tables', () => renderTables($('[data-render="tables"]')));
  safely('bar', () => renderBar($('[data-render="bar"]')));
  safely('pricing', () => renderPricing($('[data-render="pricing"]')));
  safely('booking', () => createBooking($('#rent')));
  safely('plans', () => renderPlans($('[data-render="plans"]')));
  safely('trainers', () => renderTrainers($('[data-render="trainers"]')));
  safely('schedule', () => createSchedule($('#schedule')));
  safely('tournaments', () => renderTournaments($('[data-render="next-tournament"]'), $('[data-render="tournaments"]')));
  safely('champions', () => renderChampions($('[data-render="podium"]'), $('[data-render="champions"]'), $('[data-render="leaders"]')));
  safely('nav', highlightNav);
  safely('reveal', revealOnScroll);
}

init();
