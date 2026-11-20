// Запись: услуга → формат → готовое сообщение в WhatsApp.
// Дату и время клиент и психолог согласуют в переписке.

const Booking = (() => {
  const root = document.getElementById('booking-form');
  const servicesBox = document.getElementById('bk-services');
  const summaryEl = document.getElementById('bk-summary');
  const sendLink = document.getElementById('bk-send');
  const formatHint = document.getElementById('bk-format-hint');
  const officeInput = root.querySelector('input[name="format"][value="office"]');
  const onlineInput = root.querySelector('input[name="format"][value="online"]');

  let state = Object.freeze({ service: 'single', format: 'online' });

  const service = () => SERVICES.find((s) => s.id === state.service);
  const formatLabel = () => (state.format === 'online' ? 'онлайн' : 'в кабинете');

  function setState(patch) {
    state = Object.freeze({ ...state, ...patch });
    render();
  }

  function renderServices() {
    servicesBox.innerHTML = SERVICES.map((s) => `
      <label><input type="radio" name="service" value="${esc(s.id)}" ${s.id === state.service ? 'checked' : ''}>
        <span><strong>${esc(s.title)}</strong><small>${s.duration} мин · ${esc(money(s.price))}</small></span>
      </label>`).join('');
  }

  function message() {
    const s = service();
    return [
      `Здравствуйте, ${PRO.shortName}! Хочу узнать свободное окошко.`,
      `Услуга: ${s.title} (${s.duration} мин, ${money(s.price)})`,
      `Формат: ${formatLabel()}`,
    ].join('\n');
  }

  function render() {
    // знакомство проходит только онлайн
    const onlineOnly = state.service === 'intro';
    officeInput.disabled = onlineOnly;
    if (onlineOnly && state.format !== 'online') {
      onlineInput.checked = true;
      state = Object.freeze({ ...state, format: 'online' });
    }
    formatHint.textContent = onlineOnly
      ? 'Знакомство проходит онлайн.'
      : state.format === 'office' ? `Кабинет: ${PRO.city}, ${PRO.address}.` : 'Видеосвязь в Zoom или WhatsApp — как вам удобнее.';

    const s = service();
    summaryEl.innerHTML = [
      ['Услуга', s.title],
      ['Формат', formatLabel()[0].toUpperCase() + formatLabel().slice(1)],
      ['Длительность', `${s.duration} мин${s.id === 'pack' ? ' × 5' : ''}`],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('') +
      `<div class="summary__total"><dt>Стоимость</dt><dd>${esc(money(s.price))}</dd></div>`;

    sendLink.href = whatsappUrl(message());
  }

  function selectService(id) {
    if (!SERVICES.some((s) => s.id === id)) return;
    const input = root.querySelector(`input[name="service"][value="${id}"]`);
    if (input) input.checked = true;
    setState({ service: id });
  }

  function init() {
    renderServices();
    root.addEventListener('change', (e) => {
      if (e.target.name === 'service') setState({ service: e.target.value });
      if (e.target.name === 'format') setState({ format: e.target.value });
    });
    render();
  }

  return Object.freeze({ init, selectService });
})();
