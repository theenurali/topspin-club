// Розыгрыш на главном экране: мяч летает между ракетками с отскоком от стола.
// Координаты в системе viewBox SVG (1000×540). Плоскость стола: y от 120 до 380.

const RALLY = Object.freeze({
  far: Object.freeze({ x: 352, y: 178 }),   // точка удара чёрной ракетки (дальняя сторона)
  near: Object.freeze({ x: 668, y: 318 }),  // точка удара красной ракетки (ближняя сторона)
  bounceNear: Object.freeze({ x: 590, y: 300 }),
  bounceFar: Object.freeze({ x: 420, y: 190 }),
  hitHeight: 46,     // высота мяча над столом в момент удара
  arcOverNet: 120,   // подъём дуги над сеткой
  arcAfterBounce: 60,
  flight: 620,       // мс от удара до отскока
  rise: 360,         // мс от отскока до следующего удара
});

const lerp = (a, b, t) => a + (b - a) * t;

/** Положение мяча на участке «удар → отскок → удар» при t ∈ [0, 1) */
function rallyLeg(from, bounce, to, t) {
  const split = RALLY.flight / (RALLY.flight + RALLY.rise);
  if (t < split) {
    const k = t / split;
    const ground = { x: lerp(from.x, bounce.x, k), y: lerp(from.y, bounce.y, k) };
    const z = RALLY.hitHeight * (1 - k) + 4 * RALLY.arcOverNet * k * (1 - k);
    return { ground, z };
  }
  const k = (t - split) / (1 - split);
  const ground = { x: lerp(bounce.x, to.x, k), y: lerp(bounce.y, to.y, k) };
  const z = RALLY.hitHeight * k + 4 * RALLY.arcAfterBounce * k * (1 - k);
  return { ground, z };
}

function startRally(svg) {
  const ball = svg.querySelector('.hero__ball');
  const shadow = svg.querySelector('.hero__ball-shadow');
  const paddles = { far: svg.querySelector('[data-paddle="far"]'), near: svg.querySelector('[data-paddle="near"]') };
  if (!ball || !shadow) return;

  const leg = RALLY.flight + RALLY.rise;
  let visible = true;
  let start = null;
  let lastLeg = -1;

  const swing = (el, deg) => el && el.animate(
    [{ transform: 'rotate(0deg)' }, { transform: `rotate(${deg}deg)` }, { transform: 'rotate(0deg)' }],
    { duration: 280, easing: 'cubic-bezier(.3,.7,.4,1)' },
  );

  function frame(ts) {
    if (!visible) { start = null; return; }
    if (start === null) start = ts;
    const elapsed = ts - start;
    const legIndex = Math.floor(elapsed / leg);
    const t = (elapsed % leg) / leg;
    const toNear = legIndex % 2 === 0;

    if (legIndex !== lastLeg) {
      swing(toNear ? paddles.far : paddles.near, toNear ? 18 : -18);
      lastLeg = legIndex;
    }

    const { ground, z } = toNear
      ? rallyLeg(RALLY.far, RALLY.bounceNear, RALLY.near, t)
      : rallyLeg(RALLY.near, RALLY.bounceFar, RALLY.far, t);

    // ближе к зрителю мяч крупнее
    const depth = (ground.y - 120) / 260;
    const r = 12 + depth * 8;
    ball.setAttribute('cx', ground.x.toFixed(1));
    ball.setAttribute('cy', (ground.y - z).toFixed(1));
    ball.setAttribute('r', r.toFixed(1));
    shadow.setAttribute('cx', ground.x.toFixed(1));
    shadow.setAttribute('cy', ground.y.toFixed(1));
    shadow.setAttribute('rx', (r * 0.9).toFixed(1));
    shadow.setAttribute('opacity', Math.max(0.15, 0.6 - z / 260).toFixed(2));
    requestAnimationFrame(frame);
  }

  // не тратим ресурсы, когда первый экран прокручен
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible) requestAnimationFrame(frame);
    }).observe(svg);
  }
  requestAnimationFrame(frame);
}

function setupHeroRally() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const svg = document.querySelector('.hero__svg');
  if (svg) startRally(svg);
}
