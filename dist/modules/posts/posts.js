var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Рендерить список постів у контейнер.
 */
function renderPosts(container, posts) {
    container.innerHTML = "";
    posts.forEach((post) => {
        const listItem = document.createElement("li");
        listItem.className = "post-card";
        listItem.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.body}</p>
    `;
        container.appendChild(listItem);
    });
}
/**
 * Показує повідомлення про помилку / стан у контейнері.
 */
function renderMessage(container, message) {
    container.innerHTML = `<li>${message}</li>`;
}
/**
 * Завантажує пости з API та відображає їх.
 */
function loadPosts(apiUrl, container) {
    return __awaiter(this, void 0, void 0, function* () {
        renderMessage(container, "Завантаження...");
        try {
            const response = yield fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Помилка завантаження даних");
            }
            const posts = yield response.json();
            renderPosts(container, posts);
        }
        catch (error) {
            console.error(error);
            renderMessage(container, "Не вдалося завантажити дані. Спробуйте ще раз.");
        }
    });
}
/**
 * Ініціалізує логіку кнопки "Завантажити пости":
 * - вішає обробник на кнопку
 * - при кліку тягне дані з API та рендерить у список
 */
export function initPostsModule(config) {
    const button = document.querySelector(config.buttonSelector);
    const container = document.querySelector(config.containerSelector);
    if (!button) {
        console.warn("Load posts button not found by selector:", config.buttonSelector);
        return;
    }
    if (!container) {
        console.warn("Posts container not found by selector:", config.containerSelector);
        return;
    }
    button.addEventListener("click", () => {
        void loadPosts(config.apiUrl, container);
    });
}
