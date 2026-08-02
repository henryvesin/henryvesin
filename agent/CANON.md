# CANON.md — Fictional-universe facts

Append-only. Read every run. Never contradict an existing entry — if a
new idea would contradict canon, change the idea, not the canon. If a
canon fact is genuinely wrong (typo, inconsistency introduced by
mistake), correct it in place and note the correction inline rather than
leaving two contradictory facts.

## Founding & mandate

- Kaaostoimisto was established in **1949, by accident** (exact
  circumstances unspecified — never invent or reveal them; the mystery
  is the joke).
- Motto: *"Kaaos ei katoa. Se hallinnoidaan."* / "Chaos does not
  disappear. It is administered."
- Opening hours: **Ma–Pe 9:00–9:07** ("Poikkeukset ilmoitetaan
  poikkeuksellisesti, yleensä liian myöhään" / "Exceptions are announced
  exceptionally, usually too late").

## Design decisions (bootstrap run, 2026-08-01)

- **Bilingual pattern:** side-by-side blocks (Finnish then English),
  chosen over a JS toggle so content works without JS. Implemented as
  `.bilingual > .lang-block[lang]` in `assets/base.css`. This is
  permanent per spec — do not introduce a toggle later.
- **Palette:** paper `#f4f1ea`, ink `#1a1a18`, accent red `#b5342a`
  (seals/alerts/auctioned status), accent slate-blue `#4a5a66`
  (secondary structure/links/claimed status), rule-grey `#c9c3b5`
  (hairlines). Defined in `assets/tokens.css`; do not add new colors
  there without strong reason — the whole point is restraint.
- **Type:** system grotesk for body/headings, system monospace for
  specimen/form codes and tabular data.
- **Agency seal:** a circular stamp mark with the initials "KT", the one
  deliberate exception to the site's zero-border-radius rule. It appears
  in the masthead of every page.
- **Listing pages added beyond the original spec's file diagram:**
  `osastot/index.html` (department directory) and `nayttely/index.html`
  (exhibit gallery) exist so the front desk doesn't have to inline every
  department/exhibit as the caps (6/12) are approached. Keep both
  updated whenever a department or exhibit is added, removed, or
  replaced.

## Appearance switch — "Uusi ilme" (2026-08-02)

Added by direct request during a pair session (not an autonomous run),
so it isn't in `agent/LOG.md`'s run history in the usual sense, but it's
now permanent site structure and every future page must include it.

- Every page has a fixed top-right control (`.theme-switch`) offering
  two states: **Vakiomuoto · Standard** (default) and **Uusi ilme · New
  look**. In-fiction framing: the office was made to do the standard
  corporate "brand refresh" every institution eventually suffers, and
  it looks exactly like every other big-bold-black agency site — that
  resemblance is the joke, not a design failure to fix.
- Mechanism: clicking sets `data-theme="agency"` on `<html>` and
  persists the choice in `localStorage` (key `kaaos-theme`), read back
  via a small inline snippet in each page's `<head>` (before the
  stylesheet links) to avoid a flash of the wrong theme on load.
  Implemented in `assets/theme-switch.js`.
- **The alternate look is token values only** — `tokens.css` redefines
  the same custom properties under `:root[data-theme="agency"]` (black
  paper, white ink, brighter red/blue accents, a much larger type
  scale via `clamp()`, tight negative letter-spacing, uppercase
  headings). `base.css` needed only a handful of scoped
  `[data-theme="agency"]` rules beyond that (wordmark size, nav
  spacing, link-hover invert, border widths) — see the "Uusi ilme"
  section near the end of that file. Any new component should keep
  reading tokens rather than hardcoding colors, precisely so this kind
  of theme swap keeps working for free.
- `--color-vitrine` (always white, in both themes) was pulled out as
  its own token so the exhibit display-case background stays literal
  white on both the paper background and on black — a lit case in a
  dark gallery room under "Uusi ilme".
- Like the exhibit toys, the switch is JS-only and degrades by simply
  not appearing (`<noscript>` hides it) — the standard appearance is
  always the complete, functional default.
- On narrow viewports (`max-width: 30rem`) the switch drops
  `position: fixed` and renders as a normal full-width bar at the very
  top of `<body>` instead — there isn't room for a floating corner
  control next to the oversized "Uusi ilme" wordmark at phone widths.
- Every page must include, in this order: the inline `<head>` snippet
  right after `<meta charset>`, the `<noscript>` + `.theme-switch`
  markup as the first thing in `<body>` (before `.masthead`), and
  `<script src=".../assets/theme-switch.js"></script>` near the end of
  `<body>`. Copy an existing page's blocks exactly and fix the
  relative path depth — same convention as the hardcoded nav.

## Departments

### Sattumavarasto (Warehouse of Coincidences)
- Form number: **SV-12** ("Sattuman ilmoitus" / "Coincidence Report").
- Receives, classifies, and stores modest coincidences until claimed.
- Holds an **unannounced annual auction** of unclaimed coincidences —
  the date is deliberately never published in advance.
- Ledger entry IDs follow the pattern `SV-YYYY-###`.

## Exhibits

### Näyte 001 — Kaksoisheiluri (Double Pendulum)
- Registered **1962**, reclassified **1988** and **2011** (reclassify
  reasons unspecified — do not invent them unless a future bulletin
  needs the detail, in which case add it here first).
- Curatorial claim: fully deterministic, still unpredictable beyond a
  few seconds. "The office considers this exemplary."
- Interaction: visitors may drag either bob to disturb it; disturbance
  requires no permit.

## Bulletins

- **Tiedote 1/2026** (2026-08-01), "Arkisto avautuu yleisölle" — the
  agency's archive opens partially to the public after a **77-year**
  processing period (1949 founding → 2026 opening). This bulletin is
  the in-fiction narration of the site's real-world launch. Future
  bulletins may reference this opening as the point the public record
  begins, but should not re-explain it at length.

## Open motifs (available for future bulletins, not yet used)

Annual chaos statistics; renovation of the entropy archive; new form
numbers entering force; the agency's one elevator being "temporarily
deterministic"; recruitment notices for positions that cannot be
described.
