// assets/js/supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SUPABASE_URL = "https://sbqpkfdcznulwpxlxiwu.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_9dX-ESpW0YwCaFfDR0aMAg_9PLvO2oo";

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
