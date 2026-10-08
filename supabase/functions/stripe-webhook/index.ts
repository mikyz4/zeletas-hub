import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
function adminKey(){const raw=Deno.env.get("SUPABASE_SECRET_KEYS");if(raw){try{return JSON.parse(raw).default}catch{}}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}
function hexBytes(hex:string){const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++)out[i]=parseInt(hex.slice(i*2,i*2+2),16);return out}
async function verifySignature(body:string,header:string){
 const secret=Deno.env.get("STRIPE_WEBHOOK_SECRET");if(!secret)return false;
 const parts=header.split(",");const tsPart=parts.find(x=>x.startsWith("t="));const ts=tsPart?Number(tsPart.slice(2)):0;
 if(!ts||Math.abs(Date.now()/1000-ts)>300)return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 const signed=ts+"."+body;
 for(const part of parts.filter(x=>x.startsWith("v1="))){try{if(await crypto.subtle.verify("HMAC",key,hexBytes(part.slice(3)),new TextEncoder().encode(signed)))return true}catch{}}
 return false
}
async function refundIfNeeded(stripe:string,paymentIntent:string){
 const p=new URLSearchParams();p.set("payment_intent",paymentIntent);p.set("refund_application_fee","true");p.set("reverse_transfer","true");
 await fetch("https://api.stripe.com/v1/refunds",{method:"POST",headers:{"Authorization":"Bearer "+stripe,"Content-Type":"application/x-www-form-urlencoded"},body:p});
}
Deno.serve(async req=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const body=await req.text(),sig=req.headers.get("stripe-signature")||"";if(!(await verifySignature(body,sig)))return new Response("Invalid signature",{status:400});
 let event:any;try{event=JSON.parse(body)}catch{return new Response("Invalid JSON",{status:400})}
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey());
 const prior=await admin.from("payment_events").select("id").eq("external_event_id",event.id).maybeSingle();if(prior.data)return Response.json({received:true});
 const object=event.data?.object||{};const orderId=object.metadata?.order_id||object.client_reference_id||null;
 await admin.from("payment_events").insert({external_event_id:event.id,event_type:event.type,order_id:orderId,payload:event});
 if((event.type==="checkout.session.completed"&&object.payment_status==="paid")||event.type==="payment_intent.succeeded"){
   if(!orderId)return Response.json({received:true});
   const order=await admin.from("orders").select("id,buyer_id,status").eq("id",orderId).single();
   if(order.error||!order.data||order.data.status==="paid"||order.data.status==="refunded")return Response.json({received:true});
   const stock=await admin.rpc("fulfill_order_stock",{target_order_id:orderId});
   if(stock.error||stock.data!==true){
     if(object.payment_intent)await refundIfNeeded(Deno.env.get("STRIPE_SECRET_KEY")!,object.payment_intent);
     await admin.from("orders").update({status:"cancelled"}).eq("id",orderId);
     await admin.from("notifications").insert({user_id:order.data.buyer_id,type:"payment",title:"Pedido cancelado",body:"El pago se ha reembolsado porque el stock no estaba disponible.",data:{order_id:orderId}});
     return Response.json({received:true});
   }
   await admin.from("orders").update({status:"paid",stripe_payment_intent_id:object.payment_intent||object.id||null}).eq("id",orderId);
   await admin.from("notifications").insert({user_id:order.data.buyer_id,type:"payment",title:"Pago confirmado",body:"Tu pedido ha sido pagado correctamente.",data:{order_id:orderId}});
 }
 if(event.type==="payment_intent.payment_failed"&&orderId)await admin.from("orders").update({status:"cancelled"}).eq("id",orderId);
 if(event.type==="charge.refunded"&&orderId){const order=await admin.from("orders").select("id,buyer_id,status").eq("id",orderId).single();if(order.data&&order.data.status!=="refunded"){await admin.rpc("restore_order_stock",{target_order_id:orderId});await admin.from("orders").update({status:"refunded"}).eq("id",orderId);await admin.from("notifications").insert({user_id:order.data.buyer_id,type:"payment",title:"Pago reembolsado",body:"Tu pedido ha sido reembolsado.",data:{order_id:orderId}})}}
 return Response.json({received:true});
});