document.addEventListener("DOMContentLoaded", function () {
    const root = document.documentElement;
    const header = document.querySelector("[data-header]");

    // THEME
    const themeToggle = document.querySelector("[data-theme-toggle]");
    const applyThemeLabel = () => {
        if (!themeToggle) {
            return;
        }
        const isDark = root.getAttribute("data-theme") === "dark";
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    };
    themeToggle?.addEventListener("click", function () {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
            localStorage.setItem("theme", next);
        } catch (e) {
            // Storage can be blocked (private mode); the theme still applies for this page.
        }
        applyThemeLabel();
    });
    applyThemeLabel();

    // MOBILE MENU
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const setMenu = (open) => {
        if (!header || !menuToggle) {
            return;
        }
        header.classList.toggle("menu-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuToggle?.addEventListener("click", () => setMenu(!header.classList.contains("menu-open")));
    document.querySelectorAll("#site-nav a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenu(false);
        }
    });

    // HEADER STATE
    if (header) {
        const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });
    }

    // PRINT
    document.querySelectorAll("[data-print]").forEach((button) => button.addEventListener("click", () => window.print()));

    // FOOTER YEAR
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });
});
