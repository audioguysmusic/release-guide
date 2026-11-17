const navs=[['home','시작하기','house'],['distribution','음원 유통 안내','file-text'],['artist','아티스트 페이지','user-circle'],['artwork','아트워크','image'],['ai','AI 활용 음원','sparkle'],['credits','크레딧','users'],['genres','장르 찾기','music-notes'],['settlement','정산 안내','wallet'],['glossary','용어 안내','book-open']];
const pages={distribution:DATA[0],artist:DATA[1],artwork:DATA[2],ai:DATA[3],credits:DATA[4],glossary:DATA[7],genres:{items:[]}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=document.querySelector('#main'), nav=document.querySelector('#nav'), sidebar=document.querySelector('#sidebar');
let creditType='Roles';
function navRender(id){nav.innerHTML=navs.map(([key,label,ico])=>`<a href="#${key}" class="${id===key?'active':''}"><span class="ico"><i class="ph ph-${ico}"></i></span>${label}</a>`).join('')}
function linkText(s){return esc(s).replace(/(https?:\/\/[^\s<]+)/g,'<a class="inline" href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/ip@audioguyrecords\.com/g,'<a class="inline" href="mailto:ip@audioguyrecords.com">ip@audioguyrecords.com</a>')}
function renderItem(item){if(item.type==='h')return `<h${item.level}>${esc(item.text)}</h${item.level}>`; if(item.type==='table')return '<table><tbody>'+item.rows.map(row=>'<tr>'+row.map(c=>'<td>'+linkText(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';return `<p>${linkText(item.text)}</p>`}
const descriptions={distribution:'제출 자료 · 발매 일정 · Dolby Atmos',artist:'Spotify · Apple Music 클레임',artwork:'커버 이미지 · 제작 의뢰 · 모션아트',ai:'AI 활용 고지 · 선언서 · 권리 확인',credits:'역할과 악기 한글·영문 검색',genres:'발매 장르 한글·영문 검색',settlement:'정산 문의 · 계약 및 제출 서류',glossary:'발매에 필요한 주요 용어'};
const home=`<section class="hero"><div class="eyebrow">AUDIOGUY / ARTIST GUIDE</div><h1 tabindex="-1">음악이 세상에 닿기까지,<br>함께 준비해요.</h1></section><div class="section-title"><h2>어떤 도움이 필요하신가요?</h2><span>01 — 08</span></div><div class="topic-grid">${navs.slice(1).map(([id,title,icon],i)=>`<a class="topic-link" href="#${id}"><span class="topic-no">0${i+1}</span><i class="ph ph-${icon}" aria-hidden="true"></i><span><b>${title}</b></span><i class="ph ph-arrow-right" aria-hidden="true"></i></a>`).join('')}</div><div class="release-note" hidden><span class="eyebrow">BEFORE YOU START</span><h2>희망 발매일 5주 전, 자료를 전달해 주세요.</h2><p>담당자가 메일로 보내드린 신청 양식과 파일을 제출하면 검토 후 진행합니다.</p><a href="#distribution">발매 준비 확인하기 <i class="ph ph-arrow-right"></i></a></div><footer class="home-footer"><span>© AUDIOGUY</span><a href="https://audioguy2026.vercel.app/" target="_blank" rel="noopener">공식 웹사이트</a><a href="https://www.youtube.com/@SOUND_360" target="_blank" rel="noopener">YouTube</a><a href="https://www.instagram.com/sound360.distribution/" target="_blank" rel="noopener">Instagram</a><a href="mailto:ip@audioguyrecords.com">이메일 문의</a></footer>`;
function getItems(id){let arr=pages[id]?.items||[];if(id==='distribution')arr=arr.filter(x=>!x.text?.includes('약 4주'));if(id==='artist')arr=arr.map(x=>x.text?.startsWith('UCI (')?{...x,text:'아티스트 식별 정보 — 필요한 경우 담당자가 별도로 안내합니다.'}:x);if(id==='settlement'){let all=DATA[0].items, start=all.findIndex(x=>x.text==='정산 안내 및 제출 서류'),end=all.findIndex(x=>x.text==='공간음향 제작 및 프로모션 지원');return [{type:'h',level:2,text:'정산 기준 및 제출 서류'},...all.slice(start+1,end)]}return arr}
function renderSections(items){let html='',open=false;for(const item of items){if(item.type==='h'&&item.level===2){if(open)html+='</div></details>';html+=`<details class="guide-accordion"><summary><span>${esc(item.text)}</span><i class="ph ph-plus" aria-hidden="true"></i></summary><div class="accordion-body">`;open=true}else html+=renderItem(item)}return html+(open?'</div></details>':'')}
let disposeAccordions=()=>{};
function setupAccordions(){
 disposeAccordions();
 const els=[...main.querySelectorAll('.guide-accordion')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let auto=true, timer, busy=false;
 if(!els.length)return;
 els[0].open=true;
 const bar=document.createElement('div');bar.className='reading-controls';
 bar.innerHTML=`<label><input type="checkbox" id="autoRead" checked> 스크롤에 따라 펼치기</label><button type="button" id="expandAll">모두 펼치기</button>`;
 els[0].before(bar);
 bar.querySelector('input').onchange=e=>{auto=e.target.checked;if(auto)els.forEach(x=>delete x.dataset.manual)};
 bar.querySelector('button').onclick=()=>{const expand=els.some(x=>!x.open);auto=false;bar.querySelector('input').checked=false;els.forEach(x=>{x.open=expand;x.dataset.manual='true'});bar.querySelector('button').textContent=expand?'모두 접기':'모두 펼치기'};
 els.forEach(el=>el.querySelector('summary').addEventListener('click',()=>{el.dataset.manual='true'}));
 function update(){
  if(!auto||busy)return;
  const line=innerHeight*.45;
  const candidate=els.find(el=>{const r=el.getBoundingClientRect();return r.top>=76&&r.top<line&&!el.open&&el.dataset.manual!=='true'});
  if(!candidate)return;
  busy=true;
  const before=candidate.getBoundingClientRect().top;
  els.forEach(el=>{if(el!==candidate&&el.open&&el.dataset.manual!=='true'&&!el.contains(document.activeElement)&&el.getBoundingClientRect().bottom<80)el.open=false});
  candidate.open=true;
  window.scrollBy(0,candidate.getBoundingClientRect().top-before);
  if(!reduced)candidate.querySelector('.accordion-body').animate([{opacity:0},{opacity:1}],{duration:180});
  setTimeout(()=>busy=false,180);
 }
 const onScroll=()=>{clearTimeout(timer);timer=setTimeout(update,120)};
 window.addEventListener('scroll',onScroll,{passive:true});
 disposeAccordions=()=>{clearTimeout(timer);window.removeEventListener('scroll',onScroll)};
}
function render(){disposeAccordions();let id=location.hash.slice(1)||'home';if(!navs.some(n=>n[0]===id))id='home';navRender(id);sidebar.classList.remove('open');document.body.classList.toggle('is-home',id==='home');if(id==='home'){main.innerHTML=home;window.scrollTo(0,0);main.querySelector('h1').focus({preventScroll:true});return}let title=navs.find(n=>n[0]===id)[1];let items=getItems(id);let extra=id==='genres'?`<h2>장르 검색</h2><p>영문 장르명이나 한글 키워드로 검색해 주세요.</p><input class="credit-search" id="creditSearch" placeholder="장르를 검색해 보세요" aria-label="장르 검색"><div class="credit-list" id="creditList"></div>`:id==='credits'?`<h2>역할과 악기 찾아보기</h2><p>발매 크레딧에 사용할 역할 또는 악기를 검색해 주세요. 항목을 누르면 영문명이 복사됩니다.</p><div class="credit-controls"><button data-kind="Roles" class="active">역할 Roles</button><button data-kind="Instrument">악기 Instrument</button></div><input class="credit-search" id="creditSearch" placeholder="역할명 또는 한글 키워드를 검색해 보세요" aria-label="크레딧 검색"><div class="hint">원문에 제공된 항목 목록입니다. 최종 등록 가능 여부는 담당자에게 확인해 주세요.</div><div class="credit-list" id="creditList"></div>`:'';main.innerHTML=`<a href="#home" class="back-link"><i class="ph ph-arrow-left"></i> 처음으로</a><div class="breadcrumb">가이드 <span>/</span> ${esc(title)}</div><article class="article"><div class="eyebrow">AUDIOGUYS MUSIC GUIDE</div><h1 tabindex="-1">${esc(title)}</h1><div class="lead">발매 준비를 위해 필요한 내용을 확인해 주세요.</div>${extra}${renderSections(items)}<div class="article-end"><b>궁금한 점이 있으신가요?</b><br>오디오가이 뮤직IP팀이 함께하겠습니다. <a href="mailto:ip@audioguyrecords.com">이메일 문의</a></div></article>`;if(id==='genres'){document.querySelector('#creditSearch').oninput=()=>renderCredits(true);renderCredits(true)}if(id==='credits'){creditType='Roles';document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{creditType=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));renderCredits()});document.querySelector('#creditSearch').oninput=()=>renderCredits(false);renderCredits()}window.scrollTo(0,0);setupAccordions();main.querySelector('h1').focus({preventScroll:true})}
function renderCredits(isGenre=false){let source=isGenre?GENRES:CONTRIBUTORS.filter(x=>x.type===(creditType==='Roles'?'role':'instrument'));let q=document.querySelector('#creditSearch').value.trim().normalize('NFC').toLowerCase();let filtered=source.filter(x=>String(x.active).toUpperCase()==='TRUE'&&[x.display_name,x.search_keywords_ko,x.search_keywords_en||''].some(t=>String(t||'').normalize('NFC').toLowerCase().includes(q))).sort((a,b)=>Number(a.sort_order)-Number(b.sort_order));let target=document.querySelector('#creditList');target.innerHTML=filtered.map(x=>`<button class="credit-item" data-copy="${esc(x.display_name)}">${esc(x.display_name)}</button>`).join('')||'<p>검색 결과가 없습니다.</p>';target.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);let t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent='복사했습니다';document.body.append(t);setTimeout(()=>t.remove(),1800)}catch{alert('복사할 수 없습니다. 항목을 직접 선택해 주세요.')}})}
const dialog=document.querySelector('#searchDialog'),input=document.querySelector('#searchInput'),results=document.querySelector('#searchResults');function search(){let q=input.value.trim().toLowerCase();if(!q){results.innerHTML='<div class="hint">검색어를 입력해 주세요.</div>';return}let found=[];for(const [id,label] of navs){if(id==='home')continue;for(const item of getItems(id)){let text=item.type==='table'?item.rows.flat().join(' '):item.text||'';if(text.toLowerCase().includes(q)){found.push({id,label,text:text.slice(0,130)});if(found.length>=30)break}}}results.innerHTML=found.map(x=>`<a href="#${x.id}"><b>${esc(x.label)}</b><small>${esc(x.text)}</small></a>`).join('')||'<p class="hint">검색 결과가 없습니다.</p>';results.querySelectorAll('a').forEach(a=>a.onclick=()=>dialog.close())}document.querySelector('#searchButton').onclick=()=>{dialog.showModal();input.focus();search()};document.querySelector('#closeSearch').onclick=()=>dialog.close();input.oninput=search;document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!dialog.open){dialog.showModal();input.focus();search()}}});document.querySelector('#menuButton').onclick=()=>{let open=sidebar.classList.toggle('open');document.querySelector('#menuButton').setAttribute('aria-expanded',open)};document.addEventListener('keydown',e=>{if(e.key==='Escape')sidebar.classList.remove('open')});document.addEventListener('click',e=>{if(!sidebar.contains(e.target)&&!e.target.closest('#menuButton'))sidebar.classList.remove('open')});let previousId=location.hash.slice(1)||'home';
window.addEventListener('hashchange',()=>{
 const nextId=location.hash.slice(1)||'home';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const start=document.querySelector(`.topic-link[href="#${nextId}"]`);
 const endId=previousId;
 if(!reduced && document.startViewTransition){
   if(start) start.style.viewTransitionName='selected-topic';
   if(nextId==='home') main.style.viewTransitionName='selected-topic';
   const transition=document.startViewTransition(()=>{render(); if(nextId==='home'){main.style.viewTransitionName='';const target=document.querySelector(`.topic-link[href="#${endId}"]`);if(target)target.style.viewTransitionName='selected-topic'}else{main.style.viewTransitionName='selected-topic'}});
   transition.finished.finally(()=>{main.style.viewTransitionName='';document.querySelectorAll('.topic-link').forEach(x=>x.style.viewTransitionName='')});
 }else render();
 previousId=nextId;
});render();
