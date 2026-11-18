// Плавное появление блоков при прокрутке, как на сайтах Apple.
// Блоки скрываются только когда JS точно может их показать: без
// IntersectionObserver или при «уменьшении движения» всё видно сразу.

const REVEAL_SELECTOR = [
  '.sec-title', '.sec-sub', '.tile', '.tcard', '.bk-step', '.bk-sum', '.plan',
  '.compare-title', '.compare-wrap', '.coach', '.sched', '.t-next', '.t-row',
  '.winners', '.podium-card', '.rating-wrap', '.faq-list', '.contact',
].join(',');

function setupReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = [...document.querySelectorAll(REVEAL_SELECTOR)];
  // задержка по порядку среди соседей: карточки в ряду появляются волной
  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.matches(REVEAL_SELECTOR));
    el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el), 5) * 80}ms`);
    el.classList.add('reveal');
  });
  document.documentElement.classList.add('anim-ready');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
}
