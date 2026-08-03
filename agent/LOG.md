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
- 2026-08-03 — manual (direct request, not an autonomous run — the
  owner asked to build the whole remaining catalogue in one session
  rather than one specimen per run) — built Näyte 002 through 010.
  Added `Kaaos.rotate3D`, `Kaaos.compileGLProgram`, and
  `Kaaos.drawFullscreenQuad` to `assets/sim.js` as they became
  genuinely shared across the attractor and shader exhibits. Every
  specimen's invariant was actually measured (numbers and method in
  `agent/CATALOGUE.md` and on each placard), not asserted — in two
  cases the first assumed number was wrong and got corrected after
  verification: the Lyapunov exponent for 002 needed the Benettin
  renormalization method (a naive single-shot fit underestimates it
  due to an alignment transient), and 010's shader/CPU agreement was
  reported as 88/100 after actually measuring it, not the 96/100
  guessed initially — both corrections are recorded so a future run
  doesn't repeat either mistake. 010 surfaced two real environment
  bugs worth knowing about for any future WebGL exhibit (011 will hit
  the same class of issue): a one-time-render WebGL canvas needs
  `preserveDrawingBuffer: true` or the browser may clear it right
  after presenting; and `gl.readPixels` uses OpenGL's bottom-up Y
  convention, which is easy to double-flip against by mistake when
  cross-checking against a top-down 2D canvas or CPU calculation.
  011–014 remain planned. Stopped here (context/session boundary, not
  a natural stopping point in the catalogue) — next up is Näyte 011
  (Newton's fractal, same WebGL2-shader pattern as 010, so the two
  bugs above apply directly), then 012, 013, 014, then final
  integration (all `is-planned` grid cards gone, kartta cross-checked,
  full self-check pass, one commit or a PR per the normal run
  protocol).
- 2026-08-03 — manual (direct request, continuing the same
  owner-directed session as 002–010) — built Näyte 011 (Newton's
  fractal): WebGL2 fragment shader doing per-pixel complex Newton
  iteration for a selectable polynomial (z³−1, z⁴−1, z⁵−z), 60-step
  cap (quadratic convergence means most points settle in <20 steps;
  the rest are genuinely still on the chaotic boundary, not under-
  iterated), click-to-overlay twin CPU trajectories 1e-6 apart to make
  the boundary's sensitivity directly visible, and a committed PNG
  fallback for the default polynomial. Reused 010's
  `preserveDrawingBuffer`-before-first-draw and resize-before-draw
  fixes and the shared `Kaaos.compileGLProgram`/`drawFullscreenQuad`
  helpers verbatim — no new WebGL bugs surfaced this time. Verified
  shader/CPU agreement in an actual browser (served locally, gl.readPixels
  compared against the double-precision CPU model) rather than assumed:
  99/100, 96/100, 100/100 across the three polynomials, all above the
  95% target — a real measurement, not a guess, per the mistake noted
  in the 002–010 entry above. One environment note: `python3` was
  available for the fallback-PNG generation but neither `PIL`/Pillow
  nor `numpy` were installed, so the PNG encoder (raw zlib + manual
  IHDR/IDAT/IEND chunks) was hand-rolled rather than assumed available
  — worth knowing for 012's programmatically-drawn image. Integrated:
  `index.html` grid card swapped from `is-planned`, `CATALOGUE.md`
  updated. Next up: 012 (Arnold's cat map), then 013, 014, then final
  integration.
