// ==============================
// ZELETAS HUB - Supabase Client
// ==============================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SUPABASE_URL = "https://tmiblfkgxzibcpluixxl.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_KcGGtPAUTe1hTs85t15u-A_lphYRfNJ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if(error) console.error("Error logout:", error.message);
  else location.reload();
}
