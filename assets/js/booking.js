/**
 * AyurVeda Naturals — booking.js
 * Powers the consultation booking page: selecting a consultation package
 * pre-fills the booking form, and a simple time-slot picker highlights
 * the chosen slot. TODO: connect to real calendar/scheduling API.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-booking-form]");
    if (!form) return; // not on the consultation page

    const typeSelect = form.querySelector("#consultationType");

    document.querySelectorAll("[data-book-package]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.getAttribute("data-book-package");
        if (typeSelect) typeSelect.value = value;
        const formTop = document.querySelector("[data-booking-form-anchor]");
        if (formTop) formTop.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      });
    });

    const slots = document.querySelectorAll("[data-time-slot]");
    const hiddenTimeInput = form.querySelector("#preferredTime");
    slots.forEach((slot) => {
      slot.addEventListener("click", () => {
        slots.forEach((s) => { s.classList.remove("active"); s.setAttribute("aria-pressed", "false"); });
        slot.classList.add("active");
        slot.setAttribute("aria-pressed", "true");
        if (hiddenTimeInput) hiddenTimeInput.value = slot.getAttribute("data-time-slot");
      });
    });

    // Minimum date = today for the date picker
    const dateInput = form.querySelector("#preferredDate");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }
  });
})();
