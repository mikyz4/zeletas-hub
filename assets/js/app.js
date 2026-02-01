// assets/js/app.js
import { supabase } from './supabase.js';

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
  const btnRegistro = document.getElementById('btnRegistro');
  const btnLoginMobile = document.getElementById('btnLoginMobile');
  const btnRegistroMobile = document.getElementById('btnRegistroMobile');

  const closeLogin = document.getElementById('closeLogin');
  const closeRegistro = document.getElementById('closeRegistro');

  const mensajeModal = document.getElementById('mensajeModal');
  const mensajeModalRegistro = document.getElementById('mensajeModalRegistro');

  [btnLogin, btnLoginMobile].forEach(btn => btn?.addEventListener('click', () => modalLogin.classList.add('active')));
  [btnRegistro, btnRegistroMobile].forEach(btn => btn?.addEventListener('click', () => modalRegistro.classList.add('active')));

  closeLogin?.addEventListener('click', () => modalLogin.classList.remove('active'));
  closeRegistro?.addEventListener('click', () => modalRegistro.classList.remove('active'));

  window.addEventListener('click', e => {
    if(e.target === modalLogin) modalLogin.classList.remove('active');
    if(e.target === modalRegistro) modalRegistro.classList.remove('active');
  });

  // =============================
  // LOGIN
  // =============================
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    try {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if(error){
        console.error("Error login:", error);
        mensajeModal.textContent = error.message;
        mensajeModal.style.color = 'red';
      } else {
        console.log("Login correcto:", data);
        mensajeModal.textContent = '¡Login correcto!';
        mensajeModal.style.color = 'green';
        setTimeout(() => location.reload(), 1000);
      }
    } catch(e){ console.error("Error login catch:", e); }
  });

  // =============================
  // REGISTRO
  // =============================
  document.getElementById('registroBtn')?.addEventListener('click', async () => {
    try {
      const nombre = document.getElementById('regNombre').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;

      // Crear usuario Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email, 
        password, 
        options: { data: { nombre } }
      });

      if(signUpError){
        console.error("Error signUp:", signUpError);
        mensajeModalRegistro.textContent = signUpError.message;
        mensajeModalRegistro.style.color = 'red';
        return;
      }

      console.log("Usuario Auth creado:", signUpData.user);

      // ✅ Asegurarnos que haya un UUID válido
      const userId = signUpData.user?.id || crypto.randomUUID();

      // Insertar perfil en profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: userId, nombre, email, rol: 'usuario' }]);

      if(profileError){
        console.error("Error insert profile:", profileError);
        mensajeModalRegistro.textContent = 'Usuario creado, pero no se pudo guardar el perfil: ' + profileError.message;
        mensajeModalRegistro.style.color = 'orange';
        return;
      }

      console.log("Perfil insertado correctamente:", profileData);

      mensajeModalRegistro.textContent = 'Cuenta creada correctamente. Revisa tu email.';
      mensajeModalRegistro.style.color = 'green';
      setTimeout(() => modalRegistro.classList.remove('active'), 1500);

    } catch(e){ console.error("Error registro catch:", e); }
  });

});
