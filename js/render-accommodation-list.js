(function () {
  const list = document.querySelector("[data-accommodation-list]");
  if (!list) return;

  const stays = window.ACCOMMODATIONS || [];
  const empty = document.querySelector("[data-accommodation-empty]");
  if (empty) empty.hidden = stays.length > 0;

  stays.forEach((stay) => {
    const card = document.createElement("a");
    card.className = "accommodation-card";
    card.href = `accommodation.html?slug=${encodeURIComponent(stay.slug)}`;
    card.setAttribute("aria-label", `Lihat detail ${stay.property}`);

    const imageWrap = document.createElement("div");
    imageWrap.className = "accommodation-card__image";
    const photo = stay.images?.[0];
    if (photo?.src) {
      const image = document.createElement("img");
      image.src = photo.src;
      image.alt = photo.alt || `Foto ${stay.property}`;
      image.width = 800;
      image.height = 600;
      image.loading = "lazy";
      image.decoding = "async";
      imageWrap.append(image);
    } else {
      imageWrap.textContent = "Foto belum tersedia";
    }

    const copy = document.createElement("div");
    copy.className = "accommodation-card__copy";
    const area = document.createElement("p");
    area.className = "accommodation-card__area";
    area.textContent = stay.area || "Penginapan pilihan";
    const name = document.createElement("h2");
    name.textContent = stay.property;
    const price = document.createElement("p");
    price.className = "accommodation-card__price";
    price.textContent = Number.isFinite(stay.priceFrom)
      ? `Mulai Rp${new Intl.NumberFormat("id-ID").format(stay.priceFrom)} / malam`
      : "Harga belum tersedia";
    const action = document.createElement("span");
    action.className = "accommodation-card__action";
    action.textContent = "Lihat detail →";
    copy.append(area, name, price, action);
    card.append(imageWrap, copy);
    list.append(card);
  });
})();
