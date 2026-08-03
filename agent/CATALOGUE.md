# CATALOGUE.md — The specimen list

Closed at 14. Order = build order = arc order. The agent picks the top
`planned` item for a specimen run and never adds a 15th item on its
own — that requires the owner to edit this file by hand.

Status values: `built` (shipped, in `nayte/`), `planned` (not yet
built). Update the status and add the ship date when a specimen run
completes.

## I — Herkkyys (Sensitivity)

- [x] **001 Kaksoisheiluri / Double pendulum** — built, 2026-08-03.
      Equations of motion via Lagrangian/Hamiltonian form; implicit
      midpoint rule at fixed dt with energy monitoring. Canvas 2D.
      Defining interaction: **ensemble mode** — 100 pendulums differing
      by 1e-7 rad, released as one apparent pendulum, dissolving into a
      cloud. Trail rendering with additive blending and fading alpha.
- [ ] **002 Perhosvaikutus / Butterfly divergence** — planned. Two
      Lorenz trajectories, Δ₀ = 10⁻⁹; main view plus a log-scale
      separation-vs-time graph whose slope *is* the largest Lyapunov
      exponent (annotate λ ≈ 0.9 for classic parameters). Canvas 2D.
      The atlas's conceptual anchor.

## II — Attraktorit (Attractors)

- [ ] **003 Lorenz** — planned. σ=10, ρ=28, β=8/3 default; RK4;
      rotating 3D projection (hand-rolled matrix, no library),
      additive trails. Sliders for ρ across [0, 350] with annotated
      regimes (fixed points → chaos → periodic windows).
- [ ] **004 Rössler** — planned. Same treatment as 003; placard
      contrasts its single-scroll funnel with Lorenz's two lobes.
- [ ] **005 Attraktorikokoelma / Attractor cabinet** — planned. Thomas,
      Aizawa, Halvorsen, Dadras in one exhibit with a specimen-drawer
      selector. Shares integrator/projection code from 003.
- [ ] **006 Hénon-kuvaus / Hénon map** — planned. Discrete map, a=1.4
      b=0.3; point-cloud accumulation revealing fractal banding;
      box-zoom into self-similar structure.

## III — Reitit kaaokseen (Routes to chaos)

- [ ] **007 Bifurkaatiodiagrammi / Logistic map bifurcation** —
      planned. r ∈ [2.4, 4.0], progressive rendering in a Web Worker,
      smooth box-zoom re-rendering at full precision. Annotated
      period-doubling cascade; Feigenbaum δ ≈ 4.6692 noted and
      *visible* by measuring successive branch spacings on zoom.
- [ ] **008 Seittikuvio / Cobweb plot** — planned. Companion to 007:
      logistic iteration as cobweb, r-slider synchronized to a mini
      bifurcation strip; shows *why* the diagram looks as it does.
- [ ] **009 Duffing + Poincaré** — planned. Forced Duffing oscillator;
      left: phase trajectory; right: stroboscopic Poincaré section
      accumulating the strange attractor point by point. RK4, fixed dt
      locked to forcing period subdivisions.

## IV — Altaat (Basins)

- [ ] **010 Magneettiheiluri / Magnetic pendulum basins** — planned.
      Per-pixel: final magnet (3 magnets, colored) as function of
      release point. WebGL2 fragment shader integrating per pixel;
      click any point to overlay the actual trajectory (CPU, Canvas
      overlay). Needs a committed PNG fallback.
- [ ] **011 Newtonin fraktaali / Newton's fractal** — planned. z³−1
      basins via shader; polynomial-root selector (z³−1, z⁴−1, z⁵−z).
      Needs a committed PNG fallback.
- [ ] **012 Kissakuvaus / Arnold's cat map** — planned. A raster image
      (a committed photo, owned/public-domain) scrambled by the map,
      iterated stepwise: apparent noise, then exact recurrence. Canvas
      2D. Placard: mixing, determinism, and recurrence.

## V — Säilyvä kaaos (Conservative chaos)

- [ ] **013 Standardikuvaus / Standard map (kicked rotor)** — planned.
      Phase portrait: click to seed orbits, K-slider sweeping KAM tori
      → mixed phase space → global chaos. Canvas 2D, thousands of
      iterates per seed.
- [ ] **014 Stadion vs. ympyrä / Stadium billiard** — planned. Split
      view: circular billiard (integrable, caustics) vs stadium
      (chaotic); launch fans of near-identical rays in both
      simultaneously. Exact specular reflection geometry, no
      integrator needed. The atlas's closing contrast.
