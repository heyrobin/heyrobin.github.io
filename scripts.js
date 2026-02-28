document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".filter");
    const toolButtons = document.querySelectorAll(".tool-filter");
    const cards = document.querySelectorAll(".project-card");
    const darkToggle = document.getElementById("darkToggle");
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const isMobile = () => window.matchMedia("(max-width: 920px)").matches;
    const transitionDurationMs = 320;

    const animatePageIn = () => {
        document.body.classList.remove("page-exit");
        requestAnimationFrame(() => {
            document.body.classList.add("page-ready");
        });
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
                darkToggle.textContent = "\u2600\uFE0F";
                saveTheme("dark");
            } else {
                darkToggle.textContent = "\uD83C\uDF19";
                saveTheme("light");
            }
        });
    }

    // LOAD SAVED THEME
    if (getSavedTheme() === "dark") {
        document.body.classList.add("dark");
        if (darkToggle) {
            darkToggle.textContent = "\u2600\uFE0F";
        }
    }

    // MOBILE MENU
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function () {
            sidebar.classList.toggle("active");
        });

        document.addEventListener("click", function (event) {
            if (!isMobile() || !sidebar.classList.contains("active")) {
                return;
            }
            if (!sidebar.contains(event.target) && event.target !== menuToggle) {
                sidebar.classList.remove("active");
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                sidebar.classList.remove("active");
            }
        });

        window.addEventListener("resize", function () {
            if (!isMobile()) {
                sidebar.classList.remove("active");
            }
        });
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
