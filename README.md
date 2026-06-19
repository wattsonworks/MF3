# מיכל פיטנס סטודיו — Michal Fitness Studio

Awwwards-level marketing site for **Michal Fitness Studio**, a women's fitness studio in
Safed (קניון שערי העיר, הגדוד השלישי, צפת). Hebrew, RTL, mobile-first.

**v2 — "Atelier" redesign:** a single immersive long-scroll experience (Ethos-inspired, but
warmer and more feminine). Editorial fashion-meets-fitness — oversized Hebrew serif headlines,
Space Grotesk micro-labels, full-bleed photography, infinite marquee, a cursor-following class
hover-list, count-up stats, a full-screen overlay menu, and refined scroll motion.

## Structure
- `index.html` — the whole experience (hero · marquee · 01 הסטודיו · 02 השיעורים · stats · 03 מחירון · 04 גלריה · המלצות · 05 צרי קשר · footer)
- `assets/css/app.css` — design system + all sections
- `assets/js/app.js` — nav states, overlay menu, reveals, class hover-preview, count-up, parallax, lightbox
- `assets/img/` — 30 studio photos + logo + reviews
- `michal-fitness.vcf` — downloadable contact card

## Design tokens
- **Type:** Frank Ruhl Libre (Hebrew serif display) · Assistant (Hebrew body) · Space Grotesk (Latin labels/numbers)
- **Palette:** warm paper `#f7efe8` · deep wine `#2a141d` · brand rose `#e0467a` · gold `#d99f63`

## Business data
- Phone / WhatsApp: 054-344-9212 · Instagram @michal_fitness_studio · Facebook /m.r.f.077
- Booking: Boost app · Pricing (June-2026 flyer): single trial 50₪ · trial card 119₪ (3 entries / 2 weeks) · monthly 259/379/469/559/649/739₪ for 1–6×/week

## Deploy
GitHub Pages from `main` / root → https://wattsonworks.github.io/MF/
Rollback point for the previous multi-page version: tag `restore-pre-redesign-2026-06-19`.
