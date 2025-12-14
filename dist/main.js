"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Базові примітивні типи
const siteTitle = "Практична 2 – TypeScript";
const postsLimit = 5;
const apiUrl = `https://jsonplaceholder.typicode.com/posts?_limit=${postsLimit}`;
let isModalOpen = false;
// Пошук елементів
const headerElement = document.querySelector(".header");
const modalElement = document.querySelector("#modal");
const openModalBtn = document.querySelector("[data-open-modal]");
const closeModalElements = document.querySelectorAll("[data-close-modal]");
const postsContainer = document.querySelector("#posts");
const loadPostsBtn = document.querySelector("#load-posts");
// Функція зміни заголовка сторінки
function setDocumentTitle(title) {
    document.title = title;
}
setDocumentTitle(siteTitle);
// Функція відкриття / закриття модалки
function toggleModal(open) {
    if (!modalElement)
        return;
    isModalOpen = open;
    if (open) {
        modalElement.classList.add("modal--visible");
        document.body.style.overflow = "hidden";
    }
    else {
        modalElement.classList.remove("modal--visible");
        document.body.style.overflow = "";
    }
}
// Обробники для модального вікна
if (openModalBtn) {
    openModalBtn.addEventListener("click", () => {
        toggleModal(true);
    });
}
closeModalElements.forEach((element) => {
    element.addEventListener("click", () => {
        toggleModal(false);
    });
});
// Закриття по Escape
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isModalOpen) {
        toggleModal(false);
    }
});
// Scroll-listener для шапки
window.addEventListener("scroll", () => {
    if (!headerElement)
        return;
    const currentScroll = window.scrollY;
    if (currentScroll > 20) {
        headerElement.classList.add("header--scrolled");
    }
    else {
        headerElement.classList.remove("header--scrolled");
    }
});
// Завантаження постів з API
function loadPosts() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!postsContainer)
            return;
        postsContainer.innerHTML = "<li>Завантаження...</li>";
        try {
            const response = yield fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Помилка завантаження даних");
            }
            const posts = yield response.json();
            postsContainer.innerHTML = "";
            posts.forEach((post) => {
                const listItem = document.createElement("li");
                listItem.className = "post-card";
                listItem.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.body}</p>
      `;
                postsContainer.appendChild(listItem);
            });
        }
        catch (error) {
            console.error(error);
            postsContainer.innerHTML =
                "<li>Не вдалося завантажити дані. Спробуйте ще раз.</li>";
        }
    });
}
if (loadPostsBtn) {
    loadPostsBtn.addEventListener("click", () => {
        void loadPosts();
    });
}
