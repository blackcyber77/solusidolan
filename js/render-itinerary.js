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
    if (stop.openHours) {
      chips.append(createElement("span", "", `Buka: ${stop.openHours}`));
    }

    card.append(heading, chips);
    if (stop.desc) {
      card.append(createElement("p", "timeline-stop__description", stop.desc));
    }
    card.append(renderPhotos(stop), renderCosts(stop.costs));

    if (stop.tip) {
      const tip = createElement("aside", "timeline-stop__tip");
      tip.append(createElement("strong", "", "Tips"), createElement("p", "", stop.tip));
      card.append(tip);
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

  const coverImage = document.querySelector("[data-cover]");
  coverImage.src = cover.src;
  coverImage.alt = cover.alt || itinerary.title;
  coverImage.addEventListener("error", () => {
    document.querySelector(".itinerary-hero")?.classList.add("is-image-fallback");
  }, { once: true });

  document.querySelector("[data-region]").textContent = itinerary.region || itinerary.category || "Yogyakarta";
  document.querySelector("[data-title]").textContent = itinerary.title;
  document.querySelector("[data-summary]").textContent = itinerary.summary || "";
  document.querySelector("[data-intro]").textContent = itinerary.intro || itinerary.summary || "";
  document.querySelector("[data-stat-stops]").textContent = String(stops.length);
  document.querySelector("[data-stat-time]").textContent = durationLabel;
  document.querySelector("[data-stat-price]").textContent = priceLabel;

  const heroChips = document.querySelector("[data-hero-chips]");
  [
    itinerary.duration,
    ...(itinerary.theme || []),
    `${stops.length} destinasi`,
    `${priceLabel} / orang`
  ].filter(Boolean).forEach((label) => heroChips.append(createElement("li", "", label)));

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
  if (rooms.length) {
    lodgingSection.hidden = false;
    document.querySelector("[data-accommodation-cta]").hidden = false;
    rooms.forEach((room, index) => roomGrid.append(renderRoomCard(room, index)));
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
    if (day.summary) {
      daySection.append(createElement("p", "", day.summary));
    }

    const routeContainer = createElement("div", "day-route-map");
    window.RouteMap?.renderRouteMap(routeContainer, day, window.SITE_CONFIG?.mapsApiKey || "");
    daySection.append(routeContainer);

    const timeline = createElement("div", "day-timeline");
    const dayStops = Array.isArray(day.stops) ? day.stops : [];
    dayStops.forEach((stop, stopIndex) => {
      timeline.append(renderStop(stop, stopIndex));
      if (stop.travelNext && stopIndex < dayStops.length - 1) {
        timeline.append(renderTravelBreak(stop.travelNext));
      }
    });
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