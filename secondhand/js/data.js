// Данные магазина. Меняйте тексты, цены и товары только здесь — вёрстку трогать не нужно.
// Сейчас тут демонстрационные данные, фото — Unsplash.

const STORE = Object.freeze({
  name: 'ReWear',
  tagline: 'Секонд-хенд и комиссионка',
  city: 'Алматы',
  address: 'ул. Жибек Жолы, 115',
  mapQuery: 'Алматы Жибек Жолы 115',
  phone: '77000000000', // в формате wa.me: только цифры, без +
  phoneLabel: '+7 700 000 00 00',
  instagram: 'rewear.almaty',
  openHour: 10,
  closeHour: 21,
  hoursLabel: 'Ежедневно 10:00–21:00',
  deliveryPrice: 1500,
  freeDeliveryFrom: 30000,
  consignShare: 0.6, // доля продавцу при сдаче на комиссию
});

const IMG = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

const PHOTOS = Object.freeze({
  hero: '1490481651871-ab68de25d43d',
  hall: '1567401893414-76b7b1e5a7a5',
  store: '1441986300917-64674bd600d8',
  consign: '1525507119028-ed4c629a60a3',
  wholesale: '1593030761757-71fae45fa0e7',
});

const CATEGORIES = Object.freeze([
  { id: 'all', label: 'Все' },
  { id: 'outer', label: 'Верхняя одежда' },
  { id: 'top', label: 'Футболки и трикотаж' },
  { id: 'bottom', label: 'Брюки и джинсы' },
  { id: 'shoes', label: 'Обувь' },
  { id: 'bags', label: 'Сумки' },
  { id: 'acc', label: 'Аксессуары' },
  { id: 'tech', label: 'Техника и винтаж' },
]);

const CONDITIONS = Object.freeze({
  new: { label: 'Новое с биркой', hint: 'Не носили, бирка на месте.' },
  excellent: { label: 'Отличное', hint: 'Носили пару раз, следов нет.' },
  good: { label: 'Хорошее', hint: 'Есть лёгкие следы носки, без дефектов.' },
});

// status: 'available' | 'reserved'; fresh: пришло на этой неделе
const PRODUCTS = Object.freeze([
  { id: 'p01', title: 'Кожаная куртка', brand: 'AllSaints', cat: 'outer', size: 'M', cond: 'excellent', price: 34900, retail: 189000, photo: '1551028719-00167b16eac5', fresh: true, status: 'available' },
  { id: 'p02', title: 'Кроссовки Free RN', brand: 'Nike', cat: 'shoes', size: '42', cond: 'good', price: 14900, retail: 54900, photo: '1542291026-7eec264c27ff', fresh: false, status: 'available' },
  { id: 'p03', title: 'Сумка Marmont', brand: 'Gucci', cat: 'bags', size: 'One size', cond: 'excellent', price: 289000, retail: 890000, photo: '1548036328-c9fa89d128fa', fresh: true, status: 'available', verified: true },
  { id: 'p04', title: 'Бомбер замшевый', brand: 'Massimo Dutti', cat: 'outer', size: 'M', cond: 'excellent', price: 21900, retail: 89900, photo: '1591047139829-d91aecb6caea', fresh: false, status: 'available' },
  { id: 'p05', title: 'Джинсы 501', brand: "Levi's", cat: 'bottom', size: 'W32 L32', cond: 'good', price: 12900, retail: 49900, photo: '1542272604-787c3835535d', fresh: false, status: 'available' },
  { id: 'p06', title: 'Наушники накладные', brand: 'Sony', cat: 'tech', size: '—', cond: 'good', price: 18900, retail: 59900, photo: '1505740420928-5e560c06d30e', fresh: false, status: 'reserved' },
  { id: 'p07', title: 'Футболка базовая', brand: 'COS', cat: 'top', size: 'L', cond: 'new', price: 4900, retail: 19900, photo: '1521572163474-6864f9cf17ab', fresh: true, status: 'available' },
  { id: 'p08', title: 'Камера OneStep 2', brand: 'Polaroid', cat: 'tech', size: '—', cond: 'excellent', price: 24900, retail: 69900, photo: '1526170375885-4d8ecf77b99f', fresh: true, status: 'available' },
  { id: 'p09', title: 'Худи оверсайз', brand: 'The North Face', cat: 'top', size: 'L', cond: 'good', price: 13900, retail: 49900, photo: '1556821840-3a63f95609a7', fresh: false, status: 'available' },
  { id: 'p10', title: 'Сумка-тоут', brand: 'Furla', cat: 'bags', size: 'One size', cond: 'excellent', price: 49900, retail: 189000, photo: '1584917865442-de89df76afd3', fresh: false, status: 'available', verified: true },
  { id: 'p11', title: 'Очки Wayfarer', brand: 'Ray-Ban', cat: 'acc', size: 'One size', cond: 'good', price: 19900, retail: 79900, photo: '1572635196237-14b3f281503f', fresh: false, status: 'available' },
  { id: 'p12', title: 'Кроссовки 327', brand: 'New Balance', cat: 'shoes', size: '41', cond: 'excellent', price: 18900, retail: 64900, photo: '1560769629-975ec94e6a86', fresh: true, status: 'available' },
  { id: 'p13', title: 'Джоггеры трикотажные', brand: 'Zara', cat: 'bottom', size: 'S', cond: 'new', price: 7900, retail: 22900, photo: '1594633312681-425c7b97ccd1', fresh: false, status: 'available' },
  { id: 'p14', title: 'Тренч джинсовый', brand: 'Mango', cat: 'outer', size: 'S', cond: 'excellent', price: 19900, retail: 69900, photo: '1539109136881-3be0616acf4b', fresh: false, status: 'available' },
  { id: 'p15', title: 'Кардиган-пончо', brand: 'H&M', cat: 'top', size: 'M', cond: 'excellent', price: 6900, retail: 24900, photo: '1434389677669-e08b4cac3105', fresh: true, status: 'available' },
  { id: 'p16', title: 'Косуха', brand: 'Bershka', cat: 'outer', size: 'L', cond: 'good', price: 22900, retail: 59900, photo: '1520975954732-35dd22299614', fresh: false, status: 'reserved' },
  { id: 'p17', title: 'Куртка рабочая Detroit', brand: 'Carhartt', cat: 'outer', size: 'L', cond: 'good', price: 29900, retail: 119000, photo: '1544022613-e87ca75a784a', fresh: true, status: 'available' },
  { id: 'p18', title: 'Спортивный костюм', brand: 'Adidas', cat: 'top', size: 'XS', cond: 'excellent', price: 15900, retail: 49900, photo: '1515886657613-9f3515b0c78f', fresh: false, status: 'available' },
  { id: 'p19', title: 'Кеды кожаные', brand: 'Lacoste', cat: 'shoes', size: '40', cond: 'excellent', price: 17900, retail: 69900, photo: '1608231387042-66d1773070a5', fresh: false, status: 'available' },
  { id: 'p20', title: 'Air Force 1 Shadow', brand: 'Nike', cat: 'shoes', size: '38', cond: 'new', price: 29900, retail: 74900, photo: '1595950653106-6c9ebd614d3a', fresh: true, status: 'available' },
  { id: 'p21', title: 'Джинсовая куртка', brand: "Levi's", cat: 'outer', size: 'M', cond: 'good', price: 16900, retail: 59900, photo: '1611312449408-fcece27cdbb7', fresh: false, status: 'available' },
  { id: 'p22', title: 'Сандалии Arizona', brand: 'Birkenstock', cat: 'shoes', size: '39', cond: 'good', price: 12900, retail: 54900, photo: '1603487742131-4160ec999306', fresh: false, status: 'available' },
  { id: 'p23', title: 'Бейсболка', brand: 'Polo Ralph Lauren', cat: 'acc', size: 'One size', cond: 'excellent', price: 7900, retail: 34900, photo: '1588850561407-ed78c282e89b', fresh: false, status: 'available' },
  { id: 'p24', title: 'Свитшот', brand: 'Tommy Hilfiger', cat: 'top', size: 'M', cond: 'good', price: 9900, retail: 44900, photo: '1578587018452-892bacefd3f2', fresh: true, status: 'available' },
  { id: 'p25', title: 'Набор колец, серебро', brand: 'Винтаж', cat: 'acc', size: '17–18', cond: 'excellent', price: 14900, retail: 39900, photo: '1617038220319-276d3cfab638', fresh: false, status: 'available' },
  { id: 'p26', title: 'Футболка оверсайз', brand: 'Carhartt WIP', cat: 'top', size: 'XL', cond: 'excellent', price: 8900, retail: 29900, photo: '1622519407650-3df9883f76a5', fresh: false, status: 'available' },
  { id: 'p27', title: 'Часы минималист', brand: 'Skagen', cat: 'acc', size: 'One size', cond: 'excellent', price: 12900, retail: 69000, photo: '1523275335684-37898b6baf30', fresh: false, status: 'available' },
  { id: 'p28', title: 'Футболки, набор из 3', brand: 'Uniqlo', cat: 'top', size: 'M', cond: 'new', price: 6900, retail: 23700, photo: '1529374255404-311a2a4f1fd9', fresh: true, status: 'available' },
  { id: 'p29', title: 'Костюм классический', brand: 'Hugo Boss', cat: 'bottom', size: '50', cond: 'excellent', price: 54900, retail: 249000, photo: '1617137968427-85924c800a22', fresh: false, status: 'available' },
]);

// Зал «на вес»: скидка растёт к концу недели, в понедельник — новый завоз.
// Индекс = день недели JS (0 — воскресенье).
const HALL = Object.freeze({
  pricePerKg: 7000,
  days: Object.freeze([
    { short: 'Вс', discount: 70, note: 'Финальная распродажа' },
    { short: 'Пн', discount: 0, note: 'Новый завоз' },
    { short: 'Вт', discount: 10, note: '' },
    { short: 'Ср', discount: 20, note: '' },
    { short: 'Чт', discount: 30, note: '' },
    { short: 'Пт', discount: 40, note: '' },
    { short: 'Сб', discount: 50, note: '' },
  ]),
});

// Приём вещей на комиссию: ориентир цены перепродажи от розничной.
const CONSIGN = Object.freeze({
  tiers: Object.freeze([
    { id: 'mass', label: 'Масс-маркет', hint: 'Zara, H&M, Uniqlo', rate: 0.25, min: 2000 },
    { id: 'mid', label: 'Средний сегмент', hint: "Levi's, Nike, Massimo Dutti", rate: 0.32, min: 5000 },
    { id: 'premium', label: 'Премиум и люкс', hint: 'Coach, Furla, Gucci', rate: 0.4, min: 20000 },
  ]),
  condFactor: Object.freeze({ new: 1, excellent: 0.85, good: 0.65 }),
});

// Опт для бизнеса: сортированный товар в мешках.
const WHOLESALE = Object.freeze([
  { id: 'w1', title: 'Микс осень–зима', grade: 'Сорт «Крем»', unit: 'мешок 25 кг', pricePerKg: 4200, weight: 25, origin: 'Великобритания' },
  { id: 'w2', title: 'Джинса микс', grade: 'Сорт 1', unit: 'мешок 25 кг', pricePerKg: 3600, weight: 25, origin: 'Германия' },
  { id: 'w3', title: 'Обувь, пары', grade: 'Сорт 1', unit: 'мешок 20 кг', pricePerKg: 3900, weight: 20, origin: 'Италия' },
  { id: 'w4', title: 'Детская одежда', grade: 'Сток', unit: 'коробка 15 кг', pricePerKg: 5200, weight: 15, origin: 'Европа' },
]);

const FACTS = Object.freeze([
  { value: '12 000+', label: 'вещей в зале каждую неделю' },
  { value: '−70%', label: 'к розничной цене в среднем' },
  { value: '48 ч', label: 'на выплату за проданные вещи' },
  { value: '100%', label: 'вещей проходит обработку озоном' },
]);
