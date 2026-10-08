import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.3";

const ORIGIN="https://zeletas.netlify.app";
const cors={"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"GET,OPTIONS"};

function adminKey(){const raw=Deno.env.get("SUPABASE_SECRET_KEYS");if(raw)try{return JSON.parse(raw).default}catch{}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}
function pubKey(){const raw=Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");if(raw)try{return JSON.parse(raw).default}catch{}return Deno.env.get("SUPABASE_ANON_KEY")!}
function json(body:any,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}})}

Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="GET")return json({error:"Method not allowed"},405);
 const path=new URL(req.url).searchParams.get("path")||"";
 if(!path||path.length>500||path.includes("..")||!path.startsWith("media/")&&path.split("/").length<4)return json({error:"Media path inválida"},400);
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey());
 let publicMedia=false;
 const listing=await admin.from("listing_media").select("listing_id,storage_path,listings(status)").eq("storage_path",path).maybeSingle();
 if(listing.data?.listings?.status==="published")publicMedia=true;
 if(!publicMedia){
   const product=await admin.from("product_images").select("product_id,storage_path,products(status,stores(status))").eq("storage_path",path).maybeSingle();
   if(product.data?.products?.status==="active"&&product.data?.products?.stores?.status==="active")publicMedia=true;
 }
 if(!publicMedia)return json({error:"Media no disponible públicamente"},404);
 const signed=await admin.storage.from("media").createSignedUrl(path,3600);
 if(signed.error)return json({error:signed.error.message},500);
 return json({url:signed.data.signedUrl});
});
