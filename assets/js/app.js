// =============================
// ZELETAS HUB - APP JS (FASE 1)
// =============================

// Menu Mobile
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
const overlay = document.querySelector(".overlay");

function openMenu() {
  mobileMenu.classList.add("active");
  overlay.classList.add("active");
}

function closeMenu() {
  mobileMenu.classList.remove("active");
  overlay.classList.remove("active");
}

if (hamburger) {
  hamburger.addEventListener("click", () => {
    if (mobileMenu.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

if (overlay) {
  overlay.addEventListener("click", closeMenu);
}

// Cerrar menú al clicar un enlace
document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});
