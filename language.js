/* Shared multilingual layer: English, Korean, Simplified Chinese, Spanish and French. */
(function(){
 'use strict';
 var LANGS=[
  {code:'en',label:'English'},
  {code:'ko',label:'한국어'},
  {code:'zh-CN',label:'中文（简体）'},
  {code:'es',label:'Español'},
  {code:'fr',label:'Français'}
 ];
 var COOKIE='googtrans';
 function writeCookie(value){
  document.cookie=COOKIE+'='+value+';path=/;max-age=31536000;SameSite=Lax';
 }
 function clearCookie(){
  var domains=['', ';domain='+location.hostname, ';domain=.boholwhaleshark.com'];
  domains.forEach(function(domain){
   document.cookie=COOKIE+'=;path=/;max-age=0;SameSite=Lax'+domain;
   document.cookie=COOKIE+'=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT'+domain;
  });
  try{localStorage.setItem('bw-language','en');}catch(e){}
 }
 function getLanguage(){
  try{
   var saved=localStorage.getItem('bw-language');
   if(saved&&LANGS.some(function(l){return l.code===saved;}))return saved;
  }catch(e){}
  var m=document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if(m){
   var value=decodeURIComponent(m[1]).split('/').pop();
   if(LANGS.some(function(l){return l.code===value;}))return value;
  }
  return 'en';
 }
 function triggerTranslate(code){
  var combo=document.querySelector('.goog-te-combo');
  if(!combo)return false;
  combo.value=code;
  combo.dispatchEvent(new Event('change',{bubbles:true}));
  return true;
 }
 function applyLanguage(code){
  if(!LANGS.some(function(l){return l.code===code;}))return;
  if(code==='en'){
   clearCookie();
   location.reload();
   return;
  }
  try{localStorage.setItem('bw-language',code);}catch(e){}
  writeCookie('/en/'+code);
  if(!triggerTranslate(code))location.reload();
 }
 function init(){
  if(document.getElementById('bw-google-translate'))return;
  var host=document.createElement('div');
  host.id='bw-google-translate';
  host.className='bw-google-translate-host';
  host.setAttribute('aria-hidden','true');
  document.body.appendChild(host);
  var wrap=document.createElement('div');
  wrap.className='bw-language-switcher notranslate';
  wrap.setAttribute('translate','no');
  var select=document.createElement('select');
  select.setAttribute('aria-label','Select language');
  select.innerHTML=LANGS.map(function(l){return '<option value="'+l.code+'">'+l.label+'</option>';}).join('');
  select.value=getLanguage();
  select.addEventListener('change',function(){applyLanguage(select.value);});
  wrap.appendChild(select);
  var actions=document.querySelector('.header-actions');
  var header=document.querySelector('.site-header');
  if(actions){
   var book=actions.querySelector('.book-now-link');
   if(book)actions.insertBefore(wrap,book);else actions.insertBefore(wrap,actions.firstChild);
  }else if(header){
   header.appendChild(wrap);
   wrap.style.position='absolute';wrap.style.right='22px';wrap.style.top='18px';
  }else{
   document.body.appendChild(wrap);
   wrap.style.position='fixed';wrap.style.top='16px';wrap.style.right='18px';
  }
 }
 window.googleTranslateElementInit=function(){
  if(!window.google||!google.translate)return;
  new google.translate.TranslateElement({
   pageLanguage:'en',
   includedLanguages:'ko,zh-CN,es,fr',
   autoDisplay:false,
   layout:google.translate.TranslateElement.InlineLayout.SIMPLE
  },'bw-google-translate');
  var lang=getLanguage();
  if(lang!=='en'){
   var attempts=0;
   var timer=setInterval(function(){
    attempts++;
    if(triggerTranslate(lang)||attempts>=20)clearInterval(timer);
   },250);
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 var s=document.createElement('script');
 s.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
 s.async=true;
 document.head.appendChild(s);
})();