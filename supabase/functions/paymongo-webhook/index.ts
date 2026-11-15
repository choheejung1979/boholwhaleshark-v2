import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const hex=(b:Uint8Array)=>Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join("");
async function hmac(secret:string,message:string){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return hex(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(message))));}
const safeEqual=(a:string,b:string)=>a.length===b.length&&[...a].reduce((v,c,i)=>v|(c.charCodeAt(0)^b.charCodeAt(i)),0)===0;
Deno.serve(async req=>{if(req.method!=="POST")return new Response("Method not allowed",{status:405});try{
const raw=await req.text(),sig=req.headers.get("Paymongo-Signature")||req.headers.get("paymongo-signature")||"",parts=Object.fromEntries(sig.split(",").map(x=>x.trim().split("="))),ts=parts.t||"",provided=parts.te||parts.li||"",secret=Deno.env.get("PAYMONGO_WEBHOOK_SECRET")||"";
if(!secret||!ts||!provided)return new Response("Webhook signature missing",{status:401});
const expected=await hmac(secret,ts+"."+raw);if(!safeEqual(expected,provided))return new Response("Invalid webhook signature",{status:401});
const event=JSON.parse(raw),type=event?.data?.attributes?.type||event?.data?.attributes?.event_type||event?.type||"",attrs=event?.data?.attributes?.data?.attributes||{},sessionId=event?.data?.attributes?.data?.id||attrs?.checkout_session_id||"";
if(!sessionId)return new Response("No checkout session id",{status:200});
let status="";if(type==="checkout_session.payment.paid"||type==="checkout_session.paid")status="paid";else if(type==="checkout_session.payment.failed"||type==="checkout_session.failed")status="failed";else return new Response("Event ignored",{status:200});
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),{error}=await db.from("reservations").update({payment_status:status,payment_intent_id:attrs?.payments?.[0]?.id||null,updated_at:new Date().toISOString()}).eq("checkout_session_id",sessionId);
if(error)throw error;return new Response("ok",{status:200});
}catch(e){console.error(e);return new Response("Webhook processing error",{status:500})}});
