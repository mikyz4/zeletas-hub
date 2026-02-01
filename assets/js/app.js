import { supabase } from '../assets/js/supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // ==========================================
    // 1. DETECCIÓN DE SESIÓN (AUTO-LOGIN)
    // ==========================================
    // Esto se ejecuta nada más cargar la página de /acceso/
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        console.log("¡Sesión detectada!", session.user);
        
        // 1. Limpiamos la URL (quita el access_token feo de la vista)
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // 2. Mensaje visual opcional si tienes un elemento 'mensajeModal'
        const mensajeModal = document.getElementById('mensajeModal');
        if(mensajeModal) {
            mensajeModal.textContent = "Bienvenido, redirigiendo...";
            mensajeModal.style.color = "green";
        }
        
        // 3. Redirigimos al perfil tras 1 segundo
        setTimeout(() => {
            window.location.href = "../perfil/"; 
        }, 1000);
        
        return; // Detenemos la ejecución del resto del código si ya hay sesión
    }

    // ==========================================
    // 2. MODAL MI CUENTA
    // ==========================================
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

    // ==========================================
    // 3. GOOGLE LOGIN
    // ==========================================
    document.querySelectorAll('#googleLoginBtn, #googleLoginBtnModal').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const { error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { 
                        redirectTo: "https://zeletas.netlify.app/acceso/",
                        queryParams: { prompt: 'select_account' } // Permite elegir cuenta siempre
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

    // ==========================================
    // 4. OTP TELÉFONO (TU LÓGICA ACTUAL)
    // ==========================================
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
        
        // Usamos una comprobación segura por si el elemento no existe en el HTML
        const verifyDiv = code?.closest('.verify-code');

        let requestId = null;

        sendBtn?.addEventListener('click', () => {
            if(!phone || !phone.value.trim()){
                if(mensaje) mensaje.textContent = "Introduce un número de teléfono válido";
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
            if(!code || !code.value.trim() || !requestId){
                if(mensaje) mensaje.textContent = "Introduce el código recibido.";
                return;
            }

            const { data: userData, error: signInError } = await supabase.auth.signInWithOtp({
                phone: phone.value.trim(),
                options: { createUser: true }
            });

            if(signInError){
                if(mensaje) {
                    mensaje.textContent = "Error: " + signInError.message;
                    mensaje.style.color = "red";
                }
                return;
            }

            if(mensaje) {
                mensaje.textContent = "Sesión iniciada correctamente.";
                mensaje.style.color = "green";
            }
            setTimeout(() => window.location.href = "../perfil/", 1000);
        });
    });
});
