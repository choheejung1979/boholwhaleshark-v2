# Booking system deployment
1. Run `supabase/migrations/20261115_create_reservations.sql` in the Supabase SQL Editor.
2. Deploy: `supabase functions deploy create-whale-booking-checkout`
3. Set secret: `supabase secrets set PAYMONGO_SECRET_KEY=sk_live_your_secret` (or test key first). Never put this key in public files.
4. PayMongo webhook/payment confirmation still needs to be configured before treating a booking as paid. Until then all rows stay pending.
Prices are per person and recalculated server-side: Ticket 1250/1920; Transfer 2150/2820; Private 3830/4500; Combo 5330/6000 (Filipino/Foreigner).
