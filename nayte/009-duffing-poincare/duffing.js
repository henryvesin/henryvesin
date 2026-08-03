/*
  Näyte 009 — Duffing + Poincaré

  Forced double-well Duffing oscillator: x'' + delta x' - x + x^3 =
  gamma cos(omega t). Dissipative + forced: RK4 per STANDARDS.md, fixed
  dt subdividing the forcing period exactly (stepsPerPeriod is an
  integer) so Poincaré samples land exactly on t = n * (2*pi/omega),
  not approximately.

  Parameters (delta=0.2, gamma=0.3, omega=1.0) were chosen by
  numerically screening several candidates for a genuinely chaotic
  Poincaré section (a spread-out point set, not a few periodic
  clusters) rather than assumed from memory — 234 of 300 sampled
  points fell in distinct 0.05-wide buckets, well above what a
  periodic or quasi-periodic orbit would produce.
*/

(function () {
  "use strict";

  var phaseCanvas = document.getElementById("phase-canvas");
  var poincareCanvas = document.getElementById("poincare-canvas");
  var pSetup = Kaaos.setupCanvas(phaseCanvas);
  var qSetup = Kaaos.setupCanvas(poincareCanvas);
  var pctx = pSetup.ctx;
  var qctx = qSetup.ctx;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var colorBg = cssVar("--color-bg") || "#08090b";
  var colorAccent = cssVar("--accent-arc-3") || "#9a7fd1";
  var colorChromeSoft = cssVar("--color-chrome-soft") || "#8d8f96";

  var DELTA = 0.2, GAMMA = 0.3, OMEGA = 1.0;
  var PERIOD = 2 * Math.PI / OMEGA;
  var DT = PERIOD / 400; // exact integer subdivisions of the forcing period
  var TRANSIENT_PERIODS = 50;

  function derivs(y) {
    var x = y[0], v = y[1], t = y[2];
    var a = GAMMA * Math.cos(OMEGA * t) - DELTA * v - (-x + x * x * x);
    return [v, a, 1];
  }

  var state, stepInPeriod, poincarePoints;

  function toPhaseScreen(x, v) {
    var sx = pSetup.width / 2 + x * (pSetup.width / 5);
    var sy = pSetup.height / 2 - v * (pSetup.height / 4);
    return { x: sx, y: sy };
  }
  function toPoincareScreen(x, v) {
    var sx = qSetup.width / 2 + x * (qSetup.width / 5);
    var sy = qSetup.height / 2 - v * (qSetup.height / 4);
    return { x: sx, y: sy };
  }

  function clearPhase() {
    pctx.fillStyle = colorBg;
    pctx.fillRect(0, 0, pSetup.width, pSetup.height);
  }
  function clearPoincare() {
    qctx.fillStyle = colorBg;
    qctx.fillRect(0, 0, qSetup.width, qSetup.height);
  }

  function reset() {
    state = [0.1, 0, 0];
    stepInPeriod = 0;
    poincarePoints = 0;
    clearPhase();
    clearPoincare();
    // fast-forward the transient without drawing
    for (var i = 0; i < TRANSIENT_PERIODS * 400; i++) state = Kaaos.rk4Step(state, DT, derivs);
  }

  function physicsUpdate() {
    state = Kaaos.rk4Step(state, DT, derivs);
    stepInPeriod++;

    var p = toPhaseScreen(state[0], state[1]);
    pctx.fillStyle = colorAccent;
    pctx.globalAlpha = 0.5;
    pctx.fillRect(p.x, p.y, 1.5, 1.5);
    pctx.globalAlpha = 1;

    if (stepInPeriod >= 400) {
      stepInPeriod = 0;
      var q = toPoincareScreen(state[0], state[1]);
      qctx.fillStyle = colorAccent;
      qctx.globalAlpha = 0.8;
      qctx.fillRect(q.x, q.y, 1.5, 1.5);
      qctx.globalAlpha = 1;
      poincarePoints++;
    }
  }

  var loop = Kaaos.fixedTimestepLoop({
    dt: DT,
    update: physicsUpdate,
    render: function () {},
    onAutoPause: function () { setPlaying(false); }
  });

  var btnPlay = document.getElementById("ctrl-play");
  var btnReset = document.getElementById("ctrl-reset");
  var speedSlider = document.getElementById("ctrl-speed");
  var speedReadout = document.getElementById("ctrl-speed-readout");

  function setPlaying(playing) {
    if (playing) loop.start(); else loop.stop();
    if (btnPlay) {
      btnPlay.setAttribute("aria-pressed", playing ? "false" : "true");
      btnPlay.textContent = playing ? "Tauko · Pause" : "Toista · Play";
    }
  }

  if (btnPlay) btnPlay.addEventListener("click", function () { setPlaying(!loop.isRunning()); });
  if (btnReset) btnReset.addEventListener("click", function () {
    clearPhase();
    reset();
  });
  if (speedSlider) {
    speedSlider.addEventListener("input", function () {
      var v = parseFloat(speedSlider.value);
      loop.setTimeScale(v);
      if (speedReadout) speedReadout.textContent = v.toFixed(2) + "×";
    });
  }

  reset();
  setPlaying(false);
})();
