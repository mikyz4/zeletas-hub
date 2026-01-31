// =============================
// ZELETAS HUB - APP JS (FASE 1)
// =============================

// MENU MOBILE
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
const overlay = document.querySelector(".overlay");

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
    if (mobileMenu.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

if (overlay) {
  overlay.addEventListener("click", closeMenu);
}

// Cerrar menú al clicar un enlace
document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// =================================
// USUARIOS - LOGIN / REGISTRO
// =================================

const navUser = document.getElementById('navUser');
const menuUserMobile = document.getElementById('menuUserMobile');

async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if(user) {
    // Usuario logueado
    navUser.innerHTML = `
      <a href="perfil/index.html">Mi perfil</a> | 
      <a href="#" id="logoutBtn">Cerrar sesión</a>
    `;
    menuUserMobile.innerHTML = `
      <a href="perfil/index.html">Mi perfil</a>
      <a href="#" id="logoutBtnMobile">Cerrar sesión</a>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.reload();
    });
    document.getElementById('logoutBtnMobile')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      location.reload();
    });

  } else {
    // Usuario NO logueado
    navUser.innerHTML = `
      <a href="login/index.html">Iniciar sesión</a> | 
      <a href="registro/index.html">Registrarse</a>
    `;
    menuUserMobile.innerHTML = `
      <a href="login/index.html">Iniciar sesión</a>
      <a href="registro/index.html">Registrarse</a>
    `;
  }
}

// Ejecutar al cargar la página
checkUser();

// Escuchar cambios de sesión en tiempo real (login/logout)
supabase.auth.onAuthStateChange((event, session) => {
  checkUser();
});
