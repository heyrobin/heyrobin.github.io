document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".filter");
    const toolButtons = document.querySelectorAll(".tool-filter");
    const cards = document.querySelectorAll(".project-card");
    const darkToggle = document.getElementById("darkToggle");
    const themeIcon = darkToggle ? darkToggle.querySelector(".theme-icon") : null;
    const contactTrigger = document.getElementById("contactTrigger");
    const contactDialog = document.getElementById("contactDialog");
    const contactDialogClose = document.getElementById("contactDialogClose");
    const transitionDurationMs = 300;

    const animatePageIn = () => {

        document.body.classList.remove("page-exit");
        const reveal = () => document.body.classList.add("page-ready");
        requestAnimationFrame(reveal);
        // rAF can be skipped in background tabs; never leave the page invisible.
        window.setTimeout(reveal, 60);
    };

    const isInternalNavigableLink = (link, event) => {
        if (!link || event.defaultPrevented) {
            return false;
        }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return false;
        }
        if (link.target && link.target !== "_self") {
            return false;
        }
        if (link.hasAttribute("download")) {
            return false;
        }

        const rawHref = link.getAttribute("href");
        if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
            return false;
        }

        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) {
            return false;
        }
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
            return false;
        }
        return true;
    };

    const getSavedTheme = () => {
        try {
            return localStorage.getItem("theme");
        } catch (e) {
            return null;
        }
    };

    const saveTheme = (value) => {
        try {
            localStorage.setItem("theme", value);
        } catch (e) {
            // Ignore storage errors (private mode / blocked storage).
        }
    };

    const updateThemeControl = () => {
        if (!darkToggle) {
            return;
        }

        const isDark = document.body.classList.contains("dark");
        darkToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        if (themeIcon) {
            themeIcon.src = isDark ? "icons/switch-darkmode.svg" : "icons/switch.svg";
        } else {
            darkToggle.textContent = isDark ? "Light" : "Dark";
        }
    };

    // FILTERING
    let activeCategory = "all";
    let activeTool = "all";

    const applyProjectFilters = () => {
        cards.forEach((card) => {
            const categoryMatch = activeCategory === "all" || card.classList.contains(activeCategory);
            const cardTools = (card.dataset.tools || "")
                .split(",")
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
            const toolMatch = activeTool === "all" || cardTools.includes(activeTool);

            card.style.display = categoryMatch && toolMatch ? "block" : "none";
        });
    };

    buttons.forEach((btn) => {
        btn.addEventListener("click", function () {
            buttons.forEach((b) => b.classList.remove("active"));
            this.classList.add("active");
            activeCategory = this.dataset.filter || "all";
            applyProjectFilters();
        });
    });

    toolButtons.forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.classList.contains("active") ? "true" : "false");
        btn.addEventListener("click", function () {
            const selectedTool = (this.dataset.tool || "all").toLowerCase();
            const wasActive = this.classList.contains("active");

            toolButtons.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-pressed", "false");
            });

            if (wasActive) {
                activeTool = "all";
            } else {
                this.classList.add("active");
                this.setAttribute("aria-pressed", "true");
                activeTool = selectedTool;
            }
            applyProjectFilters();
        });
    });

    // DARK MODE
    if (darkToggle) {
        darkToggle.addEventListener("click", function () {
            document.body.classList.toggle("dark");

            if (document.body.classList.contains("dark")) {
                saveTheme("dark");
            } else {
                saveTheme("light");
            }
            updateThemeControl();
        });
    }

    // LOAD SAVED THEME
    if (getSavedTheme() === "dark") {
        document.body.classList.add("dark");
    }
    updateThemeControl();

    // CONTACT OPTIONS
    if (contactTrigger && contactDialog) {
        contactTrigger.addEventListener("click", function () {
            contactDialog.showModal();
        });
        contactDialogClose?.addEventListener("click", function () {
            contactDialog.close();
        });
        contactDialog.addEventListener("click", function (event) {
            if (event.target === contactDialog) {
                contactDialog.close();
            }
        });
    }

    // FOOTER YEAR
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // PAGE TRANSITIONS
    animatePageIn();

    document.addEventListener("click", function (event) {
        const link = event.target.closest("a");
        if (!isInternalNavigableLink(link, event)) {
            return;
        }

        event.preventDefault();
        document.body.classList.remove("page-ready");
        document.body.classList.add("page-exit");

        const destination = link.href;
        window.setTimeout(function () {
            window.location.href = destination;
        }, transitionDurationMs);
    });

    window.addEventListener("pageshow", function () {
        animatePageIn();
    });
});
