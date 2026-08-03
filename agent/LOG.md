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
- 2026-08-03 — manual (direct request, continuing the same session;
  owner said to stop waiting for a push after each specimen and push
  everything once at the end) — built Näyte 012 (Arnold's cat map):
  N=64 integer-lattice permutation, no floating point anywhere, so the
  recurrence invariant is bit-exact rather than approximate. Found the
  period empirically (matrix [[2,1],[1,1]] to successive powers mod 64
  until the identity, per CATALOGUE.md's explicit instruction not to
  look it up) — 48 — then verified separately in-browser by diffing
  the actual pixel arrays: identical to the original at iteration 48,
  and at no smaller iteration checked from 1 through 50. Image is a
  small programmatically-drawn cat face (canvas primitives), disclosed
  on the placard as a substitution for a sourced photo, per spec. Reused
  `Kaaos.fixedTimestepLoop` for the Play control the same way Näyte
  006 does (dt = seconds per map-iteration rather than a physics dt);
  confirmed the shared pause-on-tab-hidden behavior actually fires
  (observed the loop auto-pause when the browser tab used for testing
  wasn't frontmost) rather than assuming the shared code path works.
  `index.html` grid card and `CATALOGUE.md` updated. Next up: 013
  (standard map), 014 (stadium billiard), then final integration.
- 2026-08-03 — manual (direct request, same session) — built Näyte 013
  (Chirikov standard map / kicked rotor): click-to-seed phase portrait,
  K-slider [0,5], Twin button. K changes auto-clear the canvas — old
  points were computed at the previous K and would silently mislabel
  the picture otherwise. Verified the STANDARDS.md invariant against
  this file's own step function (not a separate offline model): at
  K=0.5 a regular seed (0.3,0.3) stayed within a p-band of width 1.19
  over 10^5 iterates (under a fifth of the full 2π≈6.28 range), while
  the identical seed and iteration count at K=5 filled the entire
  range (width 6.28) — confirmed directly in-browser, matching an
  independent offline check to 6 significant figures. Visually
  confirmed the classic standard-map structure at both K values
  (smooth KAM curves at K=0.5; a scattered chaotic sea with one
  surviving stability island at K=2.5). `index.html` grid card and
  `CATALOGUE.md` updated. Next up: 014 (stadium billiard), then final
  integration.
- 2026-08-03 — manual (direct request, same session) — built Näyte 014
  (stadium vs. circle billiard), the atlas's closing specimen: exact
  specular reflection (closed-form line/circle intersection, no
  integrator anywhere), a one-click fan of 15 near-identical rays
  launched simultaneously into both tables. While developing the
  circular-table reflection, hit and fixed a real bug worth recording:
  normalizing the wall normal at a circular boundary by the *assumed*
  radius (point/R) instead of the collision point's own *measured*
  length (point/|point|) fed a slightly non-unit normal into the
  reflection formula — which only preserves vector length for an
  exactly-unit normal — and the resulting error compounded roughly 16×
  per bounce, reaching NaN within about 15 bounces. Caught by actually
  running the invariant check over many bounces rather than a handful;
  fixed by normalizing by the point's own length everywhere a boundary
  normal is computed (documented at the top of `billiards.js`). After
  the fix, verified in-browser against the shipped functions: speed
  conserved to ~10⁻¹⁴ over 2000–3000 bounces in both tables, and the
  circle's caustic distance constant to 5×10⁻¹⁵ over 2000 bounces.
  `index.html` grid card and `CATALOGUE.md` updated — this was the
  last planned specimen; `CATALOGUE.md` now shows all 14 built. Next:
  final integration (kartta cross-check, full self-check across all
  14, final commit).
