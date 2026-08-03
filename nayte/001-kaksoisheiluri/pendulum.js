/*
  Näyte 001 — Kaksoisheiluri (Double Pendulum)

  Integrator: implicit midpoint rule, in canonical (theta, p) coordinates
  (p = generalized momentum, not angular velocity). Implicit midpoint is
  unconditionally symplectic for ANY smooth Hamiltonian — including this
  one, whose mass matrix depends on configuration (theta1-theta2), which
  makes the Hamiltonian non-separable and rules out the simpler explicit
  "symplectic Euler" scheme (verified empirically during development:
  explicit symplectic Euler showed monotonic secular energy drift on
  this system — the signature of a scheme that isn't actually symplectic
  for a non-separable H — implicit midpoint does not).

  dt = 5e-5 s, 4 fixed-point iterations per step, same for every mode
  (single/twin/ensemble). Measured over 60 simulated seconds from rest
  at theta=(2.0, 1.0) rad: relative energy drift 1.3e-8 (final), 8.3e-7
  (peak) — both under the 1e-6 target in agent/STANDARDS.md. See
  agent/LOG.md for the full verification run.
*/

(function () {
  "use strict";

  var canvas = document.getElementById("pendulum-canvas");
  var hint = document.getElementById("interaction-hint");
  var setup = Kaaos.setupCanvas(canvas);
  var ctx = setup.ctx;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  var colorBg = cssVar("--color-bg") || "#08090b";
  var colorChrome = cssVar("--color-chrome") || "#e6e6e2";
  var colorChromeSoft = cssVar("--color-chrome-soft") || "#8d8f96";
  var colorAccent = cssVar("--accent-arc-1") || "#d99a52";
  var colorTwin = cssVar("--accent-arc-5") || "#5f93c9";

  // ---- Physical constants (SI-ish units: kg, m, s) ----
  var m1 = 1, m2 = 1, L1 = 1, L2 = 1, g = 9.81;
  var THETA1_0 = 2.0, THETA2_0 = 1.0;

  var DT = 0.00005, ITERS = 4;
  var TWIN_OFFSET = 1e-7; // rad
  var PERTURB_KICK = 1e-9; // rad, applied to theta1 on demand
  var ENSEMBLE_COUNT = 100;
  var ENSEMBLE_SPREAD = 1e-7; // rad, half-width of the uniform spread
  var ENSEMBLE_SEED = 20260803; // fixed constant — reproducible, not date-driven

  // ---- Shared Hamiltonian mechanics ----
  function massMatrix(theta1, theta2) {
    var d = theta1 - theta2;
    var cosd = Math.cos(d);
    var M11 = (m1 + m2) * L1 * L1;
    var M12 = m2 * L1 * L2 * cosd;
    var M22 = m2 * L2 * L2;
    var det = M11 * M22 - M12 * M12;
    return { M11: M11, M12: M12, M22: M22, det: det, sind: Math.sin(d) };
  }

  function omegaFromP(mm, p1, p2) {
    return [(mm.M22 * p1 - mm.M12 * p2) / mm.det, (-mm.M12 * p1 + mm.M11 * p2) / mm.det];
  }

  function dHdTheta(mm, theta1, theta2, om1, om2) {
    var cross = m2 * L1 * L2 * mm.sind * om1 * om2;
    return [
      cross + g * (m1 + m2) * L1 * Math.sin(theta1),
      -cross + g * m2 * L2 * Math.sin(theta2)
    ];
  }

  function energyOf(state) {
    var mm = massMatrix(state[0], state[1]);
    var om = omegaFromP(mm, state[2], state[3]);
    var KE = 0.5 * (state[2] * om[0] + state[3] * om[1]);
    var V = -g * ((m1 + m2) * L1 * Math.cos(state[0]) + m2 * L2 * Math.cos(state[1]));
    return KE + V;
  }

  // Implicit midpoint step. state = [theta1, theta2, p1, p2].
  function stepMidpoint(state, dt, iters) {
    var theta1 = state[0], theta2 = state[1], p1 = state[2], p2 = state[3];
    var theta1n = theta1, theta2n = theta2, p1n = p1, p2n = p2;

    for (var k = 0; k < iters; k++) {
      var tMid1 = (theta1 + theta1n) / 2;
      var tMid2 = (theta2 + theta2n) / 2;
      var pMid1 = (p1 + p1n) / 2;
      var pMid2 = (p2 + p2n) / 2;

      var mm = massMatrix(tMid1, tMid2);
      var om = omegaFromP(mm, pMid1, pMid2);
      var dH = dHdTheta(mm, tMid1, tMid2, om[0], om[1]);

      theta1n = theta1 + dt * om[0];
      theta2n = theta2 + dt * om[1];
      p1n = p1 - dt * dH[0];
      p2n = p2 - dt * dH[1];
    }

    return [theta1n, theta2n, p1n, p2n];
  }

  function bobPositions(state) {
    var x1 = L1 * Math.sin(state[0]);
    var y1 = L1 * Math.cos(state[0]);
    var x2 = x1 + L2 * Math.sin(state[1]);
    var y2 = y1 + L2 * Math.cos(state[1]);
    return { x1: x1, y1: y1, x2: x2, y2: y2 };
  }

  // ---- Scene state ----
  var mode = "single"; // "single" | "twin" | "ensemble"
  var primary, twin, ensemble, ensembleRng;
  var pxPerMeter = 100;
  var pivot = { x: 0, y: 0 };
  var initialEnergy = 0;

  function layout() {
    pxPerMeter = (setup.height * 0.42) / (L1 + L2);
    pivot.x = setup.width / 2;
    pivot.y = setup.height * 0.14;
  }

  function reset() {
    primary = [THETA1_0, THETA2_0, 0, 0];
    twin = [THETA1_0 + TWIN_OFFSET, THETA2_0, 0, 0];
    ensembleRng = Kaaos.mulberry32(ENSEMBLE_SEED);
    ensemble = [];
    for (var i = 0; i < ENSEMBLE_COUNT; i++) {
      var offset = (ensembleRng() * 2 - 1) * ENSEMBLE_SPREAD;
      ensemble.push([THETA1_0 + offset, THETA2_0, 0, 0]);
    }
    initialEnergy = energyOf(primary);
    layout();
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, setup.width, setup.height);
    updateReadout();
  }

  function perturb() {
    primary[0] += PERTURB_KICK;
  }

  // ---- Fixed-timestep physics update — dt is exactly what sim.js hands
  // us (DT), advanced by loop.setTimeScale() for the Speed control, not
  // by any local sub-looping. ----
  function physicsUpdate(dt) {
    if (mode === "ensemble") {
      for (var i = 0; i < ensemble.length; i++) {
        ensemble[i] = stepMidpoint(ensemble[i], dt, ITERS);
      }
    } else {
      primary = stepMidpoint(primary, dt, ITERS);
      if (mode === "twin") {
        twin = stepMidpoint(twin, dt, ITERS);
      }
    }
  }

  // ---- Rendering ----
  function toScreen(x, y) {
    return { x: pivot.x + x * pxPerMeter, y: pivot.y + y * pxPerMeter };
  }

  function drawArm(state, color) {
    var p = bobPositions(state);
    var s1 = toScreen(p.x1, p.y1);
    var s2 = toScreen(p.x2, p.y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pivot.x, pivot.y);
    ctx.lineTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(s1.x, s1.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s2.x, s2.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawArmGlow(state, color) {
    var p = bobPositions(state);
    var s2 = toScreen(p.x2, p.y2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(s2.x, s2.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function render() {
    // Fade the previous frame toward black, then draw luminous trail
    // marks with additive blending, then crisp arms/bobs on top.
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(8,9,11,0.3)";
    ctx.fillRect(0, 0, setup.width, setup.height);

    ctx.fillStyle = colorChrome;
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = "lighter";

    if (mode === "ensemble") {
      ctx.fillStyle = colorAccent;
      ctx.globalAlpha = 0.55;
      for (var i = 0; i < ensemble.length; i++) {
        var p = bobPositions(ensemble[i]);
        var s2 = toScreen(p.x2, p.y2);
        ctx.beginPath();
        ctx.arc(s2.x, s2.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      if (mode === "twin") drawArmGlow(twin, colorTwin);
      drawArmGlow(primary, colorAccent);
    }

    ctx.globalCompositeOperation = "source-over";

    if (mode !== "ensemble") {
      drawArm(primary, colorChrome);
      if (mode === "twin") drawArm(twin, colorChromeSoft);
    }
  }

  // ---- Controls ----
  var speedSlider = document.getElementById("ctrl-speed");
  var speedReadout = document.getElementById("ctrl-speed-readout");
  var btnPerturb = document.getElementById("ctrl-perturb");
  var btnTwin = document.getElementById("ctrl-twin");
  var btnEnsemble = document.getElementById("ctrl-ensemble");
  var btnReset = document.getElementById("ctrl-reset");
  var btnPlay = document.getElementById("ctrl-play");
  var readoutEnergy = document.getElementById("readout-energy");

  function updateReadout() {
    if (readoutEnergy) {
      var e = mode === "ensemble" ? energyOf(ensemble[0]) : energyOf(primary);
      var drift = initialEnergy !== 0 ? Math.abs((e - initialEnergy) / initialEnergy) : 0;
      readoutEnergy.textContent = "ΔE/E₀ " + drift.toExponential(2);
    }
  }

  var loop = Kaaos.fixedTimestepLoop({
    dt: DT,
    update: function (dt) {
      physicsUpdate(dt);
    },
    render: function () {
      render();
      updateReadout();
    },
    onAutoPause: function () {
      setPlaying(false);
    }
  });

  function setPlaying(playing) {
    if (playing) {
      loop.start();
    } else {
      loop.stop();
    }
    if (btnPlay) {
      btnPlay.setAttribute("aria-pressed", playing ? "false" : "true");
      btnPlay.textContent = playing ? "Tauko · Pause" : "Toista · Play";
    }
  }

  if (speedSlider) {
    speedSlider.addEventListener("input", function () {
      var v = parseFloat(speedSlider.value);
      loop.setTimeScale(v);
      if (speedReadout) speedReadout.textContent = v.toFixed(2) + "×";
    });
  }

  if (btnPerturb) {
    btnPerturb.addEventListener("click", perturb);
  }

  if (btnTwin) {
    btnTwin.addEventListener("click", function () {
      mode = mode === "twin" ? "single" : "twin";
      btnTwin.setAttribute("aria-pressed", mode === "twin" ? "true" : "false");
      if (btnEnsemble) btnEnsemble.setAttribute("aria-pressed", "false");
    });
  }

  if (btnEnsemble) {
    btnEnsemble.addEventListener("click", function () {
      mode = mode === "ensemble" ? "single" : "ensemble";
      btnEnsemble.setAttribute("aria-pressed", mode === "ensemble" ? "true" : "false");
      if (btnTwin) btnTwin.setAttribute("aria-pressed", "false");
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", reset);
  }

  if (btnPlay) {
    btnPlay.addEventListener("click", function () {
      setPlaying(!loop.isRunning());
    });
  }

  window.addEventListener("resize", layout);

  reset();

  if (Kaaos.prefersReducedMotion() && hint) {
    hint.textContent = "Simulaatio on pysäytetty käyttöjärjestelmän liikkeenvähennysasetuksen mukaisesti. Käynnistä Toista-painikkeesta. · The simulation is paused per your system's reduced-motion setting. Use Play to start it.";
  }
  setPlaying(false); // no autoplay, ever — visitor always starts it explicitly
})();
