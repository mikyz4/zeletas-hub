import { supabase } from './supabase.js';
import { redirectIfAuthenticated } from './auth.js';

redirectIfAuthenticated();

document.addEventListener('DOMContentLoaded', () => {
  const modalCuenta = document.getElementById('modalCuenta');
  const btnCuenta = document.getElementById('btnCuenta');
  const btnCuentaMobile = document.getElementById('btnCuentaMobile');
  const closeCuenta = document.getElementById('closeCuenta');

  btnCuenta?.addEventListener('click', () => modalCuenta?.classList.add('active'));
  btnCuentaMobile?.addEventListener('click', () => modalCuenta?.classList.add('active'));
  closeCuenta?.addEventListener('click', () => modalCuenta?.classList.remove('active'));

  window.addEventListener('click', event => {
    if (event.target === modalCuenta) modalCuenta?.classList.remove('active');
  });

  supabase.auth.onAuthStateChange((event, session) => {
    window.dispatchEvent(new CustomEvent('zeletas:auth-change', {
      detail: { event, session }
    }));
  });
});
