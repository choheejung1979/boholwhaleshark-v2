/* Gentle reveal and accessible accordion effects. Respects reduced-motion preferences. */
(function(){
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const selectors=[
  '.card','.tour-card','.tour-detail-card','.feature-card','.condition-card','.history-card',
  '.faq-item','.summary','.intro','.section',
  '.bw-explore-card','.experience-rule-card','.today-update-grid > *',
  '.onepage-faq-list details','.onepage-policy-list details'
 ];
 const elements=[...new Set(selectors.flatMap(s=>Array.from(document.querySelectorAll(s))))];
 elements.forEach((el,i)=>{
  if(el.closest('header,nav,footer,.mobile-menu'))return;
  if(el.matches('.onepage-faq-list details,.onepage-policy-list details'))return;
  if(!reduced){
   el.classList.add('motion-reveal');
   if(el.matches('.card,.tour-card,.tour-detail-card,.feature-card,.condition-card,.history-card,.bw-explore-card,.experience-rule-card'))el.classList.add('motion-hover');
   el.style.setProperty('--motion-delay',Math.min(i%4,3)*75+'ms');
  }
 });
 if(!reduced&&'IntersectionObserver'in window){
  document.body.classList.add('motion-ready');
  const revealEls=document.querySelectorAll('.motion-reveal');
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
   });
  },{threshold:.08,rootMargin:'0px 0px -40px 0px'});
  revealEls.forEach(el=>observer.observe(el));
 }

 /* Wrap native details content so opening and closing can animate smoothly. */
 document.querySelectorAll('.onepage-faq-list details,.onepage-policy-list details').forEach(detail=>{
  if(detail.querySelector(':scope > .bw-motion-panel'))return;
  const summary=detail.querySelector(':scope > summary');
  if(!summary)return;
  const panel=document.createElement('div');
  panel.className='bw-motion-panel';
  const inner=document.createElement('div');
  inner.className='bw-motion-panel-inner';
  Array.from(detail.children).forEach(child=>{if(child!==summary)inner.appendChild(child);});
  panel.appendChild(inner);
  detail.appendChild(panel);
  summary.setAttribute('aria-expanded',detail.open?'true':'false');
  detail.addEventListener('toggle',()=>summary.setAttribute('aria-expanded',detail.open?'true':'false'));
 });
})();
