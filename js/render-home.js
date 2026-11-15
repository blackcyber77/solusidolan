(function () {
  const trailContainer = document.querySelector("#trails-scroller");
  const itineraryData = window.ITINERARIES || [];

  if (!trailContainer) {
    return;
  }

  const createTrailCard = (itinerary, index) => {
    const article = document.createElement("article");
    article.className = "trail-card";

    const imageFrame = document.createElement("div");
    imageFrame.className = "trail-card__image";

    const image = document.createElement("img");
    image.src = itinerary.image;
    image.alt = itinerary.imageAlt;
    image.width = 800;
    image.height = 1000;
    image.loading = "lazy";
    image.decoding = "async";

    const duration = document.createElement("span");
    duration.className = "trail-card__duration";
    duration.textContent = itinerary.duration;

    const number = document.createElement("span");
    number.className = "trail-card__number";
    number.setAttribute("aria-hidden", "true");
    number.textContent = String(index + 1).padStart(2, "0");

    imageFrame.append(image, duration, number);

    const content = document.createElement("div");
    content.className = "trail-card__content";

    const textGroup = document.createElement("div");
    const metadata = document.createElement("p");
    metadata.className = "trail-card__meta";
    metadata.textContent = `${itinerary.region} · ${itinerary.category}`;

    const heading = document.createElement("h3");
    const titleLink = document.createElement("a");
    titleLink.href = `itinerary.html?slug=${encodeURIComponent(itinerary.slug)}`;
    titleLink.textContent = itinerary.title;
    heading.append(titleLink);

    const summary = document.createElement("p");
    summary.className = "trail-card__summary";
    summary.textContent = itinerary.summary;
    textGroup.append(metadata, heading, summary);

    const footer = document.createElement("div");
    footer.className = "trail-card__footer";
    const detailLink = document.createElement("a");
    detailLink.className = "trail-card__link";
    detailLink.href = titleLink.href;
    detailLink.textContent = "View Waypoints →";

    const distance = document.createElement("span");
    distance.className = "trail-card__distance";
    distance.textContent = itinerary.distance;
    footer.append(detailLink, distance);
    content.append(textGroup, footer);
    article.append(imageFrame, content);

    return article;
  };

  itineraryData.forEach((itinerary, index) => {
    trailContainer.append(createTrailCard(itinerary, index));
  });

  const previousButton = document.querySelector("#trail-prev");
  const nextButton = document.querySelector("#trail-next");
  const controls = document.querySelector(".trail-controls > div");

  if (previousButton && nextButton && controls) {
    const updateControls = () => {
      controls.hidden = trailContainer.scrollWidth <= trailContainer.clientWidth + 1;
    };

    const scrollTrails = (direction) => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      trailContainer.scrollBy({
        left: direction * Math.min(trailContainer.clientWidth * 0.85, 360),
        behavior: reducedMotion ? "auto" : "smooth"
      });
    };

    previousButton.addEventListener("click", () => scrollTrails(-1));
    nextButton.addEventListener("click", () => scrollTrails(1));
    window.addEventListener("resize", updateControls);
    updateControls();
  }
})();