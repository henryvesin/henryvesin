# LOG.md — Run history

Append-only. One line per run: date, type, what was made.

- 2026-08-01 — bootstrap (run 0) — created repo scaffold, design system
  (`assets/tokens.css`, `assets/base.css`, `assets/shared.js`), front
  desk, department directory + seed department (Sattumavarasto), exhibit
  gallery + seed exhibit (Näyte 001 — Kaksoisheiluri), bulletin archive +
  inaugural bulletin (Tiedote 1/2026), and all `agent/` operating files.
  Next run: Exhibit (rotation position 1).
- 2026-08-02 — manual (direct request, not an autonomous run) — added
  the site-wide "Uusi ilme" appearance switch: `assets/theme-switch.js`,
  agency-theme token overrides in `assets/tokens.css`, the
  `.theme-switch` component and scoped overrides in `assets/base.css`,
  and the required markup/script includes on all existing pages. See
  `agent/CANON.md`'s "Appearance switch" entry for the full contract.
  Does not change the run rotation — next autonomous run is still
  Exhibit (rotation position 1).
