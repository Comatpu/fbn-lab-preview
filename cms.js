(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imgURL=s=>/^\/(assets\/[\w.-]+\.(jpg|jpeg|png|webp|svg)|uploads\/[a-f0-9]{32}\.(jpg|png|webp))$/.test(s||'')?s.slice(1):'assets/lab-banner.jpg';
const clone=structuredClone,originals={...pages},templates={},specs={},defaults={};
let memberPageSize=4;
const para=(text='',size=16,bold=false)=>[{text,size,bold}];
function paragraphsFrom(node){
 const items=[...node.querySelectorAll('h2,h3,p,li,dd,small')].filter(e=>!e.closest('svg')&&!e.parentElement.closest('h2,h3,p,li,dd,small'));
 return (items.length?items:[node]).map(e=>{const copy=e.cloneNode(true);copy.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));return para(copy.textContent||'',/^H/.test(e.tagName)?24:15,/^H/.test(e.tagName));}).filter(p=>p[0].text.trim());
}
function buildTemplate(key){
 const holder=document.createElement('div');holder.innerHTML=originals[key]();specs[key]={};defaults[key]={version:2,regions:{}};
 function slot(node,id,label,width=1160,minHeight=70,initial){
  if(!node)return;
  specs[key][id]={label:'박스 '+String(Object.keys(specs[key]).length+1).padStart(2,'0'),width,minHeight};
  defaults[key].regions[id]=initial||{paragraphs:paragraphsFrom(node),images:[],height:minHeight,textTop:0};
  const el=document.createElement('div');el.className='fixed-slot';el.dataset.slot=id;node.replaceWith(el);return el;
 }
 const picture=(src,width,height)=>({paragraphs:[para('')],images:src?[{id:'image-0',src,x:0,y:0,width:100,ratio:height/width,alt:'목업용 실험실 스톡 사진'}]:[],height:height+38,textTop:src?height+12:0});
 if(key==='about'){
  holder.innerHTML=heading('연구실 소개','Introduction','')+'<div class="page-content"><section class="about-top"><div id="about-photo"></div><div><h2>식품생화학 및 분자영양학 연구실</h2><p class="lab-english-name">Food Biochemistry &amp; Molecular Nutrition Lab.</p><div id="about-intro"></div></div></section><div id="about-body"></div></div>';
  slot(holder.querySelector('#about-photo'),'photo','사진 칸',320,240,picture('/assets/food-apple-soft.jpg',320,240));defaults[key].regions.photo.images[0].alt='밝은 배경의 연한 청사과';
  slot(holder.querySelector('#about-intro'),'intro','오른쪽 텍스트 칸',802,75,{paragraphs:[para('경북대학교 농업생명과학대학 식품공학부',15),para('지도교수 강현주',15)],images:[],height:75,textTop:0});
  slot(holder.querySelector('#about-body'),'body','하단 본문',1160,100,{paragraphs:[para('연구실 소개를 작성할 공간입니다. 로그인 후 소개 글과 사진을 자유롭게 추가할 수 있습니다.')],images:[],height:100,textTop:0});
 }else if(key==='home'){
  const banner=holder.querySelector('.reference-banner');banner.insertAdjacentHTML('afterbegin','<div class="banner-photo"></div>');
  const p=picture('/assets/lab-banner.jpg',1160,400);p.height=400;p.textTop=0;
  slot(banner.querySelector('.banner-photo'),'banner','메인 사진 칸',1160,400,p).classList.add('banner-slot');
  slot(holder.querySelector('.ref-about>p'),'intro','홈 소개 글',1160,80);
  holder.insertAdjacentHTML('beforeend','<div class="page-content home-extra"><div id="home-body"></div></div>');slot(holder.querySelector('#home-body'),'body','추가 본문',1160,60,{paragraphs:[para('')],images:[],height:60,textTop:0});
 }else if(['professor','students','people'].includes(key)){
  const prof=holder.querySelector('.professor');if(prof){slot(prof.querySelector('.portrait'),'photo','교수 사진 칸',200,250,picture(null,200,250));const bio=prof.querySelector(':scope>div:not(.fixed-slot)');slot(bio,'bio','교수 소개 글',920,280);}
  holder.querySelectorAll('.member').forEach((m,i)=>{slot(m.querySelector('.portrait'),'photo'+i,`구성원 ${i+1} 사진 칸`,150,195,picture(null,150,195));const bio=document.createElement('div');[...m.children].filter(e=>!e.matches('.fixed-slot')).forEach(e=>bio.append(e));m.append(bio);slot(bio,'bio'+i,`구성원 ${i+1} 소개 글`,960,170);});
 }else if(key==='contact'){
  holder.querySelector('.page-intro h1').textContent='찾아오시는 길';holder.querySelector('.page-intro .eyebrow').textContent='CONTACT US';slot(holder.querySelector('.contact-grid>div:first-child'),'address','연락처 및 주소',1160,170);
  const panel=holder.querySelector('.map-panel');panel.className='location-panel';panel.innerHTML=`<div class="live-map"><iframe title="경북대학교 농대 3호관 위치 지도" src="${LAB_MAP.embed}" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;

 }else if(key==='research'){
  holder.querySelectorAll('.research-detail>div').forEach((n,i)=>slot(n,'research'+i,`연구분야 ${i+1}`,1080,160));
 }else if(key==='projects'){
  holder.innerHTML=heading('연구과제','Project','')+'<div class="page-content project-list">'+[0,1,2].map(i=>`<article class="framed-research"><h2 data-region-title="project${i}"></h2><div id="project-${i}"></div></article>`).join('')+'</div>';
  for(let i=0;i<3;i++)slot(holder.querySelector('#project-'+i),'project'+i,'연구과제',1160,120);
 }else if(key==='publications'){
  const list=holder.querySelector('#pubList');
  list.innerHTML=pubs.map((p,i)=>`<article class="publication"><span class="year">${p.year}</span><div id="paper-${i}"><h3>${esc(p.title)}</h3><p>저자 목록 입력 예정 · 학술지명, 권(호), 페이지 입력 예정</p><p>${esc(p.topic)}</p></div></article>`).join('');
  pubs.forEach((p,i)=>slot(holder.querySelector('#paper-'+i),'paper'+i,`논문 ${i+1}`,1085,120));
 }else if(key==='news'){
  holder.querySelectorAll('.news-detail').forEach((n,i)=>slot(n.querySelector('p'),'news'+i,`공지 ${i+1} 본문`,1160,100));
 }else if(key==='gallery'){
  holder.querySelectorAll('.gallery-photo').forEach((n,i)=>slot(n,'gallery'+i,`갤러리 ${i+1}`,370,260,picture(null,370,240)));
  holder.querySelectorAll('.gallery-placeholders>div>p').forEach(p=>p.remove());
  holder.querySelector('.page-content').insertAdjacentHTML('afterbegin','<p class="note">목업용 스톡 사진으로 구성한 갤러리입니다. 실제 연구실·구성원 사진으로 교체할 수 있습니다.</p>');
 }else if(key==='sites'){holder.querySelector('.page-content').insertAdjacentHTML('beforeend','<div id="sites-body"></div>');slot(holder.querySelector('#sites-body'),'body','추가 안내',1160,80,{paragraphs:[para('')],images:[],height:80,textTop:0});
 }else{slot(holder.querySelector('.page-content>div,.page-content>ul')||holder.querySelector('.page-content')?.firstElementChild,'body','본문',1160,140);}
 holder.querySelectorAll('.note,.source-inline,.mock-tag').forEach(n=>n.remove());
 const seed=key==='people'?{...LAB_MOCKUP.professor,...LAB_MOCKUP.students}:LAB_MOCKUP[key];
 for(const [id,lines]of Object.entries(seed||{})){if(defaults[key].regions[id])defaults[key].regions[id].paragraphs=lines.map(line=>Array.isArray(line)?para(...line):para(line,['professor','about'].includes(key)?18:15));}
 if(['professor','students','people'].includes(key)){for(const [id,r]of Object.entries(defaults[key].regions)){if(id.startsWith('photo')){r.paragraphs=[para('')];r.images=[{id:'image-0',src:'/assets/profile-placeholder.svg',x:0,y:0,width:100,ratio:1.3,alt:'프로필 픽토그램'}];r.textTop=0;r.height=id==='photo'?260:195;}}}
 if(key==='research'){holder.querySelectorAll('.research-detail').forEach((n,i)=>{n.querySelector('.num')?.remove();n.classList.add('framed-research');const r=defaults[key].regions['research'+i],title=r.paragraphs.shift()[0].text;r.title=title;n.insertAdjacentHTML('afterbegin',`<h2 data-region-title="research${i}">${esc(title)}</h2>`);});}
 if(key==='projects'){for(let i=0;i<3;i++){const r=defaults[key].regions['project'+i];r.title=r.paragraphs.shift()[0].text;holder.querySelector(`[data-region-title="project${i}"]`).textContent=r.title;}}
 if(key==='gallery'){Object.values(defaults[key].regions).forEach((r,i)=>{r.images=[{id:'image-0',src:i===1?'/assets/lab-sidebar.jpg':'/assets/lab-banner.jpg',x:0,y:0,width:100,ratio:.65,alt:'목업용 스톡 사진 · 실제 연구실 사진 아님'}];r.textTop=255;r.height=335;});}
 if(key==='home'){
  const main=holder.querySelector('.reference-main'),about=holder.querySelector('.ref-about'),bottom=holder.querySelector('.ref-bottom');
  const banner=holder.querySelector('.reference-banner');banner.append(about);bottom.remove();const title=document.createElement('div');title.className='hero-title';const ko=banner.querySelector('h1'),en=banner.querySelector(':scope>p');ko.innerHTML='Welcome to the Food Biochemistry<br>&amp; Molecular Nutrition Lab.';en.remove();title.append(ko);banner.append(title);
  main.classList.add('home-panel');
  holder.querySelector('.reference-banner').insertAdjacentHTML('beforeend','<span class="home-scroll-hint" aria-hidden="true">SCROLL DOWN <span>↓</span></span>');
 }
 if(key==='resources'){holder.querySelector('.page-content').insertAdjacentHTML('beforeend','<div class="resource-downloads"><a href="assets/lab-introduction-sample.txt" download>연구실 소개 문안 · TXT ↓</a><a href="assets/publication-entry-sample.txt" download>논문 실적 작성 양식 · TXT ↓</a></div>');}
 if(key==='news'){const summaries=holder.querySelectorAll('.news-detail summary');if(summaries[1])summaries[1].innerHTML='<span class="tag mock-tag">목업 안내</span> &nbsp; 연구실 홈페이지 시안 안내';}
 if(key==='sites'){holder.querySelector('.related-links').insertAdjacentHTML('beforeend','<li><a href="https://foodbio.knu.ac.kr/" target="_blank" rel="noopener">경북대학교 식품공학부 ↗</a></li><li><a href="https://cals.knu.ac.kr/" target="_blank" rel="noopener">경북대학교 농업생명과학대학 ↗</a></li><li><a href="https://kudos.knu.ac.kr/" target="_blank" rel="noopener">경북대학교 도서관 ↗</a></li>');}
 templates[key]=holder.innerHTML;
}
Object.keys(pages).forEach(buildTemplate);
defaults.students.memberOrder=['0','1','2'];
defaults.alumni={version:2,memberOrder:['0'],regions:{photo0:clone(defaults.students.regions.photo0),bio0:{paragraphs:[para('졸업생 01',20,true),para('Alumni',15),para('학위 및 졸업연도',15),para('소속 및 진로',15)],images:[],height:170,textTop:0}}};
let postContext=null;
let store=window.LAB_STATIC.content;
function currentValue(key){
 const base=clone(defaults[key]),old=store.pages[key];if(!old)return base;
 if(old.version===2&&['students','alumni'].includes(key)&&Array.isArray(old.memberOrder))return clone(old);
 if(old.version===2&&key==='alumni'&&old.regions.body){base.regions.bio0=clone(old.regions.body);return base;}
 if(old.version===2){for(const id of Object.keys(base.regions))if(old.regions[id])base.regions[id]={...base.regions[id],...clone(old.regions[id])};if(key==='projects'){for(const [id,r]of Object.entries(base.regions)){const prior=old.regions[id];if(prior&&!('title' in prior)&&r.paragraphs[0]?.length&&r.paragraphs[0].every(run=>run.bold&&run.size>=20)){r.title=r.paragraphs.shift().map(run=>run.text).join('');}}}if(key==='contact')base.regions.address.paragraphs=base.regions.address.paragraphs.filter(p=>!p.some(r=>/확인|기재|방문 안내/.test(r.text)));return base;}
 // Keep content saved by the previous editor when opening it in the new fixed frames.
 if(old.intro){const text=base.regions.intro;if(text)text.paragraphs=old.intro.text.split('\n').map(t=>para(t,15));const photo=base.regions.photo||base.regions.banner;if(photo?.images[0])photo.images[0].src=old.intro.image;}
 const target=base.regions.body||base.regions.address||Object.values(base.regions).find(r=>r.images.length===0);
 if(target&&old.blocks?.length){target.paragraphs=old.blocks.filter(b=>b.type!=='image').map(b=>para(b.text,b.type==='heading'?24:16,b.type==='heading'));for(const b of old.blocks.filter(b=>b.type==='image')){target.images.push({id:'legacy-'+target.images.length,src:b.src,x:0,y:target.height,width:70,ratio:.7,alt:b.caption||''});target.height+=600;}}
 return base;
}
function textHTML(paragraphs,normalizeBody=true){return (paragraphs.length?paragraphs:[para('')]).map(p=>`<p>${p.length?p.map(r=>`<span${normalizeBody&&r.size<=18?' data-body-copy':''} style="font-size:${normalizeBody&&r.size<=18?18:r.size}px;font-weight:${r.bold?700:400}">${esc(r.text).replace(/\n/g,'<br>')||'<br>'}</span>`).join(''):'<br>'}</p>`).join('');}
function imageHTML(im,i){return `<div class="slot-image" data-image="${i}" style="left:${im.x}%;top:${im.y}px;width:${im.width}%;aspect-ratio:${1/im.ratio}" tabindex="0" role="img" aria-label="${esc(im.alt||'첨부 사진')}"><img src="${esc(imgURL(im.src))}" alt="${esc(im.alt||'첨부 사진')}" draggable="false"><button class="resize-image" aria-label="사진 크기 조절" tabindex="-1"></button></div>`;}
function regionHTML(key,id,r,edit){const s=specs[key][id];return `<div class="slot-frame" data-region="${id}" data-width="${s.width}" style="--slot-height:${r.height}px"><div class="slot-stage" style="width:${s.width}px;min-height:${r.height}px"><div class="slot-text" style="padding-top:${r.textTop}px"  aria-label="${esc(s.label)} 글">${textHTML(r.paragraphs,key!=='home')}</div><div class="slot-images">${r.images.map(imageHTML).join('')}</div></div></div>`;}
function studentSpecs(key,id,index){
 specs[key]['photo'+id]={label:'박스 '+(index*2+1),width:150,minHeight:195};
 specs[key]['bio'+id]={label:'박스 '+(index*2+2),width:960,minHeight:170};
}
function studentsHTML(page,value){
 const order=value.memberOrder||defaults[page].memberOrder;
 const rows=order.map(id=>{
  const photo=value.regions['photo'+id],bio=value.regions['bio'+id],image=photo?.images?.[0];
  return '<article class="roster-row" data-member-id="'+id+'"><div class="roster-photo">'+(image?'<img src="'+esc(imgURL(image.src))+'" alt="'+esc(image.alt||'구성원 사진')+'">':'')+'</div><div class="roster-bio">'+(bio?.profile?'<h3 class="member-summary"><span class="member-name">'+esc(bio.profile.name)+'</span><small class="member-role">'+esc(bio.profile.role)+'</small></h3>'+(page==='students'&&bio.profile.email?'<div class="member-email"><span aria-hidden="true">✉</span><span class="member-email-address">'+esc(bio.profile.email)+'</span></div>':''):textHTML(bio?.paragraphs||[]).replaceAll(/font-size:(\d+)px/g,'--run-size:$1px'))+(bio?.images||[]).map(im=>'<img class="roster-extra" src="'+esc(imgURL(im.src))+'" alt="'+esc(im.alt||'')+'">').join('')+'</div></article>';
 });
 const sheets=Array.from({length:Math.ceil(rows.length/memberPageSize)},(_,i)=>'<section class="student-sheet'+(i===0?' first-sheet':'')+'" aria-label="'+(i+1)+'번째 구성원 목록">'+rows.slice(i*memberPageSize,i*memberPageSize+memberPageSize).join('')+'</section>').join('');
 return heading(page==='alumni'?'졸업생':'학생',page==='alumni'?'Alumni':'Student','')+'<div class="page-content roster-content">'+(sheets||'<p class="empty-members">등록된 구성원이 없습니다.</p>')+'</div>';
}
function pageHTML(key,value,edit=false){if(['students','alumni'].includes(key))return studentsHTML(key,value,edit);const h=document.createElement('div');h.innerHTML=templates[key];h.querySelectorAll('[data-region-title]').forEach(n=>{const id=n.dataset.regionTitle,title=value.regions[id].title??'';if(edit)n.innerHTML=`<input class="region-title-input" data-title-region="${id}" aria-label="${key==='projects'?'연구과제':'연구 분야'} ${Number(id.replace(/^(research|project)/,''))+1} 제목" maxlength="300" value="${esc(title)}">`;else n.textContent=title;});h.querySelectorAll('[data-slot]').forEach(n=>{const id=n.dataset.slot;n.innerHTML=(edit?`<div class="slot-label">${esc(specs[key][id].label)}</div>`:'')+regionHTML(key,id,value.regions[id],edit);});if(key==='about'){const image=value.regions.photo.images[0];h.querySelector('[data-slot="photo"]').innerHTML=image?'<img class="intro-photo" src="'+esc(imgURL(image.src))+'" alt="밝은 배경의 청사과">':'';h.querySelector('[data-slot="intro"]').innerHTML='<div class="intro-copy">'+textHTML(value.regions.intro.paragraphs)+'</div>';}if(key==='contact'){h.querySelector('[data-slot="address"]').innerHTML='<div class="contact-details">'+textHTML(value.regions.address.paragraphs)+'</div>';}return h.innerHTML;}
for(const key of Object.keys(pages))pages[key]=()=> (key==='home'?'':'<div class="sub-visual" aria-hidden="true"></div>')+pageHTML(key,currentValue(key));
for(const key of ['patents','books','news','gallery','sites'])delete pages[key];
renderPubs=()=>{const list=document.querySelector('#content #pubList');if(!list)return;const value=currentValue('publications'),query=(document.querySelector('#content #pubSearch')?.value||'').trim().toLowerCase();list.innerHTML=pubs.map((p,i)=>({p,i,r:value.regions['paper'+i]})).filter(({p,r})=>(currentYear==='all'||p.year===currentYear)&&r.paragraphs.flat().map(t=>t.text).join(' ').toLowerCase().includes(query)).map(({p,i,r})=>`<article class="publication"><span class="year">${p.year}</span><div class="fixed-slot">${regionHTML('publications','paper'+i,r,false)}</div></article>`).join('')||'<p class="empty">일치하는 논문이 없습니다.</p>';fitSlots(list);};
const oldRender=render;render=()=>{oldRender();fitSlots(document.querySelector('#content'));observeTextSizes();if(document.querySelector('#edit-page'))document.querySelector('#edit-page').hidden=['publications','resources'].includes(location.hash.slice(1));};
function fitSlots(root){
 if(!root)return;
 root.querySelectorAll('.slot-frame').forEach(frame=>{
  const stage=frame.querySelector('.slot-stage'),width=Number(frame.dataset.width),scale=frame.clientWidth/width;if(!scale)return;
  stage.style.transform=`scale(${scale})`;stage.style.minHeight='0px';
  const pageKey=frame.closest('.panel-live')?.dataset.page||document.body.dataset.page;
  const id=frame.dataset.region,compactStudent=(['students','alumni'].includes(pageKey)&&frame.closest('.student-sheet')||pageKey==='contact'&&id==='address'||['research','projects'].includes(pageKey)&&frame.closest('.framed-research')),min=compactStudent?0:parseFloat(frame.style.getPropertyValue('--slot-height'));
  const text=stage.querySelector('.slot-text');let height=Math.max(min,text.offsetTop+text.offsetHeight,text.offsetTop+text.scrollHeight);
  text.querySelectorAll('p,div,li').forEach(p=>{const margin=parseFloat(getComputedStyle(p).marginBottom)||0;height=Math.max(height,text.offsetTop+p.offsetTop+Math.max(p.offsetHeight,p.scrollHeight)+margin);});
  stage.querySelectorAll('.slot-image').forEach(im=>{height=Math.max(height,im.offsetTop+im.offsetHeight+8);});
  height=Math.ceil(height)+16;stage.style.height=height+'px';frame.style.height=Math.ceil(height*scale)+2+'px';

 });
 
}

const sizeObserver=new ResizeObserver(()=>fitSlots(document.querySelector('#content')));sizeObserver.observe(document.querySelector('.workspace'));
function observeTextSizes(){sizeObserver.disconnect();sizeObserver.observe(document.querySelector('.workspace'));document.querySelectorAll('#content .slot-text').forEach(n=>sizeObserver.observe(n));}
document.fonts?.ready.then(()=>fitSlots(document.querySelector('#content')));
window.LabCMS={renderContent:c=>regionHTML('resources','body',c.regions.body,false),fit:fitSlots,setMemberPageSize:n=>{if(![3,4].includes(n)||memberPageSize===n)return;memberPageSize=n;document.documentElement.style.setProperty('--member-page-size',String(n));if(['students','alumni'].includes(location.hash.slice(1)))render();}};
render();
})();
