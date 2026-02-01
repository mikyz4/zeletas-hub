import { supabase } from '../assets/js/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Comprobar si el usuario acaba de entrar
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        console.log("¡Sesión detectada!", session.user);
        // Limpiamos la URL (quita el token de la vista)
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirigimos al perfil tras 1 segundo de cortesía
        setTimeout(() => {
            window.location.href = "../perfil/"; 
        }, 1000);
    }
    
    // ... resto de tu código de botones ...
});

import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {

  // =============================
  // MODAL MI CUENTA
  // =============================
  const modalCuenta = document.getElementById('modalCuenta');
  const btnCuenta = document.getElementById('btnCuenta');
  const btnCuentaMobile = document.getElementById('btnCuentaMobile');
  const closeCuenta = document.getElementById('closeCuenta');
  const mensajeModal = document.getElementById('mensajeModal');

  btnCuenta?.addEventListener('click', () => modalCuenta.classList.add('active'));
  btnCuentaMobile?.addEventListener('click', () => modalCuenta.classList.add('active'));
  closeCuenta?.addEventListener('click', () => modalCuenta.classList.remove('active'));
  window.addEventListener('click', e => { if(e.target === modalCuenta) modalCuenta.classList.remove('active'); });

  // =============================
  // GOOGLE LOGIN
  // =============================
  document.querySelectorAll('#googleLoginBtn, #googleLoginBtnModal').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: "https://zeletas.netlify.app/acceso/" }
        });
        if(error) throw error;
      } catch(e) {
        mensajeModal.textContent = "Error Google: " + e.message;
        mensajeModal.style.color = "red";
      }
    });
  });

  // =============================
  // OTP SIMULADO
  // =============================
  const logins = [
    { phoneInput: 'loginPhone', codeInput: 'verifyCode', btnSend: 'phoneLoginBtn', btnVerify: 'verifyCodeBtn', mensajeEl: 'mensaje' },
    { phoneInput: 'loginPhoneModal', codeInput: 'verifyCodeModal', btnSend: 'phoneLoginBtnModal', btnVerify: 'verifyCodeBtnModal', mensajeEl: 'mensajeModal' }
  ];

  logins.forEach(({ phoneInput, codeInput, btnSend, btnVerify, mensajeEl }) => {
    const phone = document.getElementById(phoneInput);
    const code = document.getElementById(codeInput);
    const sendBtn = document.getElementById(btnSend);
    const verifyBtn = document.getElementById(btnVerify);
    const mensaje = document.getElementById(mensajeEl);
    const verifyDiv = code.closest('.verify-code');

    let requestId = null;

    sendBtn?.addEventListener('click', () => {
      if(!phone.value.trim()){
        mensaje.textContent = "Introduce un número de teléfono válido";
        mensaje.style.color = "red";
        return;
      }
      requestId = "SIMULADO_" + Date.now();
      mensaje.textContent = "Código enviado (simulado). Revisa tu teléfono.";
      mensaje.style.color = "green";
      verifyDiv.style.display = "block";
    });

    verifyBtn?.addEventListener('click', async () => {
      if(!code.value.trim() || !requestId){
        mensaje.textContent = "Introduce el código recibido.";
        mensaje.style.color = "red";
        return;
      }

      mensaje.textContent = "Código verificado. Creando sesión...";
      mensaje.style.color = "green";

      const { data: userData, error: signInError } = await supabase.auth.signInWithOtp({
        phone: phone.value.trim(),
        options: { createUser: true }
      });

      if(signInError){
        mensaje.textContent = "Error creando sesión: " + signInError.message;
        mensaje.style.color = "red";
        return;
      }

      mensaje.textContent = "Sesión iniciada correctamente.";
      mensaje.style.color = "green";

      setTimeout(() => window.location.href = "../perfil/", 1000);
    });
  });

});
