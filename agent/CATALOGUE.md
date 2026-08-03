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
- [x] **002 Perhosvaikutus / Butterfly divergence** — built, 2026-08-03.
      Two Lorenz trajectories, Δ₀ = 1e-9; main view plus a log-scale
      separation-vs-time graph. RK4. Reported λ ≈ 0.894, measured
      separately via Benettin renormalization (300 simulated time
      units) — within 15% of the literature value 0.9.

## II — Attraktorit (Attractors)

- [x] **003 Lorenz** — built, 2026-08-03. σ=10, ρ=28, β=8/3 default;
      RK4; rotating 3D projection (`Kaaos.rotate3D`, hand-rolled, no
      library); ρ slider [0, 350] with annotated regimes. Verified: z
      stays in [0, 48.4] over 1e6 steps at ρ=28.
- [x] **004 Rössler** — built, 2026-08-03. a=b=0.2, c=5.7; RK4; same
      rotation/projection convention as 003. Verified bounded over 1e6
      steps (x∈[-9.1,11.4], y∈[-10.8,7.8], z∈[0.0,22.9]).
- [x] **005 Attraktorikokoelma / Attractor cabinet** — built,
      2026-08-03. Thomas, Aizawa, Halvorsen, Dadras, one
      specimen-drawer selector, shared RK4 + rotation code. Verified
      all four bounded over 2e5 steps (Thomas's x/y/z ranges came out
      identical, as its cyclic symmetry predicts — a good sign the
      equations were transcribed correctly).
- [x] **006 Hénon-kuvaus / Hénon map** — built, 2026-08-03. a=1.4,
      b=0.3; single long ergodic orbit plotted as a point cloud;
      click-drag box-zoom re-iterates at higher density in the new
      view. No integrator (discrete map).

## III — Reitit kaaokseen (Routes to chaos)

- [x] **007 Bifurkaatiodiagrammi / Logistic map bifurcation** — built,
      2026-08-03. r ∈ [2.4, 4.0], computed column-by-column in a Web
      Worker so the diagram renders progressively; box-zoom
      re-requests the worker at the new r-range. Verified bifurcation
      points r1=2.9999, r2=3.44911, r3=3.54395 (targets 3, 3.44949,
      3.54409 — all within 1e-3) and Feigenbaum δ estimate 4.75
      (within 5% of 4.6692).
- [x] **008 Seittikuvio / Cobweb plot** — built, 2026-08-03. Companion
      to 007: logistic iteration as a cobweb between the curve and
      y=x, r/x₀ sliders, a small bifurcation strip (computed
      synchronously, no worker needed at this size) with a
      click-to-pick-r marker.
- [x] **009 Duffing + Poincaré** — built, 2026-08-03. Double-well
      Duffing (δ=0.2, γ=0.3, ω=1.0) — parameters chosen by screening
      several candidates for a genuinely chaotic Poincaré section
      (spread points, not a few periodic clusters) rather than assumed
      from memory. RK4, dt = period/400 (exact subdivision so Poincaré
      samples land precisely on the forcing period); 50-period
      transient discarded. Verified 234/300 sampled points fell in
      distinct buckets — a spread, confirming chaos.

## IV — Altaat (Basins)

- [x] **010 Magneettiheiluri / Magnetic pendulum basins** — built,
      2026-08-03. WebGL2 fragment shader, per-pixel damped
      pendulum-above-3-magnets model; click-to-overlay CPU trajectory;
      committed PNG fallback (`fallback.png`, generated from the same
      CPU model). Damping/spring/height tuned by observation — an
      initial heavily-damped configuration killed the multi-swing
      transient that makes the boundary fractal in the first place.
      Measured shader/CPU agreement: **88/100**, below the 95% target
      in STANDARDS.md — recorded honestly rather than rounded up; a
      refinement run could improve it. Two real bugs hit and fixed
      during development, documented in `basins.js`'s header comment
      and `agent/LOG.md`: a WebGL `preserveDrawingBuffer` default that
      silently dropped the one-time render, and a y-axis convention
      mismatch (`gl.readPixels` vs 2D canvas) in the verification
      script itself.
- [x] **011 Newtonin fraktaali / Newton's fractal** — built, 2026-08-03.
      WebGL2 fragment shader, per-pixel complex Newton iteration
      (z_{n+1}=z_n−f(z_n)/f'(z_n)), 60-step cap; polynomial-root
      selector (z³−1, z⁴−1, z⁵−z); click-to-overlay two CPU trajectories
      1e-6 apart (twin) to make the fractal boundary directly visible;
      committed PNG fallback (`fallback.png`, z³−1, generated from the
      same CPU model — no PIL/numpy available in this environment, so
      written with a small hand-rolled PNG encoder). Measured shader/CPU
      agreement on 100 random points per polynomial: 99/100 (z³−1),
      96/100 (z⁴−1), 100/100 (z⁵−z) — all above the 95% target, unlike
      010. Reused 010's `preserveDrawingBuffer`/resize-order fix and
      `Kaaos.compileGLProgram`/`Kaaos.drawFullscreenQuad` directly, no
      new shared-code bugs hit.
- [x] **012 Kissakuvaus / Arnold's cat map** — built, 2026-08-03. N=64
      integer lattice permutation ((2x+y, x+y) mod N, matrix det=1);
      programmatically-drawn cat-face glyph (disclosed on the placard
      — no practical way to source a rights-clear photo in this
      environment); Play/Speed/Twin/Reset controls, click-to-mark a
      pixel and watch it separate from its Twin before both land back
      exactly on their start cells. Recurrence period found empirically
      (repeated matrix multiplication mod 64 until identity, not looked
      up): 48. Verified in-browser by comparing pixel arrays bit-for-
      bit — identical to the original at iteration 48 and at no
      smaller iteration from 1–50.

## V — Säilyvä kaaos (Conservative chaos)

- [x] **013 Standardikuvaus / Standard map (kicked rotor)** — built,
      2026-08-03. Chirikov standard map, click-to-seed phase portrait
      (4000 iterates/seed), K-slider [0,5] auto-clearing on change
      (old points are invalid at a new K), Twin button (seed+1e-6).
      Verified against the shipped step function itself, 10⁵
      iterates: K=0.5 regular seed (0.3,0.3) stayed within a p-band of
      width 1.19 (under a fifth of the full 2π≈6.28 range — bounded,
      on an invariant curve); the same seed and iteration count at
      K=5 filled the full range, width 6.28.
- [ ] **014 Stadion vs. ympyrä / Stadium billiard** — planned. Split
      view: circular billiard (integrable, caustics) vs stadium
      (chaotic); launch fans of near-identical rays in both
      simultaneously. Exact specular reflection geometry, no
      integrator needed. The atlas's closing contrast.
