(function () {
  "use strict";

  var canvas = document.getElementById("pendulum-canvas");
  var ctx = canvas.getContext("2d");
  var hint = document.getElementById("interaction-hint");

  var W = canvas.width;
  var H = canvas.height;
  var pivot = { x: W / 2, y: H * 0.28 };

  var L1 = 110, L2 = 110;
  var m1 = 10, m2 = 10;
  var g = 1400;

  var theme = {
    ink: "#1a1a18",
    red: "#b5342a",
    blue: "#4a5a66",
    paper: "#ffffff"
  };

  var state = { t1: 1.9, w1: 0, t2: 0.6, w2: 0 };

  function derivs(s) {
    var t1 = s.t1, w1 = s.w1, t2 = s.t2, w2 = s.w2;
    var delta = t1 - t2;
    var den = (2 * m1 + m2 - m2 * Math.cos(2 * t1 - 2 * t2));

    var num1 = -g * (2 * m1 + m2) * Math.sin(t1)
      - m2 * g * Math.sin(t1 - 2 * t2)
      - 2 * Math.sin(delta) * m2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(delta));
    var a1 = num1 / (L1 * den);

    var num2 = 2 * Math.sin(delta) * (
      w1 * w1 * L1 * (m1 + m2)
      + g * (m1 + m2) * Math.cos(t1)
      + w2 * w2 * L2 * m2 * Math.cos(delta)
    );
    var a2 = num2 / (L2 * den);

    return { t1: w1, w1: a1, t2: w2, w2: a2 };
  }

  function addScaled(a, b, h) {
    return { t1: a.t1 + h * b.t1, w1: a.w1 + h * b.w1, t2: a.t2 + h * b.t2, w2: a.w2 + h * b.w2 };
  }

  function rk4Step(s, dt) {
    var k1 = derivs(s);
    var k2 = derivs(addScaled(s, k1, dt / 2));
    var k3 = derivs(addScaled(s, k2, dt / 2));
    var k4 = derivs(addScaled(s, k3, dt));
    return {
      t1: s.t1 + (dt / 6) * (k1.t1 + 2 * k2.t1 + 2 * k3.t1 + k4.t1),
      w1: s.w1 + (dt / 6) * (k1.w1 + 2 * k2.w1 + 2 * k3.w1 + k4.w1),
      t2: s.t2 + (dt / 6) * (k1.t2 + 2 * k2.t2 + 2 * k3.t2 + k4.t2),
      w2: s.w2 + (dt / 6) * (k1.w2 + 2 * k2.w2 + 2 * k3.w2 + k4.w2)
    };
  }

  function bobPositions(s) {
    var x1 = pivot.x + L1 * Math.sin(s.t1);
    var y1 = pivot.y + L1 * Math.cos(s.t1);
    var x2 = x1 + L2 * Math.sin(s.t2);
    var y2 = y1 + L2 * Math.cos(s.t2);
    return { x1: x1, y1: y1, x2: x2, y2: y2 };
  }

  function drawPendulum(s) {
    var p = bobPositions(s);
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivot.x, pivot.y);
    ctx.lineTo(p.x1, p.y1);
    ctx.lineTo(p.x2, p.y2);
    ctx.stroke();

    ctx.fillStyle = theme.ink;
    ctx.beginPath();
    ctx.arc(pivot.x, pivot.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.blue;
    ctx.beginPath();
    ctx.arc(p.x1, p.y1, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.red;
    ctx.beginPath();
    ctx.arc(p.x2, p.y2, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  var reduced = window.Kaaos && Kaaos.prefersReducedMotion();

  if (reduced) {
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, W, H);
    drawPendulum(state);
    if (hint) {
      hint.textContent = "Animaatio on pysäytetty käyttöjärjestelmän liikkeenvähennysasetuksen mukaisesti.";
    }
    return;
  }

  var dragging = null; // 1 or 2

  function canvasPoint(evt) {
    var rect = canvas.getBoundingClientRect();
    var clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    var clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return {
      x: (clientX - rect.left) * (W / rect.width),
      y: (clientY - rect.top) * (H / rect.height)
    };
  }

  function dist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function startDrag(evt) {
    var pt = canvasPoint(evt);
    var p = bobPositions(state);
    var d1 = dist(pt.x, pt.y, p.x1, p.y1);
    var d2 = dist(pt.x, pt.y, p.x2, p.y2);
    var grabRadius = 40;
    if (d2 <= grabRadius && d2 <= d1) {
      dragging = 2;
    } else if (d1 <= grabRadius) {
      dragging = 1;
    } else {
      return;
    }
    evt.preventDefault();
  }

  function moveDrag(evt) {
    if (!dragging) return;
    var pt = canvasPoint(evt);
    if (dragging === 1) {
      state.t1 = Math.atan2(pt.x - pivot.x, pt.y - pivot.y);
      state.w1 = 0;
    } else {
      var p = bobPositions(state);
      state.t2 = Math.atan2(pt.x - p.x1, pt.y - p.y1);
      state.w2 = 0;
    }
    evt.preventDefault();
  }

  function endDrag() {
    dragging = null;
  }

  canvas.addEventListener("mousedown", startDrag);
  canvas.addEventListener("mousemove", moveDrag);
  window.addEventListener("mouseup", endDrag);
  canvas.addEventListener("touchstart", startDrag, { passive: false });
  canvas.addEventListener("touchmove", moveDrag, { passive: false });
  canvas.addEventListener("touchend", endDrag);

  var dt = 1 / 60;
  var substeps = 6;

  function frame() {
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.fillRect(0, 0, W, H);

    if (!dragging) {
      for (var i = 0; i < substeps; i++) {
        state = rk4Step(state, dt / substeps);
      }
    }

    var p = bobPositions(state);
    ctx.fillStyle = "rgba(181,52,42,0.55)";
    ctx.beginPath();
    ctx.arc(p.x2, p.y2, 1.6, 0, Math.PI * 2);
    ctx.fill();

    drawPendulum(state);
    requestAnimationFrame(frame);
  }

  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, W, H);
  requestAnimationFrame(frame);
})();
