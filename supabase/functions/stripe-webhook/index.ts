import Stripe from "npm:stripe@^22";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.3";

const stripeKey=Deno.env.get("STRIPE_SECRET_KEY")||"";
const stripe=new Stripe(stripeKey);
const cryptoProvider=Stripe.createSubtleCryptoProvider();
function adminKey(){const raw=Deno.env.get("SUPABASE_SECRET_KEYS");if(raw){try{return JSON.parse(raw).default}catch{}}return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}

Deno.serve(async req=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const secret=Deno.env.get("STRIPE_WEBHOOK_SECRET");
 if(!secret||!stripeKey)return new Response("Stripe not configured",{status:503});
 const body=await req.text(),signature=req.headers.get("stripe-signature")||"";
 let event:Stripe.Event;
 try{event=await stripe.webhooks.constructEventAsync(body,signature,secret,undefined,cryptoProvider)}catch(e){console.error("Invalid Stripe signature",e);return new Response("Invalid signature",{status:400})}
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,adminKey());
 const object=event.data.object as any;
 const orderId=object?.metadata?.order_id||object?.client_reference_id||null;

 const recorded=await admin.from("payment_events").insert({external_event_id:event.id,event_type:event.type,order_id:orderId,payload:event,processed_at:new Date().toISOString()});
 if(recorded.error){if(recorded.error.code==="23505")return Response.json({received:true});console.error(recorded.error);return new Response("Database error",{status:500})}
 if(!orderId)return Response.json({received:true});

 if(event.type==="checkout.session.completed" && object.payment_status==="paid" || event.type==="checkout.session.async_payment_succeeded"){
   const confirmed=await admin.rpc("confirm_checkout_payment",{p_order_id:orderId,p_payment_intent_id:object.payment_intent||null});
   if(confirmed.error){console.error(confirmed.error);return new Response("Order confirmation failed",{status:500})}
   if(confirmed.data!==true)return Response.json({received:true})
   const order=await admin.from("orders").select("buyer_id,total").eq("id",orderId).single();
   if(order.data?.buyer_id){
     const note=await admin.from("notifications").insert({user_id:order.data.buyer_id,type:"payment",title:"Pago confirmado",body:"Tu pedido ha sido pagado correctamente.",data:{order_id:orderId,total:order.data.total}});
     if(note.error)console.error(note.error);
   }
 }

 if(event.type==="checkout.session.async_payment_failed"){
   const released=await admin.rpc("release_order_stock",{p_order_id:orderId});
   if(released.error){console.error(released.error);return new Response("Order cancellation failed",{status:500})}
 }
 
 if(event.type==="payment_intent.payment_failed"){
   const released=await admin.rpc("release_order_stock",{p_order_id:orderId});
   if(released.error){console.error(released.error);return new Response("Order cancellation failed",{status:500})}
   const order=await admin.from("orders").select("buyer_id").eq("id",orderId).single();
   if(order.data?.buyer_id)await admin.from("notifications").insert({user_id:order.data.buyer_id,type:"payment",title:"Pago no completado",body:"El pago no se completó y el stock reservado ha sido liberado.",data:{order_id:orderId}});
 }

 if(event.type==="checkout.session.expired"){
   const released=await admin.rpc("release_order_stock",{p_order_id:orderId});
   if(released.error){console.error(released.error);return new Response("Order expiration failed",{status:500})}
 }

 if(event.type==="charge.refunded"){
   const updated=await admin.from("orders").update({status:"refunded",updated_at:new Date().toISOString()}).eq("id",orderId).in("status",["paid","processing","shipped","completed"]);
   if(updated.error){console.error(updated.error);return new Response("Refund update failed",{status:500})}
 }

 return Response.json({received:true});
});
