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

    const publishedStays = stays.filter((stay) => !stay.isDraft);
    publishedStays.slice(0, 3).forEach((stay, index, homeStays) => {
      const card = document.createElement("article");
      card.className = "stay-feature";
      card.setAttribute("role", "group");
      card.setAttribute("aria-roledescription", "slide");
      card.setAttribute("aria-label", `${index + 1} dari ${homeStays.length}: ${stay.property}`);

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
  const stay = stays.find((item) => item.slug === slug && !item.isDraft);
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
    ? `Harga per malam: Mulai Rp${new Intl.NumberFormat("id-ID").format(stay.priceFrom)}`
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

  const photos = Array.isArray(stay.images) ? stay.images.filter((photo) => photo?.src) : [];
  const gallery = detail.querySelector("[data-accommodation-gallery]");
  const galleryDialog = document.querySelector("[data-gallery-dialog]");
  const mainImage = detail.querySelector("[data-property-image]");
  if (mainImage) mainImage.style.viewTransitionName = `stay-${stay.slug}`;
  const fullImage = galleryDialog?.querySelector("[data-gallery-full-image]");
  const galleryCaption = detail.querySelector("[data-gallery-caption]");
  const galleryCount = detail.querySelector("[data-gallery-count]");
  const fullCaption = galleryDialog?.querySelector("[data-gallery-full-caption]");
  const fullCount = galleryDialog?.querySelector("[data-gallery-full-count]");
  let photoIndex = 0;
  const animatePhoto = (image, direction) => {
    if (!image || !direction || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    image.getAnimations().forEach((animation) => animation.cancel());
    image.animate(
      [
        { opacity: 0.55, transform: `translateX(${direction * 18}px) scale(0.99)` },
        { opacity: 1, transform: "translateX(0) scale(1)" }
      ],
      { duration: 320, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" }
    );
  };
  const showPhoto = (index, direction = 0) => {
    if (!photos.length) return;
    photoIndex = (index + photos.length) % photos.length;
    const photo = photos[photoIndex];
    const alt = photo.alt || `Foto ${stay.property}`;
    if (mainImage) {
      mainImage.src = photo.src;
      mainImage.alt = alt;
      animatePhoto(mainImage, direction);
    }
    if (fullImage) {
      fullImage.src = photo.src;
      fullImage.alt = alt;
      animatePhoto(fullImage, direction);
    }
    if (galleryCaption) galleryCaption.textContent = alt;
    if (fullCaption) fullCaption.textContent = alt;
    if (galleryCount) galleryCount.textContent = `${photoIndex + 1} / ${photos.length}`;
    if (fullCount) fullCount.textContent = `${stay.property} · ${photoIndex + 1} / ${photos.length}`;
    gallery?.querySelectorAll("[data-gallery-previous], [data-gallery-next]").forEach((button) => {
      button.hidden = photos.length < 2;
    });
    galleryDialog?.querySelectorAll("[data-gallery-full-previous], [data-gallery-full-next]").forEach((button) => {
      button.hidden = photos.length < 2;
    });
  };
  const previousPhoto = () => showPhoto(photoIndex - 1, -1);
  const nextPhoto = () => showPhoto(photoIndex + 1, 1);
  const openGallery = detail.querySelector("[data-gallery-open]");
  const closeGallery = galleryDialog?.querySelector("[data-gallery-close]");
  detail.querySelector("[data-gallery-previous]")?.addEventListener("click", previousPhoto);
  detail.querySelector("[data-gallery-next]")?.addEventListener("click", nextPhoto);
  galleryDialog?.querySelector("[data-gallery-full-previous]")?.addEventListener("click", previousPhoto);
  galleryDialog?.querySelector("[data-gallery-full-next]")?.addEventListener("click", nextPhoto);
  openGallery?.addEventListener("click", () => {
    if (!galleryDialog?.showModal) return;
    showPhoto(photoIndex);
    galleryDialog.showModal();
    closeGallery?.focus();
  });
  closeGallery?.addEventListener("click", () => galleryDialog.close());
  galleryDialog?.addEventListener("click", (event) => {
    if (event.target === galleryDialog) galleryDialog.close();
  });
  galleryDialog?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") previousPhoto();
    if (event.key === "ArrowRight") nextPhoto();
  });
  const addSwipe = (node) => {
    let startX = null;
    node?.addEventListener("pointerdown", (event) => { startX = event.clientX; });
    node?.addEventListener("pointerup", (event) => {
      if (startX === null) return;
      const deltaX = event.clientX - startX;
      startX = null;
      if (Math.abs(deltaX) > 45) (deltaX < 0 ? nextPhoto : previousPhoto)();
    });
    node?.addEventListener("pointercancel", () => { startX = null; });
  };
  addSwipe(detail.querySelector("[data-gallery-viewport]"));
  addSwipe(galleryDialog?.querySelector("[data-gallery-full-viewport]"));
  showPhoto(0);

  const mapLink = detail.querySelector("[data-property-map]");
  if (mapLink) {
    const mapQuery = [stay.property, stay.area].filter(Boolean).join(", ");
    mapLink.href = stay.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  }

  const waLink = detail.querySelector("[data-property-whatsapp]");
  if (waLink) {
    const message = `Halo, saya ingin booking ${stay.property} untuk tanggal [isi tanggal check-in] sampai [isi tanggal check-out]. Apakah kamar masih tersedia?`;
    const number = (window.SITE_CONFIG?.waNumber || "").replace(/\D/g, "");
    waLink.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  document.title = `${stay.property} | SolusiDolan.id`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", stay.description || `Detail penginapan ${stay.property}.`);
})();
