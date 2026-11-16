(function () {
  const trailContainer = document.querySelector("#trails-scroller");
  const trailTrack = document.querySelector("#trail-track");
  const itineraryData = window.ITINERARIES || [];

  if (!trailContainer || !trailTrack) {
    return;
  }

  const createTrailCard = (itinerary, index) => {
    const article = document.createElement("article");
    article.className = "trail-card";
    article.setAttribute("role", "group");
    article.setAttribute("aria-roledescription", "slide");
    article.setAttribute("aria-label", `${index + 1} of ${itineraryData.length}: ${itinerary.title}`);

    const cardLink = document.createElement("a");
    cardLink.className = "trail-card__link";
    cardLink.href = `itinerary.html?slug=${encodeURIComponent(itinerary.slug)}`;
    cardLink.setAttribute("aria-label", `Open itinerary: ${itinerary.title}`);

    const imageFrame = document.createElement("div");
    imageFrame.className = "trail-card__image";

    const image = document.createElement("img");
    image.src = itinerary.image;
    image.alt = itinerary.imageAlt;
    image.width = 800;
    image.height = 1000;
    image.loading = "lazy";
    image.decoding = "async";

    const scrim = document.createElement("span");
    scrim.className = "trail-card__scrim";
    scrim.setAttribute("aria-hidden", "true");

    const duration = document.createElement("span");
    duration.className = "trail-card__duration";
    duration.textContent = itinerary.duration;

    const number = document.createElement("span");
    number.className = "trail-card__number";
    number.textContent = `Trail ${String(index + 1).padStart(2, "0")}`;

    imageFrame.append(image, scrim);

    const content = document.createElement("div");
    content.className = "trail-card__content";

    const eyebrow = document.createElement("p");
    eyebrow.className = "trail-card__eyebrow";
    eyebrow.textContent = itinerary.category;

    const heading = document.createElement("h3");
    heading.textContent = `${String(index + 1).padStart(2, "0")}. ${itinerary.title}`;

    const prompt = document.createElement("p");
    prompt.className = "trail-card__prompt";
    const promptText = document.createElement("span");
    promptText.textContent = "Tap to open dossier";
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    prompt.append(promptText, arrow);

    content.append(eyebrow, heading, prompt);
    cardLink.append(imageFrame, duration, number, content);
    article.append(cardLink);

    return article;
  };

  itineraryData.forEach((itinerary, index) => {
    trailTrack.append(createTrailCard(itinerary, index));
  });

  const previousButton = document.querySelector("#trail-prev");
  const nextButton = document.querySelector("#trail-next");
  const controls = document.querySelector(".trail-controls > div");
  const counter = document.querySelector("#trail-counter");

  if (previousButton && nextButton && controls && counter) {
    const cards = [...trailTrack.children];
    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;
    let activeIndex = 0;
    let pointerStartX = 0;
    let pointerDelta = 0;
    let activePointerId = null;
    let isDragging = false;
    let suppressClickUntil = 0;

    const renderState = () => {
      const mobile = isMobile();
      controls.hidden = !mobile || cards.length < 2;
      previousButton.disabled = activeIndex === 0;
      nextButton.disabled = activeIndex === cards.length - 1;
      counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;

      cards.forEach((card, index) => {
        const isInactive = mobile && index !== activeIndex;
        card.inert = isInactive;
        card.setAttribute("aria-hidden", String(isInactive));
      });

      if (mobile) {
        const baseOffset = -activeIndex * trailContainer.clientWidth;
        trailTrack.style.transform = `translate3d(${baseOffset + pointerDelta}px, 0, 0)`;
      } else {
        trailTrack.style.removeProperty("transform");
      }
    };

    const goTo = (nextIndex) => {
      if (!isMobile()) {
        return;
      }

      activeIndex = Math.max(0, Math.min(nextIndex, cards.length - 1));
      pointerDelta = 0;
      renderState();

      const activeCard = cards[activeIndex];
      cards.forEach((card) => card.classList.remove("is-entering"));
      void activeCard.offsetWidth;
      activeCard.classList.add("is-entering");
      window.setTimeout(() => activeCard.classList.remove("is-entering"), 900);
    };

    const finishPointer = (event, canceled = false) => {
      if (activePointerId !== event.pointerId) {
        return;
      }

      if (trailTrack.hasPointerCapture(event.pointerId)) {
        trailTrack.releasePointerCapture(event.pointerId);
      }

      activePointerId = null;
      trailTrack.classList.remove("is-dragging");

      if (!canceled && isDragging && Math.abs(pointerDelta) > 48) {
        goTo(activeIndex + (pointerDelta < 0 ? 1 : -1));
      } else {
        pointerDelta = 0;
        renderState();
      }

      if (isDragging) {
        suppressClickUntil = Date.now() + 350;
      }
      isDragging = false;
    };

    previousButton.addEventListener("click", () => goTo(activeIndex - 1));
    nextButton.addEventListener("click", () => goTo(activeIndex + 1));

    trailTrack.addEventListener("pointerdown", (event) => {
      if (!isMobile() || event.button !== 0) {
        return;
      }

      activePointerId = event.pointerId;
      pointerStartX = event.clientX;
      pointerDelta = 0;
      isDragging = false;
    });

    trailTrack.addEventListener("pointermove", (event) => {
      if (activePointerId !== event.pointerId) {
        return;
      }

      pointerDelta = event.clientX - pointerStartX;
      if (Math.abs(pointerDelta) > 6) {
        if (!isDragging) {
          isDragging = true;
          trailTrack.classList.add("is-dragging");
          trailTrack.setPointerCapture(event.pointerId);
        }
        const baseOffset = -activeIndex * trailContainer.clientWidth;
        trailTrack.style.transform = `translate3d(${baseOffset + pointerDelta}px, 0, 0)`;
        event.preventDefault();
      }
    });

    trailTrack.addEventListener("pointerup", (event) => finishPointer(event));
    trailTrack.addEventListener("pointercancel", (event) => finishPointer(event, true));
    trailTrack.addEventListener("click", (event) => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    window.addEventListener("resize", renderState);
    renderState();
  }
})();