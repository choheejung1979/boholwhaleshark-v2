/* Discourage casual copying and image dragging. Form controls remain usable. */
(function(){
 'use strict';
 function isEditable(node){
  return !!(node&&node.closest&&node.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""],.allow-copy'));
 }
 document.addEventListener('contextmenu',function(e){
  if(!isEditable(e.target))e.preventDefault();
 },true);
 document.addEventListener('copy',function(e){
  if(!isEditable(e.target))e.preventDefault();
 },true);
 document.addEventListener('cut',function(e){
  if(!isEditable(e.target))e.preventDefault();
 },true);
 document.addEventListener('selectstart',function(e){
  if(!isEditable(e.target))e.preventDefault();
 },true);
 document.addEventListener('dragstart',function(e){
  if(e.target&&e.target.closest&&e.target.closest('img,video,svg,.hero-visual'))e.preventDefault();
 },true);
 document.addEventListener('keydown',function(e){
  if(isEditable(e.target))return;
  if((e.ctrlKey||e.metaKey)&&['c','x','s','u','p'].indexOf(String(e.key).toLowerCase())!==-1)e.preventDefault();
 },true);
})();
