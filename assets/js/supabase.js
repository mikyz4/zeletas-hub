// /assets/js/supabase.js
// ==============================
// ZELETAS HUB - Supabase Client
// ==============================

// 1️⃣ URL y ANON key (frontend)
export const SUPABASE_URL = "https://tmiblfkgxzibcpluixxl.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_KcGGtPAUTe1hTs85t15u-A_lphYRfNJ";

// 2️⃣ Crear cliente Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3️⃣ Función opcional para obtener usuario actual
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

// 4️⃣ Función para cerrar sesión
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if(error) console.error("Error logout:", error.message);
  else location.reload();
}
