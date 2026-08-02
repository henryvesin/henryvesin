/*
  Kaaostoimisto — appearance switch ("Vakiomuoto" / "Uusi ilme").
  Purely decorative UI, like the exhibit toys: without JS the switch
  is inert and the site simply stays in its default appearance, which
  remains the complete, fully-functional experience. See the small
  inline snippet in each page's <head> for the flash-of-wrong-theme
  guard this script complements.
*/

window.Kaaos = window.Kaaos || {};
Kaaos.THEME_STORAGE_KEY = "kaaos-theme";

(function () {
  "use strict";

  var root = document.documentElement;

  function syncButtons(theme) {
    var buttons = document.querySelectorAll(".theme-switch button[data-theme-value]");
    for (var i = 0; i < buttons.length; i++) {
      var pressed = buttons[i].getAttribute("data-theme-value") === theme;
      buttons[i].setAttribute("aria-pressed", pressed ? "true" : "false");
    }
  }

  function applyTheme(theme) {
    if (theme === "agency") {
      root.setAttribute("data-theme", "agency");
    } else {
      root.removeAttribute("data-theme");
      theme = "standard";
    }
    syncButtons(theme);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var switchEl = document.querySelector(".theme-switch");
    if (!switchEl) return;

    syncButtons(root.getAttribute("data-theme") === "agency" ? "agency" : "standard");

    switchEl.addEventListener("click", function (evt) {
      var btn = evt.target.closest ? evt.target.closest("button[data-theme-value]") : null;
      if (!btn) return;
      var value = btn.getAttribute("data-theme-value");
      try {
        localStorage.setItem(Kaaos.THEME_STORAGE_KEY, value);
      } catch (e) {
        /* private browsing or storage disabled — theme just won't persist */
      }
      applyTheme(value);
    });
  });
})();
