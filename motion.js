/* Gentle reveal and hover effects. Respects reduced-motion preferences. */
(function(){
 if(!('IntersectionObserver'in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const selectors=['.card','.tour-card','.tour-detail-card','.feature-card','.condition-card','.history-card','.faq-item','.summary','.intro','.section'];
 const elements=[...new Set(selectors.flatMap(s=>Array.from(document.querySelectorAll(s))))];
 if(!elements.length)return;
 document.body.classList.add('motion-ready');
 elements.forEach((el,i)=>{
   if(el.closest('header,nav,footer,.mobile-menu'))return;
   el.classList.add('motion-reveal');
   if(el.matches('.card,.tour-card,.tour-detail-card,.feature-card,.condition-card,.history-card'))el.classList.add('motion-hover');
   el.style.setProperty('--motion-delay',Math.min(i%4,3)*65+'ms');
 });
 const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}});
 },{threshold:.08,rootMargin:'0px 0px -35px 0px'});
 elements.forEach(el=>{if(el.classList.contains('motion-reveal'))observer.observe(el)});
})();
