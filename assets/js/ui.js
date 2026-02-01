// assets/js/ui.js
document.addEventListener('DOMContentLoaded', () => {

  // =============================
  // MENÚ HAMBURGUESA MÓVIL
  // =============================
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.overlay');

  hamburger?.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  overlay?.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
  });

  // =============================
  // MODAL MI CUENTA
  // =============================
  const modalCuenta = document.getElementById('modalCuenta');
  const btnCuenta = document.getElementById('btnCuenta');
  const btnCuentaMobile = document.getElementById('btnCuentaMobile');
  const closeCuenta = document.getElementById('closeCuenta');
  const mensajeModal = document.getElementById('mensajeModal');

  // Abrir modal
  btnCuenta?.addEventListener('click', () => modalCuenta.classList.add('active'));
  btnCuentaMobile?.addEventListener('click', () => modalCuenta.classList.add('active'));

  // Cerrar modal
  closeCuenta?.addEventListener('click', () => modalCuenta.classList.remove('active'));
  window.addEventListener('click', e => {
    if (e.target === modalCuenta) modalCuenta.classList.remove('active');
  });

  // =============================
  // SIMULACIÓN DE LOGIN (solo UI)
  // =============================
  const phoneInput = document.getElementById('loginPhone');
  const codeInput = document.getElementById('verifyCode');
  const verifyDiv = document.querySelector('.verify-code');
  const phoneLoginBtn = document.getElementById('phoneLoginBtn');
  const verifyCodeBtn = document.getElementById('verifyCodeBtn');

  phoneLoginBtn?.addEventListener('click', () => {
    if (!phoneInput.value.trim()) {
      mensajeModal.textContent = "Introduce un número de teléfono válido";
      mensajeModal.style.color = "red";
      return;
    }
    mensajeModal.textContent = "Código enviado (simulado).";
    mensajeModal.style.color = "green";
    verifyDiv.style.display = "block";
  });

  verifyCodeBtn?.addEventListener('click', () => {
    if (!codeInput.value.trim()) {
      mensajeModal.textContent = "Introduce el código recibido.";
      mensajeModal.style.color = "red";
      return;
    }
    mensajeModal.textContent = "Código verificado (simulado). Sesión iniciada.";
    mensajeModal.style.color = "green";

    // Redirigir a perfil simulado
    setTimeout(() => {
      window.location.href = "perfil/index.html";
    }, 1000);
  });

});
