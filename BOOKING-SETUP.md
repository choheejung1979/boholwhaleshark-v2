# Booking system deployment
1. Run `supabase/migrations/20261115_create_reservations.sql` in the Supabase SQL Editor.
2. Deploy: `supabase functions deploy create-whale-booking-checkout`
3. Set secret: `supabase secrets set PAYMONGO_SECRET_KEY=sk_live_your_secret` (or test key first). Never put this key in public files.
4. PayMongo webhook/payment confirmation still needs to be configured before treating a booking as paid. Until then all rows stay pending.
Prices are per person and recalculated server-side: Ticket 1250/1920; Transfer 2150/2820; Private 3830/4500; Combo 5330/6000 (Filipino/Foreigner).

## PayMongo payment status webhook
1. Deploy the webhook function: `supabase functions deploy paymongo-webhook --no-verify-jwt`
2. Set its webhook signing secret: `supabase secrets set PAYMONGO_WEBHOOK_SECRET=your_paymongo_webhook_signing_secret`
3. In the PayMongo dashboard, create a webhook pointing to:
   `https://xpgudpilikuqzsdouxgb.supabase.co/functions/v1/paymongo-webhook`
4. Subscribe to checkout-session payment success and failure events (PayMongo event names supported by the handler: `checkout_session.payment.paid` and `checkout_session.payment.failed`). Copy the signing secret into the Supabase secret above.
5. Test with a PayMongo test key and test webhook before switching to live keys.

The webhook verifies the PayMongo signature before updating a reservation. The public booking form never receives the PayMongo secret or Supabase service-role key.

6. Deploy the public status lookup: `supabase functions deploy get-whale-booking-status`. It only returns payment status for a high-entropy booking reference.
