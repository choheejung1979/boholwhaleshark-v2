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
 function setCookie(value){
  document.cookie=COOKIE+'='+value+';path=/;max-age=31536000;SameSite=Lax';
  try{localStorage.setItem('bw-language',value.split('/').pop());}catch(e){}
 }
 function getCookie(){
  var m=document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
  if(m)return decodeURIComponent(m[1]).split('/').pop();
  try{return localStorage.getItem('bw-language')||'en';}catch(e){return 'en';}
 }
 function fire(el){
  if(!el)return;
  el.dispatchEvent(new Event('change',{bubbles:true}));
 }
 function applyLanguage(code){
  if(code==='en'){
   setCookie('/en/en');
   var combo=document.querySelector('.goog-te-combo');
   if(combo){combo.value='en';fire(combo);}
   else location.reload();
   return;
  }
  setCookie('/en/'+code);
  var combo=document.querySelector('.goog-te-combo');
  if(combo){combo.value=code;fire(combo);}
  else location.reload();
 }
 function init(){
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
  select.value=getCookie();
  if(!LANGS.some(function(l){return l.code===select.value;}))select.value='en';
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
  var lang=getCookie();
  if(lang&&lang!=='en'){
   var combo=document.querySelector('.goog-te-combo');
   if(combo){combo.value=lang;fire(combo);}
  }
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 var s=document.createElement('script');
 s.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
 s.async=true;
 document.head.appendChild(s);
})();