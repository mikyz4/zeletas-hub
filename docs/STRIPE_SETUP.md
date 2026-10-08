# Stripe production setup

The application now contains Stripe Connect onboarding, marketplace Checkout and a signed webhook handler.

Required Supabase Edge Function secrets:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

Do not put either value in GitHub, HTML, JavaScript, chat or CI variables visible to pull requests. Store them in Supabase Edge Function Secrets.

Webhook endpoint:
https://sbqpkfdcznulwpxlxiwu.supabase.co/functions/v1/stripe-webhook

The seller onboarding and checkout functions intentionally return a configuration error until STRIPE_SECRET_KEY exists. The webhook rejects requests until STRIPE_WEBHOOK_SECRET exists.

Recommended rollout:
1. Create/enable Stripe Connect for the platform.
2. Configure the webhook endpoint above for Checkout/payment events.
3. Add the two secrets in Supabase Dashboard.
4. Create a seller store and complete Stripe onboarding.
5. Approve the store from the internal operations panel.
6. Test a real payment in Stripe test mode before enabling live keys.