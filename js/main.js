const currentYear = document.querySelector("[data-current-year]");
const menuToggle = document.querySelector(".nav-toggle");
const siteNavigation = document.querySelector("#site-navigation");
const menuIcon = menuToggle?.querySelector(".material-symbols-outlined");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

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

