// Базові примітивні типи
const siteTitle: string = "Практична 2 – TypeScript";
const postsLimit: number = 5;
const apiUrl: string = `https://jsonplaceholder.typicode.com/posts?_limit=${postsLimit}`;
let isModalOpen: boolean = false;

// Тип для поста з API
type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
};

// Пошук елементів
const headerElement: HTMLElement | null = document.querySelector(".header");
const modalElement: HTMLDivElement | null = document.querySelector("#modal");
const openModalBtn: HTMLButtonElement | null = document.querySelector(
    "[data-open-modal]"
);
const closeModalElements: NodeListOf<HTMLElement> =
    document.querySelectorAll("[data-close-modal]");
const postsContainer: HTMLUListElement | null =
    document.querySelector("#posts");
const loadPostsBtn: HTMLButtonElement | null =
    document.querySelector("#load-posts");

// Функція зміни заголовка сторінки
function setDocumentTitle(title: string): void {
    document.title = title;
}

setDocumentTitle(siteTitle);

// Функція відкриття / закриття модалки
function toggleModal(open: boolean): void {
    if (!modalElement) return;
    isModalOpen = open;

    if (open) {
        modalElement.classList.add("modal--visible");
        document.body.style.overflow = "hidden";
    } else {
        modalElement.classList.remove("modal--visible");
        document.body.style.overflow = "";
    }
}

// Обробники для модального вікна
if (openModalBtn) {
    openModalBtn.addEventListener("click", (): void => {
        toggleModal(true);
    });
}

closeModalElements.forEach((element: HTMLElement): void => {
    element.addEventListener("click", (): void => {
        toggleModal(false);
    });
});

// Закриття по Escape
window.addEventListener("keydown", (event: KeyboardEvent): void => {
    if (event.key === "Escape" && isModalOpen) {
        toggleModal(false);
    }
});

// Scroll-listener для шапки
window.addEventListener("scroll", (): void => {
    if (!headerElement) return;
    const currentScroll: number = window.scrollY;

    if (currentScroll > 20) {
        headerElement.classList.add("header--scrolled");
    } else {
        headerElement.classList.remove("header--scrolled");
    }
});

// Завантаження постів з API
async function loadPosts(): Promise<void> {
    if (!postsContainer) return;

    postsContainer.innerHTML = "<li>Завантаження...</li>";

    try {
        const response: Response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Помилка завантаження даних");
        }

        const posts: Post[] = await response.json();

        postsContainer.innerHTML = "";

        posts.forEach((post: Post): void => {
            const listItem: HTMLLIElement = document.createElement("li");
            listItem.className = "post-card";

            listItem.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body}</p>
      `;

            postsContainer.appendChild(listItem);
        });
    } catch (error: unknown) {
        console.error(error);
        postsContainer.innerHTML =
            "<li>Не вдалося завантажити дані. Спробуйте ще раз.</li>";
    }
}

if (loadPostsBtn) {
    loadPostsBtn.addEventListener("click", (): void => {
        void loadPosts();
    });
}
