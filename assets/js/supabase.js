// /assets/js/supabase.js
// ==============================
// ZELETAS HUB - Supabase Client
// ==============================

const SUPABASE_URL = "https://tmiblfkgxzibcpluixxl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWJsZmtneHppYmNwbHVpeHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ4NjEsImV4cCI6MjA4NTQ0MDg2MX0.86RmLdPT3h1GCxks2yLTKC7aBIz8Wt93IahRQhht4qA";

// Crear cliente Supabase (usar createClient directamente)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Comprobación rápida
console.log("✅ Supabase conectado:", SUPABASE_URL);
