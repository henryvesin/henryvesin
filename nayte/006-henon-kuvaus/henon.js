/*
  Näyte 006 — Hénon-kuvaus (Hénon map)

  Discrete map: no integrator, no dt, no invariant to preserve — this
  is a direct iteration, not an ODE. a=1.4, b=0.3 (classic chaotic
  parameters). A single long orbit is ergodic on the attractor, so
  plotting where it falls (rather than tracking many independent
  points) is enough to reveal the whole fractal structure.
*/

(function () {
  "use strict";

  var canvas = document.getElementById("henon-canvas");
  var setup = Kaaos.setupCanvas(canvas);
  var ctx = setup.ctx;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var colorBg = cssVar("--color-bg") || "#08090b";
  var colorAccent = cssVar("--accent-arc-2") || "#4fb0b6";
  var colorChrome = cssVar("--color-chrome") || "#e6e6e2";

  var A = 1.4, B = 0.3;

  function step(p) {
    return [1 - A * p[0] * p[0] + p[1], B * p[0]];
  }

  var DEFAULT_VIEW = { xMin: -1.5, xMax: 1.5, yMin: -0.45, yMax: 0.45 };
  var view = Object.assign({}, DEFAULT_VIEW);
  var point = [0.1, 0.1];

  function toScreen(p) {
    return {
      x: ((p[0] - view.xMin) / (view.xMax - view.xMin)) * setup.width,
      y: setup.height - ((p[1] - view.yMin) / (view.yMax - view.yMin)) * setup.height
    };
  }

  function toData(sx, sy) {
    return [
      view.xMin + (sx / setup.width) * (view.xMax - view.xMin),
      view.yMin + ((setup.height - sy) / setup.height) * (view.yMax - view.yMin)
    ];
  }

  function clear() {
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, setup.width, setup.height);
  }

  function plotPoint(p) {
    var s = toScreen(p);
    if (s.x < 0 || s.x > setup.width || s.y < 0 || s.y > setup.height) return;
    ctx.fillRect(s.x, s.y, 1, 1);
  }

  function reset() {
    view = Object.assign({}, DEFAULT_VIEW);
    point = [0.1, 0.1];
    // discard transient
    for (var i = 0; i < 200; i++) point = step(point);
    clear();
  }

  function burstIterate(n) {
    ctx.fillStyle = colorAccent;
    for (var i = 0; i < n; i++) {
      point = step(point);
      plotPoint(point);
    }
  }

  function physicsUpdate() {
    ctx.fillStyle = colorAccent;
    for (var i = 0; i < 400; i++) {
      point = step(point);
      plotPoint(point);
    }
  }

  var loop = Kaaos.fixedTimestepLoop({
    dt: 1 / 60,
    update: physicsUpdate,
    render: function () {},
    onAutoPause: function () { setPlaying(false); }
  });

  var btnPlay = document.getElementById("ctrl-play");
  var btnReset = document.getElementById("ctrl-reset");

  function setPlaying(playing) {
    if (playing) loop.start(); else loop.stop();
    if (btnPlay) {
      btnPlay.setAttribute("aria-pressed", playing ? "false" : "true");
      btnPlay.textContent = playing ? "Tauko · Pause" : "Toista · Play";
    }
  }

  if (btnPlay) btnPlay.addEventListener("click", function () { setPlaying(!loop.isRunning()); });
  if (btnReset) btnReset.addEventListener("click", reset);

  // ---- Box-zoom ----
  var dragStart = null;

  canvas.addEventListener("mousedown", function (evt) {
    var rect = canvas.getBoundingClientRect();
    dragStart = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  });
  window.addEventListener("mouseup", function (evt) {
    if (!dragStart) return;
    var rect = canvas.getBoundingClientRect();
    var end = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    var x0 = Math.min(dragStart.x, end.x), x1 = Math.max(dragStart.x, end.x);
    var y0 = Math.min(dragStart.y, end.y), y1 = Math.max(dragStart.y, end.y);
    dragStart = null;
    if (x1 - x0 < 8 || y1 - y0 < 8) return; // ignore accidental clicks
    var dA = toData(x0, y1);
    var dB = toData(x1, y0);
    view = { xMin: dA[0], xMax: dB[0], yMin: dA[1], yMax: dB[1] };
    clear();
    burstIterate(300000);
  });

  var btnZoomOut = document.getElementById("ctrl-zoom-out");
  if (btnZoomOut) {
    btnZoomOut.addEventListener("click", function () {
      view = Object.assign({}, DEFAULT_VIEW);
      clear();
      burstIterate(200000);
    });
  }

  window.addEventListener("resize", function () {
    clear();
    burstIterate(50000);
  });

  reset();
  burstIterate(50000);
  setPlaying(false);
})();
