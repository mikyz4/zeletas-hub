import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.3";

const ORIGIN="https://zeletas.netlify.app";
const cors={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS"};
const MAX_SIZE=6291456;
const ALLOWED=["image/jpeg","image/png","image/webp","image/avif"];

function adminKey(){const raw=Deno.env.get("SUPABASE_SECRET_KEYS");if(raw)try{return JSON.parse(raw).default}catch{}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}
function pubKey(){const raw=Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");if(raw)try{return JSON.parse(raw).default}catch{}return Deno.env.get("SUPABASE_ANON_KEY")!}
function json(body:any,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}})}

Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const auth=req.headers.get("Authorization");if(!auth?.startsWith("Bearer "))return json({error:"Unauthorized"},401);
 const client=createClient(Deno.env.get("SUPABASE_URL")!,pubKey(),{global:{headers:{Authorization:auth}}});
 const {data:{user},error}=await client.auth.getUser();if(error||!user)return json({error:"Unauthorized"},401);
 const aal=(await client.auth.mfa.getAuthenticatorAssuranceLevel()).data;if(aal?.nextLevel==="aal2"&&aal.currentLevel!=="aal2")return json({error:"MFA_REQUIRED"},403);
 let b:any;try{b=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 const type=String(b.contentType||""),size=Number(b.size||0),entityType=String(b.entityType||""),entityId=String(b.entityId||"");
 if(!ALLOWED.includes(type)||!Number.isInteger(size)||size<1||size>MAX_SIZE)return json({error:"Archivo no válido o demasiado grande."},400);
 if(!["listing","product","store","profile"].includes(entityType)||!entityId)return json({error:"Recurso de destino inválido."},400);

 const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey());
 let allowed=false;
 if(entityType==="profile")allowed=entityId===user.id;
 if(entityType==="listing"){const q=await admin.from("listings").select("id,owner_id").eq("id",entityId).maybeSingle();allowed=q.data?.owner_id===user.id}
 if(entityType==="store"){const q=await admin.from("stores").select("id,owner_id").eq("id",entityId).maybeSingle();allowed=q.data?.owner_id===user.id}
 if(entityType==="product"){const q=await admin.from("products").select("id,store_id,stores(owner_id)").eq("id",entityId).maybeSingle();allowed=q.data?.stores?.owner_id===user.id}
 if(!allowed)return json({error:"No tienes permiso sobre ese recurso."},403);

 const current=await admin.from("media_upload_rate_limits").select("window_started_at,upload_count").eq("user_id",user.id).maybeSingle();
 const now=Date.now();
 let started=current.data?new Date(current.data.window_started_at).getTime():0;
 let count=current.data?.upload_count||0;
 if(!started||now-started>=3600000){started=now;count=0}
 if(count>=30)return json({error:"Límite de subida alcanzado. Inténtalo más tarde."},429);
 count++;
 const rate=await admin.from("media_upload_rate_limits").upsert({user_id:user.id,window_started_at:new Date(started).toISOString(),upload_count:count},{onConflict:"user_id"});
 if(rate.error)return json({error:"No se pudo validar el límite de subida."},500);

 const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif"}[type];
 const path=user.id+"/"+entityType+"/"+entityId+"/"+crypto.randomUUID()+"."+ext;
 const signed=await admin.storage.from("media").createSignedUploadUrl(path);
 if(signed.error)return json({error:signed.error.message},500);
 return json({path,token:signed.data.token});
});
