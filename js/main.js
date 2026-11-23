const currentYear = document.querySelector("[data-current-year]");
const menuToggle = document.querySelector(".nav-toggle");
const siteNavigation = document.querySelector("#site-navigation");
const menuIcon = menuToggle?.querySelector(".material-symbols-outlined");

try {
  if (sessionStorage.getItem("solusidolan-list-arrival") === "1") {
    sessionStorage.removeItem("solusidolan-list-arrival");
    document.body.classList.add("is-arriving");
    window.setTimeout(() => document.body.classList.remove("is-arriving"), 1100);
  }
} catch {
  // Navigasi tetap berjalan jika session storage tidak tersedia.
}

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const siteConfig = window.SITE_CONFIG || {};
const whatsappNumber = (siteConfig.waNumber || "").replace(/\D/g, "");

if (whatsappNumber) {
  document.querySelectorAll('a[href="https://wa.me/"]').forEach((link) => {
    link.href = `https://wa.me/${whatsappNumber}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
}

document.querySelectorAll("[data-social-link]").forEach((link) => {
  const platform = link.dataset.socialLink;
  const url = siteConfig.socialLinks?.[platform];
  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.title = `Tautan ${platform} belum diatur`;
  }
});

const footerWhatsApp = document.querySelector("[data-footer-whatsapp]");
if (footerWhatsApp) {
  const label = footerWhatsApp.querySelector("[data-footer-whatsapp-label]");
  if (whatsappNumber) {
    footerWhatsApp.href = `https://wa.me/${whatsappNumber}`;
    footerWhatsApp.target = "_blank";
    footerWhatsApp.rel = "noopener noreferrer";
    if (label) label.textContent = `+${whatsappNumber}`;
  } else {
    footerWhatsApp.removeAttribute("href");
    footerWhatsApp.setAttribute("aria-disabled", "true");
    if (label) label.textContent = "Nomor WhatsApp belum diatur";
  }
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

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href="penginapan.html"]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;

  const destination = new URL(link.href, window.location.href);
  if (destination.pathname === window.location.pathname) return;
  try {
    sessionStorage.setItem("solusidolan-list-arrival", "1");
  } catch {
    // Navigasi tetap berjalan tanpa animasi kedatangan khusus.
  }
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
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest("a");
    if (!link) return;
    setMenuOpen(false);
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

