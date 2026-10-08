import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"https://zeletas.netlify.app","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
function pub(){const r=Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");if(r)try{return JSON.parse(r).default}catch{}return Deno.env.get("SUPABASE_ANON_KEY")!}
function secret(){const r=Deno.env.get("SUPABASE_SECRET_KEYS");if(r)try{return JSON.parse(r).default}catch{}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const auth=req.headers.get("Authorization");if(!auth?.startsWith("Bearer "))return json({error:"Unauthorized"},401);
 const token=auth.slice(7),client=createClient(Deno.env.get("SUPABASE_URL")!,pub(),{global:{headers:{Authorization:auth}}});
 const {data,error}=await client.auth.getUser();if(error||!data.user)return json({error:"Unauthorized"},401);
 const aal=await client.auth.mfa.getAuthenticatorAssuranceLevel(token);if(aal.error)return json({error:"No se pudo verificar el segundo factor."},503);
 if(aal.data?.nextLevel==="aal2"&&aal.data.currentLevel!=="aal2")return json({error:"MFA_REQUIRED"},403);
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,secret());
 const result=await admin.auth.admin.deleteUser(data.user.id);if(result.error){console.error(result.error);return json({error:"No se pudo eliminar la cuenta."},500);}
 return json({ok:true});
});