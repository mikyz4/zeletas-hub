import { supabase } from './supabase.js';

export async function getSession(){const {data,error}=await supabase.auth.getSession();if(error)throw error;return data.session;}
export async function routeAfterAuth(path='/perfil/'){const {data,error}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();if(!error&&data?.nextLevel==='aal2'&&data.currentLevel!=='aal2'){window.location.replace('/seguridad/?next='+encodeURIComponent(path));return}window.location.replace(path)}
export async function redirectIfAuthenticated(path='/perfil/'){try{const session=await getSession();if(session)await routeAfterAuth(path)}catch(error){console.error(error)}}
export async function requireAuth(path='/'){try{const session=await getSession();if(!session){window.location.replace(path);return null}return session}catch(error){console.error(error);window.location.replace(path);return null}}
export async function signInWithGoogle(){const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:new URL('/acceso/',window.location.origin).toString(),queryParams:{prompt:'select_account'}}});if(error)throw error}
export async function sendPhoneOtp(phone){const {error}=await supabase.auth.signInWithOtp({phone,options:{shouldCreateUser:true}});if(error)throw error}
export async function verifyPhoneOtp(phone,token){const {data,error}=await supabase.auth.verifyOtp({phone,token,type:'sms'});if(error)throw error;return data}
export async function requestPasswordReset(email){const redirectTo=new URL('/cambiar-password/',window.location.origin).toString();const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo});if(error)throw error}
export async function updatePassword(password){const {error}=await supabase.auth.updateUser({password});if(error)throw error}
export async function submitContactRequest(payload){const {error}=await supabase.functions.invoke('contact-request',{body:payload});if(error)throw error}
export async function deleteCurrentAccount(){const {error}=await supabase.functions.invoke('delete-account',{body:{}});if(error)throw error;await supabase.auth.signOut()}
export async function listMfaFactors(){const {data,error}=await supabase.auth.mfa.listFactors();if(error)throw error;return data}
export async function enrollTotp(){const {data,error}=await supabase.auth.mfa.enroll({factorType:'totp'});if(error)throw error;return data}
export async function verifyTotp(factorId,code){const c=await supabase.auth.mfa.challenge({factorId});if(c.error)throw c.error;const {data,error}=await supabase.auth.mfa.verify({factorId,challengeId:c.data.id,code});if(error)throw error;return data}
export async function deleteMfaFactor(factorId){const {error}=await supabase.auth.mfa.unenroll({factorId});if(error)throw error}
