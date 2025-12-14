import { ModalConfig } from "../../types/appTypes.js";

let isModalOpen: boolean = false;
let modalElement: HTMLDivElement | null = null;

/**
 * Відкриває модальне вікно.
 */
function openModal(): void {
    if (!modalElement) return;
    isModalOpen = true;
    modalElement.classList.add("modal--visible");
    document.body.style.overflow = "hidden";
}

/**
 * Закриває модальне вікно.
 */
function closeModal(): void {
    if (!modalElement) return;
    isModalOpen = false;
    modalElement.classList.remove("modal--visible");
    document.body.style.overflow = "";
}

/**
 * Обробник клавіатури для закриття модалки по Escape.
 */
function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && isModalOpen) {
        closeModal();
    }
}

/**
 * Ініціалізація модального вікна:
 * - пошук елементів
 * - підписка на події
 */
export function initModal(config: ModalConfig): void {
    modalElement = document.querySelector(
        config.modalSelector
    ) as HTMLDivElement | null;

    const openButton: HTMLButtonElement | null = document.querySelector(
        config.openButtonSelector
    );

    const closeElements: NodeListOf<HTMLElement> =
        document.querySelectorAll(config.closeSelectors);

    if (!modalElement) {
        console.warn("Modal element not found by selector:", config.modalSelector);
        return;
    }

    if (openButton) {
        openButton.addEventListener("click", (): void => {
            openModal();
        });
    }

    closeElements.forEach((element: HTMLElement): void => {
        element.addEventListener("click", (): void => {
            closeModal();
        });
    });

    window.addEventListener("keydown", handleKeydown);
}
