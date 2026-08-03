/*
  Näyte 013 — Standardikuvaus (Chirikov standard map / kicked rotor)

  p_{n+1} = p_n + K sin(θ_n)     (both wrapped to [-π, π))
  θ_{n+1} = θ_n + p_{n+1}

  A discrete area-preserving map (a periodically-kicked rotor sampled
  once per kick) — no integrator, no dt. K=0 is pure rotation (every
  orbit a horizontal line); as K grows, invariant curves (KAM tori)
  break up one by one, starting near resonances, until the phase space
  is dominated by a single connected chaotic sea.

  K auto-clears the canvas on change: points already plotted were
  computed at the previous K and are not valid orbits at the new one,
  so leaving them up would silently mislabel them.

  Verified (see agent/LOG.md for the exact numbers): at K=0.5, a
  regular seed's momentum stays confined to a small band over 10^5
  iterates (bounded, i.e. on an invariant curve), while the same
  iteration count at K=5 fills the entire p-range — measured directly
  against this file's own step function, not a separate offline model.
*/

(function () {
  "use strict";

  var TWO_PI = Math.PI * 2;
  function wrap(a) {
    return ((a + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  }

  function step(theta, p, K) {
    var pNext = wrap(p + K * Math.sin(theta));
    var thetaNext = wrap(theta + pNext);
    return [thetaNext, pNext];
  }

  var canvas = document.getElementById("standard-canvas");
  var setup = Kaaos.setupCanvas(canvas);
  var ctx = setup.ctx;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var colorBg = cssVar("--color-bg") || "#08090b";
  var palette = [
    cssVar("--accent-arc-5") || "#a486d1",
    "#e8845a", "#5e94c9", "#4fb07a", "#d9b838", "#c85a6e"
  ];
  var paletteIdx = 0;

  var view = { min: -Math.PI, max: Math.PI };

  function toScreen(theta, p) {
    return {
      x: ((theta - view.min) / (view.max - view.min)) * setup.width,
      y: setup.height - ((p - view.min) / (view.max - view.min)) * setup.height
    };
  }
  function toData(sx, sy) {
    return [
      view.min + (sx / setup.width) * (view.max - view.min),
      view.min + ((setup.height - sy) / setup.height) * (view.max - view.min)
    ];
  }

  var K = 0.5;
  var ITERATES_PER_SEED = 4000;

  function clear() {
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, setup.width, setup.height);
    // faint axes at 0 and the domain edges
    ctx.strokeStyle = "rgba(230,230,226,0.12)";
    ctx.lineWidth = 1;
    var mid = toScreen(0, 0);
    ctx.beginPath(); ctx.moveTo(mid.x, 0); ctx.lineTo(mid.x, setup.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, mid.y); ctx.lineTo(setup.width, mid.y); ctx.stroke();
  }

  function plotOrbit(theta0, p0, color, n) {
    ctx.fillStyle = color;
    var theta = theta0, p = p0;
    for (var i = 0; i < n; i++) {
      var s = toScreen(theta, p);
      ctx.fillRect(s.x, s.y, 1.2, 1.2);
      var next = step(theta, p, K);
      theta = next[0]; p = next[1];
    }
  }

  var lastSeed = null;

  function nextColor() {
    var c = palette[paletteIdx % palette.length];
    paletteIdx++;
    return c;
  }

  canvas.addEventListener("click", function (evt) {
    var rect = canvas.getBoundingClientRect();
    var d = toData(
      (evt.clientX - rect.left) * (setup.width / rect.width),
      (evt.clientY - rect.top) * (setup.height / rect.height)
    );
    lastSeed = { theta: d[0], p: d[1] };
    plotOrbit(d[0], d[1], nextColor(), ITERATES_PER_SEED);
  });

  var kSlider = document.getElementById("ctrl-k");
  var kReadout = document.getElementById("ctrl-k-readout");
  if (kSlider) {
    kSlider.value = K;
    if (kReadout) kReadout.textContent = "K=" + K.toFixed(2);
    kSlider.addEventListener("input", function () {
      K = parseFloat(kSlider.value);
      if (kReadout) kReadout.textContent = "K=" + K.toFixed(2);
      lastSeed = null;
      clear();
    });
  }

  var btnClear = document.getElementById("ctrl-clear");
  if (btnClear) btnClear.addEventListener("click", function () { lastSeed = null; clear(); });

  var TWIN_DELTA = 1e-6;
  var btnTwin = document.getElementById("ctrl-twin");
  if (btnTwin) btnTwin.addEventListener("click", function () {
    if (!lastSeed) return;
    plotOrbit(lastSeed.theta + TWIN_DELTA, lastSeed.p, "rgba(255,180,60,0.9)", ITERATES_PER_SEED);
  });

  clear();

  window.__kaaosStandardMap = { step: step, setK: function (k) { K = k; }, getK: function () { return K; } };
})();
