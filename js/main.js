const currentYear = document.querySelector("[data-current-year]");
const menuToggle = document.querySelector(".nav-toggle");
const siteNavigation = document.querySelector("#site-navigation");
const menuIcon = menuToggle?.querySelector(".material-symbols-outlined");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

document.querySelectorAll("[data-page-back]").forEach((pageBack) => {
  pageBack.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!document.referrer || window.history.length < 2) return;

    try {
      const previousPage = new URL(document.referrer);
      if (previousPage.origin === window.location.origin && previousPage.href !== window.location.href) {
        event.preventDefault();
        window.history.back();
      }
    } catch {
      // Keep the link's fallback destination if the referrer cannot be read.
    }
  });
});

if (menuToggle && siteNavigation && menuIcon) {
  const setMenuOpen = (isOpen, restoreFocus = false) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
    siteNavigation.setAttribute("aria-hidden", String(!isOpen));
    siteNavigation.inert = !isOpen;
    siteNavigation.classList.toggle("is-open", isOpen);
    menuIcon.textContent = isOpen ? "close" : "menu";

    if (isOpen) {
      siteNavigation.querySelector("a")?.focus();
    } else if (restoreFocus) {
      menuToggle.focus();
    }
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  siteNavigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    if (isOpen && event.target instanceof Node && !siteNavigation.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    if (event.key === "Escape" && isOpen) {
      setMenuOpen(false, true);
    }
  });
}

