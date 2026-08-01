/*
  Kaaostoimisto — shared client-side utilities.

  Deliberately small. Navigation is hardcoded HTML on every page (not
  injected here) so the site's structure keeps working with JS
  disabled, per the self-check in agent/AGENT.md. Likewise there is no
  language-toggle script: both languages render side by side in plain
  HTML. This file exists for genuinely shared logic that multiple
  exhibits/departments need — today, date-seeded pseudo-randomness so
  a "random" display shows the same value to every visitor on a given
  day without any storage or network call.
*/

window.Kaaos = (function () {
  function dateSeed(date) {
    date = date || new Date();
    var key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    return key;
  }

  // mulberry32 — tiny deterministic PRNG, good enough for decorative use.
  function mulberry32(seed) {
    var a = seed;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededRandom(salt, date) {
    var seed = dateSeed(date) + (typeof salt === "number" ? salt : hashString(String(salt || "")));
    return mulberry32(seed);
  }

  function hashString(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return {
    dateSeed: dateSeed,
    seededRandom: seededRandom,
    prefersReducedMotion: prefersReducedMotion
  };
})();
