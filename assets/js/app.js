// /assets/js/app.js
// ==============================
// ZELETAS HUB - Login, Registro, UI
// ==============================

import { supabase, getCurrentUser, logout } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const modalLogin = document.getElementById('modalLogin');
  const modalRegistro = document.getElementById('modalRegistro');

  const btnLogin = document.getElementById('btnLogin');
  const btnRegistro = document.getElementById('btnRegistro');
  const btnLoginMobile = document.getElementById('btnLoginMobile');
  const btnRegistroMobile = document.getElementById('btnRegistroMobile');

  const closeLogin = document.getElementById('closeLogin');
  const closeRegistro = document.getElementById('closeRegistro');

  const mensajeModal = document.getElementById('mensajeModal');
  const mensajeModalRegistro = document.getElementById('mensajeModalRegistro');

  const navUser = document.getElementById('navUser');
  const menuUserMobile = document.getElementById('menuUserMobile');

  // =============================
  // Abrir modales
  // =============================
  [btnLogin, btnLoginMobile].forEach(btn => {
    btn?.addEventListener('click', () => modalLogin.classList.add('active'));
  });
  [btnRegistro, btnRegistroMobile].forEach(btn => {
    btn?.addEventListener('click', () => modalRegistro.classList.add('active'));
  });

  // =============================
  // Cerrar modales
  // =============================
  closeLogin?.addEventListener('click', ()=>modalLogin.classList.remove('active'));
  closeRegistro?.addEventListener('click', ()=>modalRegistro.classList.remove('active'));
  window.addEventListener('click', e=>{
    if(e.target===modalLogin) modalLogin.classList.remove('active');
    if(e.target===modalRegistro) modalRegistro.classList.remove('active');
  });

  // =============================
  // LOGIN
  // =============================
  document.getElementById('loginBtn')?.addEventListener('click', async ()=>{
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error){
      mensajeModal.textContent = error.message;
      mensajeModal.style.color = 'red';
    } else {
      mensajeModal.textContent = '¡Login correcto!';
      mensajeModal.style.color = 'green';
      setTimeout(()=>{ location.reload(); }, 1000);
    }
  });

  // =============================
  // REGISTRO
  // =============================
  document.getElementById('registroBtn')?.addEventListener('click', async ()=>{
    const nombre = document.getElementById('regNombre').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    });

    if(error){
      mensajeModalRegistro.textContent = error.message;
      mensajeModalRegistro.style.color='red';
    } else {
      mensajeModalRegistro.textContent='Cuenta creada. Revisa tu email.';
      mensajeModalRegistro.style.color='green';
      setTimeout(()=>modalRegistro.classList.remove('active'),1500);
    }
  });

  // =============================
  // Verificar sesión actual
  // =============================
  const user = await getCurrentUser();
  if(user){
    // Usuario logueado, mostrar su nombre y botón logout
    navUser.innerHTML = `<span>👤 ${user.email}</span> <button id="btnLogout">Cerrar sesión</button>`;
    menuUserMobile.innerHTML = `<span>👤 ${user.email}</span> <button id="btnLogoutMobile">Cerrar sesión</button>`;

    document.getElementById('btnLogout')?.addEventListener('click', logout);
    document.getElementById('btnLogoutMobile')?.addEventListener('click', logout);
  }
});
