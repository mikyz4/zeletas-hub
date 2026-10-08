import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const ORIGIN="https://zeletas.netlify.app";const cors={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS"};
const pub=()=>{const r=Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");if(r)try{return JSON.parse(r).default}catch{}return Deno.env.get("SUPABASE_ANON_KEY")!};
const key=()=>{const r=Deno.env.get("SUPABASE_SECRET_KEYS");if(r)try{return JSON.parse(r).default}catch{}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!};
async function hash(v){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,"0")).join("")}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});if(req.method!=="POST")return Response.json({error:"Method not allowed"},{status:405,headers:cors});
 const auth=req.headers.get("Authorization");if(!auth?.startsWith("Bearer "))return Response.json({error:"Unauthorized"},{status:401,headers:cors});
 const client=createClient(Deno.env.get("SUPABASE_URL")!,pub(),{global:{headers:{Authorization:auth}}});const {data:{user},error:uerr}=await client.auth.getUser();if(uerr||!user)return Response.json({error:"Unauthorized"},{status:401,headers:cors});
 let b;try{b=await req.json()}catch{return Response.json({error:"Invalid JSON"},{status:400,headers:cors})}
 const type=["listing","product","store","profile","message"].includes(String(b.targetType))?String(b.targetType):"";
 const targetId=String(b.targetId||"");const reason=String(b.reason||"").trim();
 if(!type||!/^[0-9a-f-]{36}$/i.test(targetId)||reason.length<3||reason.length>500)return Response.json({error:"Datos de reporte no válidos."},{status:400,headers:cors});
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,key());
 const existsTables={listing:"listings",product:"products",store:"stores",profile:"profiles",message:"messages"};
 const q=await admin.from(existsTables[type]).select("id").eq("id",targetId).limit(1);if(q.error||!q.data?.length)return Response.json({error:"El elemento reportado no existe."},{status:404,headers:cors});
 const duplicate=await admin.from("moderation_cases").select("id").eq("reporter_id",user.id).eq("target_type",type).eq("target_id",targetId).in("status",["open","reviewing"]).limit(1);if(duplicate.data?.length)return Response.json({error:"Ya existe un reporte abierto para este elemento."},{status:409,headers:cors});
 const keyHash=await hash(user.id+"|"+type+"|"+targetId);const old=await admin.from("moderation_rate_limits").select("last_report_at").eq("key_hash",keyHash).maybeSingle();if(old.data&&Date.now()-new Date(old.data.last_report_at).getTime()<300000)return Response.json({error:"Espera unos minutos antes de volver a reportar este elemento."},{status:429,headers:cors});
 const ins=await admin.from("moderation_cases").insert({target_type:type,target_id:targetId,reporter_id:user.id,reason,status:"open"}).select("id").single();if(ins.error)return Response.json({error:"No se pudo registrar el reporte."},{status:500,headers:cors});
 await admin.from("moderation_rate_limits").upsert({key_hash:keyHash,last_report_at:new Date().toISOString()});
 return Response.json({ok:true,id:ins.data.id},{headers:cors});
});