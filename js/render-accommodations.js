(function () {
  const stays = window.ACCOMMODATIONS || [];
  const track = document.querySelector("[data-stay-track]");

  if (track) {
    const slider = document.querySelector("[data-stay-slider]");
    const controls = document.querySelector("[data-stay-controls]");
    const dots = document.querySelector("[data-stay-dots]");
    const counter = document.querySelector("[data-stay-counter]");
    const previous = document.querySelector("[data-stay-previous]");
    const next = document.querySelector("[data-stay-next]");
    let pointerStartX = null;
    let suppressClick = false;

    stays.forEach((stay, index) => {
      const card = document.createElement("article");
      card.className = "stay-feature";
      card.setAttribute("role", "group");
      card.setAttribute("aria-roledescription", "slide");
      card.setAttribute("aria-label", `${index + 1} dari ${stays.length}: ${stay.property}`);

      const imageFrame = document.createElement("div");
      imageFrame.className = "stay-feature__image";
      if (stay.images?.[0]?.src) {
        const image = document.createElement("img");
        image.src = stay.images[0].src;
        image.alt = stay.images[0].alt || `Foto ${stay.property}`;
        image.width = 1200;
        image.height = 750;
        image.loading = index === 0 ? "eager" : "lazy";
        image.decoding = "async";
        imageFrame.append(image);
      } else {
        imageFrame.classList.add("stay-feature__image--empty");
        imageFrame.textContent = "Foto penginapan belum tersedia";
      }

      const copy = document.createElement("div");
      copy.className = "stay-feature__copy";

      const title = document.createElement("h3");
      title.textContent = stay.property;
      const location = document.createElement("p");
      location.className = "stay-feature__location";
      location.textContent = stay.area || "Lokasi belum tersedia";
      const actions = document.createElement("div");
      actions.className = "stay-feature__actions";
      const price = document.createElement("span");
      price.className = "stay-feature__price";
      price.textContent = stay.priceLabel || "Tanya harga melalui WhatsApp";
      const detailsLink = document.createElement("a");
      detailsLink.className = "button button--primary stay-feature__more";
      detailsLink.href = `accommodation.html?slug=${encodeURIComponent(stay.slug)}`;
      detailsLink.setAttribute("aria-label", `Lihat selengkapnya: ${stay.property}`);
      detailsLink.textContent = "Lihat selengkapnya";
      actions.append(price, detailsLink);
      copy.append(title, location, actions);
      card.append(imageFrame, copy);
      track.append(card);
    });

    const slides = [...track.children];
    let activeIndex = 0;
    const showSlide = (index) => {
      if (!slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = `translate3d(${-activeIndex * (slider?.clientWidth || 0)}px, 0, 0)`;
      slides.forEach((slide, slideIndex) => {
        const inactive = slideIndex !== activeIndex;
        slide.setAttribute("aria-hidden", String(inactive));
        slide.inert = inactive;
      });
      if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      if (previous) previous.disabled = slides.length < 2;
      if (next) next.disabled = slides.length < 2;
      dots?.querySelectorAll("button").forEach((dot, dotIndex) => dot.setAttribute("aria-current", String(dotIndex === activeIndex)));
    };

    if (controls) controls.hidden = slides.length < 2;
    if (dots) {
      dots.hidden = slides.length < 2;
      slides.forEach((slide, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "stay-slider-dots__dot";
        dot.setAttribute("aria-label", `Tampilkan ${slide.querySelector("h3")?.textContent || `penginapan ${index + 1}`}`);
        dot.addEventListener("click", () => showSlide(index));
        dots.append(dot);
      });
    }
    previous?.addEventListener("click", () => showSlide(activeIndex - 1));
    next?.addEventListener("click", () => showSlide(activeIndex + 1));
    window.addEventListener("resize", () => showSlide(activeIndex));
    slider?.addEventListener("pointerdown", (event) => { pointerStartX = event.clientX; });
    slider?.addEventListener("pointerup", (event) => {
      if (pointerStartX === null) return;
      const delta = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(delta) > 50 && slides.length > 1) {
        suppressClick = true;
        showSlide(activeIndex + (delta < 0 ? 1 : -1));
      }
    });
    slider?.addEventListener("pointercancel", () => { pointerStartX = null; });
    slider?.addEventListener("click", (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      suppressClick = false;
    });
    slider?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showSlide(activeIndex - 1);
      if (event.key === "ArrowRight") showSlide(activeIndex + 1);
    });
    showSlide(0);
  }

  const detail = document.querySelector("[data-accommodation-detail]");
  if (!detail) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const stay = stays.find((item) => item.slug === slug);
  const notFound = document.querySelector("[data-accommodation-not-found]");
  if (!stay) {
    if (notFound) notFound.hidden = false;
    return;
  }

  detail.hidden = false;
  const setText = (selector, value) => {
    const node = detail.querySelector(selector);
    if (node) node.textContent = value || "";
  };
  setText("[data-property-name]", stay.property);
  setText("[data-property-area]", stay.area || stay.property);
  setText("[data-property-room-summary]", stay.roomSummary);
  setText("[data-property-description]", stay.description);
  setText("[data-property-check-in]", stay.checkIn || "Belum tersedia");
  setText("[data-property-check-out]", stay.checkOut || "Belum tersedia");
  const formattedPrice = Number.isFinite(stay.priceFrom)
    ? `Harga per malam: Rp${new Intl.NumberFormat("id-ID").format(stay.priceFrom)}`
    : "Harga per malam belum tersedia";
  setText("[data-property-price]", formattedPrice);

  const amenitiesList = detail.querySelector("[data-property-amenities]");
  if (amenitiesList) {
    const amenities = Array.isArray(stay.amenities) ? stay.amenities : [];
    (amenities.length ? amenities : ["Informasi fasilitas belum tersedia."]).forEach((amenity) => {
      const item = document.createElement("li");
      item.textContent = amenity;
      amenitiesList.append(item);
    });
  }

  const image = detail.querySelector("[data-property-image]");
  if (image && stay.images?.[0]) {
    image.src = stay.images[0].src;
    image.alt = stay.images[0].alt || `Foto ${stay.property}`;
  }

  const mapLink = detail.querySelector("[data-property-map]");
  if (mapLink) {
    const mapQuery = [stay.property, stay.area].filter(Boolean).join(", ");
    mapLink.href = stay.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  }

  const waLink = detail.querySelector("[data-property-whatsapp]");
  if (waLink) {
    const message = `Halo, saya tertarik dengan ${stay.property}. Mohon informasi ketersediaan kamar dan harga. Kode promo: ${stay.promoCode || "-"}.`;
    const number = (window.SITE_CONFIG?.waNumber || "").replace(/\D/g, "");
    waLink.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  document.title = `${stay.property} | SolusiDolan.id`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", stay.description || `Detail penginapan ${stay.property}.`);
})();
