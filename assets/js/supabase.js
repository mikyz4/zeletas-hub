// /assets/js/supabase.js
// ==============================
// ZELETAS HUB - Supabase Client
// ==============================

// 1️⃣ Tu URL y anon key (del panel Supabase)
const SUPABASE_URL = "https://tmiblfkgxzibcpluixxl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWJsZmtneHppYmNwbHVpeHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ4NjEsImV4cCI6MjA4NTQ0MDg2MX0.86RmLdPT3h1GCxks2yLTKC7aBIz8Wt93IahRQhht4qA";

// 2️⃣ Crear cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3️⃣ Comprobación rápida
console.log("✅ Supabase conectado:", SUPABASE_URL);

// =============================
// FUNCIONES LOGIN / REGISTRO
// =============================
document.addEventListener('DOMContentLoaded', () => {

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

  // Abrir modales
  [btnLogin, btnLoginMobile].forEach(btn => {
    btn?.addEventListener('click', ()=>modalLogin.classList.add('active'));
  });
  [btnRegistro, btnRegistroMobile].forEach(btn => {
    btn?.addEventListener('click', ()=>modalRegistro.classList.add('active'));
  });

  // Cerrar modales
  closeLogin?.addEventListener('click', ()=>modalLogin.classList.remove('active'));
  closeRegistro?.addEventListener('click', ()=>modalRegistro.classList.remove('active'));
  window.addEventListener('click', e=>{
    if(e.target===modalLogin) modalLogin.classList.remove('active');
    if(e.target===modalRegistro) modalRegistro.classList.remove('active');
  });

  // LOGIN
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

  // REGISTRO + CREACIÓN DE PERFIL
  document.getElementById('registroBtn')?.addEventListener('click', async ()=>{
    const nombre = document.getElementById('regNombre').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    // Crear usuario en Supabase Auth
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

    // Crear perfil en tabla profiles
    try {
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: signUpData.user.id, nombre }
      ]);

      if(profileError){
        mensajeModalRegistro.textContent = 'Usuario creado, pero no se pudo guardar el perfil: ' + profileError.message;
        mensajeModalRegistro.style.color = 'orange';
        return;
      }

      mensajeModalRegistro.textContent = 'Cuenta creada correctamente. Revisa tu email.';
      mensajeModalRegistro.style.color = 'green';
      setTimeout(()=>modalRegistro.classList.remove('active'), 1500);

    } catch(e){
      mensajeModalRegistro.textContent = 'Error creando perfil: ' + e.message;
      mensajeModalRegistro.style.color = 'red';
    }
  });
});
