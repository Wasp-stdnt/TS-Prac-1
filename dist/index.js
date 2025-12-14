"use strict";
// -----------------------------
// КРОК 1. Базові типи товарів
// -----------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.books = exports.clothes = exports.electronics = exports.calculateTotal = exports.addToCart = exports.filterByPrice = exports.findProduct = void 0;
// -----------------------------
// КРОК 2. Generic-функції для пошуку / фільтрації
// -----------------------------
/**
 * Пошук товару за id у масиві продуктів.
 * Використовує generic T, який обмежений BaseProduct.
 */
const findProduct = (products, id) => {
    if (!Array.isArray(products)) {
        console.warn("findProduct: products is not an array");
        return undefined;
    }
    return products.find((product) => product.id === id);
};
exports.findProduct = findProduct;
/**
 * Фільтрація товарів за максимальною ціною.
 * Повертає всі товари, у яких price <= maxPrice.
 */
const filterByPrice = (products, maxPrice) => {
    if (!Array.isArray(products)) {
        console.warn("filterByPrice: products is not an array");
        return [];
    }
    if (maxPrice < 0) {
        console.warn("filterByPrice: maxPrice must be >= 0");
        return [];
    }
    return products.filter((product) => product.price <= maxPrice);
};
exports.filterByPrice = filterByPrice;
/**
 * Додає товар у кошик.
 * Якщо товар вже є в кошику — збільшує кількість.
 * Функція не мутує оригінальний масив, повертає новий.
 */
const addToCart = (cart, product, quantity) => {
    if (quantity <= 0) {
        console.warn("addToCart: quantity must be > 0");
        return cart;
    }
    if (!product.inStock) {
        console.warn(`addToCart: product "${product.name}" is not in stock`);
        return cart;
    }
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    // Якщо товар вже в кошику — оновлюємо кількість
    if (existingIndex !== -1) {
        const updatedCart = [...cart];
        const existingItem = updatedCart[existingIndex];
        updatedCart[existingIndex] = Object.assign(Object.assign({}, existingItem), { quantity: existingItem.quantity + quantity });
        return updatedCart;
    }
    // Інакше просто додаємо новий елемент
    return [...cart, { product, quantity }];
};
exports.addToCart = addToCart;
/**
 * Рахує загальну вартість кошика.
 * Сумує price * quantity для всіх товарів.
 */
const calculateTotal = (cart) => {
    if (!Array.isArray(cart)) {
        console.warn("calculateTotal: cart is not an array");
        return 0;
    }
    return cart.reduce((sum, item) => {
        const itemPrice = item.product.price;
        const itemQuantity = item.quantity;
        if (itemPrice < 0 || itemQuantity <= 0) {
            console.warn(`calculateTotal: incorrect data for product "${item.product.name}"`);
            return sum;
        }
        return sum + itemPrice * itemQuantity;
    }, 0);
};
exports.calculateTotal = calculateTotal;
// -----------------------------
// КРОК 4. Тестові дані та демо роботи
// -----------------------------
// 4.1. Тестові масиви товарів
exports.electronics = [
    {
        id: 1,
        name: "Смартфон SuperPhone X",
        price: 15000,
        description: "6.5'' AMOLED, 256GB пам'яті",
        inStock: true,
        tags: ["smartphone", "android", "5G"],
        category: "electronics",
        brand: "SuperTech",
        warrantyMonths: 24,
        power: "25W",
    },
    {
        id: 2,
        name: "Ноутбук UltraBook Pro",
        price: 38000,
        description: "14'' IPS, 16GB RAM, 1TB SSD",
        inStock: true,
        tags: ["laptop", "ultrabook"],
        category: "electronics",
        brand: "UltraTech",
        warrantyMonths: 12,
        power: "65W",
    },
];
exports.clothes = [
    {
        id: 10,
        name: "Футболка Oversize",
        price: 800,
        description: "Чорна футболка, oversize fit",
        inStock: true,
        tags: ["t-shirt", "black"],
        category: "clothing",
        size: "M",
        material: "cotton",
        gender: "unisex",
    },
    {
        id: 11,
        name: "Худі Warm Up",
        price: 1600,
        description: "Тепле худі з капюшоном",
        inStock: false,
        tags: ["hoodie", "warm"],
        category: "clothing",
        size: "L",
        material: "fleece",
        gender: "women",
    },
];
exports.books = [
    {
        id: 20,
        name: "Clean Code",
        price: 1200,
        description: "Роберт Мартін, класика для розробників",
        inStock: true,
        tags: ["programming", "bestseller"],
        category: "book",
        author: "Robert C. Martin",
        pages: 464,
        coverType: "hard",
    },
];
// 4.2. Демонстрація роботи функцій
// Пошук електроніки за id
const phone = (0, exports.findProduct)(exports.electronics, 1);
const laptop = (0, exports.findProduct)(exports.electronics, 2);
// Пошук футболки
const tshirt = (0, exports.findProduct)(exports.clothes, 10);
// Фільтрація товарів за ціною
const cheapElectronics = (0, exports.filterByPrice)(exports.electronics, 20000);
const cheapBooks = (0, exports.filterByPrice)(exports.books, 1500);
// Демонстрація кошика з одним конкретним типом (електроніка)
let electronicsCart = [];
if (phone) {
    electronicsCart = (0, exports.addToCart)(electronicsCart, phone, 1);
}
if (laptop) {
    electronicsCart = (0, exports.addToCart)(electronicsCart, laptop, 2);
}
const electronicsTotal = (0, exports.calculateTotal)(electronicsCart);
// Демонстрація "змішаного" кошика, де можуть бути будь-які товари
let mixedCart = [];
if (phone) {
    mixedCart = (0, exports.addToCart)(mixedCart, phone, 1);
}
if (tshirt) {
    // худі inStock: false — перевірка не дасть його додати
    mixedCart = (0, exports.addToCart)(mixedCart, tshirt, 2);
}
mixedCart = (0, exports.addToCart)(mixedCart, exports.books[0], 1);
const mixedTotal = (0, exports.calculateTotal)(mixedCart);
// -----------------------------
// 4.3. Невеликий вивід у консоль (для перевірки)
// -----------------------------
// Цей блок можна залишити або прибрати перед здачею — на твою совість :)
console.log("=== DEMO PRACTICE 5 ===");
console.log("Знайдений телефон:", phone);
console.log("Дешева електроніка (<= 20000):", cheapElectronics);
console.log("Дешеві книги (<= 1500):", cheapBooks);
console.log("Кошик (електроніка):", electronicsCart);
console.log("Сума по електроніці:", electronicsTotal);
console.log("Змішаний кошик:", mixedCart);
console.log("Загальна сума змішаного кошика:", mixedTotal);
