import Stripe from "npm:stripe@22.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-07-30.basil" });
const cryptoProvider = Stripe.createSubtleCryptoProvider();

function adminKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try { return JSON.parse(raw).default; } catch {}
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret || !Deno.env.get("STRIPE_SECRET_KEY")) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
  } catch (err) {
    console.error("Invalid Stripe signature", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, adminKey());
  const object = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
  const orderId = ("metadata" in object ? object.metadata?.order_id : null)
    || ("client_reference_id" in object ? object.client_reference_id : null)
    || null;

  if (!orderId) return Response.json({ received: true });

  if (event.type === "checkout.session.completed") {
    const prior = await admin.from("payment_events").select("id").eq("external_event_id", event.id).maybeSingle();
    if (prior.data) return Response.json({ received: true });

    const inserted = await admin.from("payment_events").insert({
      external_event_id: event.id,
      event_type: event.type,
      order_id: orderId,
      payload: event
    });
    if (inserted.error) {
      console.error(inserted.error);
      return new Response("Database error", { status: 500 });
    }

    const stock = await admin.rpc("process_paid_order", { target_order_id: orderId });
    if (stock.error || stock.data !== true) {
      console.error(stock.error);
      await admin.from("orders").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", orderId);
      return Response.json({ received: true });
    }

    const order = await admin.from("orders").select("buyer_id").eq("id", orderId).single();
    if (order.data?.buyer_id) {
      const note = await admin.from("notifications").insert({
        user_id: order.data.buyer_id,
        type: "payment",
        title: "Pago confirmado",
        body: "Tu pedido ha sido pagado correctamente.",
        data: { order_id: orderId }
      });
      if (note.error) console.error(note.error);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    await admin.from("orders")
      .update({ status: "cancelled", stripe_payment_intent_id: ("id" in object ? object.id : null), updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .in("status", ["pending"]);
  }

  if (event.type === "charge.refunded") {
    await admin.from("orders")
      .update({ status: "refunded", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .in("status", ["paid", "processing", "shipped", "completed"]);
  }

  return Response.json({ received: true });
});
