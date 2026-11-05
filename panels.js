(()=>{
'use strict';
const order=['home','about','contact','professor','students','alumni','research','projects','publications','resources'];
const content=document.querySelector('#content'),sidebar=document.querySelector('.sidebar');
const renderBody=render;
let key='',part=0,pageSize=4,rendering=false,locked=false,animationId=0,resizeFrame=0,lastInnerScroll=0;
document.body.classList.add('one-page');
sidebar.insertAdjacentHTML('beforeend','<div class="scroll-gauge" aria-hidden="true"><span class="scroll-needle"></span></div>');
const scale=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-scale'))||1;
function gauge(){
 const link=nav.querySelector('a[data-page="'+key+'"]'),group=link?.closest('.menu-group');
 const target=group&&!group.classList.contains('expanded')?group.querySelector('.group-toggle'):link;
 if(!target||key==='home')return;
 const a=sidebar.getBoundingClientRect(),b=target.getBoundingClientRect();
 sidebar.querySelector('.scroll-needle').style.top=((b.top+b.height/2-a.top)/scale()+sidebar.scrollTop)+'px';
}
function mark(open){
 document.body.classList.toggle('at-home',key==='home');
 nav.querySelectorAll('.menu-group').forEach(g=>{
  const link=g.querySelector('a[data-page="'+key+'"]');g.classList.toggle('current-location',!!link);
  if(open)setGroup(g,!!link);
  g.querySelectorAll('a').forEach(a=>{const on=a===link;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 });gauge();
}
function sheets(){return [...content.querySelectorAll('.panel-live .student-sheet')];}
function size(){
 const unit=innerHeight/scale();
 document.documentElement.style.setProperty('--screen-height',unit+'px');
 document.documentElement.style.setProperty('--roster-scale',String(1/scale()));
 content.style.height=unit+'px';
 const live=content.querySelector('.panel-live'),body=live?.querySelector('.page-content');
 if(body)body.style.height=Math.max(0,unit-(live.querySelector('.page-intro')?.offsetHeight||0))+'px';
 const list=sheets();part=Math.max(0,Math.min(part,list.length-1));
 list.forEach((s,i)=>{s.hidden=i!==part;s.style.height=Math.max(0,unit-(live.querySelector('.page-intro')?.offsetHeight||0))+'px';});
 window.LabCMS?.fit(live||content);
 window.LabJournal?.resize({screenHeight:unit,rosterScale:1/scale()});
}
function transition(old,direction){
 const live=content.querySelector('.panel-live');
 if(!old||matchMedia('(prefers-reduced-motion: reduce)').matches){locked=false;return;}
 old.classList.add('panel-exit');old.inert=true;old.setAttribute('aria-hidden','true');content.append(old);
 const id=++animationId,options={duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'};
 const outgoing=old.animate([{transform:'translateY(0)'},{transform:'translateY('+(-direction*100)+'%)'}],options);
 const incoming=live.animate([{transform:'translateY('+(direction*100)+'%)'},{transform:'translateY(0)'}],options);
 locked=true;Promise.allSettled([outgoing.finished,incoming.finished]).then(()=>{old.remove();if(id===animationId){incoming.cancel();locked=false;}});
}
function show(next,{animate=true,open=true,keepPart=false,directionOverride=0,enterFromEnd=false}={}){
 if(rendering)return;if(!order.includes(next))next='home';
 ++animationId;locked=false;
 const direction=directionOverride||(order.indexOf(next)>=order.indexOf(key)?1:-1);
 const old=animate?content.querySelector('.panel-live'):null;
 rendering=true;key=next;if(!keepPart)part=0;
 document.body.classList.toggle('panel-view',key!=='home');document.body.dataset.page=key;
 try{history.replaceState(null,'','#'+key);}catch{}
 const count=innerHeight<750?3:4;pageSize=count;window.LabCMS?.setMemberPageSize(count);
 renderBody();
 const live=document.createElement('section');live.className='panel-live';live.dataset.page=key;
 live.append(...content.childNodes);content.append(live);
 if(enterFromEnd)part=Math.max(0,sheets().length-1);
 size();mark(open);rendering=false;transition(old,direction);
}
render=()=>show(location.hash.slice(1)||'home',{animate:false});
function move(delta,target){
 if(locked||rendering||Math.abs(delta)<2||document.querySelector('dialog[open]'))return;
 let box=null;
 for(let el=target;el instanceof Element&&!el.matches('.panel-live');el=el.parentElement){
  if(el.scrollHeight>el.clientHeight+2&&['auto','scroll'].includes(getComputedStyle(el).overflowY)){box=el;break;}
 }
 box=box||(sheets().length?sheets()[part]:content.querySelector('.panel-live .page-content'));
 if(box&&box.scrollHeight>box.clientHeight+2){
  const remaining=delta>0?box.scrollHeight-box.clientHeight-box.scrollTop:box.scrollTop;
  if(remaining>2){box.scrollTop+=delta;lastInnerScroll=performance.now();return;}
  if(performance.now()-lastInnerScroll<220){lastInnerScroll=performance.now();return;}
 }
 const list=sheets(),step=delta>0?1:-1;
 if(list.length&&part+step>=0&&part+step<list.length){part+=step;show(key,{keepPart:true,open:false,directionOverride:step});return;}
 const index=order.indexOf(key),next=order[index+step];if(next)show(next,{enterFromEnd:step<0});
}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href^="#"]');if(!a||a.closest('dialog')||a.classList.contains('skip'))return;
 const next=a.getAttribute('href').slice(1);if(!order.includes(next))return;
 e.preventDefault();e.stopPropagation();show(next);content.focus({preventScroll:true});
},true);
window.addEventListener('wheel',e=>{
 if(e.ctrlKey||e.defaultPrevented||e.target.closest('.sidebar,dialog'))return;
 e.preventDefault();move(e.deltaY,e.target);
},{passive:false});
document.addEventListener('keydown',e=>{
 if(!['ArrowUp','ArrowDown'].includes(e.key)||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.defaultPrevented||e.target.closest('input,textarea,select,[contenteditable]'))return;
 e.preventDefault();move(e.key==='ArrowDown'?120:-120,e.target);
});
nav.addEventListener('click',e=>{if(e.target.closest('.group-toggle'))gauge();});
sidebar.addEventListener('scroll',gauge,{passive:true});
window.addEventListener('resize',()=>{
 cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{
  const member=part*pageSize;part=Math.floor(member/(innerHeight<750?3:4));
  show(key,{animate:false,open:false,keepPart:true});
 });
});
show(location.hash.slice(1)||'home',{animate:false});
})();
