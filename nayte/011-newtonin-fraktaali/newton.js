/*
  Näyte 011 — Newtonin fraktaali (Newton's fractal)

  Per-pixel WebGL2 fragment shader: every pixel is a starting point z0 in
  the complex plane, iterated under Newton's method z_{n+1} = z_n -
  f(z_n)/f'(z_n) for a chosen polynomial (z³−1, z⁴−1, or z⁵−z), then
  colored by which root it converged to. Same architecture as Näyte 010
  (basins.js) and both known WebGL bugs from that build apply here too:
  `preserveDrawingBuffer: true` is required on the context (a one-time
  render, not a per-frame animation), and the resize of the canvas's
  backing store happens before the first draw call, not after.

  Iteration cap: 60. Newton's method converges quadratically, so almost
  every point is within double-precision's root accuracy in under 20
  iterations; only points near the fractal basin boundary itself are
  still bouncing around at 60 (this is the actual source of the
  boundary's fractal structure, not a rendering artifact — the same
  finite-iteration truncation any Newton-fractal renderer uses). Beyond
  ~60 the single-precision float error in the shader (~1e-7 relative)
  already dominates any further refinement, so more iterations wouldn't
  sharpen the boundary, just cost more GPU time.

  Singular pixels (f'(z) ≈ 0, i.e. exactly on a critical point of the
  polynomial) are colored black rather than left as shader NaN/Inf —
  these form a measure-zero set and are visually invisible except as
  isolated dark points where multiple basins meet.

  If WebGL2 is unavailable, a pre-rendered PNG (computed with this exact
  CPU model, default polynomial z³−1) is shown instead.
*/

(function () {
  "use strict";

  // Mode 0: z^3-1, Mode 1: z^4-1, Mode 2: z^5-z
  var MODES = [
    { key: "3", numRoots: 3, roots: [[1, 0], [-0.5, 0.8660254037844387], [-0.5, -0.8660254037844387]] },
    { key: "4", numRoots: 4, roots: [[1, 0], [0, 1], [-1, 0], [0, -1]] },
    { key: "5z", numRoots: 5, roots: [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]] }
  ];
  var COLORS = [
    [0.96, 0.24, 0.15], // red-orange
    [0.31, 0.69, 0.48], // green
    [0.37, 0.58, 0.79], // blue
    [0.86, 0.72, 0.22], // amber
    [0.62, 0.42, 0.82]  // violet
  ];
  var STEPS = 60;
  var BOUNDS = { xMin: -1.6, xMax: 1.6, yMin: -1.6, yMax: 1.6 };
  var SINGULAR_EPS2 = 1e-14;

  var currentMode = 0;

  // ---- CPU reference model (double precision) ----
  // modeIdx: 0/1/2, matching MODES above. Returns root index, or -1 if
  // the iteration hit a singular point (f'(z) ~ 0) before converging.
  function cpuNewton(x0, y0, modeIdx) {
    var zx = x0, zy = y0;
    for (var i = 0; i < STEPS; i++) {
      var z2x = zx * zx - zy * zy, z2y = 2 * zx * zy;
      var z3x = z2x * zx - z2y * zy, z3y = z2x * zy + z2y * zx;
      var z4x = z3x * zx - z3y * zy, z4y = z3x * zy + z3y * zx;
      var z5x = z4x * zx - z4y * zy, z5y = z4x * zy + z4y * zx;
      var fx, fy, fpx, fpy;
      if (modeIdx === 0) { fx = z3x - 1; fy = z3y; fpx = 3 * z2x; fpy = 3 * z2y; }
      else if (modeIdx === 1) { fx = z4x - 1; fy = z4y; fpx = 4 * z3x; fpy = 4 * z3y; }
      else { fx = z5x - zx; fy = z5y - zy; fpx = 5 * z4x - 1; fpy = 5 * z4y; }
      var denom = fpx * fpx + fpy * fpy;
      if (denom < SINGULAR_EPS2) return -1;
      var qx = (fx * fpx + fy * fpy) / denom;
      var qy = (fy * fpx - fx * fpy) / denom;
      zx -= qx; zy -= qy;
    }
    var roots = MODES[modeIdx].roots;
    var best = Infinity, bestIdx = 0;
    for (var r = 0; r < roots.length; r++) {
      var dx = zx - roots[r][0], dy = zy - roots[r][1];
      var d = dx * dx + dy * dy;
      if (d < best) { best = d; bestIdx = r; }
    }
    return bestIdx;
  }

  // Returns the full iterate path (for the overlay), one [x,y] per step.
  function cpuNewtonPath(x0, y0, modeIdx) {
    var zx = x0, zy = y0;
    var path = [[zx, zy]];
    for (var i = 0; i < STEPS; i++) {
      var z2x = zx * zx - zy * zy, z2y = 2 * zx * zy;
      var z3x = z2x * zx - z2y * zy, z3y = z2x * zy + z2y * zx;
      var z4x = z3x * zx - z3y * zy, z4y = z3x * zy + z3y * zx;
      var z5x = z4x * zx - z4y * zy, z5y = z4x * zy + z4y * zx;
      var fx, fy, fpx, fpy;
      if (modeIdx === 0) { fx = z3x - 1; fy = z3y; fpx = 3 * z2x; fpy = 3 * z2y; }
      else if (modeIdx === 1) { fx = z4x - 1; fy = z4y; fpx = 4 * z3x; fpy = 4 * z3y; }
      else { fx = z5x - zx; fy = z5y - zy; fpx = 5 * z4x - 1; fpy = 5 * z4y; }
      var denom = fpx * fpx + fpy * fpy;
      if (denom < SINGULAR_EPS2) break;
      var qx = (fx * fpx + fy * fpy) / denom;
      var qy = (fy * fpx - fx * fpy) / denom;
      zx -= qx; zy -= qy;
      path.push([zx, zy]);
      if (fx * fx + fy * fy < 1e-24) break;
    }
    return path;
  }

  var canvas = document.getElementById("fractal-canvas");
  var overlay = document.getElementById("overlay-canvas");
  var fallbackImg = document.getElementById("fallback-img");
  var noteEl = document.getElementById("render-note");
  var gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true });

  var VS = "#version 300 es\nin vec2 aPos;\nvoid main(){ gl_Position = vec4(aPos,0.0,1.0); }";
  var FS = [
    "#version 300 es",
    "precision highp float;",
    "uniform vec2 uResolution;",
    "uniform vec4 uBounds;",
    "uniform int uMode;",
    "uniform vec2 uRoots[5];",
    "uniform int uNumRoots;",
    "uniform vec3 uColors[5];",
    "uniform int uSteps;",
    "out vec4 fragColor;",
    "vec2 cMul(vec2 a, vec2 b){ return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x); }",
    "vec2 cDiv(vec2 a, vec2 b){ float d = dot(b,b); return vec2(a.x*b.x+a.y*b.y, a.y*b.x-a.x*b.y)/d; }",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uResolution;",
    "  vec2 z = vec2(uBounds.x + uv.x*(uBounds.y-uBounds.x), uBounds.z + uv.y*(uBounds.w-uBounds.z));",
    "  bool singular = false;",
    "  for (int i = 0; i < 100; i++) {",
    "    if (i >= uSteps) break;",
    "    vec2 z2 = cMul(z,z); vec2 z3 = cMul(z2,z); vec2 z4 = cMul(z3,z); vec2 z5 = cMul(z4,z);",
    "    vec2 f, fp;",
    "    if (uMode == 0) { f = z3 - vec2(1.0,0.0); fp = 3.0*z2; }",
    "    else if (uMode == 1) { f = z4 - vec2(1.0,0.0); fp = 4.0*z3; }",
    "    else { f = z5 - z; fp = 5.0*z4 - vec2(1.0,0.0); }",
    "    float denom = dot(fp,fp);",
    "    if (denom < 1e-14) { singular = true; break; }",
    "    z -= cDiv(f,fp);",
    "  }",
    "  if (singular) { fragColor = vec4(0.0,0.0,0.0,1.0); return; }",
    "  float best = 1e9; int bestIdx = 0;",
    "  for (int r = 0; r < 5; r++) {",
    "    if (r >= uNumRoots) break;",
    "    float d = distance(z, uRoots[r]);",
    "    if (d < best) { best = d; bestIdx = r; }",
    "  }",
    "  vec3 color = uColors[0];",
    "  if (bestIdx == 1) color = uColors[1];",
    "  if (bestIdx == 2) color = uColors[2];",
    "  if (bestIdx == 3) color = uColors[3];",
    "  if (bestIdx == 4) color = uColors[4];",
    "  fragColor = vec4(color, 1.0);",
    "}"
  ].join("\n");

  var usingShader = false;

  function renderShader() {
    // Resize the canvas's backing store BEFORE touching WebGL — see
    // basins.js (Näyte 010) for why: resizing immediately before the
    // first draw call can silently drop that draw.
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    var errors = [];
    var program = Kaaos.compileGLProgram(gl, VS, FS, errors);
    if (!program) return false;
    gl.useProgram(program);
    gl.viewport(0, 0, canvas.width, canvas.height);

    var mode = MODES[currentMode];
    var rootsFlat = [];
    for (var i = 0; i < 5; i++) {
      var rt = mode.roots[i] || [1e6, 1e6];
      rootsFlat.push(rt[0], rt[1]);
    }
    var colorsFlat = [].concat.apply([], COLORS);

    gl.uniform2f(gl.getUniformLocation(program, "uResolution"), canvas.width, canvas.height);
    gl.uniform4f(gl.getUniformLocation(program, "uBounds"), BOUNDS.xMin, BOUNDS.xMax, BOUNDS.yMin, BOUNDS.yMax);
    gl.uniform1i(gl.getUniformLocation(program, "uMode"), currentMode);
    gl.uniform2fv(gl.getUniformLocation(program, "uRoots"), new Float32Array(rootsFlat));
    gl.uniform1i(gl.getUniformLocation(program, "uNumRoots"), mode.numRoots);
    gl.uniform3fv(gl.getUniformLocation(program, "uColors"), new Float32Array(colorsFlat));
    gl.uniform1i(gl.getUniformLocation(program, "uSteps"), STEPS);

    var aPos = gl.getAttribLocation(program, "aPos");
    Kaaos.drawFullscreenQuad(gl, aPos);
    return true;
  }

  function init() {
    if (gl) {
      try {
        usingShader = renderShader();
      } catch (e) {
        usingShader = false;
      }
    }

    if (!usingShader) {
      canvas.style.display = "none";
      if (fallbackImg) fallbackImg.style.display = "block";
      if (noteEl) noteEl.textContent = "WebGL2 ei ole käytettävissä — näytetään esilaskettu kuva (z³−1). · WebGL2 is unavailable — showing a pre-rendered image (z³−1).";
      var selector = document.getElementById("mode-selector");
      if (selector) selector.style.display = "none";
      return;
    }

    setupOverlay();
    setupSelector();
  }

  init();

  // ---- Polynomial selector ----
  function setupSelector() {
    var buttons = document.querySelectorAll("#mode-selector button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function (evt) {
        var key = evt.currentTarget.getAttribute("data-mode");
        var idx = MODES.map(function (m) { return m.key; }).indexOf(key);
        if (idx === -1 || idx === currentMode) return;
        currentMode = idx;
        for (var j = 0; j < buttons.length; j++) {
          buttons[j].setAttribute("aria-pressed", buttons[j] === evt.currentTarget ? "true" : "false");
        }
        renderShader();
        clearOverlay();
      });
    }
  }

  var octx, oSetup;
  function clearOverlay() {
    if (octx && oSetup) octx.clearRect(0, 0, oSetup.width, oSetup.height);
  }

  // ---- Click-to-overlay: primary path + a twin offset by 1e-6 ----
  // The twin demonstrates the fractal boundary directly: two starting
  // points a millionth apart are indistinguishable on screen, yet near
  // a boundary they can converge to different roots entirely.
  var TWIN_DELTA = 1e-6;

  function setupOverlay() {
    if (!overlay) return;
    octx = overlay.getContext("2d");
    oSetup = Kaaos.setupCanvas(overlay);

    function toScreen(x, y) {
      return {
        x: ((x - BOUNDS.xMin) / (BOUNDS.xMax - BOUNDS.xMin)) * oSetup.width,
        y: oSetup.height - ((y - BOUNDS.yMin) / (BOUNDS.yMax - BOUNDS.yMin)) * oSetup.height
      };
    }
    function toData(sx, sy) {
      return [
        BOUNDS.xMin + (sx / oSetup.width) * (BOUNDS.xMax - BOUNDS.xMin),
        BOUNDS.yMin + ((oSetup.height - sy) / oSetup.height) * (BOUNDS.yMax - BOUNDS.yMin)
      ];
    }
    function drawPath(path, style, width) {
      octx.strokeStyle = style;
      octx.lineWidth = width;
      octx.beginPath();
      var s0 = toScreen(path[0][0], path[0][1]);
      octx.moveTo(s0.x, s0.y);
      for (var i = 1; i < path.length; i++) {
        var s = toScreen(path[i][0], path[i][1]);
        octx.lineTo(s.x, s.y);
      }
      octx.stroke();
    }
    function markRoot(x, y, colorIdx) {
      var s = toScreen(x, y);
      var c = COLORS[colorIdx] || [1, 1, 1];
      octx.fillStyle = "rgb(" + Math.round(c[0] * 255) + "," + Math.round(c[1] * 255) + "," + Math.round(c[2] * 255) + ")";
      octx.beginPath();
      octx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      octx.fill();
    }

    overlay.addEventListener("click", function (evt) {
      var rect = overlay.getBoundingClientRect();
      var d = toData(evt.clientX - rect.left, evt.clientY - rect.top);
      clearOverlay();

      var pathA = cpuNewtonPath(d[0], d[1], currentMode);
      var pathB = cpuNewtonPath(d[0] + TWIN_DELTA, d[1], currentMode);
      var rootA = cpuNewton(d[0], d[1], currentMode);
      var rootB = cpuNewton(d[0] + TWIN_DELTA, d[1], currentMode);

      drawPath(pathA, "rgba(255,255,255,0.9)", 1.2);
      drawPath(pathB, "rgba(255,180,60,0.75)", 1.0);
      if (rootA >= 0) markRoot(pathA[pathA.length - 1][0], pathA[pathA.length - 1][1], rootA);
      if (rootB >= 0) markRoot(pathB[pathB.length - 1][0], pathB[pathB.length - 1][1], rootB);
    });
  }

  window.__kaaosCpuNewton = cpuNewton;
  window.__kaaosNewtonModes = MODES;
})();
