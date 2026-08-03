# KAAOSTOIMISTO.FI — Chaos Atlas Specification

*Specification for Claude Code. Build this system in full. The human reviews via pull requests only. This replaces the satirical-agency concept; architecture and operating model are inherited from the previous spec, content and quality standards are new.*

---

## 1. What this is

**Kaaostoimisto — kaaoksen havaintoarkisto** ("observation archive of chaos") is a static, visually striking atlas of chaotic systems at `kaaostoimisto.fi`. Each exhibit is a real, interactive, numerically honest simulation of a canonical chaotic system — Lorenz attractor, double pendulum, bifurcation diagrams, fractal basins — rendered with Canvas/WebGL, accompanied by a short, correct explanation of the mathematics.

This is **not** a joke site and **not** a physics course. It is a gallery: each system presented as a *specimen*, with a number, a calm placard, and an interaction that makes the defining property of chaos — sensitive dependence on initial conditions — directly visible.

The site is grown by an agent (Claude Code, invoked locally via `run.sh`), one exhibit per run, delivered as pull requests the owner merges after review. **No backend. No user data. No third-party requests.**

Design intent, in priority order:

1. **Correct.** The mathematics shown matches the code running. Integrators are appropriate to the system. Known invariants are verified (§7). A beautiful wrong simulation is a defect.
2. **The chaos must be *felt*.** Every exhibit includes at least one interaction demonstrating sensitivity: twin trajectories, perturbation on click, ensemble dissolution. Passive animation alone is insufficient.
3. **Zero maintenance.** Static files, GitHub Pages, no build step, no dependencies, no framework, no CDN.
4. **Finite scope.** The catalogue targets ~14 specimens (§6), then shifts permanently to refinement. This site converges to *done*.

---

## 2. Architecture

Identical to the previous spec's operating model; differences only where noted.

- **Hosting:** GitHub Pages, custom domain `kaaostoimisto.fi` (`CNAME` file), HTTPS enforced, Cloudflare DNS with A records to GitHub Pages IPs.
- **Stack:** plain HTML/CSS/JS. No npm, no build step, no frameworks, no external libraries — including no three.js and no KaTeX. Rendering:
  - **Canvas 2D** — default. Trajectories, pendulums, maps, diagrams.
  - **WebGL2, raw** — permitted *only* for per-pixel exhibits (basins of attraction, escape-time fractals) where every pixel is an independent computation. Shaders live inline in the exhibit's own file. If WebGL2 is unavailable, the exhibit shows a static pre-rendered PNG fallback (committed to the repo) with a note.
  - **Web Workers** — permitted for heavy CPU computation that would block the UI (progressive bifurcation rendering). Same-file or sibling-file worker, no external scripts.
  - **Mathematics display: native MathML.** Supported in all current browsers, zero dependencies. No LaTeX libraries.
- **Agent runtime:** `run.sh` → `claude -p` → reads `agent/AGENT.md` → performs one run → self-check → branch → PR via `gh`. Main is never pushed directly.

### Repository layout

```
/
├── CNAME
├── index.html                  # Atlas front page: specimen grid + arc navigation
├── assets/
│   ├── tokens.css              # Design tokens — single source of visual truth
│   ├── base.css                # Layout, typography, placard & control components
│   └── sim.js                  # Shared numerics: RK4, symplectic steppers, seeded RNG,
│                               #   fixed-timestep loop, DPR-aware canvas setup, pause-on-hidden
├── nayte/                      # Exhibits, one dir per specimen
│   └── NNN-<slug>/index.html   #   sim code inline or as sibling .js; shaders inline
│   └── NNN-<slug>/fallback.png #   only for WebGL exhibits
├── kartta/index.html           # "The map": one page explaining the conceptual arc (§3)
├── agent/
│   ├── AGENT.md                # Condensed operating manual (written at bootstrap from this spec)
│   ├── CATALOGUE.md            # The specimen list with status: planned / built / refined
│   ├── STANDARDS.md            # Numerical standards & invariant table (from §7) — checked every run
│   └── LOG.md                  # One line per run, append-only
└── README.md                   # Owner-facing: run.sh usage, DNS/Pages checklist
```

`sim.js` exists because integrators and the timestep loop are the highest-risk code and must be written once, tested once, and reused — not re-derived per exhibit.

---

## 3. Content concept and pedagogical arc

The atlas is ordered as a quiet progression. Navigation presents specimens in arc order; each placard states, in two or three sentences per language, (a) what the system is, (b) what to do, (c) what to notice. Finnish primary, English secondary, same fixed pattern on every page.

**The arc:**

1. **Herkkyys (Sensitivity)** — chaos as divergence of nearby states. The entry experience.
2. **Attraktorit (Attractors)** — bounded motion that never repeats; strange attractors as the shape of chaos.
3. **Reitit kaaokseen (Routes to chaos)** — period doubling, bifurcation; order and chaos interleaved in parameter space.
4. **Altaat (Basins)** — deterministic outcomes with fractal boundaries; unpredictability without noise.
5. **Säilyvä kaaos (Conservative chaos)** — chaos without attractors; mixed phase space, KAM islands.

**Placard register:** precise, spare, museum-neutral. Specimen numbers (Näyte 001…) and the faint institutional flavor of the domain name are retained as *aesthetic*, not as fiction — no invented agency lore, no jokes, no fourth wall to break. Real science, real names (Lorenz, Hénon, Feigenbaum), correct attributions.

Every placard ends with one line under the heading **"Havainto"** (Observation): the single most important thing the visitor should witness — e.g. *"Kaksi rataa, alussa 10⁻⁹ päässä toisistaan, ovat 30 sekunnin kuluttua eri puolilla attraktoria."*

---

## 4. Visual design system

- **Direction: dark-field observatory.** Near-black background, luminous trajectories (additive blending / low-alpha trails), thin light-gray chrome, generous space. The severity of the frame against the organic glow of the simulation is the identity — inherited from the previous concept's "chaos inside frames" rule.
- `tokens.css`: background and chrome neutrals, **one accent per arc section** (5 accents max, low-saturation), monospace-forward system font stack, type scale, spacing scale, control styling (sliders, buttons, readouts share one look).
- **Controls are instruments, not toys:** every exhibit gets the same control strip — parameter sliders with numeric readouts, *Perturb* (apply 10⁻⁹-scale kick), *Twin* (toggle ghost trajectory), *Reset*, and where relevant *Speed*. Uniformity across exhibits is mandatory; it is what makes the atlas feel curated.
- Full-viewport-width canvases on mobile, `devicePixelRatio`-aware rendering, target 60 fps with graceful degradation (reduce particle/segment counts, never reduce timestep accuracy).
- `prefers-reduced-motion`: simulations start paused with a visible play control; no autoplay.
- Accessibility: placard content is semantic HTML and fully readable without JS or WebGL; canvases carry meaningful `aria-label`s.

---

## 5. Run protocol

Inherited from the previous spec with these changes:

**Run types:**
1. **Specimen run** — build the next planned exhibit from CATALOGUE.md, in arc order.
2. **Refinement run** — improve an existing exhibit: performance, explanation clarity, control feel, mobile behavior, visual polish. From catalogue completion onward, all runs are refinement runs.
3. **Foundation run** — only when needed: changes to `sim.js`, tokens, or shared components. Requires regression pass over *all* exhibits that consume the changed code (§8, checked via the self-check of each affected page).

Default rotation while the catalogue is open: specimen, specimen, refinement, repeat. **One artifact per run. PRs only.** PR description must include the §7 invariant results as measured numbers, not checkmarks.

**Bootstrap (run 0):** repo structure, `CNAME`, tokens + base CSS, `sim.js` with tested RK4 + semi-implicit/symplectic steppers + seeded RNG + fixed-timestep loop, `index.html` grid, `kartta` arc page, `agent/` files (AGENT.md distilled from §3–§8, CATALOGUE.md seeded from §6, STANDARDS.md from §7), README.md with owner setup checklist, and **Näyte 001** as the proof exhibit.

**`run.sh`:** unchanged from the previous spec — pull, clean-tree check, invoke Claude Code headless with an execute-one-run instruction and optional type override, print PR URL. No scheduling.

---

## 6. The catalogue (seed for `agent/CATALOGUE.md`)

Fourteen specimens. Per-specimen notes: system, method, renderer, and its defining interaction. Order = build order = arc order.

**I — Herkkyys**
- **001 Kaksoisheiluri / Double pendulum.** Equations of motion via Lagrangian form; velocity-Verlet or RK4 at fixed dt with energy monitoring. Canvas 2D. *Defining interaction:* **ensemble mode** — release 100 pendulums differing by 10⁻⁷ rad as one apparent pendulum; watch them dissolve into a cloud. Trail rendering with fading alpha.
- **002 Perhosvaikutus / Butterfly divergence.** Two Lorenz trajectories, Δ₀ = 10⁻⁹; main view plus a log-scale separation-vs-time graph whose slope *is* the largest Lyapunov exponent (annotate λ ≈ 0.9 for classic parameters). Canvas 2D. The atlas's conceptual anchor.

**II — Attraktorit**
- **003 Lorenz.** σ=10, ρ=28, β=8/3 default; RK4; rotating 3D projection (hand-rolled matrix, no library), additive trails. Sliders for ρ across [0, 350] with annotated regimes (fixed points → chaos → periodic windows).
- **004 Rössler.** Same treatment; placard contrasts its single-scroll funnel with Lorenz's two lobes.
- **005 Attraktorikokoelma / Attractor cabinet.** Thomas, Aizawa, Halvorsen, Dadras in one exhibit with a specimen-drawer selector. Shared integrator/projection code from 003.
- **006 Hénon-kuvaus / Hénon map.** Discrete map, a=1.4 b=0.3; point-cloud accumulation revealing fractal banding; box-zoom into self-similar structure.

**III — Reitit kaaokseen**
- **007 Bifurkaatiodiagrammi / Logistic map bifurcation.** r ∈ [2.4, 4.0], progressive rendering in a Web Worker, smooth box-zoom re-rendering at full precision. Annotated period-doubling cascade; Feigenbaum δ ≈ 4.6692 noted and *visible* by measuring successive branch spacings on zoom.
- **008 Seittikuvio / Cobweb plot.** Companion to 007: logistic iteration as cobweb, r-slider synchronized to a mini bifurcation strip; shows *why* the diagram looks as it does.
- **009 Duffing + Poincaré.** Forced Duffing oscillator; left: phase trajectory; right: stroboscopic Poincaré section accumulating the strange attractor point by point. RK4, fixed dt locked to forcing period subdivisions.

**IV — Altaat**
- **010 Magneettiheiluri / Magnetic pendulum basins.** Per-pixel: final magnet (3 magnets, colored) as function of release point. WebGL2 fragment shader integrating per pixel; click any point to overlay the actual trajectory (CPU, Canvas overlay). Fractal basin boundary is the exhibit.
- **011 Newtonin fraktaali / Newton's fractal.** z³−1 basins via shader; polynomial-root selector (z³−1, z⁴−1, z⁵−z). Placard: fractal boundaries from a *root-finding algorithm* — chaos in deterministic computation.
- **012 Kissakuvaus / Arnold's cat map.** A raster image (a committed photo of a cat, owned/public-domain) scrambled by the map, iterated stepwise: apparent noise, then exact recurrence. Canvas 2D. Placard: mixing, determinism, and recurrence.

**V — Säilyvä kaaos**
- **013 Standardikuvaus / Standard map (kicked rotor).** Phase portrait: click to seed orbits, K-slider sweeping KAM tori → mixed phase space → global chaos. Canvas 2D, thousands of iterates per seed.
- **014 Stadion vs. ympyrä / Stadium billiard.** Split view: circular billiard (integrable, caustics) vs stadium (chaotic); launch fans of near-identical rays in both simultaneously. Exact specular reflection geometry, no integrator needed. The atlas's closing contrast: same rules, one shape orderly, one chaotic.

Catalogue is closed at 14. Additions require the owner to edit CATALOGUE.md by hand; the agent never expands it.

---

## 7. Numerical standards (seed for `agent/STANDARDS.md`)

1. **Integrators:** RK4 minimum for dissipative ODEs; symplectic/semi-implicit (or velocity Verlet) for conservative systems (001, 013 is a map, 014 is geometric). Plain forward Euler is prohibited everywhere.
2. **Fixed timestep, decoupled from frame rate.** Accumulator pattern in `sim.js`; rendering interpolates. Frame-rate drops must never change trajectories.
3. **Determinism:** all randomness through the seeded RNG in `sim.js`; a given seed + parameters reproduces the identical run. Perturbation magnitudes are explicit named constants shown in the UI.
4. **Invariant checks, per exhibit, measured and reported in the PR:**
   - 001: relative energy drift < 10⁻⁶ over 60 simulated seconds (unforced, undamped mode).
   - 002: measured λ within ±15 % of 0.9 for classic Lorenz parameters.
   - 003–005: attractor bounding box matches published ranges (e.g. Lorenz z ∈ ~[0, 50]); trajectories bounded for 10⁶ steps.
   - 006: iterates remain bounded from the standard basin; visual match to reference structure.
   - 007: first three bifurcation points within 10⁻³ of r₁=3, r₂≈3.4495, r₃≈3.5441; δ estimate from branches within 5 % of 4.669.
   - 009: Poincaré section stationary in distribution after transient discard (first 50 periods dropped).
   - 010–011: shader and CPU trajectory agree on final basin for ≥ 95 % of 100 random test points.
   - 012: exact recurrence to the original image at the known period for the chosen image dimensions.
   - 013: for K=0.5, seeded KAM orbits remain on invariant curves (bounded p-excursion) for 10⁵ iterates.
   - 014: circle-billiard ray fan preserves caustic structure; energy (speed) exactly conserved in both tables.
5. **Equations shown = code run.** The MathML on the placard must state exactly the equations and parameter values implemented, including the integrator name and dt. Any mismatch is a defect.
6. **Precision:** double precision on CPU. In shaders (single precision), cap iteration counts/times to keep per-pixel error below basin-flipping thresholds near boundaries — state the chosen cap in a code comment with reasoning.

---

## 8. Self-check (before every PR)

- [ ] §7 invariants for the touched exhibit(s) measured; numbers in the PR description.
- [ ] Foundation runs only: every exhibit consuming changed shared code re-verified (its invariants re-measured).
- [ ] Fixed-dt loop from `sim.js` used; no per-exhibit reimplementation of integration or timing.
- [ ] Placard readable without JS/WebGL; WebGL exhibits have committed PNG fallback; canvases have `aria-label`s.
- [ ] `prefers-reduced-motion`: paused start honored.
- [ ] Only `tokens.css` variables for color/type; control strip uses the shared component classes.
- [ ] Both languages present in the fixed pattern; "Havainto" line present.
- [ ] Page weight < 500 KB including fallback image; zero external requests; works offline once loaded.
- [ ] 60 fps on a mid-range laptop at default settings (measure with a 10 s rAF sample; report the number).
- [ ] Internal links resolve; index grid and kartta page updated; LOG.md and CATALOGUE.md updated.

---

## 9. Hard limits

1. **No backend, no analytics, no cookies, no third-party requests, no CDN assets, no external fonts.** Everything served from the repo; the site works fully offline.
2. **No libraries.** No three.js, no KaTeX, no d3. Native Canvas 2D, raw WebGL2, native MathML, hand-rolled math. (This is a correctness measure as much as a dependency measure: all numerics live in reviewable repo code.)
3. **No user input reaches any AI; the agent runs only via `run.sh`.** Interactivity is purely client-side simulation control.
4. **No secrets in the repo, ever.**
5. **One artifact per run; PRs only; main never pushed directly.**
6. **The catalogue is closed** (§6). The agent may refine forever but never adds specimen 015 on its own.
7. **Scientific integrity:** no invented physics, no decorative fake mathematics, correct attributions. If a simplification is made (e.g. small-angle anywhere, projection choices), the placard says so.

---

## 10. Cost profile

Infrastructure €0 (Pages + Cloudflare DNS + owned domain). Claude Code usage per run is the only cost. Specimen runs are heavier than the satire site's runs (real numerics + self-verification), but the catalogue is finite: after ~20 runs the site is complete and drops to occasional cheap refinement. Total lifetime cost is bounded by design.

---

*End of specification. Bootstrap per §5 run 0; Näyte 001 is the proof that the standards in §7 are actually enforceable before the rest of the catalogue proceeds.*
