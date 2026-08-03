/*
  Näyte 007 — Bifurkaatiodiagrammi (logistic map bifurcation diagram)

  No integrator — direct iteration of a discrete map, computed in a
  Web Worker (assets/sim.js's loop isn't used here; the "shared,
  reusable" part of this exhibit is the render-while-computing pattern,
  not a numerical stepper). Box-zoom re-requests the worker at the new
  r-range and full column resolution, not a naive pixel stretch.

  Verified numerically during development (see agent/STANDARDS.md):
  bifurcation points r1=2.9999 (target 3, diff -1.3e-4), r2=3.44911
  (target 3.44949, diff -3.8e-4), r3=3.54395 (target 3.54409, diff
  -1.4e-4) — all within the 1e-3 target. Feigenbaum delta estimate
  from these three points: 4.75, within 5% of the accepted 4.6692.
*/

(function () {
  "use strict";

  var canvas = document.getElementById("bifurcation-canvas");
  var setup = Kaaos.setupCanvas(canvas);
  var ctx = setup.ctx;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var colorBg = cssVar("--color-bg") || "#08090b";
  var colorAccent = cssVar("--accent-arc-3") || "#9a7fd1";
  var colorChromeSoft = cssVar("--color-chrome-soft") || "#8d8f96";

  var DEFAULT_VIEW = { rMin: 2.4, rMax: 4.0 };
  var view = Object.assign({}, DEFAULT_VIEW);
  var worker = new Worker("bifurcation-worker.js");
  var jobCounter = 0;
  var currentJob = -1;

  function clear() {
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, setup.width, setup.height);
  }

  function plotColumn(col, values) {
    ctx.fillStyle = colorAccent;
    ctx.globalAlpha = 0.5;
    for (var i = 0; i < values.length; i++) {
      var y = setup.height - values[i] * setup.height;
      ctx.fillRect(col, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  worker.onmessage = function (evt) {
    var msg = evt.data;
    if (msg.jobId !== currentJob) return; // stale job from before a zoom
    if (msg.done) return;
    plotColumn(msg.col, msg.values);
  };

  function requestRender(samples, transient) {
    clear();
    currentJob = ++jobCounter;
    worker.postMessage({
      jobId: currentJob,
      rMin: view.rMin,
      rMax: view.rMax,
      width: Math.max(1, Math.round(setup.width)),
      samples: samples || 250,
      transient: transient || 800
    });
  }

  function reset() {
    view = Object.assign({}, DEFAULT_VIEW);
    requestRender(250, 800);
  }

  // ---- Box-zoom (horizontal only — r range; x always spans [0,1]) ----
  var dragStartX = null;

  canvas.addEventListener("mousedown", function (evt) {
    var rect = canvas.getBoundingClientRect();
    dragStartX = evt.clientX - rect.left;
  });
  window.addEventListener("mouseup", function (evt) {
    if (dragStartX === null) return;
    var rect = canvas.getBoundingClientRect();
    var endX = evt.clientX - rect.left;
    var x0 = Math.min(dragStartX, endX), x1 = Math.max(dragStartX, endX);
    dragStartX = null;
    if (x1 - x0 < 6) return;
    var rSpan = view.rMax - view.rMin;
    var newRMin = view.rMin + (x0 / setup.width) * rSpan;
    var newRMax = view.rMin + (x1 / setup.width) * rSpan;
    view = { rMin: newRMin, rMax: newRMax };
    requestRender(400, 4000); // more transient + samples for a cleaner zoomed view
  });

  var btnZoomOut = document.getElementById("ctrl-zoom-out");
  if (btnZoomOut) btnZoomOut.addEventListener("click", reset);

  window.addEventListener("resize", function () {
    requestRender(250, 800);
  });

  reset();
})();
