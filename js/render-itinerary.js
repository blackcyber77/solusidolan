(function () {
  const content = document.querySelector("#itinerary-content");
  const notFound = document.querySelector("#not-found");
  const itineraries = Array.isArray(window.ITINERARIES) ? window.ITINERARIES : [];
  const slug = new URLSearchParams(window.location.search).get("slug");
  const itinerary = itineraries.find((item) => item.slug === slug);

  if (!content || !notFound) {
    return;
  }

  if (!itinerary) {
    notFound.hidden = false;
    return;
  }

  const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  };

  const formatMoney = (amount) => Number(amount) === 0
    ? "Gratis"
    : `Rp${new Intl.NumberFormat("id-ID").format(Number(amount))}`;

  const hasAmount = (amount) => amount !== null
    && amount !== undefined
    && amount !== ""
    && Number.isFinite(Number(amount));

  const sumCosts = (costs, useWeekend = false) => costs.reduce((total, cost) => {
    const value = useWeekend && hasAmount(cost.weekendAmount) ? cost.weekendAmount : cost.amount;
    return total + Number(value);
  }, 0);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return [hours ? `${hours} jam` : "", remainder ? `${remainder} menit` : ""]
      .filter(Boolean)
      .join(" ") || "0 menit";
  };

  const formatTimeRange = (start, duration) => {
    const [startHour, startMinute] = String(start || "").split(":").map(Number);
    if (!Number.isInteger(startHour) || !Number.isInteger(startMinute)) {
      return start || "Waktu belum tersedia";
    }

    const finish = (startHour * 60 + startMinute + Number(duration || 0)) % (24 * 60);
    const endHour = Math.floor(finish / 60);
    const endMinute = finish % 60;
    return `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")} – ${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
  };

  const buildLocationUrl = (place) => {
    if (!place) {
      return "";
    }

    const query = place.placeId || (Number.isFinite(place.lat) && Number.isFinite(place.lng)
      ? `${place.lat},${place.lng}`
      : "");
    if (!query) {
      return "";
    }

    const url = new URL("https://www.google.com/maps/search/");
    url.searchParams.set("api", "1");
    url.searchParams.set("query", query);
    if (place.placeId) {
      url.searchParams.set("query_place_id", place.placeId);
    }
    return url.href;
  };

  const lightbox = document.querySelector("#photo-lightbox");
  const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
  const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
  const lightboxCounter = lightbox.querySelector("[data-lightbox-counter]");
  const lightboxPrevious = lightbox.querySelector("[data-lightbox-previous]");
  const lightboxNext = lightbox.querySelector("[data-lightbox-next]");
  let lightboxPhotos = [];
  let lightboxIndex = 0;
  let lightboxTrigger = null;

  const updateLightbox = () => {
    const photo = lightboxPhotos[lightboxIndex];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt || "Foto itinerary";
    lightboxCaption.textContent = photo.credit ? `Foto: ${photo.credit}` : (photo.alt || "Foto itinerary");
    lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
    lightboxPrevious.hidden = lightboxPhotos.length < 2;
    lightboxNext.hidden = lightboxPhotos.length < 2;
  };

  const openLightbox = (photos, index, trigger) => {
    lightboxPhotos = photos;
    lightboxIndex = index;
    lightboxTrigger = trigger;
    updateLightbox();
    lightbox.showModal();
  };

  const moveLightbox = (direction) => {
    if (lightboxPhotos.length < 2) {
      return;
    }
    lightboxIndex = (lightboxIndex + direction + lightboxPhotos.length) % lightboxPhotos.length;
    updateLightbox();
  };

  const renderPhotoCredit = (photo) => {
    const credit = createElement("figcaption", "stop-photo__credit");
    if (!photo.credit) {
      credit.textContent = "Kredit foto belum tersedia";
      return credit;
    }

    credit.append(createElement("span", "", `Foto: ${photo.credit}`));
    if (photo.sourceUrl) {
      const source = createElement("a", "", "Sumber");
      source.href = photo.sourceUrl;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      credit.append(" ", source);
    }
    return credit;
  };

  const renderPhotos = (stop) => {
    const gallery = createElement("div", "stop-photos");
    const photos = Array.isArray(stop.photos) ? stop.photos.slice(0, 3) : [];

    if (!photos.length) {
      const placeholder = createElement("div", "stop-photos__empty");
      placeholder.append(createElement("span", "material-symbols-outlined", "image"));
      placeholder.append(createElement("span", "", `Foto ${stop.name} belum tersedia`));
      gallery.append(placeholder);
      return gallery;
    }

    photos.forEach((photo, index) => {
      const figure = createElement("figure", "stop-photo");
      const trigger = createElement("button", "stop-photo__button");
      trigger.type = "button";
      trigger.setAttribute("aria-label", `Buka foto ${index + 1}: ${photo.alt || stop.name}`);

      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.alt || stop.name;
      image.width = 600;
      image.height = 450;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => {
        figure.classList.add("is-failed");
        trigger.replaceChildren(createElement("span", "", stop.name));
      }, { once: true });
      trigger.append(image);
      trigger.addEventListener("click", () => openLightbox(photos, index, trigger));
      figure.append(trigger, renderPhotoCredit(photo));
      gallery.append(figure);
    });

    return gallery;
  };

  const renderCosts = (costs) => {
    const section = createElement("section", "stop-costs");
    section.append(createElement("h4", "", "Biaya"));

    if (!Array.isArray(costs) || costs.length === 0) {
      section.append(createElement("p", "stop-costs__empty", "Biaya belum tersedia."));
      return section;
    }

    const list = createElement("ul", "stop-costs__list");
    costs.forEach((cost) => {
      const item = createElement("li", "stop-costs__item");
      const label = createElement("span", "", cost.label);
      const amount = createElement("strong", "", `${formatMoney(cost.amount)}${cost.perPerson ? " /orang" : " /kendaraan"}`);
      item.append(label, amount);

      if (cost.weekendAmount !== null && cost.weekendAmount !== undefined) {
        item.append(createElement("span", "stop-costs__note", `Akhir pekan: ${formatMoney(cost.weekendAmount)}`));
      }
      if (cost.note) {
        item.append(createElement("span", "stop-costs__note", cost.note));
      }
      list.append(item);
    });
    section.append(list);
    return section;
  };

  const renderStop = (stop, index) => {
    const row = createElement("div", "timeline-stop");
    const time = createElement("div", "timeline-stop__time", formatTimeRange(stop.start, stop.duration));
    const card = createElement("article", "timeline-stop__card");
    const heading = createElement("div", "timeline-stop__heading");
    heading.append(
      createElement("span", "timeline-stop__number", String(index + 1).padStart(2, "0")),
      createElement("h3", "", stop.name)
    );

    const chips = createElement("div", "timeline-stop__chips");
    chips.append(createElement("span", "", formatDuration(Number(stop.duration) || 0)));
    card.append(heading, chips);
    if (stop.desc) {
      card.append(createElement("p", "timeline-stop__description", stop.desc));
    }

    if (stop.tip) {
      const tip = createElement("aside", "timeline-stop__tip");
      tip.append(createElement("strong", "", "Catatan"), createElement("p", "", stop.tip));
      card.append(tip);
    }

    if (Array.isArray(stop.photos) && stop.photos.length) {
      card.append(renderPhotos(stop));
    }

    const locationUrl = buildLocationUrl(stop.place);
    if (locationUrl) {
      const locationLink = createElement("a", "timeline-stop__map-link", "Lihat lokasi di Google Maps ↗");
      locationLink.href = locationUrl;
      locationLink.target = "_blank";
      locationLink.rel = "noopener noreferrer";
      card.append(locationLink);
    }

    row.append(time, card);
    return row;
  };

  const renderRouteIllustration = (day, startingStay) => {
    const section = createElement("section", "route-sketch");
    section.append(createElement("h3", "route-sketch__title", "Rute perjalanan"));
    const route = createElement("ol", "route-sketch__list");
    const dayStops = Array.isArray(day.stops) ? day.stops : [];

    if (startingStay) {
      const node = createElement("li", "route-sketch__node route-sketch__node--stay");
      node.append(
        createElement("span", "route-sketch__number", "00"),
        createElement("span", "route-sketch__name", startingStay.property)
      );
      route.append(node);
      if (dayStops.length) {
        const leg = createElement("li", "route-sketch__leg");
        leg.setAttribute("aria-label", `Berangkat dari penginapan ${startingStay.property}`);
        leg.append(createElement("span", "route-sketch__line", "↓"));
        leg.append(createElement("span", "route-sketch__travel", "Mulai dari penginapan"));
        route.append(leg);
      }
    }

    dayStops.forEach((stop, index) => {
      const node = createElement("li", "route-sketch__node");
      node.append(
        createElement("span", "route-sketch__number", String(index + 1).padStart(2, "0")),
        createElement("span", "route-sketch__name", stop.name)
      );
      route.append(node);

      if (stop.travelNext && index < dayStops.length - 1) {
        const travel = stop.travelNext;
        const facts = [travel.mode, `± ${travel.minutes} menit`];
        if (Number.isFinite(Number(travel.km))) facts.push(`${travel.km} km`);
        const leg = createElement("li", "route-sketch__leg");
        leg.setAttribute("aria-label", `Perjalanan: ${facts.join(", ")}`);
        leg.append(createElement("span", "route-sketch__line", "↓"));
        leg.append(createElement("span", "route-sketch__travel", facts.join(" · ")));
        route.append(leg);
      }
    });

    section.append(route);
    return section;
  };

  const renderTravelBreak = (travel) => {
    const card = createElement("aside", "travel-break");
    card.append(createElement("span", "material-symbols-outlined", "near_me"));
    const details = createElement("div", "travel-break__details");
    details.append(createElement("strong", "", "Perjalanan berikutnya"));
    const facts = [travel.mode, `± ${travel.minutes} menit`];
    if (Number.isFinite(Number(travel.km))) {
      facts.push(`${travel.km} km`);
    }
    if (hasAmount(travel.cost)) {
      facts.push(formatMoney(travel.cost));
    }
    details.append(createElement("p", "", facts.join(" · ")));
    card.append(details);
    return card;
  };

  const toast = document.querySelector("[data-site-toast]");
  let toastTimer = 0;

  const showToast = (message) => {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  };

  const copyText = async (value) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // Lanjutkan ke fallback clipboard untuk konteks non-secure.
    }

    const textarea = createElement("textarea", "clipboard-fallback", value);
    textarea.setAttribute("readonly", "");
    document.body.append(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    textarea.remove();
    return copied;
  };

  const renderRoomGallery = (room, roomIndex) => {
    const gallery = createElement("div", "room-gallery");
    gallery.setAttribute("role", "region");
    gallery.setAttribute("aria-roledescription", "carousel");
    gallery.setAttribute("aria-label", `Galeri ${room.property}`);

    const track = createElement("div", "room-gallery__track");
    const images = Array.isArray(room.images) ? room.images : [];
    const slides = images.length ? images : [{ src: "", alt: `Foto ${room.property} belum tersedia` }];

    slides.forEach((photo, index) => {
      const slide = createElement("div", "room-gallery__slide");
      if (photo.src) {
        const image = document.createElement("img");
        image.src = photo.src;
        image.alt = photo.alt || `Foto ${room.property}`;
        image.width = 1200;
        image.height = 750;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          slide.classList.add("is-failed");
          slide.replaceChildren(createElement("span", "", photo.alt || `Foto ${room.property} belum tersedia`));
        }, { once: true });
        slide.append(image);
      } else {
        slide.classList.add("is-empty");
        slide.append(createElement("span", "material-symbols-outlined", "hotel"));
        slide.append(createElement("span", "", photo.alt));
      }
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${index + 1} dari ${slides.length}`);
      track.append(slide);
    });

    const previous = createElement("button", "room-gallery__arrow room-gallery__previous", "←");
    previous.type = "button";
    previous.setAttribute("aria-label", "Foto kamar sebelumnya");
    const next = createElement("button", "room-gallery__arrow room-gallery__next", "→");
    next.type = "button";
    next.setAttribute("aria-label", "Foto kamar berikutnya");
    const dots = createElement("div", "room-gallery__dots");
    let activeIndex = 0;

    const updateControls = () => {
      const canMove = images.length > 1;
      previous.disabled = !canMove || activeIndex === 0;
      next.disabled = !canMove || activeIndex === images.length - 1;
      [...dots.children].forEach((dot, index) => {
        dot.setAttribute("aria-current", String(index === activeIndex));
      });
    };

    const goTo = (index) => {
      activeIndex = Math.max(0, Math.min(index, slides.length - 1));
      track.scrollTo({
        left: activeIndex * track.clientWidth,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
      updateControls();
    };

    images.forEach((photo, index) => {
      const dot = createElement("button", "room-gallery__dot");
      dot.type = "button";
      dot.setAttribute("aria-label", `Tampilkan foto ${index + 1} untuk ${room.property}`);
      dot.addEventListener("click", () => goTo(index));
      dots.append(dot);
    });

    previous.addEventListener("click", () => goTo(activeIndex - 1));
    next.addEventListener("click", () => goTo(activeIndex + 1));
    track.addEventListener("scroll", () => {
      if (!track.clientWidth) {
        return;
      }
      activeIndex = Math.round(track.scrollLeft / track.clientWidth);
      updateControls();
    }, { passive: true });

    gallery.append(track, previous, next, dots);
    updateControls();
    return gallery;
  };

  const renderRoomCard = (room, index) => {
    const card = createElement("article", "room-card");
    const gallery = renderRoomGallery(room, index);
    const details = createElement("div", "room-card__details");
    details.append(createElement("p", "itinerary-kicker", room.location || "Penginapan pilihan"));
    details.append(createElement("h3", "", room.property));
    details.append(createElement("p", "room-card__type", room.type || "Tipe kamar belum tersedia"));

    const amenities = createElement("ul", "room-card__amenities");
    (room.amenities || []).forEach((amenity) => amenities.append(createElement("li", "", amenity)));
    if (amenities.children.length) {
      details.append(amenities);
    }

    const price = hasAmount(room.priceFrom) ? formatMoney(room.priceFrom) : "Harga belum tersedia";
    details.append(createElement("p", "room-card__price", price === "Harga belum tersedia" ? price : `Mulai ${price} /malam`));

    const promo = createElement("div", "room-promo");
    promo.append(createElement("span", "room-promo__label", "Kode promo"));
    const promoCode = room.promo?.code || "";
    const code = createElement("code", "room-promo__code", promoCode || "Kode belum tersedia");
    promo.append(code);
    if (room.promo?.note) {
      promo.append(createElement("p", "room-promo__note", room.promo.note));
    }

    if (promoCode) {
      const copyButton = createElement("button", "room-promo__copy", "Salin");
      copyButton.type = "button";
      copyButton.setAttribute("aria-label", `Salin kode promo ${promoCode}`);
      copyButton.addEventListener("click", async () => {
        const copied = await copyText(promoCode);
        showToast(copied ? "Kode tersalin" : `Salin kode promo secara manual: ${promoCode}`);
      });
      promo.append(copyButton);
    }
    details.append(promo);

    const bookingButton = createElement("button", "button button--primary room-card__booking", "Pesan via WhatsApp");
    bookingButton.type = "button";
    bookingButton.disabled = true;
    bookingButton.title = "Pemesanan WhatsApp akan tersedia pada fase berikutnya";
    bookingButton.setAttribute("aria-label", `Pesan kamar ${room.property} via WhatsApp (belum tersedia)`);
    details.append(bookingButton);

    card.append(gallery, details);
    return card;
  };

  const renderItineraryStay = (stay) => {
    const card = createElement("article", "itinerary-stay-card");
    const image = document.createElement("img");
    const photo = stay.images?.[0];
    if (photo?.src) {
      image.src = photo.src;
      image.alt = photo.alt || `Foto ${stay.property}`;
      image.width = 800;
      image.height = 600;
      image.loading = "lazy";
      image.decoding = "async";
      card.append(image);
    } else {
      card.append(createElement("div", "itinerary-stay-card__image-empty", "Foto penginapan belum tersedia"));
    }

    const details = createElement("div", "itinerary-stay-card__details");
    details.append(createElement("p", "itinerary-kicker", stay.area || "Penginapan pilihan"));
    details.append(createElement("h3", "", stay.property));
    details.append(createElement("p", "itinerary-stay-card__price", stay.priceLabel || (hasAmount(stay.priceFrom)
      ? `Mulai ${formatMoney(stay.priceFrom)} / malam`
      : "Harga belum tersedia")));
    const link = createElement("a", "button button--primary", "Lihat penginapan");
    link.href = `accommodation.html?slug=${encodeURIComponent(stay.slug)}`;
    details.append(link);
    card.append(details);
    return card;
  };

  const stops = (itinerary.days || []).flatMap((day) => day.stops || []);
  const totalMinutes = stops.reduce((total, stop) => total + (Number(stop.duration) || 0), 0);
  const allCosts = stops.flatMap((stop) => Array.isArray(stop.costs) ? stop.costs : [])
    .filter((cost) => hasAmount(cost.amount));
  const ticketCosts = allCosts.filter((cost) => ["tiket", "aktivitas"].includes(cost.type) && cost.perPerson === true);
  const mealCosts = allCosts.filter((cost) => cost.type === "makan" && cost.perPerson === true);
  const perPersonCosts = [...ticketCosts, ...mealCosts];
  const hasPerPersonCosts = perPersonCosts.length > 0;
  const hasWeekendCosts = perPersonCosts.some((cost) => hasAmount(cost.weekendAmount));
  const travelCosts = stops.map((stop) => stop.travelNext)
    .filter((travel) => travel && hasAmount(travel.cost));
  const priceUpdated = itinerary.priceUpdated
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(`${itinerary.priceUpdated}T00:00:00`))
    : "tanggal belum tersedia";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const durationLabel = [
    hours ? `${hours} jam` : "",
    minutes ? `${minutes} menit` : ""
  ].filter(Boolean).join(" ") || "Belum tersedia";
  const priceLabel = hasPerPersonCosts
    ? formatMoney(sumCosts(perPersonCosts))
    : "Belum tersedia";
  const cover = itinerary.cover || { src: itinerary.image, alt: itinerary.imageAlt || itinerary.title };

  const hotelWhatsApp = document.querySelector("[data-whatsapp-hotel]");
  const waNumber = window.SITE_CONFIG?.waNumber || "";
  if (hotelWhatsApp && waNumber) {
    const message = `Halo, saya ingin info penginapan untuk itinerary ${itinerary.title}.`;
    hotelWhatsApp.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  }

  document.title = `${itinerary.title} | SolusiDolan.id`;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute("content", itinerary.summary || itinerary.title);
  }

  const heroCarousel = document.querySelector("[data-hero-carousel]");
  const heroSection = document.querySelector(".itinerary-hero");
  const heroSlides = document.querySelector("[data-hero-slides]");
  const heroPlace = document.querySelector("[data-hero-place]");
  const heroCredit = document.querySelector("[data-hero-credit]");
  const heroControls = document.querySelector("[data-hero-controls]");
  const heroCounter = document.querySelector("[data-hero-counter]");
  const heroDots = document.querySelector("[data-hero-dots]");
  const stopPhotos = (itinerary.days || []).flatMap((day) => day.stops || [])
    .flatMap((stop) => (Array.isArray(stop.photos) ? stop.photos : []).map((photo) => ({ ...photo, placeName: stop.name })));
  const heroPhotos = [
    ...(Array.isArray(itinerary.heroImages) ? itinerary.heroImages.map((photo) => ({
      ...photo,
      placeName: photo.placeName || photo.name || itinerary.title
    })) : []),
    ...stopPhotos
  ].filter((photo) => photo.src);
  if (!heroPhotos.length && cover?.src) {
    heroPhotos.push({ src: cover.src, alt: cover.alt || itinerary.title, placeName: itinerary.title });
  }

  const heroSlideNodes = heroPhotos.map((photo, index) => {
    const slide = createElement("div", "itinerary-hero__slide");
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt || photo.placeName || itinerary.title;
    image.width = 1920;
    image.height = 1080;
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";
    slide.append(image);
    heroSlides.append(slide);
    return slide;
  });

  let activeHeroIndex = 0;
  let heroTimer = 0;
  const setHeroSlide = (index) => {
    if (!heroSlideNodes.length) return;
    activeHeroIndex = (index + heroSlideNodes.length) % heroSlideNodes.length;
    heroSlideNodes.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== activeHeroIndex));
    });
    heroSlides.style.transform = `translateX(${-activeHeroIndex * heroCarousel.clientWidth}px)`;
    const photoCredit = heroPhotos[activeHeroIndex];
    heroPlace.textContent = photoCredit.placeName && photoCredit.placeName !== itinerary.title
      ? photoCredit.placeName
      : "";
    heroCredit.textContent = photoCredit.credit ? `Foto: ${photoCredit.credit}` : "";
    heroCredit.hidden = !photoCredit.credit;
    if (photoCredit.sourceUrl) {
      heroCredit.href = photoCredit.sourceUrl;
    } else {
      heroCredit.removeAttribute("href");
    }
    heroCounter.textContent = `${activeHeroIndex + 1} / ${heroPhotos.length}`;
    heroDots.querySelectorAll("button").forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", String(dotIndex === activeHeroIndex));
    });
  };

  if (heroPhotos.length > 1) {
    heroControls.hidden = false;
    heroPhotos.forEach((photo, index) => {
      const dot = createElement("button", "itinerary-hero__dot");
      dot.type = "button";
      dot.setAttribute("aria-label", `Tampilkan foto ${photo.placeName || index + 1}`);
      dot.addEventListener("click", () => setHeroSlide(index));
      heroDots.append(dot);
    });
    document.querySelector("[data-hero-previous]").addEventListener("click", () => setHeroSlide(activeHeroIndex - 1));
    document.querySelector("[data-hero-next]").addEventListener("click", () => setHeroSlide(activeHeroIndex + 1));

    const stopHeroAutoSlide = () => window.clearInterval(heroTimer);
    const startHeroAutoSlide = () => {
      stopHeroAutoSlide();
      if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      heroTimer = window.setInterval(() => setHeroSlide(activeHeroIndex + 1), 5000);
    };
    heroSection.addEventListener("mouseenter", stopHeroAutoSlide);
    heroSection.addEventListener("mouseleave", startHeroAutoSlide);
    heroSection.addEventListener("focusin", stopHeroAutoSlide);
    heroSection.addEventListener("focusout", startHeroAutoSlide);
    document.addEventListener("visibilitychange", startHeroAutoSlide);
    startHeroAutoSlide();
  } else {
    heroControls.hidden = true;
  }
  setHeroSlide(0);
  window.addEventListener("resize", () => setHeroSlide(activeHeroIndex));

  document.querySelector("[data-region]").textContent = itinerary.region || itinerary.category || "Yogyakarta";
  document.querySelector("[data-title]").textContent = itinerary.title;
  document.querySelector("[data-intro]").textContent = itinerary.intro || itinerary.summary || "";
  document.querySelector("[data-stat-stops]").textContent = String(stops.length);
  document.querySelector("[data-stat-time]").textContent = durationLabel;
  document.querySelector("[data-stat-price]").textContent = priceLabel;

  const bestFor = document.querySelector("[data-best-for]");
  (itinerary.bestFor || []).forEach((label) => bestFor.append(createElement("li", "", label)));
  if (!itinerary.bestFor?.length) {
    document.querySelector(".itinerary-best-for").hidden = true;
  }

  const displayCost = (selector, costs) => {
    const target = document.querySelector(selector);
    if (costs.length) {
      target.textContent = formatMoney(sumCosts(costs));
    } else {
      target.textContent = "Belum tersedia";
    }
  };

  displayCost("[data-cost-tickets]", ticketCosts);
  displayCost("[data-cost-meals]", mealCosts);
  const transportCell = document.querySelector("[data-cost-transport]");
  transportCell.textContent = travelCosts.length
    ? formatMoney(travelCosts.reduce((total, travel) => total + Number(travel.cost), 0))
    : "Belum tersedia";

  const accommodationCell = document.querySelector("[data-cost-accommodation]");
  const rooms = Array.isArray(itinerary.rooms) ? itinerary.rooms : [];
  const lodgingSection = document.querySelector("#penginapan");
  const roomGrid = document.querySelector("[data-room-grid]");
  const availableStays = (window.ACCOMMODATIONS || []).filter((stay) => !stay.isDraft);
  const recommendedSlugs = Array.isArray(itinerary.accommodationSlugs) ? itinerary.accommodationSlugs : [];
  const recommendedStays = recommendedSlugs.length
    ? recommendedSlugs.map((staySlug) => availableStays.find((stay) => stay.slug === staySlug)).filter(Boolean)
    : availableStays.slice(0, 3);
  const startingStay = recommendedStays[0] || null;
  const featuredStay = document.querySelector("[data-recommended-stay]");
  if (featuredStay && startingStay) {
    featuredStay.hidden = false;
    const link = createElement("a", "recommended-stay__link");
    link.href = `accommodation.html?slug=${encodeURIComponent(startingStay.slug)}`;
    const photo = startingStay.images?.[0];
    if (photo?.src) {
      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.alt || `Foto ${startingStay.property}`;
      image.loading = "lazy";
      image.decoding = "async";
      link.append(image);
    }
    const details = createElement("span", "recommended-stay__details");
    details.append(
      createElement("span", "recommended-stay__label", "Mulai dari penginapan ini"),
      createElement("strong", "", startingStay.property),
      createElement("span", "recommended-stay__action", "Lihat detail →")
    );
    link.append(details);
    featuredStay.append(link);
  }
  if (rooms.length || recommendedStays.length) {
    lodgingSection.hidden = false;
    document.querySelector("[data-accommodation-cta]").hidden = false;
    if (rooms.length) {
      rooms.forEach((room, index) => roomGrid.append(renderRoomCard(room, index)));
    } else {
      recommendedStays.forEach((stay) => roomGrid.append(renderItineraryStay(stay)));
    }
    const accommodationLink = createElement("a", "", "Lihat rekomendasi kamar");
    accommodationLink.href = "#penginapan";
    accommodationCell.append(accommodationLink);
  } else {
    accommodationCell.textContent = "Belum tersedia";
  }

  const totals = document.querySelector("[data-cost-totals]");
  const addTotalRow = (label, amount, available) => {
    const row = createElement("tr", "cost-summary__total");
    row.append(createElement("th", "", label));
    row.append(createElement("td", "", available ? formatMoney(amount) : "Belum tersedia"));
    totals.append(row);
  };

  if (hasPerPersonCosts) {
    addTotalRow("Total weekday / orang", sumCosts(perPersonCosts), true);
    if (hasWeekendCosts) {
      addTotalRow("Total akhir pekan / orang", sumCosts(perPersonCosts, true), true);
    }
  } else {
    addTotalRow("Total estimasi / orang", 0, false);
  }

  const priceNote = document.querySelector("[data-cost-note]");
  priceNote.textContent = `Estimasi per ${priceUpdated}. Harga dapat berubah, konfirmasi ulang sebelum berangkat.`;

  const dayLinks = document.querySelector("[data-day-links]");
  const dayOverviews = document.querySelector("[data-day-overviews]");

  (itinerary.days || []).forEach((day, index) => {
    const dayId = `hari-${index + 1}`;
    const dayLink = createElement("a", "", `Hari ${index + 1}`);
    dayLink.href = `#${dayId}`;
    dayLink.setAttribute("aria-label", `Hari ${index + 1}: ${day.title}`);
    dayLinks.append(dayLink);

    const daySection = createElement("article", "day-overview__item");
    daySection.id = dayId;
    const dayLabel = createElement("p", "itinerary-kicker", `Hari ${index + 1}`);
    const dayTitle = createElement("h2", "", day.title);
    daySection.append(dayLabel, dayTitle);
    daySection.append(renderRouteIllustration(day, startingStay));
    const timeline = createElement("div", "day-timeline");
    (day.stops || []).forEach((stop, stopIndex) => timeline.append(renderStop(stop, stopIndex)));
    daySection.append(timeline);
    dayOverviews.append(daySection);
  });

  lightbox.querySelector("[data-lightbox-close]").addEventListener("click", () => lightbox.close());
  lightboxPrevious.addEventListener("click", () => moveLightbox(-1));
  lightboxNext.addEventListener("click", () => moveLightbox(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });
  lightbox.addEventListener("cancel", (event) => {
    event.preventDefault();
    lightbox.close();
  });
  document.addEventListener("keydown", (event) => {
    if (!lightbox.open) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      lightbox.close();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveLightbox(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveLightbox(1);
    }
  });
  lightbox.addEventListener("close", () => {
    lightboxTrigger?.focus();
    lightboxTrigger = null;
  });

  content.hidden = false;
})();
