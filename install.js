// =====================================================================
// JOVI SYSTEM · Prestamos Pro — aviso de "Instalar app"
// Funciona distinto segun el dispositivo:
//  - Android / Chrome / Edge (PC): usa el evento nativo beforeinstallprompt,
//    un clic instala de verdad.
//  - iOS (Safari/Chrome en iPhone/iPad): Apple no permite instalar con un
//    clic desde la web, así que se muestran las 2 instrucciones manuales.
//  - Si ya esta instalada (abierta como app), no se muestra nada.
// =====================================================================

(function () {
  const STORAGE_KEY = "jovi_install_dismissed_at";
  const DISMISS_DAYS = 14;

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function wasDismissedRecently() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const elapsedDays = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
    return elapsedDays < DISMISS_DAYS;
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    hideBanner();
  }

  function showBanner(text, showInstallBtn) {
    const banner = document.getElementById("installBanner");
    const textEl = document.getElementById("installBannerText");
    const btn = document.getElementById("installBtn");
    if (!banner) return;
    if (textEl) textEl.textContent = text;
    if (btn) btn.style.display = showInstallBtn ? "" : "none";
    banner.classList.add("show");
    banner.setAttribute("aria-hidden", "false");
  }

  function hideBanner() {
    const banner = document.getElementById("installBanner");
    if (banner) { banner.classList.remove("show"); banner.setAttribute("aria-hidden", "true"); }
  }

  if (isStandalone() || wasDismissedRecently()) return;

  const ua = window.navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
  let deferredPrompt = null;

  if (isIos) {
    // Safari en iOS no dispara beforeinstallprompt: instrucciones manuales.
    window.addEventListener("DOMContentLoaded", () => {
      showBanner("Toca compartir (⬆) y luego \"Agregar a inicio\"", false);
    });
  } else {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
      showBanner("Accede mas rapido desde tu pantalla de inicio", true);
    });

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      hideBanner();
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    const installBtn = document.getElementById("installBtn");
    const dismissBtn = document.getElementById("installDismissBtn");

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) { hideBanner(); return; }
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        hideBanner();
      });
    }

    if (dismissBtn) dismissBtn.addEventListener("click", dismiss);
  });
})();
