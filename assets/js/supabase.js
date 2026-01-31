// /assets/js/supabase.js
// ==============================
// ZELETAS HUB - Supabase Client
// ==============================

// 1️⃣ Tu URL y anon key (del panel Supabase)
const SUPABASE_URL = "https://tmiblfkgxzibcpluixxl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaWJsZmtneHppYmNwbHVpeHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NjQ4NjEsImV4cCI6MjA4NTQ0MDg2MX0.86RmLdPT3h1GCxks2yLTKC7aBIz8Wt93IahRQhht4qA";

// 2️⃣ Crear cliente Supabase
// IMPORTANTE: esto debe estar después de cargar el CDN
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3️⃣ Comprobación rápida
console.log("✅ Supabase conectado:", SUPABASE_URL);
