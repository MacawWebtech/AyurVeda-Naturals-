/**
 * AyurVeda Naturals — shop.js
 * Handles the shop page: category chips, filter toolbar, sorting,
 * client-side pagination and the quick-view modal. Operates entirely on
 * markup already present in shop.html (data attributes on .product-card).
 * TODO: replace client-side filtering with real catalog/API calls.
 */
(function () {
  "use strict";

  const PAGE_SIZE = 8;

  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector("[data-product-grid]");
    if (!grid) return; // not on the shop page

    const cards = Array.from(grid.querySelectorAll("[data-product-card]"));
    const chips = document.querySelectorAll("[data-category-chip]");
    const sortSelect = document.querySelector("[data-sort-select]");
    const searchInput = document.querySelector("[data-shop-search]");
    const priceFilter = document.querySelector("[data-price-filter]");
    const ratingFilter = document.querySelector("[data-rating-filter]");
    const availabilityFilter = document.querySelector("[data-availability-filter]");
    const clearBtn = document.querySelector("[data-clear-filters]");
    const emptyState = document.querySelector("[data-shop-empty]");
    const resultCount = document.querySelector("[data-result-count]");
    const pagination = document.querySelector("[data-shop-pagination]");

    let state = { category: "all", sort: "featured", query: "", price: "all", rating: "all", availability: "all", page: 1 };

    function matches(card) {
      const cat = card.getAttribute("data-category");
      const name = card.getAttribute("data-name") || "";
      const price = parseFloat(card.getAttribute("data-price") || "0");
      const rating = parseFloat(card.getAttribute("data-rating") || "0");
      const inStock = card.getAttribute("data-instock") === "true";

      if (state.category !== "all" && cat !== state.category) return false;
      if (state.query && !name.toLowerCase().includes(state.query.toLowerCase())) return false;
      if (state.price === "under500" && price >= 500) return false;
      if (state.price === "500to800" && (price < 500 || price > 800)) return false;
      if (state.price === "over800" && price <= 800) return false;
      if (state.rating !== "all" && rating < parseFloat(state.rating)) return false;
      if (state.availability === "in" && !inStock) return false;
      if (state.availability === "out" && inStock) return false;
      return true;
    }

    function sortCards(list) {
      const sorted = [...list];
      if (state.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
      if (state.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
      if (state.sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
      if (state.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
      return sorted;
    }

    function render() {
      let visible = cards.filter(matches).map((card) => ({
        el: card,
        price: parseFloat(card.getAttribute("data-price") || "0"),
        rating: parseFloat(card.getAttribute("data-rating") || "0"),
        name: card.getAttribute("data-name") || "",
      }));
      visible = sortCards(visible);

      cards.forEach((c) => (c.hidden = true));

      const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
      state.page = Math.min(state.page, totalPages);
      const start = (state.page - 1) * PAGE_SIZE;
      const pageItems = visible.slice(start, start + PAGE_SIZE);

      pageItems.forEach(({ el }) => {
        el.hidden = false;
        grid.appendChild(el); // preserve sort order visually
      });

      if (emptyState) emptyState.hidden = visible.length !== 0;
      if (resultCount) resultCount.textContent = visible.length + (visible.length === 1 ? " product" : " products");

      renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
      if (!pagination) return;
      pagination.innerHTML = "";
      if (totalPages <= 1) return;
      for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.className = "page-item" + (i === state.page ? " active" : "");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "page-link";
        btn.textContent = String(i);
        if (i === state.page) btn.setAttribute("aria-current", "page");
        btn.addEventListener("click", () => {
          state.page = i;
          render();
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        li.appendChild(btn);
        pagination.appendChild(li);
      }
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.category = chip.getAttribute("data-category-chip");
        state.page = 1;
        render();
      });
    });

    if (sortSelect) sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; render(); });
    if (searchInput) searchInput.addEventListener("input", () => { state.query = searchInput.value; state.page = 1; render(); });
    if (priceFilter) priceFilter.addEventListener("change", () => { state.price = priceFilter.value; state.page = 1; render(); });
    if (ratingFilter) ratingFilter.addEventListener("change", () => { state.rating = ratingFilter.value; state.page = 1; render(); });
    if (availabilityFilter) availabilityFilter.addEventListener("change", () => { state.availability = availabilityFilter.value; state.page = 1; render(); });
    if (clearBtn) clearBtn.addEventListener("click", () => {
      state = { category: "all", sort: "featured", query: "", price: "all", rating: "all", availability: "all", page: 1 };
      if (searchInput) searchInput.value = "";
      if (priceFilter) priceFilter.value = "all";
      if (ratingFilter) ratingFilter.value = "all";
      if (availabilityFilter) availabilityFilter.value = "all";
      if (sortSelect) sortSelect.value = "featured";
      chips.forEach((c) => c.classList.toggle("active", c.getAttribute("data-category-chip") === "all"));
      render();
    });

    // Quick view modal population
    const quickViewModal = document.getElementById("quickViewModal");
    if (quickViewModal) {
      document.querySelectorAll("[data-quick-view]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const card = btn.closest("[data-product-card]");
          if (!card) return;
          quickViewModal.querySelector("[data-qv-name]").textContent = card.getAttribute("data-name") || "";
          quickViewModal.querySelector("[data-qv-price]").textContent = "\u20B9" + (card.getAttribute("data-price") || "");
          quickViewModal.querySelector("[data-qv-cat]").textContent = card.getAttribute("data-category") || "";
          const img = card.querySelector("img");
          const qvImg = quickViewModal.querySelector("[data-qv-image]");
          if (img && qvImg) { qvImg.src = img.src; qvImg.alt = img.alt; }
        });
      });
    }

    render();
  });
})();
