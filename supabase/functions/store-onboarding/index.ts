import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const ORIGIN="https://zeletas.netlify.app";const cors={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS"};
const pub=()=>{const r=Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");if(r)try{return JSON.parse(r).default}catch{}return Deno.env.get("SUPABASE_ANON_KEY")!};
const key=()=>{const r=Deno.env.get("SUPABASE_SECRET_KEYS");if(r)try{return JSON.parse(r).default}catch{}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!};
const reply=(b:any,s=200)=>Response.json(b,{status:s,headers:cors});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 const auth=req.headers.get("Authorization");if(!auth?.startsWith("Bearer "))return reply({error:"Unauthorized"},401);
 const client=createClient(Deno.env.get("SUPABASE_URL")!,pub(),{global:{headers:{Authorization:auth}}});const {data:{user}}=await client.auth.getUser();if(!user)return reply({error:"Unauthorized"},401);
 const stripe=Deno.env.get("STRIPE_SECRET_KEY");if(!stripe)return reply({error:"Stripe no está configurado todavía."},503);
 let b:any;try{b=await req.json()}catch{return reply({error:"Invalid JSON"},400)}const admin=createClient(Deno.env.get("SUPABASE_URL")!,key());
 const q=await admin.from("stores").select("id,name,status,stripe_account_id,stripe_onboarding_complete").eq("id",String(b.storeId)).eq("owner_id",user.id).single();if(q.error)return reply({error:"Tienda no encontrada."},404);
 let accountId=q.data.stripe_account_id;
 if(accountId){
   const sr=await fetch("https://api.stripe.com/v1/accounts/"+encodeURIComponent(accountId),{headers:{"Authorization":"Bearer "+stripe}});
   const a=await sr.json();if(sr.ok){const ready=Boolean(a.charges_enabled&&a.payouts_enabled);await admin.from("stores").update({stripe_onboarding_complete:ready}).eq("id",q.data.id).eq("owner_id",user.id);if(ready)return reply({ready:true,storeId:q.data.id})}
 } else {
   const p=new URLSearchParams();p.set("type","express");p.set("country","ES");p.set("capabilities[card_payments][requested]","true");p.set("capabilities[transfers][requested]","true");
   const sr=await fetch("https://api.stripe.com/v1/accounts",{method:"POST",headers:{"Authorization":"Bearer "+stripe,"Content-Type":"application/x-www-form-urlencoded"},body:p});const a=await sr.json();if(!sr.ok)return reply({error:"No se pudo crear la cuenta de pagos."},502);
   accountId=a.id;await admin.from("stores").update({stripe_account_id:accountId,stripe_onboarding_complete:false}).eq("id",q.data.id).eq("owner_id",user.id);
 }
 const lp=new URLSearchParams();lp.set("account",accountId);lp.set("refresh_url",ORIGIN+"/tienda/?onboarding=refresh");lp.set("return_url",ORIGIN+"/tienda/?onboarding=complete");lp.set("type","account_onboarding");
 const lr=await fetch("https://api.stripe.com/v1/account_links",{method:"POST",headers:{"Authorization":"Bearer "+stripe,"Content-Type":"application/x-www-form-urlencoded"},body:lp});const link=await lr.json();if(!lr.ok)return reply({error:"No se pudo generar el onboarding."},502);
 return reply({url:link.url,storeId:q.data.id});
});