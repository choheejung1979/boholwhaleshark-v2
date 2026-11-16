import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const P={ticket:{name:"Ticket Only",Filipino:1250,Foreigner:1920},transfer:{name:"Pick-up & Drop-off",Filipino:2150,Foreigner:2820},private:{name:"Private Tour",Filipino:3830,Foreigner:4500},combo:{name:"Whale Shark + Napaling",Filipino:5330,Foreigner:6000}};
const cors={"Access-Control-Allow-Origin":"https://boholwhaleshark.com","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const out=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async req=>{if(req.method==="OPTIONS")return new Response("ok",{headers:cors});if(req.method!=="POST")return out({error:"Method not allowed"},405);try{
const b=await req.json(),p=P[b.tour_key],r=b.rate_category,n=Number(b.guests);
if(!p||!["Filipino","Foreigner"].includes(r))return out({error:"Invalid tour or rate category"},400);
if(!Number.isInteger(n)||n<1||n>30||!/^\d{4}-\d{2}-\d{2}$/.test(b.tour_date||"")||!b.customer_name?.trim()||!b.whatsapp?.trim()||!b.email?.trim())return out({error:"Please complete all required fields"},400);
const secret=Deno.env.get("PAYMONGO_SECRET_KEY")||"",db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
if(!secret)return out({error:"Payment gateway is not configured."},503);
const unit=p[r],total=unit*n,code="BWS-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomUUID().slice(0,6).toUpperCase();
const {data:row,error}=await db.from("reservations").insert({booking_code:code,tour_key:b.tour_key,tour_name:p.name,rate_category:r,unit_price:unit,guests:n,total_amount:total,tour_date:b.tour_date,customer_name:b.customer_name.trim(),hotel:b.hotel||"",whatsapp:b.whatsapp.trim(),email:b.email.trim(),contact:b.whatsapp.trim(),special_request:b.special_request||"",payment_status:"pending",status:"Pending"}).select("id").single();if(error)throw error;
const payload={data:{attributes:{amount:total*100,currency:"PHP",payment_method_allowed:["card"],payment_method_options:{card:{request_three_d_secure:"any"}},capture_type:"automatic",description:p.name+" · "+r+" · "+code,metadata:{reservation_id:row.id,booking_code:code,tour_date:b.tour_date,guests:String(n)}}}};
const res=await fetch("https://api.paymongo.com/v1/payment_intents",{method:"POST",headers:{Authorization:"Basic "+btoa(secret+":"),"Content-Type":"application/json"},body:JSON.stringify(payload)}),result=await res.json(),intent=result?.data?.attributes,id=result?.data?.id,clientKey=intent?.client_key;
if(!res.ok||!id||!clientKey){await db.from("reservations").update({payment_status:"failed",updated_at:new Date().toISOString()}).eq("id",row.id);return out({error:result?.errors?.[0]?.detail||"Unable to initialize card payment."},502)}
const {error:updateError}=await db.from("reservations").update({payment_intent_id:id,updated_at:new Date().toISOString()}).eq("id",row.id);if(updateError)throw updateError;
return out({payment_intent_id:id,client_key:clientKey,booking_code:code,total_amount:total});
}catch(e){console.error(e);return out({error:e.message||"Server error"},500)}});
