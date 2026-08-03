/*
  Näyte 012 — Kissakuvaus (Arnold's cat map)

  Discrete map on an N×N torus: (x,y) -> ((2x+y) mod N, (x+y) mod N).
  The matrix [[2,1],[1,1]] has determinant 1, so this is a bijection of
  the N×N lattice onto itself for any N — every iteration is an exact
  integer permutation of pixels, no floating point involved anywhere.
  That means the recurrence (the image returning to its exact original
  state) isn't approximate the way a floating-point invariant would be
  — it's bit-exact, checked directly in the browser by comparing pixel
  arrays.

  Image: a small programmatically-drawn glyph (a cat face, since the
  Finnish name is literally "cat-mapping"), not a sourced photograph —
  there's no practical way to source a rights-clear photo file in this
  environment, so this substitution is disclosed on the placard per
  the spec's "disclose simplifications" rule. It's drawn once, at
  N×N resolution, directly into an offscreen canvas.

  Recurrence period: NOT looked up from a formula — the period of the
  cat map for a given N is the order of the matrix mod N, which was
  found here by direct computation (see agent/LOG.md for the method
  and the actual measured value for this N). Iterating the shared test
  harness confirmed the image returns pixel-for-pixel identical to the
  original at exactly that many steps, and not before.
*/

(function () {
  "use strict";

  var N = 64;
  var MAT = [[2, 1], [1, 1]]; // det = 1 => bijection of the N×N lattice mod N

  function mapPoint(x, y) {
    return [(2 * x + y) % N, (x + y) % N];
  }

  // ---- Build the base glyph once, at N×N resolution ----
  function buildOriginal() {
    var off = document.createElement("canvas");
    off.width = N; off.height = N;
    var octx = off.getContext("2d");

    octx.fillStyle = "#0a0d10";
    octx.fillRect(0, 0, N, N);

    octx.fillStyle = "#5e94c9"; // head/ears
    // ears
    octx.beginPath();
    octx.moveTo(14, 22); octx.lineTo(22, 6); octx.lineTo(28, 20); octx.closePath();
    octx.fill();
    octx.beginPath();
    octx.moveTo(50, 22); octx.lineTo(42, 6); octx.lineTo(36, 20); octx.closePath();
    octx.fill();
    // head
    octx.beginPath();
    octx.arc(32, 36, 21, 0, Math.PI * 2);
    octx.fill();

    // eyes
    octx.fillStyle = "#f0efe9";
    octx.beginPath(); octx.arc(24, 33, 4, 0, Math.PI * 2); octx.fill();
    octx.beginPath(); octx.arc(40, 33, 4, 0, Math.PI * 2); octx.fill();
    octx.fillStyle = "#0a0d10";
    octx.beginPath(); octx.arc(24, 33, 1.6, 0, Math.PI * 2); octx.fill();
    octx.beginPath(); octx.arc(40, 33, 1.6, 0, Math.PI * 2); octx.fill();

    // nose + whisker dots
    octx.fillStyle = "#e8845a";
    octx.beginPath(); octx.moveTo(32, 40); octx.lineTo(29, 44); octx.lineTo(35, 44); octx.closePath(); octx.fill();

    return octx.getImageData(0, 0, N, N);
  }

  var originalData = buildOriginal();
  var current = new Uint8ClampedArray(originalData.data);
  var iteration = 0;

  function idx(x, y) { return (y * N + x) * 4; }

  function stepMap() {
    var next = new Uint8ClampedArray(N * N * 4);
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        var d = mapPoint(x, y);
        var si = idx(x, y), di = idx(d[0], d[1]);
        next[di] = current[si]; next[di + 1] = current[si + 1];
        next[di + 2] = current[si + 2]; next[di + 3] = current[si + 3];
      }
    }
    current = next;
    iteration++;
    for (var i = 0; i < markers.length; i++) {
      var m = mapPoint(markers[i].x, markers[i].y);
      markers[i].x = m[0]; markers[i].y = m[1];
    }
  }

  function resetState() {
    current = new Uint8ClampedArray(originalData.data);
    iteration = 0;
    markers = [];
  }

  // ---- Rendering ----
  var canvas = document.getElementById("catmap-canvas");
  var setup = Kaaos.setupCanvas(canvas);
  var ctx = setup.ctx;
  var offCanvas = document.createElement("canvas");
  offCanvas.width = N; offCanvas.height = N;
  var offCtx = offCanvas.getContext("2d");

  var markers = [];

  function render() {
    offCtx.putImageData(new ImageData(current, N, N), 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, N, N, 0, 0, setup.width, setup.height);

    var cell = setup.width / N;
    var colors = ["rgba(255,255,255,0.95)", "rgba(255,180,60,0.9)"];
    for (var i = 0; i < markers.length; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc((markers[i].x + 0.5) * cell, (markers[i].y + 0.5) * cell, Math.max(2, cell * 0.35), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  var readout = document.getElementById("iter-readout");
  function updateReadout() {
    if (readout) readout.textContent = "Iteraatio " + iteration + " · jakso 48 · Iteration " + iteration + " · period 48";
  }

  // ---- Play/pause via the shared fixed-timestep loop ----
  // dt is seconds *per map iteration* (not a physics dt) — this is a
  // discrete map, so "speed" scales how many iterations happen per
  // second, not integration accuracy.
  var loop = Kaaos.fixedTimestepLoop({
    dt: 0.28,
    update: function () { stepMap(); },
    render: function () { render(); updateReadout(); },
    onAutoPause: function () { setPlaying(false); }
  });

  var btnPlay = document.getElementById("ctrl-play");
  var btnReset = document.getElementById("ctrl-reset");
  var btnTwin = document.getElementById("ctrl-twin");
  var speedSlider = document.getElementById("ctrl-speed");
  var speedReadout = document.getElementById("ctrl-speed-readout");

  function setPlaying(playing) {
    if (playing) loop.start(); else loop.stop();
    if (btnPlay) {
      btnPlay.setAttribute("aria-pressed", playing ? "true" : "false");
      btnPlay.textContent = playing ? "Tauko · Pause" : "Toista · Play";
    }
  }

  if (btnPlay) btnPlay.addEventListener("click", function () { setPlaying(!loop.isRunning()); });
  if (btnReset) btnReset.addEventListener("click", function () {
    setPlaying(false);
    resetState();
    render();
    updateReadout();
  });
  if (btnTwin) btnTwin.addEventListener("click", function () {
    if (markers.length === 0) {
      markers.push({ x: Math.floor(N / 2), y: Math.floor(N / 2) });
    }
    if (markers.length === 1) {
      markers.push({ x: (markers[0].x + 1) % N, y: markers[0].y });
    }
    render();
  });
  if (speedSlider) {
    speedSlider.addEventListener("input", function () {
      var v = parseFloat(speedSlider.value);
      loop.setTimeScale(v);
      if (speedReadout) speedReadout.textContent = v.toFixed(2) + "×";
    });
  }

  canvas.addEventListener("click", function (evt) {
    var rect = canvas.getBoundingClientRect();
    var cell = rect.width / N;
    var gx = Math.floor((evt.clientX - rect.left) / cell);
    var gy = Math.floor((evt.clientY - rect.top) / cell);
    gx = Math.max(0, Math.min(N - 1, gx));
    gy = Math.max(0, Math.min(N - 1, gy));
    markers = [{ x: gx, y: gy }];
    render();
  });

  render();
  updateReadout();

  window.__kaaosCatMap = {
    N: N,
    mapPoint: mapPoint,
    getOriginal: function () { return originalData.data; },
    getCurrent: function () { return current; },
    stepMap: stepMap,
    getIteration: function () { return iteration; }
  };
})();
