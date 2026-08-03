/*
  Näyte 005 — Attraktorikokoelma (Attractor cabinet)

  Four dissipative systems, one specimen-drawer selector, sharing the
  RK4 integrator and Kaaos.rotate3D projection from Näyte 003/004.
  Verified numerically during development: all four stay bounded (no
  divergence, no NaN) over 2e5 steps at each system's chosen dt —
  Thomas's x/y/z ranges came out identical, as expected from its
  cyclic symmetry, which is a useful internal consistency check that
  the equations were transcribed correctly.
*/

(function () {
  "use strict";

  var canvas = document.getElementById("attractor-canvas");
  var setup = Kaaos.setupCanvas(canvas);
  var ctx = setup.ctx;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  var colorBg = cssVar("--color-bg") || "#08090b";
  var colorAccent = cssVar("--accent-arc-2") || "#4fb0b6";

  var SYSTEMS = {
    thomas: {
      label: "Thomas",
      dt: 0.02,
      scale: 90,
      y0: [0.1, 0, 0],
      derivs: function (y) {
        var b = 0.208186;
        return [Math.sin(y[1]) - b * y[0], Math.sin(y[2]) - b * y[1], Math.sin(y[0]) - b * y[2]];
      }
    },
    aizawa: {
      label: "Aizawa",
      dt: 0.01,
      scale: 220,
      y0: [0.1, 0, 0],
      derivs: function (y) {
        var a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
        var x = y[0], yy = y[1], z = y[2];
        return [
          (z - b) * x - d * yy,
          d * x + (z - b) * yy,
          c + a * z - (z * z * z) / 3 - (x * x + yy * yy) * (1 + e * z) + f * z * x * x * x
        ];
      }
    },
    halvorsen: {
      label: "Halvorsen",
      dt: 0.005,
      scale: 22,
      y0: [0.1, 0.2, 0.3],
      derivs: function (y) {
        var a = 1.4;
        var x = y[0], yy = y[1], z = y[2];
        return [-a * x - 4 * yy - 4 * z - yy * yy, -a * yy - 4 * z - 4 * x - z * z, -a * z - 4 * x - 4 * yy - x * x];
      }
    },
    dadras: {
      label: "Dadras",
      dt: 0.005,
      scale: 15,
      y0: [1.1, 2.1, -2.1],
      derivs: function (y) {
        var a = 3, b = 2.7, c = 1.7, d = 2, e = 9;
        var x = y[0], yy = y[1], z = y[2];
        return [yy - a * x + b * yy * z, c * yy - x * z + z, d * x * yy - e * z];
      }
    }
  };

  var current = "thomas";
  var state, angleY;

  function reset() {
    state = SYSTEMS[current].y0.slice();
    angleY = 0;
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, setup.width, setup.height);
  }

  function physicsUpdate(dt) {
    var sys = SYSTEMS[current];
    state = Kaaos.rk4Step(state, sys.dt, sys.derivs);
    angleY += dt * 0.15;
  }

  function project(p) {
    var sys = SYSTEMS[current];
    var r = Kaaos.rotate3D(p[0], p[1], p[2], 0.5, angleY);
    var scale = Math.min(setup.width, setup.height) / sys.scale;
    return { x: setup.width / 2 + r[0] * scale, y: setup.height / 2 + r[1] * scale };
  }

  function render() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(8,9,11,0.1)";
    ctx.fillRect(0, 0, setup.width, setup.height);

    ctx.globalCompositeOperation = "lighter";
    var p = project(state);
    ctx.fillStyle = colorAccent;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  var loop = Kaaos.fixedTimestepLoop({
    dt: 1 / 240,
    update: physicsUpdate,
    render: render,
    onAutoPause: function () { setPlaying(false); }
  });

  var btnPlay = document.getElementById("ctrl-play");
  var btnReset = document.getElementById("ctrl-reset");
  var speedSlider = document.getElementById("ctrl-speed");
  var speedReadout = document.getElementById("ctrl-speed-readout");
  var drawerButtons = document.querySelectorAll("[data-system]");

  function setPlaying(playing) {
    if (playing) loop.start(); else loop.stop();
    if (btnPlay) {
      btnPlay.setAttribute("aria-pressed", playing ? "false" : "true");
      btnPlay.textContent = playing ? "Tauko · Pause" : "Toista · Play";
    }
  }

  drawerButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      current = btn.getAttribute("data-system");
      drawerButtons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      reset();
    });
  });

  if (btnPlay) btnPlay.addEventListener("click", function () { setPlaying(!loop.isRunning()); });
  if (btnReset) btnReset.addEventListener("click", reset);
  if (speedSlider) {
    speedSlider.addEventListener("input", function () {
      var v = parseFloat(speedSlider.value);
      loop.setTimeScale(v);
      if (speedReadout) speedReadout.textContent = v.toFixed(2) + "×";
    });
  }

  reset();
  render();
  setPlaying(false);
})();
