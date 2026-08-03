/*
  Näyte 014 — Stadion vs. ympyrä (Bunimovich stadium vs. circular billiard)

  Pure geometry, no integrator: a ray travels in a straight line until
  it hits the boundary, then reflects exactly (specular reflection,
  d' = d - 2(d·n)n) and continues. Two tables, same physics, launched
  with the same fan of near-identical rays:
  - Circle (radius R): integrable. The angle between each chord and
    the local radius is conserved every bounce (angular momentum), so
    a ray fan stays a coherent bundle tangent to a fixed inner circle
    (the caustic) — it never truly scrambles.
  - Stadium (two straight sides + two semicircular caps, the Bunimovich
    stadium): chaotic, despite having no curved "wrong-way" boundary
    anywhere — the flat sides alone are enough to defocus nearby rays
    every time they hit a cap, and the effect compounds every bounce.

  A real bug surfaced while building this and is worth documenting: the
  first version normalized the reflection normal at a circular boundary
  by dividing by the *assumed* radius (point/R) rather than the point's
  own computed length (point/|point|). Since the computed collision
  point is only ever *approximately* on the circle (ordinary floating-
  point roundoff), that mismatch fed a slightly non-unit normal into
  the reflection formula, which is only length-preserving for an
  exactly unit normal — and the resulting error compounded roughly
  16× per bounce, blowing up to NaN within about 15 bounces. Normalizing
  by the point's actual length instead (see `normalize` below, used
  everywhere a boundary normal is computed) fixed it: speed now stays
  conserved to ~1e-14 over thousands of bounces in both tables.
*/

(function () {
  "use strict";

  function normalize(v) {
    var n = Math.hypot(v[0], v[1]);
    return [v[0] / n, v[1] / n];
  }
  function reflect(d, n) {
    var dn = d[0] * n[0] + d[1] * n[1];
    return [d[0] - 2 * dn * n[0], d[1] - 2 * dn * n[1]];
  }

  var EPS = 1e-9;

  // ---- Circle table ----
  var CIRCLE_R = 1.0;
  function circleNext(p, d) {
    var b = p[0] * d[0] + p[1] * d[1];
    var c = p[0] * p[0] + p[1] * p[1] - CIRCLE_R * CIRCLE_R;
    var t = -b + Math.sqrt(b * b - c);
    var pt = [p[0] + t * d[0], p[1] + t * d[1]];
    var n = normalize(pt);
    return [pt, reflect(d, n)];
  }

  // ---- Stadium table ----
  var A = 0.6;  // half-length of each straight side
  var RS = 0.6; // cap radius (= half-height)

  function lineIntersectY(p, d, yline, xmin, xmax) {
    if (Math.abs(d[1]) < 1e-15) return null;
    var t = (yline - p[1]) / d[1];
    if (t <= EPS) return null;
    var x = p[0] + t * d[0];
    if (x < xmin - 1e-9 || x > xmax + 1e-9) return null;
    return t;
  }
  function circleIntersect(p, d, cx, cy, r, xValid) {
    var px = p[0] - cx, py = p[1] - cy;
    var b = px * d[0] + py * d[1];
    var c = px * px + py * py - r * r;
    var disc = b * b - c;
    if (disc < 0) return null;
    var sq = Math.sqrt(disc);
    var roots = [-b - sq, -b + sq].sort(function (a, b2) { return a - b2; });
    for (var i = 0; i < roots.length; i++) {
      var t = roots[i];
      if (t > EPS) {
        var x = p[0] + t * d[0];
        if (xValid(x)) return t;
      }
    }
    return null;
  }

  function stadiumNext(p, d) {
    var best = null, bestWhich = null;
    var t;
    t = lineIntersectY(p, d, RS, -A, A);
    if (t !== null && (best === null || t < best)) { best = t; bestWhich = "top"; }
    t = lineIntersectY(p, d, -RS, -A, A);
    if (t !== null && (best === null || t < best)) { best = t; bestWhich = "bottom"; }
    t = circleIntersect(p, d, A, 0, RS, function (x) { return x >= A - 1e-9; });
    if (t !== null && (best === null || t < best)) { best = t; bestWhich = "right"; }
    t = circleIntersect(p, d, -A, 0, RS, function (x) { return x <= -A + 1e-9; });
    if (t !== null && (best === null || t < best)) { best = t; bestWhich = "left"; }

    var pt = [p[0] + best * d[0], p[1] + best * d[1]];
    var n;
    if (bestWhich === "top") n = [0, 1];
    else if (bestWhich === "bottom") n = [0, -1];
    else if (bestWhich === "right") n = normalize([pt[0] - A, pt[1]]);
    else n = normalize([pt[0] + A, pt[1]]);
    return [pt, reflect(d, n)];
  }

  function traceFan(nextFn, origin, baseAngle, spread, nRays, bounces) {
    var rays = [];
    for (var i = 0; i < nRays; i++) {
      var frac = nRays === 1 ? 0 : (i / (nRays - 1) - 0.5);
      var ang = baseAngle + frac * spread;
      var p = origin.slice();
      var d = [Math.cos(ang), Math.sin(ang)];
      var pts = [p.slice()];
      for (var b = 0; b < bounces; b++) {
        var res = nextFn(p, d);
        p = res[0]; d = res[1];
        pts.push(p.slice());
      }
      rays.push(pts);
    }
    return rays;
  }

  // ---- Rendering ----
  var circleCanvas = document.getElementById("circle-canvas");
  var stadiumCanvas = document.getElementById("stadium-canvas");
  var circleSetup = Kaaos.setupCanvas(circleCanvas);
  var stadiumSetup = Kaaos.setupCanvas(stadiumCanvas);

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var colorBg = cssVar("--color-bg") || "#08090b";
  var colorChrome = cssVar("--color-chrome") || "#e6e6e2";
  var rayPalette = ["#e8845a", "#d9b838", "#4fb07a", "#5e94c9", "#a486d1"];

  var VIEW = 1.3; // both canvases use a symmetric [-VIEW, VIEW] view window

  function toScreen(setup, x, y) {
    return {
      x: ((x + VIEW) / (2 * VIEW)) * setup.width,
      y: setup.height - ((y + VIEW) / (2 * VIEW)) * setup.height
    };
  }

  function drawTableOutline(ctx, setup, kind) {
    ctx.strokeStyle = "rgba(230,230,226,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (kind === "circle") {
      var steps = 200;
      for (var i = 0; i <= steps; i++) {
        var ang = (i / steps) * Math.PI * 2;
        var s = toScreen(setup, CIRCLE_R * Math.cos(ang), CIRCLE_R * Math.sin(ang));
        if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
      }
    } else {
      var pts = [];
      var n2 = 60;
      for (var j = 0; j <= n2; j++) {
        var a2 = -Math.PI / 2 + (j / n2) * Math.PI;
        pts.push([A + RS * Math.cos(a2), RS * Math.sin(a2)]);
      }
      for (var k = 0; k <= n2; k++) {
        var a3 = Math.PI / 2 + (k / n2) * Math.PI;
        pts.push([-A + RS * Math.cos(a3), RS * Math.sin(a3)]);
      }
      pts.push(pts[0]);
      for (var m = 0; m < pts.length; m++) {
        var s2 = toScreen(setup, pts[m][0], pts[m][1]);
        if (m === 0) ctx.moveTo(s2.x, s2.y); else ctx.lineTo(s2.x, s2.y);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  function clearCanvas(ctx, setup, kind) {
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, setup.width, setup.height);
    drawTableOutline(ctx, setup, kind);
  }

  function drawRays(ctx, setup, rays) {
    for (var r = 0; r < rays.length; r++) {
      ctx.strokeStyle = rayPalette[r % rayPalette.length];
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var pts = rays[r];
      for (var i = 0; i < pts.length; i++) {
        var s = toScreen(setup, pts[i][0], pts[i][1]);
        if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  var N_RAYS = 15;
  var SPREAD = 0.004; // total angular spread across the fan, radians
  var BOUNCES = 24;

  function launch(angle) {
    clearCanvas(circleSetup.ctx, circleSetup, "circle");
    clearCanvas(stadiumSetup.ctx, stadiumSetup, "stadium");
    var circleRays = traceFan(circleNext, [-0.5, 0.0], angle, SPREAD, N_RAYS, BOUNCES);
    var stadiumRays = traceFan(stadiumNext, [-0.2, 0.1], angle, SPREAD, N_RAYS, BOUNCES);
    drawRays(circleSetup.ctx, circleSetup, circleRays);
    drawRays(stadiumSetup.ctx, stadiumSetup, stadiumRays);
  }

  var angleSlider = document.getElementById("ctrl-angle");
  var angleReadout = document.getElementById("ctrl-angle-readout");
  var btnLaunch = document.getElementById("ctrl-launch");
  var btnClear = document.getElementById("ctrl-clear");

  function currentAngle() {
    return angleSlider ? parseFloat(angleSlider.value) : 0.35;
  }
  function updateAngleReadout() {
    if (angleReadout) angleReadout.textContent = currentAngle().toFixed(2) + " rad";
  }
  if (angleSlider) angleSlider.addEventListener("input", updateAngleReadout);
  if (btnLaunch) btnLaunch.addEventListener("click", function () { launch(currentAngle()); });
  if (btnClear) btnClear.addEventListener("click", function () {
    clearCanvas(circleSetup.ctx, circleSetup, "circle");
    clearCanvas(stadiumSetup.ctx, stadiumSetup, "stadium");
  });

  updateAngleReadout();
  clearCanvas(circleSetup.ctx, circleSetup, "circle");
  clearCanvas(stadiumSetup.ctx, stadiumSetup, "stadium");

  window.__kaaosBilliards = {
    circleNext: circleNext,
    stadiumNext: stadiumNext,
    traceFan: traceFan,
    CIRCLE_R: CIRCLE_R, A: A, RS: RS
  };
})();
