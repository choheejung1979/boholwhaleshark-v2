/* Stable shared language switching for Bohol Whale Shark. */
(function(){
 'use strict';
 var LANGS=[
  {code:'en',label:'English',flag:'🇺🇸'},
  {code:'ko',label:'한국어',flag:'🇰🇷'},
  {code:'zh-CN',label:'中文（简体）',flag:'🇨🇳'},
  {code:'es',label:'Español',flag:'🇪🇸'},
  {code:'fr',label:'Français',flag:'🇫🇷'},
  {code:'ja',label:'日本語',flag:'🇯🇵'}
 ];
 var ROOT_DOMAIN='.boholwhaleshark.com';
 var KEY='bw-language';
 function setSavedLanguage(code){
  try{localStorage.setItem(KEY,code);}catch(e){}
 }
 function expireCookie(domain,path){
  var suffix=domain?';domain='+domain:'';
  document.cookie='googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;max-age=0;path='+path+suffix+';SameSite=Lax';
 }
 function clearTranslationCookies(){
  expireCookie('', '/');
  expireCookie(location.hostname, '/');
  expireCookie(ROOT_DOMAIN, '/');
  expireCookie('.www.boholwhaleshark.com','/');
  setSavedLanguage('en');
 }
 function writeTranslationCookie(code){
  /* One shared-domain cookie keeps the language consistent across www and apex URLs. */
  expireCookie('', '/');
  expireCookie(location.hostname, '/');
  expireCookie(ROOT_DOMAIN, '/');
  document.cookie='googtrans=/en/'+code+';path=/;domain='+ROOT_DOMAIN+';max-age=31536000;SameSite=Lax';
  setSavedLanguage(code);
 }
 function readLanguage(){
  var match=document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if(match){
   var cookieLang=decodeURIComponent(match[1]).split('/').pop();
   if(LANGS.some(function(item){return item.code===cookieLang;}))return cookieLang;
  }
  try{
   var saved=localStorage.getItem(KEY);
   if(saved&&LANGS.some(function(item){return item.code===saved;}))return saved;
  }catch(e){}
  return 'en';
 }
 function chooseLanguage(code){
  if(!LANGS.some(function(item){return item.code===code;}))return;
  if(code==='en')clearTranslationCookies();
  else writeTranslationCookie(code);
  /* Reload consistently so Google Translate starts from a clean page state. */
  location.reload();
 }
 function mountSelector(){
  if(document.getElementById('bw-google-translate'))return;
  var host=document.createElement('div');
  host.id='bw-google-translate';
  host.className='bw-google-translate-host';
  host.setAttribute('aria-hidden','true');
  document.body.appendChild(host);
  var wrap=document.createElement('div');
  wrap.className='bw-language-switcher notranslate';
  wrap.setAttribute('translate','no');
  var current=readLanguage();
  var active=LANGS.find(function(item){return item.code===current;})||LANGS[0];
  var trigger=document.createElement('button');
  trigger.type='button';
  trigger.className='bw-language-trigger';
  trigger.setAttribute('aria-label','Select language');
  trigger.setAttribute('aria-expanded','false');
  trigger.innerHTML='<span class="bw-language-flag" aria-hidden="true">'+active.flag+'</span><span class="bw-language-current">'+active.label+'</span><span class="bw-language-chevron" aria-hidden="true"></span>';
  var menu=document.createElement('div');
  menu.className='bw-language-menu';
  menu.setAttribute('role','menu');
  LANGS.forEach(function(item){
   var option=document.createElement('button');
   option.type='button';
   option.className='bw-language-option'+(item.code===current?' is-active':'');
   option.setAttribute('role','menuitem');
   option.innerHTML='<span class="bw-language-flag" aria-hidden="true">'+item.flag+'</span><span>'+item.label+'</span>';
   option.addEventListener('click',function(){chooseLanguage(item.code);});
   menu.appendChild(option);
  });
  trigger.addEventListener('click',function(){
   var open=wrap.classList.toggle('is-open');
   trigger.setAttribute('aria-expanded',open?'true':'false');
  });
  document.addEventListener('click',function(event){
   if(!wrap.contains(event.target)){
    wrap.classList.remove('is-open');
    trigger.setAttribute('aria-expanded','false');
   }
  });
  wrap.appendChild(trigger);
  wrap.appendChild(menu);
  var actions=document.querySelector('.header-actions');
  var header=document.querySelector('.site-header');
  if(actions){
   var book=actions.querySelector('.book-now-link');
   if(book)actions.insertBefore(wrap,book);
   else actions.insertBefore(wrap,actions.firstChild);
  }else if(header){
   header.appendChild(wrap);
   wrap.style.position='absolute';
   wrap.style.right='22px';
   wrap.style.top='18px';
  }else{
   document.body.appendChild(wrap);
   wrap.style.position='fixed';
   wrap.style.top='16px';
   wrap.style.right='18px';
  }
 }
 window.googleTranslateElementInit=function(){
  if(!window.google||!google.translate)return;
  new google.translate.TranslateElement({
   pageLanguage:'en',
   includedLanguages:'ko,zh-CN,es,fr,ja',
   autoDisplay:false,
   layout:google.translate.TranslateElement.InlineLayout.SIMPLE
  },'bw-google-translate');
  var selected=readLanguage();
  if(selected==='en')return;
  var attempts=0;
  var timer=window.setInterval(function(){
   attempts++;
   var combo=document.querySelector('.goog-te-combo');
   if(combo){
    if(combo.value!==selected){
     combo.value=selected;
     combo.dispatchEvent(new Event('change',{bubbles:true}));
    }
    window.clearInterval(timer);
   }else if(attempts>=40){
    window.clearInterval(timer);
   }
  },250);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountSelector);
 else mountSelector();
 var script=document.createElement('script');
 script.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
 script.async=true;
 document.head.appendChild(script);
})();