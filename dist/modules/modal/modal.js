let isModalOpen = false;
let modalElement = null;
/**
 * Відкриває модальне вікно.
 */
function openModal() {
    if (!modalElement)
        return;
    isModalOpen = true;
    modalElement.classList.add("modal--visible");
    document.body.style.overflow = "hidden";
}
/**
 * Закриває модальне вікно.
 */
function closeModal() {
    if (!modalElement)
        return;
    isModalOpen = false;
    modalElement.classList.remove("modal--visible");
    document.body.style.overflow = "";
}
/**
 * Обробник клавіатури для закриття модалки по Escape.
 */
function handleKeydown(event) {
    if (event.key === "Escape" && isModalOpen) {
        closeModal();
    }
}
/**
 * Ініціалізація модального вікна:
 * - пошук елементів
 * - підписка на події
 */
export function initModal(config) {
    modalElement = document.querySelector(config.modalSelector);
    const openButton = document.querySelector(config.openButtonSelector);
    const closeElements = document.querySelectorAll(config.closeSelectors);
    if (!modalElement) {
        console.warn("Modal element not found by selector:", config.modalSelector);
        return;
    }
    if (openButton) {
        openButton.addEventListener("click", () => {
            openModal();
        });
    }
    closeElements.forEach((element) => {
        element.addEventListener("click", () => {
            closeModal();
        });
    });
    window.addEventListener("keydown", handleKeydown);
}
