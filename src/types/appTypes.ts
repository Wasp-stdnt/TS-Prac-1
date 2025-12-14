// Тип даних, які приходять з API JSONPlaceholder
export type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
};

// Конфіг для модуля модального вікна
export type ModalConfig = {
    modalSelector: string;
    openButtonSelector: string;
    closeSelectors: string; // CSS-селектори для елементів, по кліку на які модалка закривається
};

// Конфіг для модуля шапки при скролі
export type HeaderScrollConfig = {
    headerSelector: string;
    scrollThreshold: number;
};

// Конфіг для модуля з постами
export type PostsModuleConfig = {
    buttonSelector: string;
    containerSelector: string;
    apiUrl: string;
};
