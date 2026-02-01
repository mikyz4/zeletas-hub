import { supabase } from '../assets/js/supabase.js';

// Este alert es tu seguro de vida: si sale, es que el archivo está conectado
alert("Archivo login.js cargado correctamente");

async function gestionarEntrada() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session) {
        alert("¡Sesión detectada! Redirigiendo a perfil...");
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = "../perfil/index.html";
    }
}

// Escuchamos los botones de Google
document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
    await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + "/acceso/" }
    });
});

// Ejecutamos la comprobación al cargar
gestionarEntrada();
