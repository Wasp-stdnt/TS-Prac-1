/**
 * Додає/знімає клас на шапці при скролі після певного порогу.
 */
export function initHeaderScroll(config) {
    const headerElement = document.querySelector(config.headerSelector);
    if (!headerElement) {
        console.warn("Header element not found by selector:", config.headerSelector);
        return;
    }
    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;
        if (currentScroll > config.scrollThreshold) {
            headerElement.classList.add("header--scrolled");
        }
        else {
            headerElement.classList.remove("header--scrolled");
        }
    });
}
