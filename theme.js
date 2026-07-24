// =====================================================================
// JOVI SYSTEM · Prestamos Pro — Interruptor de apariencia (claro/oscuro)
// Es una preferencia personal del dispositivo/navegador, no del negocio
// (el color de marca de cada empresa sigue siendo el que eligio en
// Configuracion > Apariencia; esto solo cambia fondo/texto claro u oscuro).
// =====================================================================

function toggleTheme() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("jovi_theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("jovi_theme", "light");
  }
}

document.querySelectorAll(".theme-toggle").forEach(btn => btn.addEventListener("click", toggleTheme));
