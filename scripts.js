document.addEventListener("DOMContentLoaded", function () {
    const root = document.documentElement;
    const header = document.querySelector("[data-header]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    // SCROLL REVEAL
    // Measured on scroll instead of relying on IntersectionObserver alone, which can fire late in
    // embedded or throttled views and leave sections blank.
    const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
    if (prefersReducedMotion) {
        revealItems.forEach((el) => el.classList.add("is-visible", "reveal-done"));
    } else {
        let pending = revealItems;
        const revealInView = () => {
            const triggerLine = window.innerHeight * 1.1;
            pending = pending.filter((el) => {
                if (el.getBoundingClientRect().top > triggerLine) {
                    return true;
                }
                el.classList.add("is-visible");
                // Safety net: end fully visible even if the animation is throttled.
                window.setTimeout(() => el.classList.add("reveal-done"), 1300);
                return false;
            });
            if (!pending.length) {
                window.removeEventListener("scroll", revealInView);
                window.removeEventListener("resize", revealInView);
            }
        };
        revealInView();
        window.addEventListener("scroll", revealInView, { passive: true });
        window.addEventListener("resize", revealInView);
    }
    window.setTimeout(() => root.classList.add("motion-settled"), 2400);

    // COUNT-UP
    const countItems = document.querySelectorAll("[data-count]");
    if (!prefersReducedMotion && "IntersectionObserver" in window && countItems.length) {
        const countUp = (el) => {
            const target = Number(el.dataset.count);
            const start = performance.now();
            const durationMs = 1200;
            const step = (now) => {
                const t = Math.min((now - start) / durationMs, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = target;
                }
            };
            requestAnimationFrame(step);
        };
        const countObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        countItems.forEach((el) => countObserver.observe(el));
    }

    // TABLE OF CONTENTS
    const tocLinks = Array.from(document.querySelectorAll(".toc a"));
    if (tocLinks.length) {
        const sections = tocLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
        const updateToc = () => {
            const line = window.innerHeight * 0.35;
            let active = sections[0];
            sections.forEach((section) => {
                if (section.getBoundingClientRect().top <= line) {
                    active = section;
                }
            });
            tocLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === "#" + active.id));
        };
        updateToc();
        window.addEventListener("scroll", updateToc, { passive: true });
    }

    // TOAST + COPY EMAIL
    const toast = document.querySelector("[data-toast]");
    let toastTimer;
    const showToast = (message) => {
        if (!toast) {
            return;
        }
        toast.textContent = message;
        toast.classList.add("is-shown");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("is-shown"), 2200);
    };
    document.querySelectorAll("[data-copy]").forEach((button) => {
        button.addEventListener("click", async function () {
            const value = this.dataset.copy;
            try {
                await navigator.clipboard.writeText(value);
                showToast("Email copied: " + value);
            } catch (e) {
                showToast(value);
            }
        });
    });

    // PRINT
    document.querySelectorAll("[data-print]").forEach((button) => button.addEventListener("click", () => window.print()));

    // FOOTER YEAR
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });
});
