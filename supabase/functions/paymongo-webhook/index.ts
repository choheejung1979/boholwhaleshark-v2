import{createClient}from"https://esm.sh/@supabase/supabase-js@2";
const hex=(b:Uint8Array)=>Array.from(b).map(x=>x.toString(16).padStart(2,"0")).join("");
async function hmac(secret:string,message:string){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return hex(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(message))));}
const safeEqual=(a:string,b:string)=>a.length===b.length&&[...a].reduce((v,c,i)=>v|(c.charCodeAt(0)^b.charCodeAt(i)),0)===0;
Deno.serve(async req=>{if(req.method!=="POST")return new Response("Method not allowed",{status:405});try{
const raw=await req.text(),sig=req.headers.get("Paymongo-Signature")||req.headers.get("paymongo-signature")||"",parts=Object.fromEntries(sig.split(",").map(x=>{const i=x.indexOf("=");return i<0?[x.trim(),""]:[x.slice(0,i).trim(),x.slice(i+1).trim()]})),ts=parts.t||"",event=JSON.parse(raw),livemode=event?.data?.attributes?.livemode===true,provided=livemode?parts.li||"":parts.te||"",secret=Deno.env.get("PAYMONGO_WEBHOOK_SECRET")||"";
if(!secret||!ts||!provided)return new Response("Webhook signature missing",{status:401});
const expected=await hmac(secret,ts+"."+raw);if(!safeEqual(expected,provided))return new Response("Invalid webhook signature",{status:401});
const type=event?.data?.attributes?.type||event?.type||"",resource=event?.data?.attributes?.data||event?.data||{},attrs=resource?.attributes||{},intentId=attrs?.payment_intent_id||resource?.id||"";
let status="";if(type==="payment.paid")status="paid";else if(type==="payment.failed")status="failed";else return new Response("Event ignored",{status:200});
if(!intentId)return new Response("No payment intent id",{status:200});
const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),{error}=await db.from("reservations").update({payment_status:status,status:status==="paid"?"Confirmed":"Payment Failed",updated_at:new Date().toISOString()}).eq("payment_intent_id",intentId);
if(error)throw error;return new Response("ok",{status:200});
}catch(e){console.error(e);return new Response("Webhook processing error",{status:500})}});
