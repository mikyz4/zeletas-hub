import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.3";

const ORIGIN = "https://zeletas.netlify.app";
const cors = {"Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Headers":"authorization,apikey,content-type", "Access-Control-Allow-Methods":"POST,OPTIONS"};

function adminKey(){const raw=Deno.env.get("SUPABASE_SECRET_KEYS");if(raw){try{return JSON.parse(raw).default}catch{}}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}
function pubKey(){const raw=Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");if(raw){try{return JSON.parse(raw).default}catch{}}return Deno.env.get("SUPABASE_ANON_KEY")!}

Deno.serve(async req=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 if(req.method!=="POST") return Response.json({error:"Method not allowed"},{status:405,headers:cors});
 const auth=req.headers.get("Authorization");
 if(!auth?.startsWith("Bearer ")) return Response.json({error:"Unauthorized"},{status:401,headers:cors});
 const client=createClient(Deno.env.get("SUPABASE_URL")!,pubKey(),{global:{headers:{Authorization:auth}}});
 const {data:{user},error}=await client.auth.getUser(); if(error||!user)return Response.json({error:"Unauthorized"},{status:401,headers:cors});
 const aal=(await client.auth.mfa.getAuthenticatorAssuranceLevel()).data;
 if(aal?.nextLevel==="aal2"&&aal.currentLevel!=="aal2")return Response.json({error:"MFA_REQUIRED"},{status:403,headers:cors});
 const stripeKey=Deno.env.get("STRIPE_SECRET_KEY");if(!stripeKey)return Response.json({error:"Stripe no está configurado todavía."},{status:503,headers:cors});
 let b:any;try{b=await req.json()}catch{return Response.json({error:"Invalid JSON"},{status:400,headers:cors})}
if(b.shippingAddress && JSON.stringify(b.shippingAddress).length>10000)return Response.json({error:"Dirección de envío demasiado grande."},{status:400,headers:cors});
 const items=Array.isArray(b.items)?b.items:[];if(!items.length||items.length>50)return Response.json({error:"Carrito inválido"},{status:400,headers:cors});
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey());
 const order=await admin.rpc("create_checkout_order",{p_buyer_id:user.id,p_items:items,p_shipping_address:b.shippingAddress??null});
 if(order.error){console.error(order.error);const msg=order.error.message.includes("INSUFFICIENT_STOCK")?"Stock insuficiente.":order.error.message.includes("MULTI_STORE_CART_NOT_SUPPORTED")?"El carrito debe pertenecer a una sola tienda.":"No se pudo preparar el pedido.";return Response.json({error:msg},{status:409,headers:cors})}
 const orderId=order.data;
 const o=await admin.from("orders").select("id,store_id,subtotal,platform_fee,total").eq("id",orderId).single();
 const oi=await admin.from("order_items").select("quantity,unit_price,product_id,products(name)").eq("order_id",orderId);
 if(o.error||oi.error){await admin.rpc("release_order_stock",{p_order_id:orderId});return Response.json({error:"No se pudo preparar el pago."},{status:500,headers:cors})}
 const store=await admin.from("stores").select("id,name,stripe_account_id,status,stripe_onboarding_complete").eq("id",o.data.store_id).single();
 if(store.error||store.data.status!=="active"||!store.data.stripe_account_id||!store.data.stripe_onboarding_complete){await admin.rpc("release_order_stock",{p_order_id:orderId});return Response.json({error:"La tienda no puede recibir pagos todavía."},{status:400,headers:cors})}
 const params=new URLSearchParams();params.set("mode","payment");params.set("success_url",ORIGIN+"/tienda/?checkout=success&order="+orderId);params.set("cancel_url",ORIGIN+"/tienda/?checkout=cancelled&order="+orderId);params.set("client_reference_id",orderId);params.set("metadata[order_id]",orderId);params.set("payment_intent_data[application_fee_amount]",String(Math.round(Number(o.data.platform_fee)*100)));params.set("payment_intent_data[transfer_data][destination]",store.data.stripe_account_id);
 (oi.data||[]).forEach((x:any,i:number)=>{params.set("line_items["+i+"][price_data][currency]","eur");params.set("line_items["+i+"][price_data][unit_amount]",String(Math.round(Number(x.unit_price)*100)));params.set("line_items["+i+"][price_data][product_data][name]",x.products?.name||"Producto");params.set("line_items["+i+"][quantity]",String(x.quantity))});
 const sr=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{"Authorization":"Bearer "+stripeKey,"Content-Type":"application/x-www-form-urlencoded","Idempotency-Key":orderId},body:params});
 const sd=await sr.json();if(!sr.ok){console.error(sd);await admin.rpc("release_order_stock",{p_order_id:orderId});return Response.json({error:"Stripe no pudo crear el pago."},{status:502,headers:cors})}
 const up=await admin.from("orders").update({stripe_checkout_session_id:sd.id}).eq("id",orderId);if(up.error){console.error(up.error);try{await fetch("https://api.stripe.com/v1/checkout/sessions/"+encodeURIComponent(sd.id)+"/expire",{method:"POST",headers:{"Authorization":"Bearer "+stripeKey}})}catch{}await admin.rpc("release_order_stock",{p_order_id:orderId});return Response.json({error:"No se pudo registrar el pago."},{status:500,headers:cors})}
 return Response.json({url:sd.url,orderId},{headers:cors});
});
