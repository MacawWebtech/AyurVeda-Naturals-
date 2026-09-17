/**
 * AyurVeda Naturals — main.js
 * Site-wide behaviour shared by every page: theme, RTL, sticky header,
 * mobile navigation, wishlist/cart state, scroll reveal, back-to-top,
 * newsletter + generic form validation, and toast notifications.
 *
 * No console.log in production paths. Wrap risky DOM lookups defensively
 * so this file can be safely included on every page even when a given
 * page doesn't contain every component.
 */
(function () {
  "use strict";

  const THEME_KEY = "ayurveda-theme"; // 'light' | 'dark' | 'system'
  const DIR_KEY = "ayurveda-dir"; // 'ltr' | 'rtl'
  const WISHLIST_KEY = "ayurveda-wishlist";
  const CART_KEY = "ayurveda-cart";

  const root = document.documentElement;

  /* ---------------------------------------------------------------------
   * THEME (light / dark / system) with persistence + system detection
   * ------------------------------------------------------------------- */
  const ThemeManager = {
    init() {
      const saved = localStorage.getItem(THEME_KEY) || "system";
      this.apply(saved);
      this.bindToggle();

      // React to OS-level theme change when in "system" mode
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if ((localStorage.getItem(THEME_KEY) || "system") === "system") {
          this.apply("system");
        }
      });
    },
    resolve(mode) {
      if (mode === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return mode;
    },
    apply(mode) {
      const resolved = this.resolve(mode);
      root.setAttribute("data-bs-theme", resolved);
      localStorage.setItem(THEME_KEY, mode);
      document.querySelectorAll("[data-theme-option]").forEach((btn) => {
        const isActive = btn.getAttribute("data-theme-option") === mode;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    },
    bindToggle() {
      document.querySelectorAll("[data-theme-option]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.apply(btn.getAttribute("data-theme-option"));
        });
      });
    },
  };

  /* ---------------------------------------------------------------------
   * RTL / LTR direction switching
   * ------------------------------------------------------------------- */
  const DirectionManager = {
    init() {
      const saved = localStorage.getItem(DIR_KEY) || "ltr";
      this.apply(saved);
      document.querySelectorAll("[data-dir-option]").forEach((btn) => {
        btn.addEventListener("click", () => this.apply(btn.getAttribute("data-dir-option")));
      });
    },
    apply(dir) {
      root.setAttribute("dir", dir);
      root.setAttribute("lang", dir === "rtl" ? (root.lang === "en" ? "ar" : root.lang) : root.lang);
      localStorage.setItem(DIR_KEY, dir);
      document.querySelectorAll("[data-dir-option]").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-dir-option") === dir);
      });
    },
  };

  /* ---------------------------------------------------------------------
   * STICKY HEADER — shrinks + gains shadow on scroll
   * ------------------------------------------------------------------- */
  const HeaderManager = {
    init() {
      this.header = document.querySelector(".site-header");
      if (!this.header) return;
      window.addEventListener("scroll", () => this.onScroll(), { passive: true });
      this.onScroll();
    },
    onScroll() {
      this.header.classList.toggle("is-scrolled", window.scrollY > 24);
    },
  };

  /* ---------------------------------------------------------------------
   * WISHLIST + CART badge counts (demo, localStorage-backed)
   * ------------------------------------------------------------------- */
  const CommerceState = {
    init() {
      this.renderBadges();
      document.querySelectorAll("[data-wishlist-toggle]").forEach((btn) => {
        btn.addEventListener("click", () => this.toggleWishlist(btn));
      });
      document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
        btn.addEventListener("click", () => this.addToCart(btn));
      });
    },
    getList(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch (e) {
        return [];
      }
    },
    toggleWishlist(btn) {
      const id = btn.getAttribute("data-product-id") || btn.closest("[data-product-id]")?.getAttribute("data-product-id");
      let list = this.getList(WISHLIST_KEY);
      const active = list.includes(id);
      list = active ? list.filter((x) => x !== id) : [...list, id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
      btn.classList.toggle("is-active", !active);
      btn.setAttribute("aria-pressed", String(!active));
      Toast.show(active ? "Removed from wishlist" : "Added to wishlist", "success");
      this.renderBadges();
    },
    addToCart(btn) {
      const name = btn.getAttribute("data-product-name") || "Item";
      let list = this.getList(CART_KEY);
      list.push(name);
      localStorage.setItem(CART_KEY, JSON.stringify(list));
      Toast.show(name + " added to cart", "success");
      this.renderBadges();
    },
    renderBadges() {
      const cartCount = this.getList(CART_KEY).length;
      document.querySelectorAll("[data-cart-count]").forEach((el) => {
        el.textContent = String(cartCount);
        el.hidden = cartCount === 0;
      });
      const wishCount = this.getList(WISHLIST_KEY).length;
      document.querySelectorAll("[data-wishlist-count]").forEach((el) => {
        el.textContent = String(wishCount);
        el.hidden = wishCount === 0;
      });
    },
  };

  /* ---------------------------------------------------------------------
   * TOAST NOTIFICATIONS (Bootstrap toast wrapper)
   * ------------------------------------------------------------------- */
  const Toast = {
    show(message, variant) {
      const container = document.querySelector(".toast-container");
      if (!container || !window.bootstrap) return;
      const el = document.createElement("div");
      el.className = "toast align-items-center border-0";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "true");
      const iconClass = variant === "success" ? "bi-check-circle text-primary-brand" : "bi-info-circle text-accent-brand";
      el.innerHTML =
        '<div class="d-flex">' +
        '<div class="toast-body"><i class="bi ' + iconClass + ' me-2"></i>' + message + "</div>" +
        '<button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>' +
        "</div>";
      container.appendChild(el);
      const toast = new bootstrap.Toast(el, { delay: 3200 });
      toast.show();
      el.addEventListener("hidden.bs.toast", () => el.remove());
    },
  };
  window.AyurvedaToast = Toast;

  /* ---------------------------------------------------------------------
   * SCROLL REVEAL — IntersectionObserver based, respects reduced motion
   * ------------------------------------------------------------------- */
  const RevealManager = {
    init() {
      const items = document.querySelectorAll(".reveal");
      if (!items.length) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      items.forEach((el) => observer.observe(el));
    },
  };

  /* ---------------------------------------------------------------------
   * BACK TO TOP
   * ------------------------------------------------------------------- */
  const BackToTop = {
    init() {
      this.btn = document.querySelector(".back-to-top");
      if (!this.btn) return;
      window.addEventListener("scroll", () => {
        this.btn.classList.toggle("show", window.scrollY > 480);
      }, { passive: true });
      this.btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
    },
  };

  /* ---------------------------------------------------------------------
   * GENERIC FORM VALIDATION (Bootstrap-style) + accessible error announce
   * Works for contact, wholesale, consultation, newsletter forms.
   * TODO: wire each form's action/fetch to Formspree / Netlify Forms.
   * ------------------------------------------------------------------- */
  const FormValidation = {
    init() {
      document.querySelectorAll("form[data-validate]").forEach((form) => {
        form.setAttribute("novalidate", "novalidate");
        form.addEventListener("submit", (e) => this.handleSubmit(e, form));
      });
    },
    handleSubmit(e, form) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        const firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        Toast.show("Please review the highlighted fields", "info");
        return;
      }
      form.classList.add("was-validated");
      const successEl = form.querySelector("[data-form-success]");
      if (successEl) {
        successEl.hidden = false;
        successEl.setAttribute("tabindex", "-1");
        successEl.focus();
      }
      Toast.show("Thank you — your message has been sent", "success");
      // TODO: replace with real submission handler (Formspree/Netlify endpoint)
      form.reset();
      form.classList.remove("was-validated");
    },
  };

  /* ---------------------------------------------------------------------
   * FAQ / GENERIC ACCORDION CHEVRON STATE is handled by Bootstrap itself.
   * ------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------
   * SEARCH OVERLAY (simple demo — filters a static result list if present)
   * ------------------------------------------------------------------- */
  const SearchOverlay = {
    init() {
      const modalEl = document.getElementById("searchModal");
      if (!modalEl) return;
      const input = modalEl.querySelector("[data-search-input]");
      const results = modalEl.querySelectorAll("[data-search-result]");
      const empty = modalEl.querySelector("[data-search-empty]");
      modalEl.addEventListener("shown.bs.modal", () => input && input.focus());
      if (!input) return;
      input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        let visible = 0;
        results.forEach((r) => {
          const match = r.textContent.toLowerCase().includes(q);
          r.hidden = q.length > 0 && !match;
          if (!r.hidden) visible++;
        });
        if (empty) empty.hidden = !(q.length > 0 && visible === 0);
      });
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    ThemeManager.init();
    DirectionManager.init();
    HeaderManager.init();
    CommerceState.init();
    RevealManager.init();
    BackToTop.init();
    FormValidation.init();
    SearchOverlay.init();

    // Auto-mark active nav link based on current page
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav .nav-link, .offcanvas-brand-nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").split("/").pop();
      if (href && href === path) link.classList.add("active");
    });
  });
})();
