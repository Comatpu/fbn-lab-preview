// Menu structure observed on fmbl.knu.ac.kr, 2026-10-28.
const menuGroups=[
 {ko:'연구실',en:'Lab',items:[['about','연구실 소개','Introduction'],['contact','찾아오시는 길','Contact us']]},
 {ko:'연구원',en:'People',items:[['professor','교수','Professor'],['students','학생','Student'],['alumni','졸업생','Alumni']]},
 {ko:'연구활동',en:'Research',items:[['research','연구분야','Research field'],['projects','연구과제','Project']]},
 {ko:'출판',en:'Publication',items:[['publications','저널','Journal']]},
 {ko:'게시판',en:'Board',items:[['resources','자료실','Data room']]}
];
const nav=document.querySelector('nav');
nav.innerHTML=menuGroups.map((g,i)=>`<div class="menu-group"><button class="group-toggle" aria-expanded="false" aria-controls="submenu-${i}"><span>${g.ko}</span><small>${g.en}</small></button><div class="submenu" id="submenu-${i}" inert><div class="submenu-inner">${g.items.map(([id,ko,en])=>`<a href="#${id}" data-page="${id}">${ko}<small>${en}</small></a>`).join('')}</div></div></div>`).join('');
function setGroup(group,open){group.classList.toggle('expanded',open);group.querySelector('button').setAttribute('aria-expanded',String(open));group.querySelector('.submenu').inert=!open;}
nav.querySelectorAll('.group-toggle').forEach(button=>button.addEventListener('click',()=>{const group=button.parentElement;const open=!group.classList.contains('expanded');nav.querySelectorAll('.menu-group').forEach(g=>setGroup(g,g===group&&open));}));
const peopleTemplate=pages.people;
function memberPart(selector){const template=document.createElement('template');template.innerHTML=peopleTemplate();return template.content.querySelector(selector).outerHTML;}
pages.professor=()=>heading('교수','Professor','')+'<div class="page-content">'+memberPart('.professor')+'</div>';
pages.students=()=>heading('학생','Student','')+'<div class="page-content"><p class="note">구성원 3명의 배치 예시입니다. 이름·과정·사진은 추후 입력합니다.</p>'+memberPart('.members')+'</div>';
const emptyPage=(ko,en,description)=>()=>heading(ko,en,'')+`<div class="page-content"><div class="empty-record"><p>${description}</p><small>자료 입력 전인 목업 페이지입니다.</small></div></div>`;
pages.alumni=emptyPage('졸업생','Alumni','졸업생 정보를 등록할 공간입니다.');
pages.projects=emptyPage('연구과제','Project','과제명 · 연구 기간 · 지원 기관을 등록할 공간입니다.');
pages.patents=emptyPage('특허','Patent','특허명 · 발명자 · 출원 및 등록 정보를 등록할 공간입니다.');
pages.books=emptyPage('저서 및 역서','Book','도서명 · 저자 · 출판사 정보를 등록할 공간입니다.');
pages.resources=emptyPage('자료실','Data room','연구실 소개자료와 공개 자료를 등록할 공간입니다.');
pages.gallery=()=>heading('포토갤러리','Gallery','')+'<div class="page-content"><div class="gallery-placeholders">'+[1,2,3].map(i=>`<div><div class="gallery-photo">사진 등록 예정</div><p>연구실 사진 ${i} <small>목업</small></p></div>`).join('')+'</div></div>';
pages.sites=()=>heading('관련사이트','Sites','')+`<div class="page-content"><ul class="related-links"><li><a href="https://www.knu.ac.kr/" target="_blank" rel="noopener">경북대학교 ↗</a></li><li><a href="${profileURL}" target="_blank" rel="noopener">강현주 교수님 공식 연구자 소개 ↗</a></li></ul></div>`;
let entranceObserver;
const previousRender=render;
render=function(){
 entranceObserver?.disconnect();previousRender();
 const key=location.hash.slice(1)||'home';
 const group=menuGroups.findIndex(g=>g.items.some(item=>item[0]===key));
 nav.querySelectorAll('.menu-group').forEach((g,i)=>setGroup(g,i===group));
 const title=key==='home'?'홈':document.querySelector('#content h1')?.textContent||'홈';
 document.title=title+' | 식품생화학 및 분자영양학 연구실';
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const nodes=document.querySelectorAll(key==='home'?'.reference-banner h1,.reference-banner p,.ref-about,.ref-quick,.ref-bottom h2,.ref-notice,.ref-gallery':'.page-intro,.page-content');
 entranceObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('entered');entranceObserver.unobserve(entry.target);}}),{threshold:0.05});
 nodes.forEach((node,i)=>{node.classList.add('entrance');node.style.setProperty('--entrance-delay',(i%2)*100+'ms');entranceObserver.observe(node);});
};
// Make the gallery shortcuts open the corresponding submenu page.
const homeWithGallery=pages.home;
pages.home=()=>homeWithGallery().replace('href="#about" class="ref-gallery"','href="#gallery" class="ref-gallery"');
document.querySelector('#sources h3').insertAdjacentHTML('afterend','<a href="https://www.pexels.com/photo/a-scientist-drop-pipetting-liquid-samples-in-test-tubes-8540031/" target="_blank" rel="noopener">배너 사진: Kaboompics / Pexels ↗</a><a href="https://www.pexels.com/photo/close-up-vials-during-chemistry-experiment-8540033/" target="_blank" rel="noopener">메뉴 사진: Kaboompics / Pexels ↗</a><a href="https://www.pexels.com/license/" target="_blank" rel="noopener">Pexels 사용 조건 ↗</a>');
render();



document.querySelector('#sources h3').insertAdjacentHTML('afterend','<a href="https://www.pexels.com/photo/apple-on-white-background-5876762/" target="_blank" rel="noopener">연구실 소개 사진: cottonbro studio / Pexels ↗</a>');
