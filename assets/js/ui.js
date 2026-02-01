// assets/js/ui.js

// 1. IMPORTAMOS SUPABASE (Esto es lo que faltaba para que funcione el login)
import { supabase } from './supabase.js';

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

  // Funciones para abrir/cerrar
  const abrirModal = () => modalCuenta.classList.add('active');
  const cerrarModal = () => modalCuenta.classList.remove('active');

  btnCuenta?.addEventListener('click', abrirModal);
  btnCuentaMobile?.addEventListener('click', abrirModal);
  
  closeCuenta?.addEventListener('click', cerrarModal);
  window.addEventListener('click', e => {
    if (e.target === modalCuenta) cerrarModal();
  });

  // =======================================================
  // 🔥 LÓGICA DE GOOGLE LOGIN (RECUPERADA) 🔥
  // =======================================================
  // Buscamos cualquier botón de Google (en el modal o en la página)
  const googleBtns = document.querySelectorAll('#googleLoginBtn, #googleLoginBtnModal, .btn-google');

  googleBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Feedback visual para el usuario
      if(mensajeModal) {
        mensajeModal.textContent = "Conectando con Google...";
        mensajeModal.style.color = "#666";
      }

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            // Importante: Esta URL debe coincidir con la de Supabase > Auth > URL Configuration
            redirectTo: window.location.origin + "/acceso/" 
          }
        });
        if (error) throw error;
      } catch (e) {
        console.error("Error Login:", e);
        if(mensajeModal) {
            mensajeModal.textContent = "Error: " + e.message;
            mensajeModal.style.color = "red";
        }
      }
    });
  });

  // =============================
  // SIMULACIÓN DE LOGIN TELÉFONO (Solo visual)
  // =============================
  // (Mantengo tu código original aquí por si lo usas de momento)
  const phoneInput = document.getElementById('loginPhone');
  const codeInput = document.getElementById('verifyCode');
  const verifyDiv = document.querySelector('.verify-code');
  const phoneLoginBtn = document.getElementById('phoneLoginBtn');
  const verifyCodeBtn = document.getElementById('verifyCodeBtn');

  phoneLoginBtn?.addEventListener('click', () => {
    if (!phoneInput.value.trim()) {
      if(mensajeModal) {
          mensajeModal.textContent = "Introduce un número de teléfono válido";
          mensajeModal.style.color = "red";
      }
      return;
    }
    if(mensajeModal) {
        mensajeModal.textContent = "Código enviado (simulado).";
        mensajeModal.style.color = "green";
    }
    if(verifyDiv) verifyDiv.style.display = "block";
  });

  verifyCodeBtn?.addEventListener('click', () => {
    if (!codeInput.value.trim()) {
      if(mensajeModal) {
        mensajeModal.textContent = "Introduce el código recibido.";
        mensajeModal.style.color = "red";
      }
      return;
    }
    if(mensajeModal) {
        mensajeModal.textContent = "Código verificado (simulado). Redirigiendo...";
        mensajeModal.style.color = "green";
    }
    setTimeout(() => {
      // Ajusta esta ruta si es necesario
      window.location.href = "perfil/index.html"; 
    }, 1000);
  });

});
