import { initModal } from "./modules/modal/modal.js";
import { initHeaderScroll } from "./modules/header/headerScroll.js";
import { initPostsModule } from "./modules/posts/posts.js";
import {
    HeaderScrollConfig,
    ModalConfig,
    PostsModuleConfig,
} from "./types/appTypes.js";

/**
 * Ініціалізація всієї сторінки.
 * Викликається після завантаження DOM.
 */
function bootstrap(): void {
    const modalConfig: ModalConfig = {
        modalSelector: "#modal",
        openButtonSelector: "[data-open-modal]",
        closeSelectors: "[data-close-modal]",
    };

    const headerConfig: HeaderScrollConfig = {
        headerSelector: ".header",
        scrollThreshold: 20,
    };

    const postsConfig: PostsModuleConfig = {
        buttonSelector: "#load-posts",
        containerSelector: "#posts",
        apiUrl: "https://jsonplaceholder.typicode.com/posts?_limit=5",
    };

    initModal(modalConfig);
    initHeaderScroll(headerConfig);
    initPostsModule(postsConfig);
}

// Чекаємо на DOM, щоб всі елементи вже існували
document.addEventListener("DOMContentLoaded", (): void => {
    bootstrap();
});
