# AyurVeda Naturals — Herbal & Ayurvedic Products Store (HTML Template)

A premium, multipage Bootstrap 5.3 storefront template for a herbal and
Ayurvedic wellness brand. Editorial, botanical design system — deep
forest green and warm bronze/terracotta on cream, Playfair Display
headlines over Manrope body, organic asymmetric imagery instead of a
generic ecommerce look.

## Quick start

Because pages reference assets with relative paths, serve the folder
with a local server rather than opening files directly:

```
cd ayurveda-naturals
python3 -m http.server 8000
```

Then visit `http://localhost:8000/pages/index.html`.

Full setup, customization and page-structure docs are in
`documentation/` (open `documentation/installation.html` first).

## What's included

**Design system** (`assets/css/`)
- `style.css` — full token system (colors, type, spacing), every
  component: header, nav, buttons, product/ingredient/testimonial/
  journal cards, forms, modals, accordion, timeline, pagination, etc.
- `dark-mode.css` — deep forest/charcoal dark theme refinements
- `rtl.css` — right-to-left layout overrides

**JavaScript** (`assets/js/`)
- `main.js` — theme (light/dark/system) + RTL persistence via
  localStorage, sticky header, mobile offcanvas nav, wishlist/cart
  demo state, toast notifications, scroll reveal, back-to-top, generic
  form validation, header search filter
- `shop.js` — category chips, filters, sorting, pagination, quick view
- `booking.js` — consultation package selection, time-slot picker

**16 pages** (`pages/`)
`index.html`, `home-2.html`, `shop.html`, `product-details.html`,
`ingredients.html`, `ingredient-details.html`, `consultation.html`,
`certifications.html`, `services.html`, `service-details.html`,
`about.html`, `blog.html`, `blog-details.html`, `contact.html`,
`404.html`, `coming-soon.html`

**Documentation** (`documentation/`)
Installation, Customization, Page Structure, Credits, Changelog

**SEO**
`sitemap.xml`, `robots.txt`, per-page meta descriptions/canonical/OG/
Twitter tags, and JSON-LD (`LocalBusiness`, `Product`, `Article`,
`BreadcrumbList`, `Service`, `FAQPage`) where relevant.

## Notes

- All product prices, testimonials, team names, certification badges
  and blog posts are demo/placeholder content — see `LICENSE`.
- Forms are validation-ready (`data-validate`) but not wired to a
  backend; each has a `TODO` comment marking where to connect
  Formspree, Netlify Forms, a booking API, Mailchimp/ConvertKit, a
  payment provider, or Google Maps.
- No admin dashboard is included — this is a customer-facing
  storefront template only, as specified.
