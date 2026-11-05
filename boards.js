(()=>{
'use strict';
const cms=window.LabCMS,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const boards={publications:{title:'저널',en:'Journal'},resources:{title:'자료실',en:'Data room'}};
let state={revision:0,posts:[]},active='',query='',selected=null,requestId=0;
const actions=()=>'';
let galleryPage=0,galleryColumns=2,galleryRows=2;
function journalFigure(post,detail=false){const f=post.figure;if(!f)return '<div class="journal-no-figure" aria-hidden="true"><svg viewBox="0 0 64 80"><path d="M10 2h29l15 15v61H10zM39 2v16h15M20 34h24M20 44h24M20 54h17" fill="none" stroke="currentColor" stroke-width="2"/></svg></div>';return '<figure class="'+(detail?'journal-detail-figure':'journal-figure')+'"><img src="'+esc(f.image)+'" alt="'+esc(f.label+' · '+post.title)+'" loading="lazy">'+(detail?'<figcaption>'+esc(f.credit)+' · <a href="'+esc(f.source)+'" target="_blank" rel="noopener">논문 원문 ↗</a></figcaption>':'')+'</figure>';}
function journalHTML(filtered){
 const count=galleryColumns*galleryRows,total=Math.max(1,Math.ceil(filtered.length/count));galleryPage=Math.min(galleryPage,total-1);
 const ordered=[...filtered].sort((a,b)=>Number(b.publication?.year||0)-Number(a.publication?.year||0));
 const cards=ordered.slice(galleryPage*count,(galleryPage+1)*count).map(p=>'<button class="journal-card" data-post-id="'+esc(p.id)+'">'+journalFigure(p)+'<h2>'+esc(p.title)+' ('+esc(p.publication?.year||'')+')</h2><div class="journal-meta">'+esc(p.publication?p.publication.journal+' · '+p.publication.year:formatDate(p.createdAt))+'</div></button>').join('');
 return '<div class="journal-gallery" style="--journal-columns:'+galleryColumns+';--journal-rows:'+galleryRows+'"><div class="journal-grid">'+(cards||'<p class="board-empty">일치하는 논문이 없습니다.</p>')+'</div><div class="journal-pagination"><button data-journal-page="'+(galleryPage-1)+'" '+(galleryPage===0?'disabled':'')+' aria-label="이전 논문 목록">←</button><span>'+(galleryPage+1)+' / '+total+'</span><button data-journal-page="'+(galleryPage+1)+'" '+(galleryPage===total-1?'disabled':'')+' aria-label="다음 논문 목록">→</button></div></div>';
}
window.LabJournal={resize(data){const scale=1/(data.rosterScale||1),width=document.querySelector('.workspace').clientWidth*scale,height=data.screenHeight*scale,cols=width>=1000?3:2,rows=height<580?1:2;if(cols===galleryColumns&&rows===galleryRows)return;galleryColumns=cols;galleryRows=rows;galleryPage=0;if(active==='publications'&&!selected)draw();}};
for(const [key,info]of Object.entries(boards))pages[key]=()=>'<div class="sub-visual" aria-hidden="true"></div>'+heading(info.title,info.en,'')+'<div class="page-content"><div id="board-mount" aria-live="polite">불러오는 중…</div></div>';
function formatDate(v){return v.slice(0,10).replaceAll('-','.');}
function draw(){
 const mount=document.querySelector('#board-mount');if(!mount)return;
 const info=boards[active];
 if(selected){
  const post=state.posts.find(p=>p.id===selected);if(!post){selected=null;return draw();}
  if(active==='publications'){const paragraphs=post.content.regions.body.paragraphs.map(p=>p.map(r=>r.text).join(''));const author=paragraphs[0]||'',journal=paragraphs[1]||post.publication?.journal||'',doi=post.publication?.doi||'',source=doi?'https://doi.org/'+doi:(post.publication?.source||post.figure?.source||'#');const reference=[author,post.title,journal,doi? 'https://doi.org/'+doi:''].filter(Boolean).join(' ');mount.innerHTML=`<article class="post-detail journal-detail"><h2>${esc(post.title)} (${esc(post.publication?.year||'')})</h2><div class="post-body">${post.figure?journalFigure(post,true):''}<p class="journal-reference"><a href="${esc(source)}" target="_blank" rel="noopener">${esc(reference)}</a></p></div><div class="board-bottom"><button data-board-action="list">목록</button></div></article>`;return;}
  mount.innerHTML=`<article class="post-detail"><h2>${esc(post.title)}</h2><div class="post-meta"><span>${esc(post.publication?.journal||'관리자')}</span><time>${esc(post.publication?.year||formatDate(post.createdAt))}</time></div><div class="post-body">${active==='publications'?journalFigure(post,true):''}${cms.renderContent(post.content)}${post.publication?.source&&!post.figure?`<p><a href="${esc(post.publication.source)}" target="_blank" rel="noopener">논문 원문 ↗</a></p>`:''}</div>${post.attachments.length?`<div class="post-downloads"><b>첨부파일</b>${post.attachments.map(a=>`<a href="${esc(a.src.replace(/^\//,''))}" download="${esc(a.name)}">${esc(a.name)} ↓</a>`).join('')}</div>`:''}<div class="board-bottom"><button data-board-action="list">목록</button></div></article>`;
  cms.fit(mount);return;
 }
 const filtered=state.posts.filter(p=>(p.title+' '+p.content.regions.body.paragraphs.flat().map(r=>r.text).join(' ')).toLowerCase().includes(query.toLowerCase()));
 if(active==='publications'){mount.innerHTML=journalHTML(filtered);return;}
 mount.innerHTML=`<div class="board-top"><span>전체 <b>${state.posts.length}</b>건</span><form id="board-search"><input aria-label="게시글 검색" placeholder="제목 또는 내용 검색" value="${esc(query)}"><button>검색</button></form></div><table class="board-table"><thead><tr><th>번호</th><th>제목</th><th>작성자</th><th>작성일</th></tr></thead><tbody>${filtered.length?filtered.map((p,i)=>`<tr><td>${filtered.length-i}</td><td><button class="post-link" data-post-id="${esc(p.id)}">${esc(p.title)}${p.attachments.length?'<span class="file-mark" aria-label="첨부파일 있음">▣</span>':''}</button></td><td>관리자</td><td>${formatDate(p.createdAt)}</td></tr>`).join(''):'<tr><td colspan="4" class="board-empty">등록된 글이 없습니다.</td></tr>'}</tbody></table><div class="board-bottom"><span class="board-page">1</span>${actions()}</div>`;
 mount.querySelector('form').onsubmit=e=>{e.preventDefault();query=e.target.querySelector('input').value.trim();draw();};
}
function load(board){state={revision:0,posts:window.LAB_STATIC.posts.posts.filter(p=>p.board===board&&(board!=='publications'||p.publication?.sinceKeimyung))};active=board;galleryPage=0;draw();}
document.addEventListener('click',e=>{if(!e.target.closest('#board-mount'))return;const pager=e.target.closest('[data-journal-page]');if(pager&&!pager.disabled){galleryPage=Math.max(0,Number(pager.dataset.journalPage));draw();return;}const post=e.target.closest('[data-post-id]');if(post){selected=post.dataset.postId;draw();return;}if(e.target.closest('[data-board-action="list"]')){selected=null;draw();}});
const previous=render;render=()=>{previous();const key=location.hash.slice(1);if(boards[key]){query='';selected=null;active=key;load(key);}};
document.querySelector('nav').addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link)return;const key=link.getAttribute('href').slice(1);if(boards[key]&&location.hash==='#'+key){query='';selected=null;draw();}});
// Keep all shortcuts within the reduced menu structure.
const home=pages.home;pages.home=()=>{const holder=document.createElement('div');holder.innerHTML=home();const notices=holder.querySelectorAll('.ref-notice');if(notices[0])notices[0].innerHTML='연구실 소개자료<time>2026.10.28</time>';if(notices[1])notices[1].innerHTML='논문 실적 정리 양식<time>2026.10.28</time>';return holder.innerHTML.replaceAll('href="#news"','href="#resources"').replaceAll('href="#gallery"','href="#resources"').replace('공지사항','자료실').replace('포토갤러리 Photo','연구실 자료').replace('연구실 홈페이지 시안 안내','연구실 소개자료');};
render();
})();

