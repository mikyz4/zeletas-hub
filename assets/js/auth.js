import { supabase } from './supabase.js';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function redirectIfAuthenticated(path = '/perfil/') {
  try {
    const session = await getSession();
    if (session) window.location.replace(path);
  } catch (error) {
    console.error('Error comprobando la sesión:', error);
  }
}

export async function requireAuth(path = '/') {
  try {
    const session = await getSession();
    if (!session) {
      window.location.replace(path);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error comprobando la autenticación:', error);
    window.location.replace(path);
    return null;
  }
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: new URL('/acceso/', window.location.origin).toString(),
      queryParams: { prompt: 'select_account' }
    }
  });
  if (error) throw error;
}

export async function sendPhoneOtp(phone) {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: true }
  });
  if (error) throw error;
}

export async function verifyPhoneOtp(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  });
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email) {
  const redirectTo = new URL('/cambiar-password/', window.location.origin).toString();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function submitContactRequest(payload) {
  const { error } = await supabase.functions.invoke('contact-request', { body: payload });
  if (error) throw error;
}

export async function deleteCurrentAccount() {
  const { error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error) throw error;
  await supabase.auth.signOut();
}
