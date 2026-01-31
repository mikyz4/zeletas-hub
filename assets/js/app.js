// =============================
// ZELETAS HUB - APP JS COMPLETO
// =============================

// 1️⃣ Configuración Supabase
const SUPABASE_URL = "https://tmiblfkgxzibcpluixxl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWJsZmtneHppYmNwbHVpeHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ4NjEsImV4cCI6MjA4NTQ0MDg2MX0.86RmLdPT3h1GCxks2yLTKC7aBIz8Wt93IahRQhht4qA";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2️⃣ Elementos del DOM
const navUser = document.getElementById('navUser');
const menuUserMobile = document.getElementById('menuUserMobile');
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
const overlay = document.querySelector(".overlay");

// 3️⃣ Función para mostrar el usuario
async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if(user) {
    // Usuario logueado
    navUser.innerHTML = `<a href="perfil/index.html">Mi perfil</a> | <a href="#" id="logoutBtn">Cerrar sesión</a>`;
    menuUserMobile.innerHTML = `<a href="perfil/index.html">Mi perfil</a><a href="#" id="logoutBtnMobile">Cerrar sesión</a>`;

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.reload();
    });

    document.getElementById('logoutBtnMobile')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.reload();
    });

  } else {
    // Usuario no logueado
    navUser.innerHTML = `<a href="login/index.html">Iniciar sesión</a> | <a href="registro/index.html">Registrarse</a>`;
    menuUserMobile.innerHTML = `<a href="login/index.html">Iniciar sesión</a><a href="registro/index.html">Registrarse</a>`;
  }
}

// 4️⃣ Escuchar cambios de sesión en tiempo real
supabase.auth.onAuthStateChange((event, session) => {
  checkUser();
});

// 5️⃣ Inicializar menú móvil
function openMenu() {
  mobileMenu.classList.add("active");
  overlay.classList.add("active");
}
function closeMenu() {
  mobileMenu.classList.remove("active");
  overlay.classList.remove("active");
}

if (hamburger) {
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.contains("active") ? closeMenu() : openMenu();
  });
}

if (overlay) overlay.addEventListener("click", closeMenu);

// Cerrar menú al clicar un enlace
document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// 6️⃣ Ejecutar al cargar
checkUser();
