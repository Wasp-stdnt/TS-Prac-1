// -----------------------------
// КРОК 1. Базові типи товарів
// -----------------------------

/**
 * Базовий тип для будь-якого товару.
 * Містить спільні поля для всіх категорій.
 */
export type BaseProduct = {
    id: number;
    name: string;
    price: number;
    description: string;
    inStock: boolean;
    tags: string[];
};

/**
 * Електроніка: телефони, ноутбуки, навушники тощо.
 */
export type Electronics = BaseProduct & {
    category: "electronics";
    brand: string;
    warrantyMonths: number;
    power: string; // наприклад, "20W", "65W"
};

/**
 * Одяг: футболки, худі, кросівки тощо.
 */
export type Clothing = BaseProduct & {
    category: "clothing";
    size: "XS" | "S" | "M" | "L" | "XL";
    material: string;
    gender: "men" | "women" | "unisex";
};

/**
 * Книги: паперові, електронні тощо.
 */
export type Book = BaseProduct & {
    category: "book";
    author: string;
    pages: number;
    coverType: "soft" | "hard";
};

// Допоміжний тип для "будь-якого" товару магазину
export type AnyProduct = Electronics | Clothing | Book;

// -----------------------------
// КРОК 2. Generic-функції для пошуку / фільтрації
// -----------------------------

/**
 * Пошук товару за id у масиві продуктів.
 * Використовує generic T, який обмежений BaseProduct.
 */
export const findProduct = <T extends BaseProduct>(
    products: T[],
    id: number
): T | undefined => {
    if (!Array.isArray(products)) {
        console.warn("findProduct: products is not an array");
        return undefined;
    }

    return products.find((product: T): boolean => product.id === id);
};

/**
 * Фільтрація товарів за максимальною ціною.
 * Повертає всі товари, у яких price <= maxPrice.
 */
export const filterByPrice = <T extends BaseProduct>(
    products: T[],
    maxPrice: number
): T[] => {
    if (!Array.isArray(products)) {
        console.warn("filterByPrice: products is not an array");
        return [];
    }

    if (maxPrice < 0) {
        console.warn("filterByPrice: maxPrice must be >= 0");
        return [];
    }

    return products.filter((product: T): boolean => product.price <= maxPrice);
};

// -----------------------------
// КРОК 3. Кошик та операції з ним
// -----------------------------

/**
 * Елемент кошика: товар + кількість.
 * T — будь-який тип, що наслідує BaseProduct.
 */
export type CartItem<T extends BaseProduct> = {
    product: T;
    quantity: number;
};

/**
 * Додає товар у кошик.
 * Якщо товар вже є в кошику — збільшує кількість.
 * Функція не мутує оригінальний масив, повертає новий.
 */
export const addToCart = <T extends BaseProduct>(
    cart: CartItem<T>[],
    product: T,
    quantity: number
): CartItem<T>[] => {
    if (quantity <= 0) {
        console.warn("addToCart: quantity must be > 0");
        return cart;
    }

    if (!product.inStock) {
        console.warn(`addToCart: product "${product.name}" is not in stock`);
        return cart;
    }

    const existingIndex: number = cart.findIndex(
        (item: CartItem<T>): boolean => item.product.id === product.id
    );

    // Якщо товар вже в кошику — оновлюємо кількість
    if (existingIndex !== -1) {
        const updatedCart: CartItem<T>[] = [...cart];
        const existingItem: CartItem<T> = updatedCart[existingIndex];

        updatedCart[existingIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
        };

        return updatedCart;
    }

    // Інакше просто додаємо новий елемент
    return [...cart, { product, quantity }];
};

/**
 * Рахує загальну вартість кошика.
 * Сумує price * quantity для всіх товарів.
 */
export const calculateTotal = <T extends BaseProduct>(
    cart: CartItem<T>[]
): number => {
    if (!Array.isArray(cart)) {
        console.warn("calculateTotal: cart is not an array");
        return 0;
    }

    return cart.reduce((sum: number, item: CartItem<T>): number => {
        const itemPrice: number = item.product.price;
        const itemQuantity: number = item.quantity;

        if (itemPrice < 0 || itemQuantity <= 0) {
            console.warn(
                `calculateTotal: incorrect data for product "${item.product.name}"`
            );
            return sum;
        }

        return sum + itemPrice * itemQuantity;
    }, 0);
};

// -----------------------------
// КРОК 4. Тестові дані та демо роботи
// -----------------------------

// 4.1. Тестові масиви товарів

export const electronics: Electronics[] = [
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

export const clothes: Clothing[] = [
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

export const books: Book[] = [
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
const phone: Electronics | undefined = findProduct<Electronics>(
    electronics,
    1
);
const laptop: Electronics | undefined = findProduct<Electronics>(
    electronics,
    2
);

// Пошук футболки
const tshirt: Clothing | undefined = findProduct<Clothing>(clothes, 10);

// Фільтрація товарів за ціною
const cheapElectronics: Electronics[] = filterByPrice<Electronics>(
    electronics,
    20000
);
const cheapBooks: Book[] = filterByPrice<Book>(books, 1500);

// Демонстрація кошика з одним конкретним типом (електроніка)
let electronicsCart: CartItem<Electronics>[] = [];

if (phone) {
    electronicsCart = addToCart<Electronics>(electronicsCart, phone, 1);
}
if (laptop) {
    electronicsCart = addToCart<Electronics>(electronicsCart, laptop, 2);
}

const electronicsTotal: number = calculateTotal<Electronics>(electronicsCart);

// Демонстрація "змішаного" кошика, де можуть бути будь-які товари
let mixedCart: CartItem<AnyProduct>[] = [];

if (phone) {
    mixedCart = addToCart<AnyProduct>(mixedCart, phone, 1);
}
if (tshirt) {
    // худі inStock: false — перевірка не дасть його додати
    mixedCart = addToCart<AnyProduct>(mixedCart, tshirt, 2);
}
mixedCart = addToCart<AnyProduct>(mixedCart, books[0], 1);

const mixedTotal: number = calculateTotal<AnyProduct>(mixedCart);

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
