import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.3";
const ORIGIN="https://zeletas.netlify.app";
const cors={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
async function hash(v:string){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return Array.from(new Uint8Array(d)).map(x=>x.toString(16).padStart(2,"0")).join("");}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST"||req.headers.get("origin")!==ORIGIN)return json({error:"Not allowed"},403);
 let p:any;try{p=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 const name=String(p.name??"").trim(),email=String(p.email??"").trim().toLowerCase(),phone=String(p.phone??"").trim(),subject=String(p.subject??"").trim(),message=String(p.message??"").trim();
 if(name.length<2||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10||message.length>5000)return json({error:"Datos no válidos."},400);
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
 const ip=(req.headers.get("x-forwarded-for")??"unknown").split(",")[0].trim();
 const ipKey=await hash("ip|"+ip),emailKey=await hash("email|"+email);
 const {data:limits}=await admin.from("contact_rate_limits").select("key_hash,last_request_at").in("key_hash",[ipKey,emailKey]);
 if((limits||[]).some((x:any)=>Date.now()-new Date(x.last_request_at).getTime()<60000))return json({error:"Espera un minuto antes de enviar otra consulta."},429);
 let userId=null;const auth=req.headers.get("Authorization");
 if(auth?.startsWith("Bearer ")){const c=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});const u=await c.auth.getUser();userId=u.data.user?.id??null;}
 const {error}=await admin.from("contact_requests").insert({user_id:userId,name,email,phone:phone||null,subject:subject||null,message});
 if(error){console.error(error);return json({error:"No se pudo registrar la consulta."},500);}
 await admin.from("contact_rate_limits").upsert([{key_hash:ipKey,last_request_at:new Date().toISOString()},{key_hash:emailKey,last_request_at:new Date().toISOString()}]);
 return json({ok:true});
});