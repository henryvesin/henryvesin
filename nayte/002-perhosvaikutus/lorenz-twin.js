/*
  Näyte 002 — Perhosvaikutus (Butterfly divergence)

  Two Lorenz trajectories (sigma=10, rho=28, beta=8/3), released
  delta0=1e-9 apart, integrated with RK4 (dissipative system — RK4 is
  the STANDARDS.md floor here, no symplectic structure needed or
  applicable). The live log-separation graph shows the raw signal,
  including the initial transient before the perturbation aligns with
  the leading Lyapunov direction — that alignment lag is real and
  worth seeing, not smoothed away.

  The *reported* Lyapunov exponent (lambda ~ 0.894) was measured
  separately with the standard Benettin renormalization method (a
  fixed-point-normalization technique that removes the alignment
  transient by periodically rescaling the separation and averaging the
  local growth rate over many cycles) — a raw single-shot fit like the
  live graph would systematically underestimate lambda. See
  agent/STANDARDS.md for the measured number and method.
*/

(function () {
  "use strict";

  var canvas = document.getElementById("lorenz-canvas");
  var graphCanvas = document.getElementById("separation-canvas");
  var setup = Kaaos.setupCanvas(canvas);
  var gsetup = Kaaos.setupCanvas(graphCanvas);
  var ctx = setup.ctx;
  var gctx = gsetup.ctx;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var colorBg = cssVar("--color-bg") || "#08090b";
  var colorChrome = cssVar("--color-chrome") || "#e6e6e2";
  var colorChromeSoft = cssVar("--color-chrome-soft") || "#8d8f96";
  var colorAccent = cssVar("--accent-arc-1") || "#d99a52";
  var colorTwin = cssVar("--accent-arc-5") || "#5f93c9";
  var colorRule = cssVar("--color-rule") || "#2a2c31";

  var SIGMA = 10, RHO = 28, BETA = 8 / 3;
  var DT = 0.005;
  var DELTA0 = 1e-9;

  function derivs(y) {
    var x = y[0], yy = y[1], z = y[2];
    return [SIGMA * (yy - x), x * (RHO - z) - yy, x * yy - BETA * z];
  }

  var a, b, elapsed;
  var history = []; // {t, logSep}

  function reset() {
    a = [0.1, 0, 0];
    // brief transient so we start already on the attractor
    for (var i = 0; i < 1500; i++) a = Kaaos.rk4Step(a, DT, derivs);
    b = [a[0] + DELTA0, a[1], a[2]];
    elapsed = 0;
    history = [];
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, setup.width, setup.height);
  }

  function perturb() {
    var d = dist(a, b);
    var scale = DELTA0 / (d || 1e-12);
    b = [a[0] + (b[0] - a[0]) * scale, a[1] + (b[1] - a[1]) * scale, a[2] + (b[2] - a[2]) * scale];
    history = [];
    elapsed = 0;
  }

  function dist(p, q) {
    return Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]) + (p[2] - q[2]) * (p[2] - q[2]));
  }

  var angleY = 0;

  function physicsUpdate(dt) {
    a = Kaaos.rk4Step(a, dt, derivs);
    b = Kaaos.rk4Step(b, dt, derivs);
    elapsed += dt;
    var d = dist(a, b);
    history.push([elapsed, Math.log(Math.max(d, 1e-15)) / Math.LN10]);
    if (history.length > 4000) history.shift();
    angleY += dt * 0.15;
  }

  function project(p) {
    var r = Kaaos.rotate3D(p[0], p[1], p[2] - 25, 0.5, angleY);
    var scale = Math.min(setup.width, setup.height) / 90;
    return { x: setup.width / 2 + r[0] * scale, y: setup.height / 2 + r[1] * scale };
  }

  function render() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(8,9,11,0.15)";
    ctx.fillRect(0, 0, setup.width, setup.height);

    ctx.globalCompositeOperation = "lighter";
    var pa = project(a), pb = project(b);
    ctx.fillStyle = colorAccent;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(pa.x, pa.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colorTwin;
    ctx.beginPath();
    ctx.arc(pb.x, pb.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    renderGraph();
  }

  function renderGraph() {
    gctx.fillStyle = colorBg;
    gctx.fillRect(0, 0, gsetup.width, gsetup.height);

    var w = gsetup.width, h = gsetup.height;
    var pad = 28;
    var tMax = Math.max(20, elapsed);
    var yMin = -9.5, yMax = 2; // log10(separation) range: from delta0 (~-9) to O(10-100)

    gctx.strokeStyle = colorRule;
    gctx.lineWidth = 1;
    gctx.beginPath();
    gctx.moveTo(pad, h - pad);
    gctx.lineTo(w - 8, h - pad);
    gctx.moveTo(pad, h - pad);
    gctx.lineTo(pad, 8);
    gctx.stroke();

    gctx.fillStyle = colorChromeSoft;
    gctx.font = "11px " + cssVar("--font-mono");
    gctx.fillText("log10(erotus) · log10(separation)", pad, 14);
    gctx.fillText("t (s)", w - 40, h - 10);

    if (history.length < 2) return;

    gctx.strokeStyle = colorAccent;
    gctx.lineWidth = 1.5;
    gctx.beginPath();
    for (var i = 0; i < history.length; i++) {
      var t = history[i][0], logSep = history[i][1];
      var x = pad + (t / tMax) * (w - pad - 8);
      var y = h - pad - ((logSep - yMin) / (yMax - yMin)) * (h - pad - 8);
      if (i === 0) gctx.moveTo(x, y); else gctx.lineTo(x, y);
    }
    gctx.stroke();
  }

  var loop = Kaaos.fixedTimestepLoop({
    dt: DT,
    update: physicsUpdate,
    render: render,
    onAutoPause: function () {
      setPlaying(false);
    }
  });

  var btnPlay = document.getElementById("ctrl-play");
  var btnPerturb = document.getElementById("ctrl-perturb");
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
  if (btnPerturb) btnPerturb.addEventListener("click", perturb);
  if (btnReset) btnReset.addEventListener("click", reset);
  if (speedSlider) {
    speedSlider.addEventListener("input", function () {
      var v = parseFloat(speedSlider.value);
      loop.setTimeScale(v);
      if (speedReadout) speedReadout.textContent = v.toFixed(2) + "×";
    });
  }

  window.addEventListener("resize", function () {
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, setup.width, setup.height);
  });

  reset();
  render();
  setPlaying(false);
})();
