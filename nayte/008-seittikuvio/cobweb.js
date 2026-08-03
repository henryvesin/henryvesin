/*
  Näyte 008 — Seittikuvio (Cobweb plot)

  Companion to Näyte 007. No integrator, no invariant beyond the
  discrete map itself. The mini bifurcation strip is computed once,
  synchronously, on load (300 columns x 120 samples is small enough
  that a worker would be overhead, not help — 007 needed one because
  its diagram is the full exhibit at full resolution with box-zoom
  recomputation, this one is a fixed-size reference strip).
*/

(function () {
  "use strict";

  var cobwebCanvas = document.getElementById("cobweb-canvas");
  var stripCanvas = document.getElementById("strip-canvas");
  var cobwebSetup = Kaaos.setupCanvas(cobwebCanvas);
  var stripSetup = Kaaos.setupCanvas(stripCanvas);
  var cctx = cobwebSetup.ctx;
  var sctx = stripSetup.ctx;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var colorBg = cssVar("--color-bg") || "#08090b";
  var colorAccent = cssVar("--accent-arc-3") || "#9a7fd1";
  var colorChrome = cssVar("--color-chrome") || "#e6e6e2";
  var colorChromeSoft = cssVar("--color-chrome-soft") || "#8d8f96";
  var colorRule = cssVar("--color-rule") || "#2a2c31";

  var r = 3.6;
  var x0 = 0.2;
  var STEPS = 60;

  function f(x) { return r * x * (1 - x); }

  function toScreenCobweb(x, y) {
    var pad = 20;
    var w = cobwebSetup.width - pad, h = cobwebSetup.height - pad;
    return { x: pad + x * w, y: h - y * (h - pad) + pad - pad };
  }

  function drawCobweb() {
    cctx.fillStyle = colorBg;
    cctx.fillRect(0, 0, cobwebSetup.width, cobwebSetup.height);

    var pad = 24;
    var w = cobwebSetup.width - pad * 1.5, h = cobwebSetup.height - pad * 1.5;

    function toXY(x, y) {
      return { x: pad + x * w, y: (pad + h) - y * h };
    }

    // axes
    cctx.strokeStyle = colorRule;
    cctx.lineWidth = 1;
    cctx.beginPath();
    cctx.moveTo(pad, pad); cctx.lineTo(pad, pad + h); cctx.lineTo(pad + w, pad + h);
    cctx.stroke();

    // y = x
    cctx.strokeStyle = colorChromeSoft;
    cctx.beginPath();
    var p0 = toXY(0, 0), p1 = toXY(1, 1);
    cctx.moveTo(p0.x, p0.y); cctx.lineTo(p1.x, p1.y);
    cctx.stroke();

    // y = f(x) curve
    cctx.strokeStyle = colorChrome;
    cctx.lineWidth = 1.5;
    cctx.beginPath();
    for (var i = 0; i <= 200; i++) {
      var x = i / 200;
      var pt = toXY(x, f(x));
      if (i === 0) cctx.moveTo(pt.x, pt.y); else cctx.lineTo(pt.x, pt.y);
    }
    cctx.stroke();

    // cobweb staircase
    cctx.strokeStyle = colorAccent;
    cctx.lineWidth = 1.2;
    cctx.beginPath();
    var x = x0;
    var cur = toXY(x, 0);
    cctx.moveTo(cur.x, cur.y);
    for (var s = 0; s < STEPS; s++) {
      var y = f(x);
      var a = toXY(x, y);
      cctx.lineTo(a.x, a.y);
      var b = toXY(y, y);
      cctx.lineTo(b.x, b.y);
      x = y;
    }
    cctx.stroke();
  }

  function drawStrip() {
    sctx.fillStyle = colorBg;
    sctx.fillRect(0, 0, stripSetup.width, stripSetup.height);
    var rMin = 2.4, rMax = 4.0;
    var cols = Math.round(stripSetup.width);
    sctx.fillStyle = colorChromeSoft;
    for (var col = 0; col < cols; col++) {
      var rr = rMin + (col / cols) * (rMax - rMin);
      var xx = 0.5;
      for (var i = 0; i < 300; i++) xx = rr * xx * (1 - xx);
      for (var s = 0; s < 60; s++) {
        xx = rr * xx * (1 - xx);
        var yy = stripSetup.height - xx * stripSetup.height;
        sctx.globalAlpha = 0.5;
        sctx.fillRect(col, yy, 1, 1);
      }
    }
    sctx.globalAlpha = 1;
    drawMarker();
  }

  function drawMarker() {
    var rMin = 2.4, rMax = 4.0;
    var x = ((r - rMin) / (rMax - rMin)) * stripSetup.width;
    sctx.strokeStyle = colorAccent;
    sctx.lineWidth = 2;
    sctx.beginPath();
    sctx.moveTo(x, 0);
    sctx.lineTo(x, stripSetup.height);
    sctx.stroke();
  }

  function redraw() {
    drawCobweb();
    drawStrip();
  }

  var rSlider = document.getElementById("ctrl-r");
  var rReadout = document.getElementById("ctrl-r-readout");
  var x0Slider = document.getElementById("ctrl-x0");
  var x0Readout = document.getElementById("ctrl-x0-readout");

  if (rSlider) {
    rSlider.addEventListener("input", function () {
      r = parseFloat(rSlider.value);
      if (rReadout) rReadout.textContent = r.toFixed(3);
      redraw();
    });
  }
  if (x0Slider) {
    x0Slider.addEventListener("input", function () {
      x0 = parseFloat(x0Slider.value);
      if (x0Readout) x0Readout.textContent = x0.toFixed(3);
      redraw();
    });
  }

  stripCanvas.addEventListener("click", function (evt) {
    var rect = stripCanvas.getBoundingClientRect();
    var frac = (evt.clientX - rect.left) / rect.width;
    r = 2.4 + frac * (4.0 - 2.4);
    if (rSlider) rSlider.value = r;
    if (rReadout) rReadout.textContent = r.toFixed(3);
    redraw();
  });

  window.addEventListener("resize", redraw);

  redraw();
})();
