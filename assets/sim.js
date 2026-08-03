/*
  Kaaostoimisto — shared numerics. Written once, tested once, reused
  by every exhibit. This is the highest-risk code in the site: a bug
  here is a bug in every specimen that depends on it.

  Provides:
    Kaaos.mulberry32(seed)      deterministic PRNG -> function(): [0,1)
    Kaaos.rk4Step(y, dt, f)     generic vector RK4 for dissipative ODEs
    Kaaos.fixedTimestepLoop()   accumulator-pattern rAF loop, decoupled
                                from frame rate, pauses on tab-hidden
    Kaaos.setupCanvas(canvas)   DPR-aware backing store, CSS-size driven
    Kaaos.prefersReducedMotion()

  Integrators for conservative systems (symplectic/semi-implicit) are
  system-specific — they need each system's mass matrix and Hamiltonian
  partials, which don't generalize the way RK4 does — so those live in
  the exhibit's own file (see nayte/001-kaksoisheiluri/pendulum.js for
  the double pendulum's symplectic Euler step).
*/

window.Kaaos = window.Kaaos || {};

(function (Kaaos) {
  "use strict";

  // ---- Deterministic PRNG ----
  // Same seed + same call sequence => identical output, always. Used
  // wherever an exhibit needs "randomness" that's still reproducible
  // (e.g. the tiny per-pendulum offsets in Näyte 001's ensemble mode).
  Kaaos.mulberry32 = function (seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // ---- Generic RK4 for y' = f(y) ----
  // y: number[], f: (y: number[]) => number[] of the same length.
  // Forward Euler is prohibited by agent/STANDARDS.md; this is the
  // floor for any dissipative/forced system (Lorenz, Rössler, Duffing).
  Kaaos.rk4Step = function (y, dt, f) {
    var n = y.length;
    var i;

    function addScaled(base, k, h) {
      var out = new Array(n);
      for (i = 0; i < n; i++) out[i] = base[i] + h * k[i];
      return out;
    }

    var k1 = f(y);
    var k2 = f(addScaled(y, k1, dt / 2));
    var k3 = f(addScaled(y, k2, dt / 2));
    var k4 = f(addScaled(y, k3, dt));

    var out = new Array(n);
    for (i = 0; i < n; i++) {
      out[i] = y[i] + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }
    return out;
  };

  // ---- Fixed-timestep accumulator loop ----
  // Physics always advances in fixed `dt` increments regardless of the
  // display's actual frame rate, so a slow frame can never change the
  // trajectory (only how many physics steps happen before the next
  // paint). `render(alpha)` is called once per animation frame with
  // the leftover fraction of a step (0..1) so the exhibit can
  // interpolate its own state for smooth motion between physics steps.
  //
  // Pauses itself when the tab is hidden (Page Visibility API) rather
  // than accumulating a huge catch-up backlog; does not auto-resume —
  // an exhibit's own Play control decides when to resume, consistent
  // with "no autoplay" under prefers-reduced-motion.
  Kaaos.fixedTimestepLoop = function (opts) {
    var dt = opts.dt;
    var update = opts.update;
    var render = opts.render;
    var onAutoPause = opts.onAutoPause || function () {};
    // Default is generous on purpose: a physically accurate conservative
    // integrator (see nayte/001) may need a very small dt (< 1e-4 s) for
    // its energy-drift invariant, which means hundreds of substeps per
    // 1/60s frame under normal operation, not just during catch-up.
    var maxStepsPerFrame = opts.maxStepsPerFrame || 2000;

    var running = false;
    var rafId = null;
    var lastTime = null;
    var accumulator = 0;
    var timeScale = 1;

    function frame(now) {
      if (!running) return;
      if (lastTime === null) lastTime = now;
      var frameSeconds = (now - lastTime) / 1000;
      lastTime = now;
      if (frameSeconds > 0.25) frameSeconds = 0.25; // clamp stalls/tab-switches

      accumulator += frameSeconds * timeScale;
      var steps = 0;
      while (accumulator >= dt && steps < maxStepsPerFrame) {
        update(dt);
        accumulator -= dt;
        steps++;
      }
      render(accumulator / dt);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      lastTime = null;
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && running) {
        stop();
        onAutoPause();
      }
    });

    return {
      start: start,
      stop: stop,
      isRunning: function () {
        return running;
      },
      setTimeScale: function (s) {
        timeScale = s;
      }
    };
  };

  // ---- DPR-aware canvas setup ----
  // The canvas's CSS box size is controlled entirely by CSS (see
  // .exhibit-frame canvas { aspect-ratio } in base.css) so it never
  // depends on — and never feeds back into — the internal pixel-buffer
  // resolution set here. Drawing code should use CSS-pixel coordinates
  // (0,0 .. cssWidth,cssHeight); the returned context is pre-scaled.
  Kaaos.setupCanvas = function (canvas, onResize) {
    var ctx = canvas.getContext("2d");
    var cssWidth = 0;
    var cssHeight = 0;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      cssWidth = rect.width;
      cssHeight = rect.height;
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (onResize) onResize(cssWidth, cssHeight);
    }

    resize();
    window.addEventListener("resize", resize);

    return {
      ctx: ctx,
      resize: resize,
      get width() {
        return cssWidth;
      },
      get height() {
        return cssHeight;
      }
    };
  };

  Kaaos.prefersReducedMotion = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  // ---- Hand-rolled 3D rotation (no library) ----
  // Rotates a point around the X axis by ax, then the resulting frame
  // around the Y axis by ay. Returns [x, y, z]; callers use x,y for an
  // orthographic screen position and z for a depth cue (alpha/size).
  // Shared by the attractor exhibits (Lorenz, Rössler, the attractor
  // cabinet) so the projection convention is identical across all of
  // them.
  Kaaos.rotate3D = function (x, y, z, ax, ay) {
    var cosA = Math.cos(ax), sinA = Math.sin(ax);
    var y1 = y * cosA - z * sinA;
    var z1 = y * sinA + z * cosA;
    var cosB = Math.cos(ay), sinB = Math.sin(ay);
    var x2 = x * cosB + z1 * sinB;
    var z2 = -x * sinB + z1 * cosB;
    return [x2, y1, z2];
  };

  // ---- Minimal WebGL2 program compile/link helper ----
  // Shared by the two per-pixel shader exhibits (basins, Newton's
  // fractal) so shader-error handling is written once. Returns
  // {program, gl} on success, or null (with details in errors[]) on
  // failure — callers use a failed compile as the WebGL2-unavailable
  // signal and fall back to the committed PNG, same as an actually
  // missing webgl2 context.
  Kaaos.compileGLProgram = function (gl, vsSource, fsSource, errors) {
    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        if (errors) errors.push(gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }
    var vs = compile(gl.VERTEX_SHADER, vsSource);
    var fs = compile(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (errors) errors.push(gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  };

  // Binds a fullscreen quad (two triangles) to attribute location
  // `aPosLoc` — every per-pixel shader exhibit needs exactly this.
  Kaaos.drawFullscreenQuad = function (gl, aPosLoc) {
    var quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
})(window.Kaaos);
