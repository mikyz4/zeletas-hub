// ==============================
// ZELETAS HUB - Supabase Client
// ==============================

// 1️⃣ Tu URL y anon key
export const SUPABASE_URL = "https://tmiblfkgxzibcpluixxl.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWJsZmtneHppYmNwbHVpeHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ4NjEsImV4cCI6MjA4NTQ0MDg2MX0.86RmLdPT3h1GCxks2yLTKC7aBIz8Wt93IahRQhht4qA";

// 2️⃣ Crear cliente Supabase
export const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3️⃣ Funciones auxiliares para app.js
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

console.log("✅ Supabase configurado");

