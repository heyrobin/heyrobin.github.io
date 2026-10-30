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

    // INSTAGRAM SIDEBAR
    // Reads posts from data-feed: a Behold.so feed, Instagram Graph API JSON, or a plain list.
    // Captions are inserted as text and only instagram.com links are used.
    const igBox = document.querySelector("[data-instagram]");
    if (igBox && igBox.dataset.feed) {
        const list = igBox.querySelector("[data-ig-list]");
        const empty = igBox.querySelector("[data-ig-empty]");
        const toPosts = (data) => {
            const raw = Array.isArray(data) ? data : data.posts || data.data || [];
            return raw.map((post) => ({
                caption: (post.prunedCaption || post.caption || "").trim(),
                url: post.permalink || post.url || "",
                time: post.timestamp || post.date || "",
            }));
        };
        const isInstagramUrl = (url) => {
            try {
                const host = new URL(url).hostname;
                return host === "instagram.com" || host.endsWith(".instagram.com");
            } catch (e) {
                return false;
            }
        };
        const shorten = (text, max) => {
            const firstLine = text.split("\n").find((line) => line.trim()) || "";
            return firstLine.length > max ? firstLine.slice(0, max - 1).trimEnd() + "\u2026" : firstLine;
        };
        fetch(igBox.dataset.feed, { cache: "no-cache" })
            .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
            .then((data) => {
                const posts = toPosts(data).filter((post) => post.caption && isInstagramUrl(post.url)).slice(0, 4);
                if (!posts.length) {
                    return;
                }
                posts.forEach((post) => {
                    const item = document.createElement("li");
                    const link = document.createElement("a");
                    link.href = post.url;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = shorten(post.caption, 120);
                    item.appendChild(link);
                    list.appendChild(item);
                });
                list.hidden = false;
                if (empty) {
                    empty.hidden = true;
                }
            })
            .catch(() => {
                // No feed yet or it failed: keep the "Follow" card.
            });
    }

    // TESTIMONIALS MARQUEE
    // Repeats the cards until one set is wider than the screen, then doubles that set so the
    // row loops seamlessly at -50%; hover or focus pauses it.
    // With reduced motion the row stays still and scrolls sideways instead.
    const marquee = document.querySelector("[data-marquee]");
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (marquee && !reduceMotion) {
        const track = marquee.querySelector("[data-marquee-track]");
        const cards = Array.from(track.children);
        const addCopy = (card) => {
            const clone = card.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            clone.querySelectorAll("a").forEach((link) => link.setAttribute("tabindex", "-1"));
            track.appendChild(clone);
        };
        let guard = 0;
        while (track.scrollWidth < marquee.clientWidth + 40 && guard++ < 10) {
            cards.forEach(addCopy);
        }
        Array.from(track.children).forEach(addCopy);
        // Keep the speed steady (about 40px per second) however many cards there are.
        marquee.style.setProperty("--marquee-duration", Math.max(20, track.scrollWidth / 2 / 40) + "s");
        marquee.classList.add("is-running");
    }

    // PRINT
    document.querySelectorAll("[data-print]").forEach((button) => button.addEventListener("click", () => window.print()));

    // FOOTER YEAR
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });
});
