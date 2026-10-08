import { supabase } from './supabase.js';
import { signInWithGoogle, sendPhoneOtp, verifyPhoneOtp, routeAfterAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.overlay');

  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('active');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', () => {
    mobileMenu?.classList.remove('active');
    overlay?.classList.remove('active');
  });

  const modalCuenta = document.getElementById('modalCuenta');
  const btnCuenta = document.getElementById('btnCuenta');
  const btnCuentaMobile = document.getElementById('btnCuentaMobile');
  const closeCuenta = document.getElementById('closeCuenta');

  const abrirModal = () => modalCuenta?.classList.add('active');
  const cerrarModal = () => modalCuenta?.classList.remove('active');

  btnCuenta?.addEventListener('click', abrirModal);
  btnCuentaMobile?.addEventListener('click', abrirModal);
  closeCuenta?.addEventListener('click', cerrarModal);
  if (window.location.hash === '#cuenta') abrirModal();

  window.addEventListener('click', event => {
    if (event.target === modalCuenta) cerrarModal();
  });

  const mensaje = document.getElementById('mensajeModal') || document.getElementById('mensaje');

  document.querySelectorAll('#googleLoginBtn, #googleLoginBtnModal, #googleBtn, .btn-google')
    .forEach(button => {
      button.addEventListener('click', async event => {
        event.preventDefault();
        try {
          if (mensaje) mensaje.textContent = 'Conectando con Google...';
          await signInWithGoogle();
        } catch (error) {
          console.error('Error Login Google:', error);
          if (mensaje) {
            mensaje.textContent = 'No se pudo iniciar sesión con Google.';
            mensaje.style.color = 'red';
          }
        }
      });
    });

  const phoneInput = document.getElementById('loginPhone') || document.getElementById('loginPhoneModal');
  const codeInput = document.getElementById('verifyCode') || document.getElementById('verifyCodeModal');
  const sendButton = document.getElementById('phoneLoginBtn') || document.getElementById('phoneLoginBtnModal');
  const verifyButton = document.getElementById('verifyCodeBtn') || document.getElementById('verifyCodeBtnModal');
  const verifyDiv = codeInput?.closest('.verify-code');

  sendButton?.addEventListener('click', async () => {
    const phone = phoneInput?.value.trim();

    if (!phone) {
      if (mensaje) {
        mensaje.textContent = 'Introduce un número de teléfono válido.';
        mensaje.style.color = 'red';
      }
      return;
    }

    try {
      await sendPhoneOtp(phone);
      if (verifyDiv) verifyDiv.style.display = 'block';
      if (mensaje) {
        mensaje.textContent = 'Código enviado por SMS.';
        mensaje.style.color = 'green';
      }
    } catch (error) {
      console.error('Error enviando OTP:', error);
      if (mensaje) {
        mensaje.textContent = 'No se pudo enviar el código.';
        mensaje.style.color = 'red';
      }
    }
  });

  verifyButton?.addEventListener('click', async () => {
    const phone = phoneInput?.value.trim();
    const token = codeInput?.value.trim();

    if (!phone || !token) {
      if (mensaje) {
        mensaje.textContent = 'Introduce el teléfono y el código recibido.';
        mensaje.style.color = 'red';
      }
      return;
    }

    try {
      const { session } = await verifyPhoneOtp(phone, token);

      if (!session) {
        throw new Error('Supabase no devolvió una sesión válida.');
      }

      if (mensaje) {
        mensaje.textContent = 'Sesión iniciada correctamente.';
        mensaje.style.color = 'green';
      }

      await routeAfterAuth('/perfil/');
    } catch (error) {
      console.error('Error verificando OTP:', error);
      if (mensaje) {
        mensaje.textContent = 'El código no es válido o ha caducado.';
        mensaje.style.color = 'red';
      }
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    document.documentElement.dataset.authenticated = session ? 'true' : 'false';
    window.dispatchEvent(new CustomEvent('zeletas:auth-change', {
      detail: { event, session }
    }));
  });
});
