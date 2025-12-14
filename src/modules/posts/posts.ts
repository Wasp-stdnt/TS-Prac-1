import { Post, PostsModuleConfig } from "../../types/appTypes.js";

/**
 * Рендерить список постів у контейнер.
 */
function renderPosts(container: HTMLUListElement, posts: Post[]): void {
    container.innerHTML = "";

    posts.forEach((post: Post): void => {
        const listItem: HTMLLIElement = document.createElement("li");
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
function renderMessage(container: HTMLUListElement, message: string): void {
    container.innerHTML = `<li>${message}</li>`;
}

/**
 * Завантажує пости з API та відображає їх.
 */
async function loadPosts(
    apiUrl: string,
    container: HTMLUListElement
): Promise<void> {
    renderMessage(container, "Завантаження...");

    try {
        const response: Response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Помилка завантаження даних");
        }

        const posts: Post[] = await response.json();
        renderPosts(container, posts);
    } catch (error: unknown) {
        console.error(error);
        renderMessage(
            container,
            "Не вдалося завантажити дані. Спробуйте ще раз."
        );
    }
}

/**
 * Ініціалізує логіку кнопки "Завантажити пости":
 * - вішає обробник на кнопку
 * - при кліку тягне дані з API та рендерить у список
 */
export function initPostsModule(config: PostsModuleConfig): void {
    const button: HTMLButtonElement | null = document.querySelector(
        config.buttonSelector
    );

    const container: HTMLUListElement | null = document.querySelector(
        config.containerSelector
    );

    if (!button) {
        console.warn(
            "Load posts button not found by selector:",
            config.buttonSelector
        );
        return;
    }

    if (!container) {
        console.warn(
            "Posts container not found by selector:",
            config.containerSelector
        );
        return;
    }

    button.addEventListener("click", (): void => {
        void loadPosts(config.apiUrl, container);
    });
}
