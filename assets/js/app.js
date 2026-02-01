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
  // LOGIN (EMAIL + PASSWORD)
  // =============================
  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    try {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if(error){
        mensajeModal.textContent = error.message;
        mensajeModal.style.color = 'red';
      } else {
        mensajeModal.textContent = '¡Login correcto!';
        mensajeModal.style.color = 'green';
        setTimeout(() => location.reload(), 800);
      }
    } catch(e){
      console.error("Error login:", e);
      mensajeModal.textContent = "Error inesperado en login.";
      mensajeModal.style.color = "red";
    }
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
  // REGISTRO (EMAIL + PASSWORD)
  // =============================
  document.getElementById('registroBtn')?.addEventListener('click', async () => {
    try {
      const nombre = document.getElementById('regNombre').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();

      // Crear usuario Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nombre } }
      });

      if(signUpError){
        mensajeModalRegistro.textContent = signUpError.message;
        mensajeModalRegistro.style.color = 'red';
        return;
      }

      // ID REAL del usuario Auth (OBLIGATORIO)
      const userId = signUpData.user?.id;

      if(!userId){
        mensajeModalRegistro.textContent = "Usuario creado pero no se recibió ID. Intenta iniciar sesión.";
        mensajeModalRegistro.style.color = "orange";
        return;
      }

      // Insertar perfil en profiles con id = auth.user.id
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: userId, nombre, email, rol: 'usuario' }]);

      if(profileError){
        mensajeModalRegistro.textContent =
          'Usuario creado, pero no se pudo guardar el perfil: ' + profileError.message;
        mensajeModalRegistro.style.color = 'orange';
        return;
      }

      mensajeModalRegistro.textContent = 'Cuenta creada correctamente. Ya puedes iniciar sesión.';
      mensajeModalRegistro.style.color = 'green';
      setTimeout(() => modalRegistro.classList.remove('active'), 1200);

    } catch(e){
      console.error("Error registro:", e);
      mensajeModalRegistro.textContent = "Error inesperado en registro.";
      mensajeModalRegistro.style.color = "red";
    }
  });

});
