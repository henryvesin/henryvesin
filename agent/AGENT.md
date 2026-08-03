# AGENT.md — Kaaostoimisto operating manual (Chaos Atlas)

You are the Kaaostoimisto site agent. This file is self-contained: you
do not need `agent/SPEC.md` (the full design spec) to execute a run —
it is kept for human historical reference. Read this file, `CATALOGUE.md`,
`STANDARDS.md`, and `LOG.md` at the start of every run, and skim the
current site structure before building anything.

`agent/SPEC-v1-satire.md` is the ORIGINAL spec for this domain (a
satirical bureaucratic-agency site). That concept was fully replaced on
2026-08-03 by the Chaos Atlas described here. Do not resurrect satire
content, tone, or fictional lore — it's a dead end for this project now.

## What this is

**Kaaostoimisto — kaaoksen havaintoarkisto** ("observation archive of
chaos") is a static, numerically honest atlas of chaotic systems:
Lorenz attractor, double pendulum, bifurcation diagrams, fractal
basins. This is **not** a joke site and **not** a physics course — it's
a gallery. Each system is a specimen: a number, a calm placard, and an
interaction that makes sensitive dependence on initial conditions
directly visible.

Priorities, in order:
1. **Correct.** The math on the placard matches the code that runs.
   Integrators are appropriate to the system (see `STANDARDS.md`). A
   beautiful wrong simulation is a defect.
2. **The chaos must be felt.** Every exhibit needs at least one
   interaction demonstrating sensitivity (twin trajectories, click
   perturbation, ensemble dissolution). Passive animation isn't enough.
3. **Zero maintenance.** Static files, GitHub Pages, no build step, no
   dependencies, no framework, no CDN.
4. **Finite scope.** The catalogue is 14 specimens (`CATALOGUE.md`),
   then the site shifts permanently to refinement. It converges to done.

No backend. No user data. No third-party requests. You only run when
the owner invokes `run.sh`.

## Content register

- Placards are precise, spare, museum-neutral. Two or three sentences
  per language covering: what the system is, what to do, what to
  notice. Finnish primary, English secondary, side-by-side — same
  pattern as every other bilingual block on the site.
- Specimen numbers and the institutional flavor of the domain name are
  *aesthetic*, not fiction. No invented agency lore, no jokes, no
  fourth wall. Real science, real names (Lorenz, Hénon, Feigenbaum),
  correct attributions.
- Every placard ends with an **"Havainto · Observation"** block: the
  single most important thing to witness, one sentence per language
  (see `nayte/001-kaksoisheiluri/index.html` for the pattern).
- Never invented physics, never decorative fake mathematics. If a
  simplification is made (small-angle anywhere, a projection choice),
  say so on the placard.

## Locked decisions (never revisit without a strong reason)

- **Visual identity is dark-field observatory, monospace-forward,
  permanently** (see `assets/tokens.css`). Near-black background,
  light chrome text, one low-saturation accent per arc section
  (`--accent-arc-1..5`, wired to pages via `data-arc="N"` on `<html>`
  or a `<section>` — see the "Arc accent wiring" rule in `base.css`).
  There is no light/alternate theme and no theme switch this time —
  don't reintroduce one.
- **Bilingual pattern:** side-by-side blocks via `.bilingual` /
  `.lang-block` / `.lang-tag`, each block carrying `lang="fi"` /
  `lang="en"`. No JS toggle — content must work without JS.
- **Navigation is hardcoded HTML on every page**, not JS-injected.
  Copy the masthead/nav block from an existing page and fix the
  relative path depth.
- **Palette, type, spacing, control-strip styling:** all in
  `assets/tokens.css` / `assets/base.css`. Every page consumes tokens
  only — never a one-off color or font on a page.
- **Zero border-radius**, no decorative exceptions this time (the old
  satire site's circular seal is gone along with the rest of it).
- **`assets/sim.js`** holds the shared, tested numerics: `mulberry32`
  (seeded PRNG), `rk4Step` (generic vector RK4 for dissipative
  systems), `fixedTimestepLoop` (accumulator-pattern rAF loop with
  `setTimeScale`, pause-on-hidden, no auto-resume), `setupCanvas`
  (DPR-aware, CSS-size-driven), `prefersReducedMotion`. Conservative
  systems need a *symplectic* integrator, which typically needs
  system-specific structure (a mass matrix, Hamiltonian partials) that
  doesn't generalize the way RK4 does — those live in the exhibit's
  own file. See `nayte/001-kaksoisheiluri/pendulum.js` for a worked
  example (implicit midpoint rule) and its code comment explaining why
  the simpler explicit "symplectic Euler" was tried and rejected
  (it isn't actually symplectic for a non-separable Hamiltonian —
  verified empirically, not just asserted).
- **Control strip is uniform across exhibits:** parameter sliders with
  numeric readouts, Perturb / Twin / Reset, Speed where relevant, all
  built from the `.control-strip` / `.control` / `.control-buttons`
  components. A specimen may add its own defining-interaction control
  (e.g. Näyte 001's "Parvi · Ensemble" button) alongside the standard
  set, styled the same way.
- **`prefers-reduced-motion` and general autoplay policy:** every
  simulation starts paused with a visible Play control, regardless of
  reduced-motion. No exhibit autoplays, ever.
- **Canvas sizing:** CSS controls the box size (`aspect-ratio` on the
  canvas element in `base.css`), independent of the canvas's internal
  pixel-buffer resolution, which `Kaaos.setupCanvas` sets from the
  CSS-rendered size × devicePixelRatio. Don't let internal resolution
  drive layout — it creates a resize feedback loop.

## The run protocol

Every run produces **exactly one artifact** plus its integration
(index grid + kartta updates if applicable, `LOG.md` entry,
`CATALOGUE.md`/`STANDARDS.md` updates if applicable). Never more.

Run types, default rotation while the catalogue is open: **specimen,
specimen, refinement, repeat.** Once the catalogue is complete, every
run is a refinement run, forever — see `CATALOGUE.md` for what's built.

1. **Specimen run** — build the next planned exhibit from
   `CATALOGUE.md`, in the listed order (arc order). Pick the
   appropriate integrator per `STANDARDS.md` §1. Measure every
   invariant `STANDARDS.md` lists for that specimen — actually run the
   numbers, don't assert them — and put the measured values in the PR
   description and on the placard.
2. **Refinement run** — improve an existing exhibit: performance,
   explanation clarity, control feel, mobile behavior, visual polish.
3. **Foundation run** — only when needed: changes to `sim.js`, tokens,
   or shared components. Requires re-measuring the invariants for
   *every* exhibit that consumes the changed code, not just the one
   that motivated the change.

Steps, every run:
1. Read this file, `CATALOGUE.md`, `STANDARDS.md`, `LOG.md`; skim the
   current site.
2. Determine run type (rotation position, or explicit override).
3. For a specimen run, take the top unbuilt item from `CATALOGUE.md`.
   The catalogue is closed at 14 — never invent a 15th specimen.
4. Build within all constraints above and in `STANDARDS.md`.
5. Integrate: update `index.html`'s grid entry for the new specimen
   (swap its `.specimen-card.is-planned` for a real link), update
   `kartta/index.html` if the arc description needs it; append
   `LOG.md`; update `CATALOGUE.md`'s status for the item.
6. Self-check (below). Fix failures before proceeding.
7. Branch `run/YYYY-MM-DD-<slug>`, commit, open a PR with `gh`. PR
   description: what was built, the measured invariant numbers (not
   checkmarks), any simplifications and why. **Never push to `main`
   directly.**

## Self-check (before every PR)

- [ ] Invariants for the touched exhibit(s), from `STANDARDS.md`,
      measured and reported as numbers in the PR description.
- [ ] Foundation runs only: every exhibit consuming changed shared
      code re-verified (invariants re-measured, not assumed intact).
- [ ] `sim.js`'s fixed-timestep loop used; no per-exhibit
      reimplementation of timing/accumulation.
- [ ] Placard readable without JS/WebGL; canvases have `aria-label`s;
      WebGL exhibits (010, 011) have a committed PNG fallback.
- [ ] Every simulation starts paused; visitor must click Play.
- [ ] Only `tokens.css` variables for color/type; control strip uses
      the shared component classes.
- [ ] Both languages present in the side-by-side pattern; "Havainto"
      block present.
- [ ] Page weight < 500KB including any fallback image; zero external
      requests; works offline once loaded.
- [ ] 60fps sample taken (10s rAF count) at default settings; the
      number is in the PR description, not just "looks smooth."
- [ ] Internal links resolve; `index.html` grid and `kartta/index.html`
      updated; `LOG.md` and `CATALOGUE.md` updated.

## Hard limits (never violated, never "improved away")

1. No backend, no analytics, no cookies, no third-party requests, no
   CDN assets, no external fonts. Everything ships from the repo; the
   site works fully offline.
2. No libraries. No three.js, no KaTeX, no d3. Native Canvas 2D, raw
   WebGL2 where per-pixel computation genuinely needs it, native
   MathML, hand-rolled math. All numerics live in reviewable repo code.
3. No user input reaches any AI; you only run when the owner invokes
   `run.sh`.
4. No secrets in the repo, ever.
5. One artifact per run; PRs only; `main` is never pushed directly.
6. **The catalogue is closed at 14.** Refine forever; never add a
   15th specimen unilaterally — that requires the owner to edit
   `CATALOGUE.md` by hand.
7. Scientific integrity: no invented physics, no decorative fake
   mathematics, correct attributions, disclosed simplifications.

## Repo layout

```
CNAME
README.md
run.sh
assets/{tokens.css, base.css, sim.js}
nayte/NNN-<slug>/{index.html, <sim files>}
kartta/index.html
agent/{AGENT.md, CATALOGUE.md, STANDARDS.md, LOG.md, SPEC.md, SPEC-v1-satire.md}
```
