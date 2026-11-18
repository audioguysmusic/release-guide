const navs=[['home','시작하기','house'],['distribution','음원 유통 안내','file-text'],['artist','아티스트 페이지','user-circle'],['artwork','아트워크','image'],['ai','AI 활용 음원','sparkle'],['credits','크레딧','users'],['genres','장르 찾기','music-notes'],['settlement','정산 안내','wallet'],['glossary','용어 안내','book-open']];
const pages={distribution:DATA[0],artist:DATA[1],artwork:DATA[2],ai:DATA[3],credits:DATA[4],glossary:DATA[7],genres:{items:[]}};
const descriptions={distribution:'제출 자료 · 발매 일정 · Dolby Atmos',artist:'Spotify · Apple Music 클레임',artwork:'커버 이미지 · 제작 의뢰 · 모션아트',ai:'AI 활용 고지 · 선언서 · 권리 확인',credits:'역할과 악기 한글·영문 검색',genres:'발매 장르 한글·영문 검색',settlement:'정산 문의 · 계약 및 제출 서류',glossary:'발매에 필요한 주요 용어'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=document.querySelector('#main'), nav=document.querySelector('#nav'), sidebar=document.querySelector('#sidebar');
let creditType='Roles';

function navRender(id){nav.innerHTML=navs.map(([key,label,ico])=>`<a href="#${key}"${id===key?' class="active" aria-current="page"':''}><i class="ph ph-${ico}" aria-hidden="true"></i>${label}</a>`).join('')}
function linkText(s){return esc(s).replace(/(https?:\/\/[^\s<]+)/g,'<a class="inline" href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/ip@audioguyrecords\.com/g,'<a class="inline" href="mailto:ip@audioguyrecords.com">ip@audioguyrecords.com</a>')}
// "라벨: 내용" gets a bold label; lines after the first become a quiet note under the item
function liText(s){const [first,...rest]=String(s).split('\n');return linkText(first).replace(/^([^:<]{1,24}):\s/,'<b>$1</b> ')+rest.map(r=>`<span class="li-note">${linkText(r)}</span>`).join('')}
const li=i=>typeof i==='string'?`<li>${liText(i)}</li>`:`<li>${liText(i.text)}<ul>${i.items.map(li).join('')}</ul></li>`;
function renderItem(x){
 if(x.type==='h')return `<h${x.level}>${esc(x.text)}</h${x.level}>`;
 if(x.type==='ul'||x.type==='ol')return `<${x.type}${x.style?` class="${x.style}"`:''}>${x.items.map(li).join('')}</${x.type}>`;
 if(x.type==='link')return `<p><a class="text-link" href="${x.href}">${esc(x.text)}<i class="ph ph-arrow-right" aria-hidden="true"></i></a></p>`;
 if(x.type==='table'){
  if(x.rows.length===1&&x.rows[0].length===1)return `<pre class="example">${esc(x.rows[0][0])}</pre>`;
  const [head,...body]=x.rows;
  return `<div class="table-wrap"><table><thead><tr>${head.map(c=>`<th>${linkText(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r=>'<tr>'+r.map(c=>`<td>${linkText(c)}</td>`).join('')+'</tr>').join('')}</tbody></table></div>`;
 }
 return `<p>${linkText(x.text)}</p>`;
}
const itemText=x=>x.type==='table'?x.rows.flat().join(' '):x.items?x.items.map(i=>typeof i==='string'?i:i.text+' '+i.items.join(' ')).join(' '):x.text||'';

function getItems(id){
 if(id==='settlement'){const all=DATA[0].items,start=all.findIndex(x=>x.text==='정산 안내 및 제출 서류'),end=all.findIndex(x=>x.text==='공간음향 제작 및 프로모션 지원');return [{type:'h',level:2,text:'정산 기준 및 제출 서류'},...all.slice(start+1,end)]}
 return pages[id]?.items||[];
}
function renderSections(items){let html='',open=false;for(const x of items){if(x.type==='h'&&x.level===2){if(open)html+='</div></details>';html+=`<details class="guide-accordion"><summary><h2>${esc(x.text)}</h2><i class="ph ph-plus" aria-hidden="true"></i></summary><div class="accordion-body">`;open=true}else html+=renderItem(x)}return html+(open?'</div></details>':'')}
const renderGlossary=items=>'<dl class="glossary">'+items.map(x=>x.type==='h'?`<dt>${esc(x.text)}</dt>`:`<dd>${linkText(x.text)}</dd>`).join('')+'</dl>';

let disposeAccordions=()=>{};
// While the reader scrolls, the next closed section whose title is on screen (above 75% height) opens, one per frame.
// Nothing auto-closes and nothing above the viewport opens, so the page never jumps under the reader.
function setupAccordions(){
 disposeAccordions();
 const els=[...main.querySelectorAll('.guide-accordion')];
 if(!els.length)return;
 els[0].open=true;
 const bar=document.createElement('div');bar.className='reading-controls';
 bar.innerHTML='<button type="button">모두 펼치기</button>';
 els[0].before(bar);
 const btn=bar.querySelector('button');
 const sync=()=>btn.textContent=els.every(x=>x.open)?'모두 접기':'모두 펼치기';
 btn.onclick=()=>{const expand=!els.every(x=>x.open);els.forEach(x=>{x.open=expand;x.dataset.manual='1'});sync()};
 els.forEach(el=>{el.querySelector('summary').addEventListener('click',()=>el.dataset.manual='1');el.addEventListener('toggle',sync)});
 const top=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header'))||64;
 let ticking=false;
 const onScroll=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{ticking=false;const next=els.find(el=>{if(el.open||el.dataset.manual)return false;const t=el.firstElementChild.getBoundingClientRect().top;return t>=top&&t<innerHeight*.75});if(next)next.open=true})};
 // attach after render's own scrollTo(0,0) has fired, so only the reader's scrolling opens sections
 const arm=setTimeout(()=>addEventListener('scroll',onScroll,{passive:true}),150);
 disposeAccordions=()=>{clearTimeout(arm);removeEventListener('scroll',onScroll)};
}

const home=`<section class="hero"><h1 tabindex="-1">음악이 세상에 닿기까지,<br>함께 준비해요.</h1></section><nav class="topic-grid" aria-label="가이드 주제">${navs.slice(1).map(([id,title,icon],i)=>`<a class="topic-link" href="#${id}"><span class="topic-no">${String(i+1).padStart(2,'0')}</span><i class="ph ph-${icon} topic-ico" aria-hidden="true"></i><span class="topic-text"><b>${title}</b><small>${descriptions[id]}</small></span><i class="ph ph-arrow-right topic-arrow" aria-hidden="true"></i></a>`).join('')}</nav><footer class="home-footer"><span>© AUDIOGUY</span><a href="https://audioguy2026.vercel.app/" target="_blank" rel="noopener">공식 웹사이트</a><a href="https://www.youtube.com/@SOUND_360" target="_blank" rel="noopener">YouTube</a><a href="https://www.instagram.com/sound360.distribution/" target="_blank" rel="noopener">Instagram</a><a href="mailto:ip@audioguyrecords.com">이메일 문의</a></footer>`;

function render(){
 disposeAccordions();
 let id=location.hash.slice(1)||'home';if(!navs.some(n=>n[0]===id))id='home';
 navRender(id);sidebar.classList.remove('open');document.body.classList.toggle('is-home',id==='home');
 if(id==='home'){main.innerHTML=home;window.scrollTo(0,0);main.querySelector('h1').focus({preventScroll:true});return}
 const title=navs.find(n=>n[0]===id)[1], items=getItems(id);
 const first=items.findIndex(x=>x.type==='h'&&x.level===2), intro=first<0?items:items.slice(0,first), rest=first<0?[]:items.slice(first);
 const extra=id==='genres'?`<section class="tool"><p>영문 장르명이나 한글 키워드로 검색해 주세요.</p><input class="credit-search" id="creditSearch" placeholder="장르 검색" aria-label="장르 검색"><div class="credit-list" id="creditList"></div></section>`
  :id==='credits'?`<section class="tool"><h2>역할과 악기 찾아보기</h2><p>발매 크레딧에 사용할 역할 또는 악기를 검색해 주세요. 항목을 누르면 영문명이 복사됩니다.</p><div class="credit-controls" role="tablist"><button data-kind="Roles" class="active">역할 Roles</button><button data-kind="Instrument">악기 Instrument</button></div><input class="credit-search" id="creditSearch" placeholder="역할명 또는 한글 키워드" aria-label="크레딧 검색"><div class="hint">원문에 제공된 항목 목록입니다. 최종 등록 가능 여부는 담당자에게 확인해 주세요.</div><div class="credit-list" id="creditList"></div></section>`:'';
 main.innerHTML=`<a href="#home" class="back-link"><i class="ph ph-arrow-left" aria-hidden="true"></i>처음으로</a><article class="article"><h1 tabindex="-1">${esc(title)}</h1>${intro.length?`<div class="intro">${intro.map(renderItem).join('')}</div>`:''}${extra}${id==='glossary'?renderGlossary(rest):renderSections(rest)}<div class="article-end"><div><b>궁금한 점이 있으신가요?</b>오디오가이 뮤직IP팀이 함께하겠습니다.</div><a href="mailto:ip@audioguyrecords.com">이메일 문의</a></div></article>`;
 if(id==='genres'){document.querySelector('#creditSearch').oninput=()=>renderCredits(true);renderCredits(true)}
 if(id==='credits'){creditType='Roles';document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{creditType=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>x.classList.toggle('active',x===b));renderCredits()});document.querySelector('#creditSearch').oninput=()=>renderCredits(false);renderCredits()}
 window.scrollTo(0,0);setupAccordions();main.querySelector('h1').focus({preventScroll:true});
}
function renderCredits(isGenre=false){let source=isGenre?GENRES:CONTRIBUTORS.filter(x=>x.type===(creditType==='Roles'?'role':'instrument'));let q=document.querySelector('#creditSearch').value.trim().normalize('NFC').toLowerCase();let filtered=source.filter(x=>String(x.active).toUpperCase()==='TRUE'&&[x.display_name,x.search_keywords_ko,x.search_keywords_en||''].some(t=>String(t||'').normalize('NFC').toLowerCase().includes(q))).sort((a,b)=>Number(a.sort_order)-Number(b.sort_order));let target=document.querySelector('#creditList');target.innerHTML=filtered.map(x=>`<button class="credit-item" data-copy="${esc(x.display_name)}">${esc(x.display_name)}</button>`).join('')||'<p class="hint">검색 결과가 없습니다.</p>';target.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);let t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent='복사했습니다';document.body.append(t);setTimeout(()=>t.remove(),1800)}catch{alert('복사할 수 없습니다. 항목을 직접 선택해 주세요.')}})}

const dialog=document.querySelector('#searchDialog'),input=document.querySelector('#searchInput'),results=document.querySelector('#searchResults');
function search(){let q=input.value.trim().toLowerCase();if(!q){results.innerHTML='<div class="hint">검색어를 입력해 주세요.</div>';return}let found=[];for(const [id,label] of navs){if(id==='home')continue;for(const item of getItems(id)){let text=itemText(item);if(text.toLowerCase().includes(q)){found.push({id,label,text:text.slice(0,130)});if(found.length>=30)break}}}results.innerHTML=found.map(x=>`<a href="#${x.id}"><b>${esc(x.label)}</b><small>${esc(x.text)}</small></a>`).join('')||'<p class="hint">검색 결과가 없습니다.</p>';results.querySelectorAll('a').forEach(a=>a.onclick=()=>dialog.close())}
const openSearch=()=>{if(!dialog.open){dialog.showModal();input.focus();search()}};
document.querySelector('#searchButton').onclick=openSearch;document.querySelector('#closeSearch').onclick=()=>dialog.close();input.oninput=search;
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape')sidebar.classList.remove('open')});
document.querySelector('#menuButton').onclick=()=>{let open=sidebar.classList.toggle('open');document.querySelector('#menuButton').setAttribute('aria-expanded',open)};
document.addEventListener('click',e=>{if(!sidebar.contains(e.target)&&!e.target.closest('#menuButton'))sidebar.classList.remove('open')});

let previousId=location.hash.slice(1)||'home';
window.addEventListener('hashchange',()=>{
 const nextId=location.hash.slice(1)||'home';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const start=document.querySelector(`.topic-link[href="#${nextId}"]`);
 const endId=previousId;
 if(!reduced&&document.startViewTransition){
  if(start)start.style.viewTransitionName='selected-topic';
  if(nextId==='home')main.style.viewTransitionName='selected-topic';
  const transition=document.startViewTransition(()=>{render();if(nextId==='home'){main.style.viewTransitionName='';const target=document.querySelector(`.topic-link[href="#${endId}"]`);if(target)target.style.viewTransitionName='selected-topic'}else{main.style.viewTransitionName='selected-topic'}});
  transition.ready.catch(()=>{}); // aborted when the tab is hidden; the page still renders
  transition.finished.finally(()=>{main.style.viewTransitionName='';document.querySelectorAll('.topic-link').forEach(x=>x.style.viewTransitionName='')});
 }else render();
 previousId=nextId;
});
render();
