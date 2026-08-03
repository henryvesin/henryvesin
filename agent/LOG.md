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
- 2026-08-03 — pivot (direct request, not an autonomous run) — the
  satirical-agency concept was fully replaced by the Chaos Atlas per
  `agent/SPEC.md` (the original satire spec is archived at
  `agent/SPEC-v1-satire.md`). Removed: `osastot/`, `tiedotteet/`,
  `nayttely/`, `assets/shared.js`, `assets/theme-switch.js`,
  `agent/CANON.md`, `agent/BACKLOG.md`. This entry exists so the run
  history stays continuous rather than silently disappearing.
- 2026-08-03 — bootstrap (run 0, Chaos Atlas) — new dark-field
  observatory design system (`assets/tokens.css`, `assets/base.css`),
  shared numerics (`assets/sim.js`: seeded RNG, generic RK4, fixed
  timestep loop, DPR-aware canvas setup), `index.html` specimen grid
  (14 slots, arc-grouped), `kartta/index.html` arc-map page, and
  Näyte 001 (Kaksoisheiluri) as the proof exhibit — implicit-midpoint
  symplectic integrator, measured energy drift 1.3e-8 (final) / 8.3e-7
  (peak) over 60 simulated seconds, ensemble/twin/perturb interactions,
  bilingual placard with MathML equations and a Havainto line. All
  `agent/` files rewritten for the new project (`AGENT.md`,
  `CATALOGUE.md`, `STANDARDS.md`). Next run: Specimen (Näyte 002,
  rotation position 1 of specimen/specimen/refinement).
