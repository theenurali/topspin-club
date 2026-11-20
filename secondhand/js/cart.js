// Корзина: список id товаров (каждая вещь в одном экземпляре), выдвижная панель,
// оформление заказа сообщением в WhatsApp.

const Cart = (() => {
  const KEY = 'rewear.cart.v1';
  const listeners = [];

  const isValidId = (id) => {
    const product = productById(id);
    return Boolean(product) && product.status === 'available';
  };

  let ids = Object.freeze(
    [...new Set(storage.read(KEY, []))].filter((id) => typeof id === 'string' && isValidId(id)),
  );

  function commit(next) {
    ids = Object.freeze(next);
    storage.write(KEY, ids);
    listeners.forEach((fn) => fn(ids));
  }

  return Object.freeze({
    items: () => ids.map(productById).filter(Boolean),
    has: (id) => ids.includes(id),
    count: () => ids.length,
    subtotal: () => ids.reduce((sum, id) => sum + (productById(id)?.price || 0), 0),
    add(id) {
      if (!isValidId(id) || ids.includes(id)) return false;
      commit([...ids, id]);
      return true;
    },
    remove(id) {
      commit(ids.filter((x) => x !== id));
    },
    toggle(id) {
      if (ids.includes(id)) {
        this.remove(id);
        return false;
      }
      return this.add(id);
    },
    clear() {
      commit([]);
    },
    subscribe(fn) {
      listeners.push(fn);
    },
  });
})();

const CartView = (() => {
  const root = document.getElementById('cart');
  const list = document.getElementById('cart-list');
  const form = document.getElementById('cart-form');
  const countEl = document.getElementById('bag-count');
  const bagBtn = document.querySelector('.bag-btn');
  const addressField = document.getElementById('cart-address-field');
  const errorEl = document.getElementById('cart-error');
  let lastFocus = null;

  const deliveryMode = () => form.querySelector('input[name="delivery"]:checked').value;

  function deliveryCost(subtotal) {
    if (deliveryMode() !== 'courier') return 0;
    return subtotal >= STORE.freeDeliveryFrom ? 0 : STORE.deliveryPrice;
  }

  function renderItems(items) {
    list.innerHTML = items.map((p) => `
      <li class="cart-item">
        <img src="${IMG(p.photo, 200)}" alt="" loading="lazy">
        <div>
          <div class="cart-item__brand">${esc(p.brand)}</div>
          <div class="cart-item__title">${esc(p.title)}</div>
          <div class="cart-item__price">${money(p.price)} · ${esc(p.size)}</div>
        </div>
        <button class="cart-item__remove" type="button" data-remove="${esc(p.id)}">Убрать</button>
      </li>`).join('');
  }

  function renderTotals() {
    const subtotal = Cart.subtotal();
    const delivery = deliveryCost(subtotal);
    document.getElementById('cart-subtotal').textContent = money(subtotal);
    document.getElementById('cart-delivery-cost').textContent =
      deliveryMode() === 'courier' && delivery === 0 ? 'Бесплатно' : money(delivery);
    document.getElementById('cart-total').textContent = money(subtotal + delivery);
    addressField.hidden = deliveryMode() !== 'courier';
  }

  function render() {
    const items = Cart.items();
    renderItems(items);
    renderTotals();
    root.classList.toggle('is-empty', items.length === 0);
    countEl.hidden = items.length === 0;
    countEl.textContent = String(items.length);
  }

  function open() {
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    root.querySelector('.drawer__head .icon-btn').focus();
  }

  function close() {
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  }

  function setInvalid(input, invalid) {
    input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function validate() {
    const name = document.getElementById('cart-name');
    const phone = document.getElementById('cart-phone');
    const address = document.getElementById('cart-address');
    const errors = [];
    const nameOk = name.value.trim().length >= 2;
    const phoneNorm = normalizePhone(phone.value);
    const needAddress = deliveryMode() === 'courier';
    const addressOk = !needAddress || address.value.trim().length >= 5;
    setInvalid(name, !nameOk);
    setInvalid(phone, !phoneNorm);
    setInvalid(address, !addressOk);
    if (!nameOk) errors.push('укажите имя');
    if (!phoneNorm) errors.push('проверьте номер телефона');
    if (!addressOk) errors.push('укажите адрес доставки');
    return { errors, name: name.value.trim(), phone: phoneNorm, address: address.value.trim() };
  }

  function orderMessage({ name, phone, address }) {
    const items = Cart.items();
    const subtotal = Cart.subtotal();
    const delivery = deliveryCost(subtotal);
    const lines = items.map((p, i) => `${i + 1}. ${p.brand} — ${p.title}, ${p.size} (арт. ${p.id}) — ${money(p.price)}`);
    return [
      `Здравствуйте! Хочу заказать в ${STORE.name}:`,
      ...lines,
      '',
      `Получение: ${deliveryMode() === 'courier' ? `курьер, ${address}` : 'самовывоз'}`,
      `Итого: ${money(subtotal + delivery)}`,
      `Имя: ${name}, тел.: ${phone}`,
    ].join('\n');
  }

  function onSubmit(event) {
    event.preventDefault();
    const result = validate();
    if (result.errors.length) {
      errorEl.textContent = `Почти готово: ${result.errors.join(', ')}.`;
      return;
    }
    errorEl.textContent = '';
    window.open(whatsappUrl(orderMessage(result)), '_blank', 'noopener');
    toast('Заказ отправлен в WhatsApp. Ответим в течение 15 минут.');
  }

  function bump() {
    bagBtn.classList.remove('is-bump');
    void bagBtn.offsetWidth; // перезапуск анимации
    bagBtn.classList.add('is-bump');
  }

  function init() {
    document.querySelectorAll('[data-open-cart]').forEach((el) => el.addEventListener('click', open));
    root.querySelectorAll('[data-close-cart]').forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) close();
    });
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove]');
      if (btn) Cart.remove(btn.dataset.remove);
    });
    form.addEventListener('change', renderTotals);
    form.addEventListener('submit', onSubmit);
    Cart.subscribe(render);
    render();
  }

  return Object.freeze({ init, open, close, bump });
})();
