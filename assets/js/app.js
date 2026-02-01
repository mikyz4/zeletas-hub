// assets/js/app.js
import { supabase } from './supabase.js';
import { Vonage } from '@vonage/server-sdk';

document.addEventListener('DOMContentLoaded', () => {

  // =============================
  // MENÚ HAMBURGUESA MÓVIL
  // =============================
  try {
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
  } catch(e){ console.error("Error menú:", e); }

  // =============================
  // MODALES LOGIN / REGISTRO
  // =============================
  const modalLogin = document.getElementById('modalLogin');
  const modalRegistro = document.getElementById('modalRegistro');

  const btnLogin = document.getElementById('btnLogin');
  const btnLoginMobile = document.getElementById('btnLoginMobile');
  const closeLogin = document.getElementById('closeLogin');

  const mensajeModal = document.getElementById('mensajeModal');

  [btnLogin, btnLoginMobile].forEach(btn => btn?.addEventListener('click', () => modalLogin.classList.add('active')));

  closeLogin?.addEventListener('click', () => modalLogin.classList.remove('active'));

  window.addEventListener('click', e => {
    if(e.target === modalLogin) modalLogin.classList.remove('active');
  });

  // =============================
  // LOGIN CON GOOGLE (OAuth)
  // =============================
  document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://zeletas.netlify.app"
        }
      });

      if(error){
        mensajeModal.textContent = error.message;
        mensajeModal.style.color = "red";
      }
    } catch(e){
      console.error("Error Google OAuth:", e);
      mensajeModal.textContent = "Error inesperado con Google.";
      mensajeModal.style.color = "red";
    }
  });

  // =============================
  // LOGIN POR TELÉFONO (VONAGE VERIFY)
  // =============================
  const vonage = new Vonage({
    apiKey: "TU_API_KEY",
    apiSecret: "TU_API_SECRET"
  });

  let requestIdGlobal = null;

  document.getElementById('phoneLoginBtn')?.addEventListener('click', async () => {
    try {
      const phone = document.getElementById('loginPhone').value.trim();
      if(!phone){
        mensajeModal.textContent = "Introduce un número de teléfono válido";
        mensajeModal.style.color = "red";
        return;
      }

      // Inicia verificación
      const resp = await vonage.verify.start({
        number: phone,
        brand: "Zeletas"
      });

      requestIdGlobal = resp.request_id;
      mensajeModal.textContent = "Código enviado por SMS. Introduce el código recibido.";
      mensajeModal.style.color = "green";

      document.getElementById('verifyCodeBtn')?.addEventListener('click', async () => {
        const code = document.getElementById('verifyCode').value.trim();
        if(!code) return;

        const checkResp = await vonage.verify.check(requestIdGlobal, code);
        if(checkResp.status === "0"){
          mensajeModal.textContent = "¡Usuario verificado con éxito!";
          mensajeModal.style.color = "green";
          setTimeout(() => location.reload(), 1000);
        } else {
          mensajeModal.textContent = "Código incorrecto o fallo en verificación";
          mensajeModal.style.color = "red";
        }
      });

    } catch(e){
      console.error("Error Vonage Verify:", e);
      mensajeModal.textContent = "Error al enviar el SMS de verificación";
      mensajeModal.style.color = "red";
    }
  });

});
