(function (global) {
  const MAX_WAYPOINTS = 20;

  const placeReference = (place) => {
    if (place?.placeId) {
      return `place_id:${place.placeId}`;
    }
    if (Number.isFinite(place?.lat) && Number.isFinite(place?.lng)) {
      return `${place.lat},${place.lng}`;
    }
    return "";
  };

  const routeReferences = (stops) => (Array.isArray(stops) ? stops : [])
    .map((stop) => placeReference(stop.place))
    .filter(Boolean);

  const buildEmbedUrl = (stops, key) => {
    const references = routeReferences(stops);
    if (!key || references.length < 2) {
      return "";
    }

    const url = new URL("https://www.google.com/maps/embed/v1/directions");
    url.searchParams.set("key", key);
    url.searchParams.set("origin", references[0]);
    url.searchParams.set("destination", references[references.length - 1]);
    url.searchParams.set("mode", "driving");

    const waypoints = references.slice(1, -1).slice(0, MAX_WAYPOINTS);
    if (waypoints.length) {
      url.searchParams.set("waypoints", waypoints.join("|"));
    }
    return url.href;
  };

  const buildDirectionsUrl = (stops) => {
    const references = routeReferences(stops);
    if (!references.length) {
      return "";
    }

    const url = new URL(references.length === 1
      ? "https://www.google.com/maps/search/"
      : "https://www.google.com/maps/dir/");
    url.searchParams.set("api", "1");

    if (references.length === 1) {
      url.searchParams.set("query", references[0]);
      return url.href;
    }

    url.searchParams.set("origin", references[0]);
    url.searchParams.set("destination", references[references.length - 1]);
    url.searchParams.set("travelmode", "driving");

    const waypoints = references.slice(1, -1).slice(0, MAX_WAYPOINTS);
    if (waypoints.length) {
      url.searchParams.set("waypoints", waypoints.join("|"));
    }
    return url.href;
  };

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

  const renderRouteMap = (container, day, key = "") => {
    if (!container) {
      return null;
    }

    const section = createElement("section", "route-map");
    const title = createElement("h3", "route-map__title", "Peta rute");
    section.append(title);

    const embedUrl = buildEmbedUrl(day.stops, key);
    if (embedUrl) {
      const frame = createElement("div", "route-map__frame");
      const iframe = document.createElement("iframe");
      iframe.src = embedUrl;
      iframe.title = `Rute berkendara: ${day.title}`;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      iframe.addEventListener("error", () => {
        frame.remove();
        section.classList.add("route-map--fallback");
      }, { once: true });

      const unlock = createElement("button", "route-map__unlock", "Ketuk untuk menggeser peta");
      unlock.type = "button";
      unlock.addEventListener("click", () => {
        section.classList.add("is-unlocked");
        unlock.hidden = true;
      });

      frame.append(iframe, unlock);
      section.append(frame);
    } else {
      section.classList.add("route-map--fallback");
    }

    const stopList = createElement("ol", "route-map__stops");
    (day.stops || []).forEach((stop, index) => {
      const item = createElement("li", "route-map__stop");
      item.append(createElement("span", "route-map__stop-number", String(index + 1).padStart(2, "0")));
      const details = createElement("div", "route-map__stop-details");
      details.append(createElement("strong", "", stop.name));

      if (stop.travelNext && index < day.stops.length - 1) {
        const travel = stop.travelNext;
        const facts = [travel.mode, `± ${travel.minutes} menit`];
        if (Number.isFinite(Number(travel.km))) {
          facts.push(`${travel.km} km`);
        }
        details.append(createElement("p", "", facts.join(" · ")));
      }
      item.append(details);
      stopList.append(item);
    });
    section.append(stopList);

    const directionsUrl = buildDirectionsUrl(day.stops);
    if (directionsUrl) {
      const directionsLink = createElement("a", "route-map__directions", "Buka rute di Google Maps ↗");
      directionsLink.href = directionsUrl;
      directionsLink.target = "_blank";
      directionsLink.rel = "noopener noreferrer";
      section.append(directionsLink);
    }

    container.replaceChildren(section);
    return section;
  };

  global.RouteMap = { buildEmbedUrl, buildDirectionsUrl, renderRouteMap };
})(window);