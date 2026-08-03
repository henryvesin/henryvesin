# STANDARDS.md — Numerical standards & invariants

Checked every run. "Measured" means actually run the numbers — in the
browser, or a scratch harness — and report them; asserting a value
without computing it is the exact defect this file exists to prevent.

## 1. Integrators

- **RK4 minimum** for dissipative/forced ODEs (Lorenz, Rössler,
  Duffing, and anything else with damping or external forcing). Plain
  forward Euler is prohibited everywhere.
- **Symplectic / semi-implicit (or velocity Verlet) for conservative
  systems** — 001 (double pendulum), 013 (map, needs no integrator in
  the ODE sense), 014 (geometric, no integrator needed).
  - For systems with a **separable** Hamiltonian H=T(p)+V(q), explicit
    symplectic Euler (p-update then q-update, or vice versa) is fine
    and cheap.
  - For a **non-separable** Hamiltonian (kinetic energy depends on
    configuration, e.g. a configuration-dependent mass matrix — this
    is 001's situation), explicit symplectic Euler is **not**
    guaranteed symplectic and was empirically found to secularly drift
    on the double pendulum during development (see
    `nayte/001-kaksoisheiluri/pendulum.js`'s header comment). Use the
    **implicit midpoint rule** instead — unconditionally symplectic for
    any smooth Hamiltonian, separable or not — solved via a small
    fixed-point iteration (a handful of iterations converges for a
    reasonably small dt; check convergence, don't assume it).

## 2. Fixed timestep, decoupled from frame rate

Accumulator pattern in `assets/sim.js` (`Kaaos.fixedTimestepLoop`).
Physics always advances in fixed `dt` increments; a slow frame changes
how many steps happen before the next paint, never the trajectory.
Speed controls scale wall-clock time fed into the accumulator
(`loop.setTimeScale`), not the physics `dt` itself — changing `dt`
would change accuracy, not just playback speed.

## 3. Determinism

All randomness through `Kaaos.mulberry32` (seeded PRNG) in
`assets/sim.js`. A given seed + parameters reproduces the identical
run. Perturbation magnitudes are explicit named constants in the code
(and stated on the placard), not magic numbers.

## 4. Invariant checks, per exhibit, measured and reported in the PR

- **001**: relative energy drift < 10⁻⁶ over 60 simulated seconds
  (unforced, undamped — the double pendulum has no other mode).
  **Measured** (implicit midpoint, dt=5×10⁻⁵ s, 4 fixed-point
  iterations, from rest at θ=(2.0, 1.0) rad): final drift 1.3×10⁻⁸,
  peak drift over the full 60s 8.3×10⁻⁷. Re-measure if `DT`, `ITERS`,
  or the initial condition in `pendulum.js` ever change.
- 002: measured λ within ±15% of 0.9 for classic Lorenz parameters.
- 003–005: attractor bounding box matches published ranges (e.g.
  Lorenz z ∈ ~[0, 50]); trajectories bounded for 10⁶ steps.
- 006: iterates remain bounded from the standard basin; visual match
  to reference structure.
- 007: first three bifurcation points within 10⁻³ of r₁=3, r₂≈3.4495,
  r₃≈3.5441; δ estimate from branches within 5% of 4.669.
- 009: Poincaré section stationary in distribution after transient
  discard (first 50 periods dropped).
- 010–011: shader and CPU trajectory agree on final basin for ≥95% of
  100 random test points.
- 012: exact recurrence to the original image at the known period for
  the chosen image dimensions.
- 013: for K=0.5, seeded KAM orbits remain on invariant curves
  (bounded p-excursion) for 10⁵ iterates.
- 014: circle-billiard ray fan preserves caustic structure; energy
  (speed) exactly conserved in both tables.

## 5. Equations shown = code run

The MathML on the placard must state exactly the equations and
parameter values implemented, including the integrator name and dt.
Any mismatch is a defect. If the placard shows a different (but
mathematically equivalent) formulation than what's literally executed
— e.g. 001 shows the canonical Hamiltonian form because that's what's
actually integrated, even though the more commonly recognized
Lagrangian angular-acceleration form exists — say so in the
surrounding text, don't just show equations and hope they match.

## 6. Precision

Double precision on CPU. In shaders (single precision), cap iteration
counts/times to keep per-pixel error below basin-flipping thresholds
near boundaries — state the chosen cap in a code comment with
reasoning.
