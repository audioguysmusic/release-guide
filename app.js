const navs=[['home','시작하기','house'],['distribution','음원 유통 안내','file-text'],['artist','아티스트 페이지','user-circle'],['artwork','아트워크','image'],['ai','AI 활용 음원','sparkle'],['credits','크레딧','users'],['genres','장르 찾기','music-notes'],['settlement','정산 안내','wallet'],['faq','자주 묻는 질문','question'],['glossary','용어 안내','book-open']];
const pages={distribution:DATA[0],artist:DATA[1],artwork:DATA[2],ai:DATA[3],credits:DATA[4],glossary:DATA[7],settlement:DATA[8],genres:{items:[]}};
const descriptions={distribution:'제출 자료 · 발매 일정 · Dolby Atmos',artist:'Spotify · Apple Music 클레임',artwork:'커버 이미지 · 제작 의뢰 · 모션 아트워크',ai:'AI 활용 고지 · 선언서 · 권리 확인',credits:'역할과 악기 한글·영문 검색',genres:'발매 장르 한글·영문 검색',settlement:'계약 · 전자서명 · 제출 서류',faq:'유통 · 제작 · 정산 · 계약',glossary:'발매에 필요한 주요 용어'};
// "핵심 요약": the few numbers and deadlines readers come for, each taken from that page's own text
const facts={
 distribution:['희망 발매일 5주 전까지 파일 제출','아트워크·프로필 이미지 최소 3000×3000px, RGB, JPG 또는 PNG','음원 wav, aiff 또는 flac, 최소 24bit/44.1kHz 권장','Dolby Atmos 기본 제작 무료 지원(유통 음원에 한함)'],
 artist:['음원이 플랫폼에 정식 딜리버리된 후 클레임','Spotify 승인은 보통 수일 이내','Apple Music은 게재 5영업일 이후 신청, 승인 통상 2~5영업일'],
 artwork:['의뢰는 메일로 접수: ip@audioguyrecords.com','메일 제목: [아트워크 의뢰] 아티스트명 - 앨범 타이틀','모션 아트워크는 당사 제작 시 별도 견적'],
 ai:['유통 신청 양식의 03_AI 활용 고지 작성','AI 활용 음원 제작·유통 확인 및 선언서 제출','고지·선언서·크레딧 시트 내용이 서로 일치해야 함'],
 credits:['국내 플랫폼 크레딧은 작사·작곡·편곡만 노출','추가 참여자는 앨범 소개 하단 [Credits]에 작성','참여자명은 한글명과 영문명 함께 기재'],
 settlement:['계약서는 모두싸인 전자서명으로 진행','제출 서류는 전자서명 요청 메일에서 함께 업로드','정산금은 권리자 본인 명의로만 신청'],
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=document.querySelector('#main'), nav=document.querySelector('#nav'), sidebar=document.querySelector('#sidebar'), menuButton=document.querySelector('#menuButton');
function setMenu(open){sidebar.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',open);menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기')}
let creditType='Roles';

function navRender(id){nav.innerHTML=navs.map(([key,label,ico])=>`<a href="#${key}"${id===key?' class="active" aria-current="page"':''}><i class="ph ph-${ico}" aria-hidden="true"></i>${label}</a>`).join('')}
function linkText(s){return esc(s).replace(/(https?:\/\/[^\s<]+)/g,(u)=>`<a class="inline" href="${u}" target="_blank" rel="noopener noreferrer">${u.replace(/^https?:\/\//,'')}</a>`).replace(/ip@audioguyrecords\.com/g,'<a class="inline" href="mailto:ip@audioguyrecords.com">ip@audioguyrecords.com</a>')}
// "라벨: 내용" gets a bold label; lines after the first become a quiet note under the item
function liText(s){const [first,...rest]=String(s).split('\n');return linkText(first).replace(/^([^:<]{1,24}):\s/,'<b>$1</b> ')+rest.map(r=>`<span class="li-note">${linkText(r)}</span>`).join('')}
const li=i=>typeof i==='string'?`<li>${liText(i)}</li>`:`<li>${liText(i.text)}<ul>${i.items.map(li).join('')}</ul></li>`;
function renderItem(x){
 if(x.type==='h')return `<h${x.level}>${esc(x.text)}</h${x.level}>`;
 if(x.style==='check')return `<ul class="check">${x.items.map(i=>`<li><label><input type="checkbox"><span>${liText(i)}</span></label></li>`).join('')}</ul>`;
 if(x.type==='ul'||x.type==='ol')return `<${x.type}${x.style?` class="${x.style}"`:''}>${x.items.map(li).join('')}</${x.type}>`;
 if(x.type==='buttons')return `<div class="social-links">${x.items.map(b=>`<a class="social-btn" href="${b.href}" target="_blank" rel="noopener noreferrer"><i class="ph ph-${b.icon}" aria-hidden="true"></i><span><b>${esc(b.text)}</b><small>${esc(b.handle)}</small></span><i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>`).join('')}</div>`;
 if(x.type==='link'){const ext=x.href.startsWith('http');return `<p><a class="text-link" href="${x.href}"${ext?' target="_blank" rel="noopener noreferrer"':''}>${esc(x.text)}<i class="ph ph-arrow-${ext?'up-right':'right'}" aria-hidden="true"></i></a></p>`}
 if(x.type==='table'){
  if(x.rows.length===1&&x.rows[0].length===1)return `<pre class="example">${esc(x.rows[0][0])}</pre>`;
  const [head,...body]=x.rows;
  const cls=[head[0]==='구분'&&'label-first',head.length>2&&'stack'].filter(Boolean).join(' ');
  return `<div class="table-wrap"><table${cls?` class="${cls}"`:''}><thead><tr>${head.map(c=>`<th>${linkText(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r=>'<tr>'+r.map((c,i)=>`<td data-label="${esc(head[i])}">${linkText(c)}</td>`).join('')+'</tr>').join('')}</tbody></table></div>`;
 }
 if(x.tone==='quote')return `<figure class="quote"><blockquote>${linkText(x.text)}</blockquote><button type="button" class="copy-btn" data-copy="${esc(x.text)}"><i class="ph ph-copy" aria-hidden="true"></i>복사</button></figure>`;
 if(x.tone)return `<p class="callout ${x.tone}"><i class="ph ph-${x.tone==='warn'?'warning':'info'}" aria-hidden="true"></i><span>${linkText(x.text)}</span></p>`;
 return `<p>${linkText(x.text)}</p>`;
}
const itemText=x=>x.type==='buttons'?x.items.map(b=>b.text+' '+b.handle).join(' '):x.type==='table'?x.rows.flat().join(' '):x.items?x.items.map(i=>typeof i==='string'?i:i.text+' '+i.items.join(' ')).join(' '):x.text||'';

function getItems(id){
 return pages[id]?.items||[];
}
function renderSections(items){let html='',open=false;for(const x of items){if(x.type==='h'&&x.level===2){if(open)html+='</div></details>';html+=`<details class="guide-accordion"><summary><h2>${esc(x.text)}</h2><i class="ph ph-plus" aria-hidden="true"></i></summary><div class="accordion-body">`;open=true}else html+=renderItem(x)}return html+(open?'</div></details>':'')}
FAQ.flatMap(g=>g.items).forEach((f,i)=>f.id='faq-'+(i+1));
const faqAnswer=f=>f.a.map(a=>typeof a==='string'?{type:'p',text:a}:a);
const renderFaq=()=>FAQ.map(g=>`<section class="faq-group"><h2>${esc(g.cat)}</h2>${g.items.map(f=>`<details class="guide-accordion" id="${f.id}"><summary><h3>${esc(f.q)}</h3><i class="ph ph-plus" aria-hidden="true"></i></summary><div class="accordion-body">${faqAnswer(f).map(renderItem).join('')}</div></details>`).join('')}</section>`).join('');
const renderGlossary=items=>'<dl class="glossary">'+items.map(x=>x.type==='h'?`<dt>${esc(x.text)}</dt>`:`<dd>${linkText(x.text)}</dd>`).join('')+'</dl>';

// Sections open only on click, one at a time. Height is animated here because ::details-content isn't in every browser.
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),DUR=320,easeOut=p=>1-(1-p)**3;
function setOpen(d,open){
 const from=d.offsetHeight;d._anim?.cancel();d.open=true;d.classList.toggle('is-open',open);
 const to=open?d.offsetHeight:d.querySelector('summary').offsetHeight;
 if(reduce.matches){d.open=open;return null}
 d.style.overflow='clip';
 const a=d._anim=d.animate({height:[from+'px',to+'px']},{duration:DUR,easing:'cubic-bezier(.2,0,0,1)',fill:'forwards'});
 a.onfinish=()=>{d.open=open;d.style.overflow='';a.cancel()};
 return a;
}
const showOpen=d=>{if(d){d.open=true;d.classList.add('is-open')}};
main.addEventListener('click',e=>{
 const s=e.target.closest('.guide-accordion summary');if(!s)return;
 e.preventDefault();
 const d=s.parentElement,open=!d.classList.contains('is-open');
 if(open)main.querySelectorAll('.guide-accordion.is-open').forEach(o=>o!==d&&setOpen(o,false));
 const anim=setOpen(d,open);
 // Hold the title still while sections resize; once an opened one has its full height, bring its start under the header.
 // The hold must stop before the scroll starts: any scrollBy would cancel the smooth scroll.
 const v0=s.getBoundingClientRect().top;let settled=!anim;
 const hold=()=>{if(settled)return;scrollBy(0,s.getBoundingClientRect().top-v0);requestAnimationFrame(hold)};
 requestAnimationFrame(hold);
 (anim?anim.finished:Promise.resolve()).then(()=>{settled=true;if(open)s.scrollIntoView({block:'start',behavior:reduce.matches?'auto':'smooth'})},()=>{settled=true});
});

// Hero lines rotate every 10s; each change scrambles through glyphs (with a light blur) before settling.
const HEROES=[['음악이 세상에 닿기까지,','함께 준비해요.'],['첫 발매부터 첫 정산까지,','함께 준비해요.'],['음악은 당신이 만들고,','나머지는 함께해요.'],['좋은 음악이 더 멀리 가도록,','곁에서 준비해요.'],['작업실에서 플레이리스트까지,','함께 걸어요.'],['음악이 공간을 채우기까지,','함께 준비해요.'],['모든 음악을 공간음향으로,','그리고 세상으로.'],['더 넓게 들리는 음악으로,','세상에 내보내요.'],['발매에 필요한 모든 것,','여기서 확인하세요.'],['당신의 다음 발매,','여기서 시작해요.']];
const GLYPHS='#%&*+=/<>░▒▓◆◇○●가나다라마바사';
let heroIndex=0,heroTimer=0;
const heroHTML=lines=>lines.map(l=>`<span class="hero-line">${l}</span>`).join('');
function scrambleHero(h1,lines){
 h1.setAttribute('aria-label',lines.join(' '));
 const out=h1.querySelector('.hero-text');
 if(reduce.matches){out.innerHTML=heroHTML(lines.map(esc));return}
 const D=400,t0=performance.now();
 // each character settles at its own moment, roughly left to right
 const at=lines.map(l=>[...l].map((_,i,arr)=>D*(.15+.6*i/arr.length+.25*Math.random())));
 h1.classList.add('scrambling');
 const tick=now=>{
  if(!out.isConnected)return;
  const t=now-t0;
  out.innerHTML=heroHTML(lines.map((l,j)=>[...l].map((c,i)=>c===' '||t>=at[j][i]?esc(c):`<span class="glyph">${esc(GLYPHS[Math.random()*GLYPHS.length|0])}</span>`).join('')));
  if(t<D)requestAnimationFrame(tick);else h1.classList.remove('scrambling');
 };
 requestAnimationFrame(tick);
}
const home=`<section class="hero"><h1 tabindex="-1" aria-label="${HEROES[0].join(' ')}"><span class="hero-text" aria-hidden="true">${heroHTML(HEROES[0])}</span></h1></section><nav class="topic-grid" aria-label="가이드 주제">${navs.slice(1).map(([id,title,icon],i)=>`<a class="topic-link" href="#${id}"><i class="ph ph-${icon} topic-ico" style="--i:${i}" aria-hidden="true"></i><span class="topic-text"><b>${title}</b><small>${descriptions[id]}</small></span><i class="ph ph-arrow-right topic-arrow" aria-hidden="true"></i></a>`).join('')}</nav><footer class="home-footer"><span>© AUDIOGUY</span><a href="https://audioguy2026.vercel.app/" target="_blank" rel="noopener">공식 웹사이트</a><a href="https://www.youtube.com/@SOUND_360" target="_blank" rel="noopener">YouTube</a><a href="https://www.instagram.com/sound360.distribution/" target="_blank" rel="noopener">Instagram</a></footer>`;

function render(){
 const hash=location.hash.slice(1)||'home';let id=hash.startsWith('faq-')?'faq':hash;if(!navs.some(n=>n[0]===id))id='home';
 navRender(id);setMenu(false);document.body.classList.toggle('is-home',id==='home');
 clearInterval(heroTimer);
 if(id==='home'){main.innerHTML=home;heroIndex=0;window.scrollTo(0,0);main.querySelector('h1').focus({preventScroll:true});
  heroTimer=setInterval(()=>{const h=main.querySelector('.hero h1');if(h)scrambleHero(h,HEROES[heroIndex=(heroIndex+1)%HEROES.length])},10000);return}
 const title=navs.find(n=>n[0]===id)[1], items=getItems(id);
 const first=items.findIndex(x=>x.type==='h'&&x.level===2), intro=first<0?items:items.slice(0,first), rest=first<0?[]:items.slice(first);
 const extra=id==='genres'?`<section class="tool"><p>영문 장르명이나 한글 키워드로 검색해 주세요.</p><input class="credit-search" id="creditSearch" placeholder="장르 검색" aria-label="장르 검색"><div class="credit-list" id="creditList"></div></section>`
  :id==='credits'?`<section class="tool"><h2>역할과 악기 찾아보기</h2><p>발매 크레딧에 사용할 역할 또는 악기를 검색해 주세요. 항목을 누르면 영문명이 복사됩니다.</p><div class="credit-controls"><button data-kind="Roles" class="active" aria-pressed="true">역할 Roles</button><button data-kind="Instrument" aria-pressed="false">악기 Instrument</button></div><input class="credit-search" id="creditSearch" placeholder="역할명 또는 한글 키워드" aria-label="크레딧 검색"><div class="hint">원문에 제공된 항목 목록입니다. 최종 등록 가능 여부는 담당자에게 확인해 주세요.</div><div class="credit-list" id="creditList"></div></section>`:'';
 main.innerHTML=`<a href="#home" class="back-link"><i class="ph ph-arrow-left" aria-hidden="true"></i>처음으로</a><article class="article"><h1 tabindex="-1">${esc(title)}</h1>${intro.length?`<div class="intro">${intro.map(renderItem).join('')}</div>`:''}${facts[id]?`<section class="key-facts"><h2>핵심 요약</h2><ul>${facts[id].map(f=>`<li>${linkText(f)}</li>`).join('')}</ul></section>`:''}${extra}${id==='glossary'?renderGlossary(rest):id==='faq'?renderFaq():renderSections(rest)}</article>`;
 if(id==='genres'){document.querySelector('#creditSearch').oninput=()=>renderCredits(true);renderCredits(true)}
 if(id==='credits'){creditType='Roles';document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{creditType=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});renderCredits()});document.querySelector('#creditSearch').oninput=()=>renderCredits(false);renderCredits()}
 window.scrollTo(0,0);main.querySelector('h1').focus({preventScroll:true});
 const target=id==='faq'&&document.getElementById(hash);
 if(target){showOpen(target);target.scrollIntoView()}else if(id!=='faq')showOpen(main.querySelector('.guide-accordion'));
}
function renderCredits(isGenre=false){let source=isGenre?GENRES:CONTRIBUTORS.filter(x=>x.type===(creditType==='Roles'?'role':'instrument'));let q=document.querySelector('#creditSearch').value.trim().normalize('NFC').toLowerCase();let filtered=source.filter(x=>String(x.active).toUpperCase()==='TRUE'&&[x.display_name,x.search_keywords_ko,x.search_keywords_en||''].some(t=>String(t||'').normalize('NFC').toLowerCase().includes(q))).sort((a,b)=>Number(a.sort_order)-Number(b.sort_order));let target=document.querySelector('#creditList');target.innerHTML=filtered.map(x=>`<button class="credit-item" data-copy="${esc(x.display_name)}">${esc(x.display_name)}</button>`).join('')||'<p class="hint">검색 결과가 없습니다.</p>';}
main.addEventListener('click',async e=>{const b=e.target.closest('[data-copy]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy);const ico=b.querySelector('.ph-copy');if(ico){ico.classList.replace('ph-copy','ph-check');setTimeout(()=>ico.classList.replace('ph-check','ph-copy'),1500)}let t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent='복사했습니다';document.body.append(t);setTimeout(()=>t.remove(),1800)}catch{alert('복사할 수 없습니다. 항목을 직접 선택해 주세요.')}});

const dialog=document.querySelector('#searchDialog'),input=document.querySelector('#searchInput'),results=document.querySelector('#searchResults');
function search(){let q=input.value.trim().toLowerCase();if(!q){results.innerHTML='<div class="hint">검색어를 입력해 주세요.</div>';return}const found=[];for(const f of FAQ.flatMap(g=>g.items))if((f.q+' '+faqAnswer(f).map(itemText).join(' ')).toLowerCase().includes(q))found.push({id:f.id,label:'자주 묻는 질문',text:f.q});
 for(const [id,label] of navs){if(id==='home'||id==='faq')continue;for(const item of getItems(id)){const text=itemText(item);if(text.toLowerCase().includes(q))found.push({id,label,text:text.slice(0,130)})}}
 results.innerHTML=found.slice(0,30).map(x=>`<a href="#${x.id}"><b>${esc(x.label)}</b><small>${esc(x.text)}</small></a>`).join('')||'<p class="hint">검색 결과가 없습니다.</p>';results.querySelectorAll('a').forEach(a=>a.onclick=()=>dialog.close())}
const openSearch=()=>{if(!dialog.open){dialog.showModal();input.focus();search()}};
document.querySelector('#searchButton').onclick=openSearch;document.querySelector('#closeSearch').onclick=()=>dialog.close();
// dialog has no padding, so only the backdrop targets it; also require the press to start there, so a text drag ending outside doesn't close it
let pressedOn=null;dialog.addEventListener('pointerdown',e=>pressedOn=e.target);
dialog.addEventListener('click',e=>{if(e.target===dialog&&pressedOn===dialog)dialog.close()});input.oninput=search;
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape')setMenu(false)});
menuButton.onclick=()=>setMenu(!sidebar.classList.contains('open'));
document.addEventListener('click',e=>{if(!sidebar.contains(e.target)&&!e.target.closest('#menuButton'))setMenu(false)});

let previousId=location.hash.slice(1)||'home';
// Home → topic, as a short loading beat: the tile grows into a frosted veil while its icon glides to the centre (0.5s),
// the page renders underneath while the icon plays its own motion, then the veil fades away.
main.addEventListener('click',e=>{
 const a=e.target.closest('.topic-link');if(!a||reduce.matches||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
 e.preventDefault();
 const r=a.getBoundingClientRect(),ico=a.querySelector('.topic-ico'),ir=ico.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,ease='cubic-bezier(.2,0,0,1)';
 const veil=document.createElement('div'),wrap=document.createElement('span'),glyph=document.createElement('i');
 veil.className='veil';wrap.className='veil-ico';wrap.style.cssText=`left:${ir.left}px;top:${ir.top}px`;
 glyph.className=ico.className.replace(' topic-ico','');glyph.setAttribute('aria-hidden','true');
 wrap.append(glyph);veil.append(wrap);document.body.append(veil);
 veil.animate({clipPath:[`inset(${r.top}px ${vw-r.right}px ${vh-r.bottom}px ${r.left}px)`,'inset(0px 0px 0px 0px)'],opacity:[.6,1]},{duration:500,easing:ease,fill:'forwards'});
 // the wrapper moves and scales; the glyph inside is free to run its hover motion without fighting that transform
 wrap.animate({transform:['none',`translate(${vw/2-ir.left-ir.width/2}px,${vh/2-ir.top-ir.height/2}px) scale(2.6)`]},{duration:500,easing:ease,fill:'forwards'}).finished.then(()=>{
  const href=a.getAttribute('href');history.pushState(null,'',href);render();previousId=href.slice(1);
  glyph.classList.add('play');
  setTimeout(()=>veil.animate({opacity:[1,0]},{duration:350,easing:'ease-out',fill:'forwards'}).finished.then(()=>veil.remove()),600);
 });
});
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
