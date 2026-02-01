import { supabase } from '../assets/js/supabase.js';

// --- 1. DETECCIÓN INMEDIATA ---
async function handleAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (session) {
        // Limpiamos la URL (quita el token de la vista)
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirigimos al perfil
        window.location.href = "../perfil/"; 
    }
}

// Ejecutamos la detección de inmediato
handleAuth();

// --- 2. LÓGICA DE LA PÁGINA (Botones y Modales) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Diseño cargado, configurando botones...");

    // MODAL MI CUENTA
    const modalCuenta = document.getElementById('modalCuenta');
    const btnCuenta = document.getElementById('btnCuenta');
    const btnCuentaMobile = document.getElementById('btnCuentaMobile');
    const closeCuenta = document.getElementById('closeCuenta');
    const mensajeModal = document.getElementById('mensajeModal');

    btnCuenta?.addEventListener('click', () => modalCuenta.classList.add('active'));
    btnCuentaMobile?.addEventListener('click', () => modalCuenta.classList.add('active'));
    closeCuenta?.addEventListener('click', () => modalCuenta.classList.remove('active'));
    
    window.addEventListener('click', e => { 
        if(e.target === modalCuenta) modalCuenta.classList.remove('active'); 
    });

    // GOOGLE LOGIN
    document.querySelectorAll('#googleLoginBtn, #googleLoginBtnModal').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { 
                        redirectTo: "https://zeletas.netlify.app/acceso/",
                        queryParams: { prompt: 'select_account' }
                    }
                });
                if(error) throw error;
            } catch(e) {
                if(mensajeModal) {
                    mensajeModal.textContent = "Error Google: " + e.message;
                    mensajeModal.style.color = "red";
                }
            }
        });
    });

    // OTP TELÉFONO
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
        const verifyDiv = code?.closest('.verify-code');

        let requestId = null;

        sendBtn?.addEventListener('click', () => {
            if(!phone?.value.trim()){
                if(mensaje) mensaje.textContent = "Introduce un número válido";
                return;
            }
            requestId = "SIMULADO_" + Date.now();
            if(mensaje) {
                mensaje.textContent = "Código enviado (simulado).";
                mensaje.style.color = "green";
            }
            if(verifyDiv) verifyDiv.style.display = "block";
        });

        verifyBtn?.addEventListener('click', async () => {
            if(!code?.value.trim() || !requestId){
                if(mensaje) mensaje.textContent = "Introduce el código.";
                return;
            }

            const { data: userData, error: signInError } = await supabase.auth.signInWithOtp({
                phone: phone.value.trim(),
                options: { createUser: true }
            });

            if(signInError){
                if(mensaje) mensaje.textContent = "Error: " + signInError.message;
                return;
            }

            if(mensaje) mensaje.textContent = "Iniciando sesión...";
            setTimeout(() => window.location.href = "../perfil/", 1000);
        });
    });
}); // <--- Aquí termina todo correctamente
