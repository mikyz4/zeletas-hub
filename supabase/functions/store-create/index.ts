import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const ORIGIN="https://zeletas.netlify.app";
const cors={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS"};
function pubKey(){const raw=Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");if(raw){try{return JSON.parse(raw).default}catch{}}return Deno.env.get("SUPABASE_ANON_KEY")!}
function adminKey(){const raw=Deno.env.get("SUPABASE_SECRET_KEYS");if(raw){try{return JSON.parse(raw).default}catch{}}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return Response.json({error:"Method not allowed"},{status:405,headers:cors});
 const auth=req.headers.get("Authorization");if(!auth?.startsWith("Bearer "))return Response.json({error:"Unauthorized"},{status:401,headers:cors});
 const client=createClient(Deno.env.get("SUPABASE_URL")!,pubKey(),{global:{headers:{Authorization:auth}}});
 const {data:{user},error}=await client.auth.getUser();if(error||!user)return Response.json({error:"Unauthorized"},{status:401,headers:cors});
 let b:any;try{b=await req.json()}catch{return Response.json({error:"Invalid JSON"},{status:400,headers:cors})}
 const name=String(b.name??"").trim(),slug=String(b.slug??"").trim().toLowerCase(),description=String(b.description??"").trim();
 if(name.length<2||name.length>120||!/^[a-z0-9-]{2,80}$/.test(slug))return Response.json({error:"Datos de tienda no válidos."},{status:400,headers:cors});
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey());
 const existing=await admin.from("stores").select("id").eq("owner_id",user.id).maybeSingle();if(existing.data)return Response.json({error:"Ya tienes una tienda."},{status:409,headers:cors});
 const {data,error:insertError}=await admin.from("stores").insert({owner_id:user.id,name,slug,description,status:"pending",stripe_account_id:null,stripe_onboarding_complete:false}).select("id,name,slug,status").single();
 if(insertError)return Response.json({error:insertError.code==="23505"?"El slug ya está ocupado.":"No se pudo crear la tienda."},{status:400,headers:cors});
 await admin.from("store_members").insert({store_id:data.id,user_id:user.id,role:"owner"});
 return Response.json({store:data},{headers:cors});
});