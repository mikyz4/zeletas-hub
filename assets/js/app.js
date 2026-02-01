// assets/js/app.js
import { supabase } from './supabase.js';
import { Vonage } from "https://cdn.jsdelivr.net/npm/@vonage/server-sdk/dist/vonage.js";

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
  // MODAL LOGIN
  // =============================
  const modalLogin = document.getElementById('modalLogin');
  const btnLogin = document.getElementById('btnLogin');
  const closeLogin = document.getElementById('closeLogin');
  const mensajeModal = document.getElementById('mensajeModal');

  btnLogin?.addEventListener('click', () => modalLogin.classList.add('active'));
  closeLogin?.addEventListener('click', () => modalLogin.classList.remove('active'));
  window.addEventListener('click', e => { if(e.target === modalLogin) modalLogin.classList.remove('active'); });

  // =============================
  // GOOGLE LOGIN
  // =============================
  document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "https://zeletas.netlify.app" }
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
  // VONAGE LOGIN POR TELÉFONO
  // =============================
  const vonage = new Vonage({
    apiKey: "TU_VONAGE_API_KEY",
    apiSecret: "TU_VONAGE_API_SECRET"
  });

  let requestIdGlobal = null;
  const phoneInput = document.getElementById('loginPhone');
  const codeInput = document.getElementById('verifyCode');
  const verifyDiv = document.querySelector('.verify-code');

  // ENVIAR CÓDIGO
  document.getElementById('phoneLoginBtn')?.addEventListener('click', async () => {
    const phoneNumber = phoneInput.value.trim();
    if(!phoneNumber){
      mensajeModal.textContent = "Introduce un número de teléfono válido";
      mensajeModal.style.color = "red";
      return;
    }

    try {
      const resp = await vonage.verify.start({ number: phoneNumber, brand: "Zeletas" });
      requestIdGlobal = resp.request_id;
      mensajeModal.textContent = "Código enviado. Revisa tu teléfono.";
      mensajeModal.style.color = "green";
      verifyDiv.style.display = "block";
    } catch(e){
      console.error("Error Vonage Verify:", e);
      mensajeModal.textContent = "Error enviando código: " + e.message;
      mensajeModal.style.color = "red";
    }
  });

  // VERIFICAR CÓDIGO
  document.getElementById('verifyCodeBtn')?.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    if(!code || !requestIdGlobal){
      mensajeModal.textContent = "Introduce el código recibido.";
      mensajeModal.style.color = "red";
      return;
    }

    try {
      const resp = await vonage.verify.check(requestIdGlobal, code);
      if(resp.status === "0"){
        mensajeModal.textContent = "Teléfono verificado. Creando sesión...";
        mensajeModal.style.color = "green";

        // CREAR O INICIAR USUARIO EN SUPABASE
        const { data: userData, error: signInError } = await supabase.auth.signInWithOtp({
          phone: phoneInput.value.trim(),
          options: { createUser: true }
        });

        if(signInError){
          mensajeModal.textContent = "Error creando sesión: " + signInError.message;
          mensajeModal.style.color = "red";
          return;
        }

        mensajeModal.textContent = "Sesión iniciada correctamente.";
        mensajeModal.style.color = "green";

        setTimeout(() => window.location.href = "perfil/index.html", 1000);
      } else {
        mensajeModal.textContent = "Código incorrecto.";
        mensajeModal.style.color = "red";
      }
    } catch(e){
      console.error("Error verificando código:", e);
      mensajeModal.textContent = "Error verificando código: " + e.message;
      mensajeModal.style.color = "red";
    }
  });

});
