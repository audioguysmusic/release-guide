// Language: picked from ?lang=, then the last choice, then the browser. All three are loaded, so switching is just a re-render.
const LANG_SRC={ko:[DATA,FAQ],ja:[DATA_JA,FAQ_JA],en:[DATA_EN,FAQ_EN]},LANG_LABEL={ko:'KR',ja:'JP',en:'EN'};
const NAV_ICONS=[['home','house'],['distribution','file-text'],['artist','user-circle'],['artwork','image'],['ai','sparkle'],['credits','users'],['genres','music-notes'],['settlement','wallet'],['faq','question'],['glossary','book-open']];
const PAGE_IDX={distribution:0,artist:1,artwork:2,ai:3,credits:4,glossary:7,settlement:8};
let lang,T,navs,pages,FAQ_L,HEROES,descriptions,facts;
const fill=(s,o)=>s.replace(/\{(\w+)\}/g,(_,k)=>o[k]);
function pickLang(){
 const q=new URLSearchParams(location.search).get('lang');if(LANG_SRC[q])return q;
 try{const s=localStorage.getItem('lang');if(LANG_SRC[s])return s}catch{}
 const n=(navigator.language||'').slice(0,2);return n==='ko'||n==='ja'?n:'en';
}
function setLang(l){
 lang=l;T=I18N[l];const [D,F]=LANG_SRC[l];
 navs=NAV_ICONS.map(([k,i])=>[k,T.nav[k],i]);
 pages={};for(const k in PAGE_IDX)pages[k]=D[PAGE_IDX[k]];
 FAQ_L=F;FAQ_L.flatMap(g=>g.items).forEach((f,i)=>f.id='faq-'+(i+1));
 HEROES=T.heroes;descriptions=T.desc;facts=T.facts;heroBag=[];
 document.documentElement.lang=l;document.title=T.title;document.querySelector('meta[name=description]').content=T.metaDesc;
 document.querySelectorAll('[data-t]').forEach(el=>el.textContent=T[el.dataset.t]);
 document.querySelectorAll('[data-t-aria]').forEach(el=>el.setAttribute('aria-label',T[el.dataset.tAria]));
 document.querySelectorAll('[data-t-ph]').forEach(el=>el.placeholder=T[el.dataset.tPh]);
 document.querySelectorAll('.lang-seg').forEach(seg=>seg.innerHTML=segButtons());
}
const segButtons=()=>Object.keys(LANG_SRC).map(l=>`<button type="button" data-lang="${l}" lang="${l}" aria-pressed="${l===lang}">${LANG_LABEL[l]}</button>`).join('');
const segHTML=()=>`<div class="lang-seg" role="group" aria-label="${T.langAria}">${segButtons()}</div>`;
document.addEventListener('click',e=>{
 const b=e.target.closest('.lang-seg button');if(!b||b.dataset.lang===lang)return;
 try{localStorage.setItem('lang',b.dataset.lang)}catch{}
 const u=new URL(location.href);u.searchParams.set('lang',b.dataset.lang);history.replaceState(null,'',u);
 // keep what the reader was doing: credits tab and query, home scroll, and focus on the segment they used
 const q=document.querySelector('#creditSearch')?.value,kind=creditType,onHome=location.hash.slice(1)==='home'||!location.hash,y=scrollY,inMenu=!!b.closest('aside');
 setLang(b.dataset.lang);render();
 // the words change in place, so fade them in the way the page icons draw in
 if(!reduce.matches)document.querySelectorAll('main,#nav,.brand span,.search-trigger span,.contact,.side-footer a').forEach(el=>el.animate({opacity:[0,1],transform:['translateY(3px)','none']},{duration:360,easing:'cubic-bezier(.22,1,.36,1)'}));
 const s=document.querySelector('#creditSearch');if(s&&q)s.value=q;
 if(document.querySelector('[data-kind]')&&kind!=='Roles')document.querySelector(`[data-kind="${kind}"]`).click();else if(s&&q)s.oninput();
 if(onHome)scrollTo(0,y);
 (inMenu?menuButton:document.querySelector(`${b.closest('header')?'header':'.home-footer'} [data-lang="${lang}"]`))?.focus({preventScroll:true});
});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main=document.querySelector('#main'), nav=document.querySelector('#nav'), sidebar=document.querySelector('#sidebar'), menuButton=document.querySelector('#menuButton');
function setMenu(open){sidebar.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',open);menuButton.setAttribute('aria-label',open?T.menuClose:T.menuOpen)}
let creditType='Roles';

function navRender(id){nav.innerHTML=navs.map(([key,label,ico])=>`<a href="#${key}"${id===key?' class="active" aria-current="page"':''}><i class="ph ph-${ico}" aria-hidden="true"></i>${label}</a>`).join('')}
// Form sheet/tab names ("03_AI 활용 고지", "03_AI Use Disclosure") get a soft marker so readers can spot them in the form
// JP/EN name the tabs of the English application form, which contain spaces and a slash
const DOC_RE=/\b0\d_(?:AI 활용 고지|Album\/Track Info|Artist Info|AI Use Disclosure|Checklist|[^\s,.()<」]+)/g;
const ARROW={right:'M3 8h10M9 4l4 4-4 4',ext:'M5 11l6-6M6 5h5v5'};
const arrow=k=>`<svg class="link-arrow ${k}" viewBox="0 0 16 16" aria-hidden="true"><path d="${ARROW[k]}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
function linkText(s){return esc(s).replace(DOC_RE,'<mark class="doc">$&</mark>').replace(/(https?:\/\/[^\s<]+)/g,(u)=>`<a class="inline" href="${u}" target="_blank" rel="noopener noreferrer">${u.replace(/^https?:\/\//,'')}${arrow('ext')}</a>`).replace(/ip@audioguyrecords\.com/g,'<a class="inline" href="mailto:ip@audioguyrecords.com">ip@audioguyrecords.com</a>')}
// "라벨: 내용" gets a bold label; lines after the first become a quiet note under the item
function liText(s){const [first,...rest]=String(s).split('\n');return linkText(first).replace(/^([^:<]{1,32}):\s/,'<b>$1</b> ')+rest.map(r=>`<span class="li-note">${linkText(r)}</span>`).join('')}
const li=i=>typeof i==='string'?`<li>${liText(i)}</li>`:`<li>${liText(i.text)}<ul>${i.items.map(li).join('')}</ul></li>`;
function renderItem(x){
 if(x.type==='h')return `<h${x.level}>${esc(x.text)}</h${x.level}>`;
 if(x.style==='check')return `<ul class="check">${x.items.map(i=>`<li><label><input type="checkbox"><span>${liText(i)}</span></label></li>`).join('')}</ul>`;
 if(x.type==='ul'||x.type==='ol')return `<${x.type}${x.style?` class="${x.style}"`:''}>${x.items.map(li).join('')}</${x.type}>`;
 if(x.type==='buttons')return `<div class="social-links">${x.items.map(b=>`<a class="social-btn" href="${b.href}" target="_blank" rel="noopener noreferrer"><i class="ph ph-${b.icon}" aria-hidden="true"></i><span><b>${esc(b.text)}</b><small>${esc(b.handle)}</small></span><i class="ph ph-arrow-up-right" aria-hidden="true"></i></a>`).join('')}</div>`;
 if(x.type==='link'){const ext=x.href.startsWith('http');return `<p><a class="text-link" href="${x.href}"${ext?' target="_blank" rel="noopener noreferrer"':''}>${esc(x.text)}${arrow(ext?'ext':'right')}</a></p>`}
 if(x.type==='table'){
  if(x.rows.length===1&&x.rows[0].length===1)return `<pre class="example">${esc(x.rows[0][0])}</pre>`;
  const [head,...body]=x.rows;
  const cls=[['구분','区分','Category'].includes(head[0])&&'label-first',head.length>2&&'stack'].filter(Boolean).join(' ');
  return `<div class="table-wrap"><table${cls?` class="${cls}"`:''}><thead><tr>${head.map(c=>`<th>${linkText(c)}</th>`).join('')}</tr></thead><tbody>${body.map(r=>'<tr>'+r.map((c,i)=>`<td data-label="${esc(head[i])}">${linkText(c)}</td>`).join('')+'</tr>').join('')}</tbody></table></div>`;
 }
 if(x.tone==='quote')return `<figure class="quote"><blockquote>${linkText(x.text)}</blockquote><button type="button" class="copy-btn" data-copy="${esc(x.text)}"><i class="ph ph-copy" aria-hidden="true"></i>${T.copy}</button></figure>`;
 if(x.tone)return `<p class="callout ${x.tone}"><i class="ph ph-${x.tone==='warn'?'warning':'info'}" aria-hidden="true"></i><span>${linkText(x.text)}</span></p>`;
 return `<p>${linkText(x.text)}</p>`;
}
const itemText=x=>x.type==='buttons'?x.items.map(b=>b.text+' '+b.handle).join(' '):x.type==='table'?x.rows.flat().join(' '):x.items?x.items.map(i=>typeof i==='string'?i:i.text+' '+i.items.join(' ')).join(' '):x.text||'';

function getItems(id){
 return pages[id]?.items||[];
}
function renderSections(items){let html='',open=false;for(const x of items){if(x.type==='h'&&x.level===2){if(open)html+='</div></details>';html+=`<details class="guide-accordion"><summary><h2>${esc(x.text)}</h2><i class="ph ph-plus" aria-hidden="true"></i></summary><div class="accordion-body">`;open=true}else html+=renderItem(x)}return html+(open?'</div></details>':'')}
const faqAnswer=f=>f.a.map(a=>typeof a==='string'?{type:'p',text:a}:a);
const renderFaq=()=>FAQ_L.map((g,gi)=>`<section class="faq-group" id="faq-cat-${gi+1}"><h2>${esc(g.cat)}</h2>${g.items.map(f=>`<details class="guide-accordion" id="${f.id}"><summary><h3>${esc(f.q)}</h3><i class="ph ph-plus" aria-hidden="true"></i></summary><div class="accordion-body">${faqAnswer(f).map(renderItem).join('')}</div></details>`).join('')}</section>`).join('');
// one <div> per term, so a term with several paragraphs keeps a single divider under it
const renderGlossary=items=>'<dl class="glossary">'+items.map((x,i)=>x.type==='h'?`${i?'</div>':''}<div class="term"><dt>${esc(x.text)}</dt>`:`<dd>${linkText(x.text)}</dd>`).join('')+'</div></dl>';

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
 const hold=()=>{if(settled||!s.isConnected)return;scrollBy(0,s.getBoundingClientRect().top-v0);requestAnimationFrame(hold)};
 requestAnimationFrame(hold);
 (anim?anim.finished:Promise.resolve()).then(()=>{settled=true;if(open)s.scrollIntoView({block:'start',behavior:reduce.matches?'auto':'smooth'})},()=>{settled=true});
});

// Hero lines rotate every 10s; each change scrambles through glyphs (with a light blur) before settling.
const GLYPHS=()=>'#%&*+=/<>░▒▓◆◇○●'+{ko:'가나다라마바사',ja:'アイウエオカキ',en:'ABCDEFG'}[lang];
let heroTimer=0,heroBag=[],heroLast=-1;
// shuffled bag: every line shows once before any repeats, and a new round never starts with the line just shown
function nextHero(){
 if(!heroBag.length){heroBag=[...HEROES.keys()];for(let i=heroBag.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[heroBag[i],heroBag[j]]=[heroBag[j],heroBag[i]]}if(heroBag[0]===heroLast)heroBag.push(heroBag.shift())}
 return HEROES[heroLast=heroBag.shift()];
}
const heroHTML=lines=>lines.map(l=>`<span class="hero-line">${l}</span>`).join('');
function scrambleHero(h1,lines){
 h1.setAttribute('aria-label',lines.join(' '));
 const out=h1.querySelector('.hero-text');
 if(reduce.matches){out.innerHTML=heroHTML(lines.map(esc));return}
 const D=400,t0=performance.now();
 // each character settles at its own moment, roughly left to right
 const at=lines.map(l=>[...l].map((_,i,arr)=>D*(.15+.6*i/arr.length+.25*Math.random())));
 h1.classList.add('scrambling');const g=GLYPHS();
 const tick=now=>{
  if(!out.isConnected)return;
  const t=now-t0;
  out.innerHTML=heroHTML(lines.map((l,j)=>[...l].map((c,i)=>c===' '||t>=at[j][i]?esc(c):`<span class="glyph">${esc(g[Math.random()*g.length|0])}</span>`).join('')));
  if(t<D)requestAnimationFrame(tick);else h1.classList.remove('scrambling');
 };
 requestAnimationFrame(tick);
}
const home=()=>`<section class="hero"><h1 tabindex="-1" aria-label="${HEROES[0].join(' ')}"><span class="hero-text" aria-hidden="true">${heroHTML(HEROES[0])}</span></h1></section><nav class="topic-grid" aria-label="${T.topicsAria}">${navs.slice(1).map(([id,title,icon],i)=>`<a class="topic-link" href="#${id}"><i class="ph ph-${icon} topic-ico" style="--i:${i}" aria-hidden="true"></i><span class="topic-text"><b>${title}</b><small>${descriptions[id]}</small></span><i class="ph ph-arrow-right topic-arrow" aria-hidden="true"></i></a>`).join('')}</nav><footer class="home-footer">${segHTML()}<span>© AUDIOGUY</span><a href="https://audioguy2026.vercel.app/" target="_blank" rel="noopener">${T.website}</a><a href="https://www.youtube.com/@SOUND_360" target="_blank" rel="noopener">YouTube</a><a href="https://www.instagram.com/sound360.distribution/" target="_blank" rel="noopener">Instagram</a></footer>`;

function render(){
 const hash=location.hash.slice(1)||'home';let id=hash.startsWith('faq-')?'faq':hash;if(!navs.some(n=>n[0]===id))id='home';
 navRender(id);setMenu(false);document.body.classList.toggle('is-home',id==='home');
 clearInterval(heroTimer);
 if(id==='home'){main.innerHTML=home();const h1=main.querySelector('h1'),first=nextHero();h1.setAttribute('aria-label',first.join(' '));h1.querySelector('.hero-text').innerHTML=heroHTML(first.map(esc));
  window.scrollTo(0,0);h1.focus({preventScroll:true});
  heroTimer=setInterval(()=>{const h=main.querySelector('.hero h1');if(h)scrambleHero(h,nextHero())},10000);return}
 const title=navs.find(n=>n[0]===id)[1], items=getItems(id);
 const first=items.findIndex(x=>x.type==='h'&&x.level===2), intro=first<0?items:items.slice(0,first), rest=first<0?[]:items.slice(first);
 const extra=id==='genres'?`<section class="tool"><p>${T.genresHint}</p><input class="credit-search" id="creditSearch" placeholder="${T.genresPlaceholder}" aria-label="${T.genresPlaceholder}"><div class="credit-list" id="creditList"></div></section>`
  :id==='credits'?`<section class="tool"><h2>${T.creditsTitle}</h2><p>${T.creditsHint}</p><div class="credit-controls"><button data-kind="Roles" class="active" aria-pressed="true">${T.roles}${lang==='en'?'':' Roles'}</button><button data-kind="Instrument" aria-pressed="false">${T.instruments}${lang==='en'?'':' Instrument'}</button></div><input class="credit-search" id="creditSearch" placeholder="${T.creditPlaceholder}" aria-label="${T.creditAria}"><div class="hint">${T.creditNote}</div><p class="cross-hint" id="creditHint" hidden></p><div class="credit-list" id="creditList"></div><button type="button" class="more-btn" id="creditMore" hidden></button></section>`:'';
 main.innerHTML=`<a href="#home" class="back-link"><i class="ph ph-arrow-left" aria-hidden="true"></i>${T.back}</a><article class="article"><h1 tabindex="-1">${esc(title)}</h1>${intro.length?`<div class="intro">${intro.map(renderItem).join('')}</div>`:''}${facts[id]?`<section class="key-facts"><h2>${T.keyFacts}</h2><ul>${facts[id].map(f=>`<li>${linkText(f)}</li>`).join('')}</ul></section>`:''}${id==='credits'?'':extra}${id==='glossary'?renderGlossary(rest):id==='faq'?renderFaq():renderSections(rest)}${id==='credits'?extra:''}</article>`;
 if(id==='genres'){document.querySelector('#creditSearch').oninput=()=>renderCredits(true);renderCredits(true)}
 // credits: the short guidance comes first so the long lookup list below can't bury it
 if(id==='credits'){creditType='Roles';creditsExpanded=false;document.querySelector('#creditMore').onclick=()=>{creditsExpanded=!creditsExpanded;renderCredits()};document.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{creditType=b.dataset.kind;creditsExpanded=false;document.querySelectorAll('[data-kind]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});renderCredits()});document.querySelector('#creditSearch').oninput=()=>renderCredits(false);renderCredits()}
 window.scrollTo(0,0);main.querySelector('h1').focus({preventScroll:true});
 const target=id==='faq'&&document.getElementById(hash);
 if(target){if(target.tagName==='DETAILS')showOpen(target);target.scrollIntoView()}else if(id!=='faq'&&id!=='credits')showOpen(main.querySelector('.guide-accordion'));
 if(flashReq){flash(flashReq);flashReq=null}
}
// After a search result opens a page, its keyword is marked in the item it came from (or anywhere on the page as a fallback);
// the mark holds 5s, fades over 5s (CSS), then is unwrapped.
let flashReq=null;
function flash({phrase,hit,text}){
 const art=main.querySelector('.article');if(!art)return;
 const sq=t=>norm(t).replace(/\s+/g,''),whole=sq(text),key=whole.slice(0,24),test=(re,t)=>new RegExp(re,'i').test(t);
 const hashEl=document.getElementById(location.hash.slice(1));
 // the rendered block whose text is part of (or starts like) the search item and holds the keyword
 const item=hashEl?.tagName==='DETAILS'?hashEl:text?[...art.querySelectorAll('h2,h3,h4,p,li,td,th,dt,dd,summary')].find(e=>{const t=sq(e.textContent);return t&&test(hit,e.textContent)&&(whole.includes(t)||t.includes(key))}):null;
 for(const scope of [item,art]){
  if(!scope)continue;
  const re=new RegExp(test(phrase,scope.textContent)?phrase:hit,'gi'),w=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT),nodes=[],marks=[];
  while(w.nextNode())nodes.push(w.currentNode);
  for(const n of nodes){
   if(n.parentElement.closest('svg,mark'))continue;
   let last=0,frag=null;
   for(const m of n.data.matchAll(re)){if(!m[0])continue;frag??=document.createDocumentFragment();frag.append(n.data.slice(last,m.index));const k=document.createElement('mark');k.className='flash';k.textContent=m[0];frag.append(k);marks.push(k);last=m.index+m[0].length}
   if(frag){frag.append(n.data.slice(last));n.replaceWith(frag)}
  }
  if(!marks.length)continue;
  main.querySelectorAll('.guide-accordion.is-open').forEach(d=>{if(!d.contains(marks[0])){d.open=false;d.classList.remove('is-open')}});for(let d=marks[0].closest('details');d;d=d.parentElement.closest('details'))showOpen(d);marks[0].scrollIntoView({block:'center'});
  marks.forEach(k=>k.addEventListener('animationend',()=>{const p=k.parentNode;k.replaceWith(k.textContent);p?.normalize()},{once:true}));
  return;
 }
}
// Credits lists are long (hundreds of items), so with no search only a faded preview shows and the guidance below stays in reach.
const CREDIT_PREVIEW=12;let creditsExpanded=false;
const creditMatches=(source,q)=>source.filter(x=>String(x.active).toUpperCase()==='TRUE'&&[x.display_name,x.search_keywords_ko,x.search_keywords_en||''].some(t=>String(t||'').normalize('NFC').toLowerCase().includes(q))).sort((a,b)=>Number(a.sort_order)-Number(b.sort_order));
function renderCredits(isGenre=false){
 const kind=creditType==='Roles'?'role':'instrument',q=document.querySelector('#creditSearch').value.trim().normalize('NFC').toLowerCase();
 const filtered=creditMatches(isGenre?GENRES:CONTRIBUTORS.filter(x=>x.type===kind),q);
 const target=document.querySelector('#creditList'),more=document.querySelector('#creditMore'),hint=document.querySelector('#creditHint');
 const collapse=!isGenre&&!q&&!creditsExpanded&&filtered.length>CREDIT_PREVIEW;
 target.innerHTML=(collapse?filtered.slice(0,CREDIT_PREVIEW):filtered).map(x=>`<button class="credit-item" data-copy="${esc(x.display_name)}">${esc(x.display_name)}</button>`).join('')||`<p class="hint">${T.noResults}</p>`;
 target.classList.toggle('is-collapsed',collapse);
 if(isGenre)return;
 more.hidden=!!q||filtered.length<=CREDIT_PREVIEW;
 more.innerHTML=creditsExpanded?`${T.collapse}<i class="ph ph-caret-up" aria-hidden="true"></i>`:`${fill(T.showAll,{n:filtered.length})}<i class="ph ph-caret-down" aria-hidden="true"></i>`;
 more.setAttribute('aria-expanded',creditsExpanded);
 // point to the other tab when it has matches the current one doesn't show
 const otherKind=kind==='role'?'instrument':'role',otherLabel=otherKind==='role'?T.roles:T.instruments,otherCount=q?creditMatches(CONTRIBUTORS.filter(x=>x.type===otherKind),q).length:0;
 hint.hidden=!otherCount;
 if(otherCount)hint.innerHTML=`<span>${filtered.length?'':T.tabEmpty+' '}${fill(T.foundIn,{tab:otherLabel,n:otherCount})}</span><button type="button" class="text-link" data-switch="${otherKind==='role'?'Roles':'Instrument'}">${fill(T.viewIn,{tab:otherLabel})}${arrow('right')}</button>`;
 hint.classList.toggle('is-empty',!filtered.length);
 if(otherCount&&!filtered.length)target.innerHTML=''; // the hint already says this tab is empty
 hint.querySelector('[data-switch]')?.addEventListener('click',e=>document.querySelector(`[data-kind="${e.currentTarget.dataset.switch}"]`).click());
}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-copy]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy);const ico=b.querySelector('.ph-copy');if(ico){ico.classList.replace('ph-copy','ph-check');setTimeout(()=>ico.classList.replace('ph-check','ph-copy'),1500)}let t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=T.copied;document.body.append(t);setTimeout(()=>t.remove(),1800)}catch{alert(T.copyFail)}});

const dialog=document.querySelector('#searchDialog'),input=document.querySelector('#searchInput'),results=document.querySelector('#searchResults');
// Search: NFKC (full-width → half-width), case-folded, katakana folded to hiragana; every space-separated word must appear,
// and a word also matches across a space in the text ("정산시차" finds "정산 시차"). Hits are highlighted in the results.
const kana=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const norm=s=>kana(s.normalize('NFKC').toLowerCase());
const charPat=c=>/[ぁ-ゖ]/.test(c)?'['+c+String.fromCharCode(c.charCodeAt(0)+0x60)+']':c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const wordPat=w=>[...w].map(charPat).join('\\s*');
function search(){
 const q=norm(input.value).trim();if(!q){results.innerHTML=`<div class="hint">${T.enterQuery}</div>`;return}
 const words=[...new Set(q.split(/\s+/))],compact=q.replace(/\s+/g,'');
 const wordRes=words.map(w=>new RegExp(wordPat(w),'i')),compactRe=new RegExp(wordPat(compact),'i');
 const hitRe=new RegExp([...new Set([compact,...words])].sort((x,y)=>y.length-x.length).map(wordPat).join('|'),'gi');
 // 0 = no match; whole-phrase and heading/question matches rank first
 const score=(t,bonus=0)=>{const n=norm(t);return wordRes.every(r=>r.test(n))?1+bonus+(compactRe.test(n)?2:0):0};
 // when the whole phrase is there, centre on and mark only it (so 'Content ID' doesn't also light up the ID in CID)
 const phraseRe=new RegExp(wordPat(compact),'gi'),reFor=t=>compactRe.test(norm(t))?phraseRe:hitRe;
 const snip=t=>{t=t.normalize('NFKC');const re=reFor(t);re.lastIndex=0;const m=re.exec(t),st=m?Math.max(0,m.index-40):0;return (st?'…':'')+t.slice(st,st+130)+(t.length>st+130?'…':'')};
  const hl=t=>{let out='',last=0;t.replace(reFor(t),(m,i)=>{out+=esc(t.slice(last,i))+`<mark class="hit">${esc(m)}</mark>`;last=i+m.length;return m});return out+esc(t.slice(last))};
 const found=[];
 for(const f of FAQ_L.flatMap(g=>g.items)){const ans=faqAnswer(f).map(itemText).join(' '),inQ=score(f.q),sc=inQ?inQ+2:score(ans);if(sc)found.push({id:f.id,text:'',label:T.nav.faq,html:hl(f.q.normalize('NFKC'))+(inQ?'':`<span>${hl(snip(ans))}</span>`),sc})}
 for(const [id,label] of navs){if(id==='home'||id==='faq')continue;for(const item of getItems(id)){const text=itemText(item),sc=score(text,item.type==='h'?2:0);if(sc)found.push({id,text,label,html:hl(snip(text)),sc})}}
 found.sort((x,y)=>y.sc-x.sc);
 results.innerHTML=found.slice(0,30).map(x=>`<a href="#${x.id}"><b>${esc(x.label)}</b><small>${x.html}</small></a>`).join('')||`<p class="hint">${T.noResults}</p>`;
 const shown=found.slice(0,30);
 results.querySelectorAll('a').forEach((a,i)=>a.onclick=()=>{flashReq={phrase:phraseRe.source,hit:hitRe.source,text:shown[i].text};dialog.close();if(a.getAttribute('href')===location.hash)render()})}
const openSearch=()=>{if(!dialog.open){dialog.showModal();input.focus();search()}};
document.querySelector('#searchButton').onclick=openSearch;document.querySelector('#closeSearch').onclick=()=>dialog.close();
// dialog has no padding, so only the backdrop targets it; also require the press to start there, so a text drag ending outside doesn't close it
let pressedOn=null;dialog.addEventListener('pointerdown',e=>pressedOn=e.target);
dialog.addEventListener('click',e=>{if(e.target===dialog&&pressedOn===dialog)dialog.close()});input.oninput=search;
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape')setMenu(false)});
menuButton.onclick=()=>setMenu(!sidebar.classList.contains('open'));
document.addEventListener('click',e=>{if(!sidebar.contains(e.target)&&!e.target.closest('#menuButton'))setMenu(false)});

let previousId=location.hash.slice(1)||'home';
// Home → topic, as a short loading beat below the header: the tile grows into a frosted veil (blur and tint ease in together)
// while its icon glides to the centre; the page is swapped only once the veil is at full cover, the icon plays its motion,
// then the veil eases out. The URL changes on click, so Back during the beat cancels it cleanly.
const ICON_BIG=112; // the icon is drawn at this size and scaled up from small, never scaled past 1, so it stays sharp
main.addEventListener('click',e=>{
 const a=e.target.closest('.topic-link');if(!a||reduce.matches||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
 e.preventDefault();
 const href=a.getAttribute('href');history.pushState(null,'',href);
 const H=document.querySelector('header').offsetHeight,vw=document.documentElement.clientWidth,vh=innerHeight-H;
 const r=a.getBoundingClientRect(),ico=a.querySelector('.topic-ico'),ir=ico.getBoundingClientRect();
 const veil=document.createElement('div'),wrap=document.createElement('span'),glyph=document.createElement('i');
 veil.className='veil';veil.style.top=H+'px';
 wrap.className='veil-ico';wrap.style.cssText=`font-size:${ICON_BIG}px;left:${vw/2-ICON_BIG/2}px;top:${vh/2-ICON_BIG/2}px`;
 glyph.className=ico.className.replace(' topic-ico','');
 wrap.append(glyph);veil.append(wrap);document.body.append(veil);
 const inOut='cubic-bezier(.65,0,.35,1)',out='cubic-bezier(.2,0,0,1)',cover={backgroundColor:'rgba(250,250,250,.94)',backdropFilter:'blur(18px)'},clear={backgroundColor:'rgba(250,250,250,0)',backdropFilter:'blur(0px)'};
 const top=Math.max(0,r.top-H),bottom=Math.max(0,innerHeight-r.bottom);
 veil.animate({clipPath:[`inset(${top}px ${vw-r.right}px ${bottom}px ${r.left}px)`,'inset(0px 0px 0px 0px)']},{duration:500,easing:out,fill:'forwards'});
 veil.animate([clear,cover],{duration:500,easing:inOut,fill:'forwards'});
 const s=ir.width/ICON_BIG,dx=ir.left+ir.width/2-vw/2,dy=ir.top-H+ir.height/2-vh/2;
 wrap.animate({transform:[`translate(${dx}px,${dy}px) scale(${s})`,'none']},{duration:500,easing:out,fill:'forwards'}).finished.then(()=>{
  const leave=()=>{veil.getAnimations().forEach(x=>x.commitStyles?.());veil.animate([cover,clear],{duration:400,easing:inOut,fill:'forwards'});
   wrap.animate({opacity:[1,0],transform:['none','scale(.9)']},{duration:300,easing:inOut,fill:'forwards'}).finished.then(()=>veil.remove())};
  if(location.hash!==href){leave();return} // user went Back mid-beat
  render();previousId=href.slice(1);
  glyph.classList.add('play');setTimeout(leave,600);
 });
});
window.addEventListener('hashchange',()=>{
 const nextId=location.hash.slice(1)||'home';
 const start=document.querySelector(`.topic-link[href="#${nextId}"]`);
 const endId=previousId;
 if(!reduce.matches&&document.startViewTransition){
  if(start)start.style.viewTransitionName='selected-topic';
  if(nextId==='home')main.style.viewTransitionName='selected-topic';
  const transition=document.startViewTransition(()=>{render();if(nextId==='home'){main.style.viewTransitionName='';const target=document.querySelector(`.topic-link[href="#${endId}"]`);if(target)target.style.viewTransitionName='selected-topic'}else{main.style.viewTransitionName='selected-topic'}});
  transition.ready.catch(()=>{}); // aborted when the tab is hidden; the page still renders
  transition.finished.finally(()=>{main.style.viewTransitionName='';document.querySelectorAll('.topic-link').forEach(x=>x.style.viewTransitionName='')});
 }else render();
 previousId=nextId;
});
setLang(pickLang());render();

// Mail links: some browsers have no mail app set up, so the clicked button grows into a dark cover showing the address
// large (click to copy), then the mailto is handed off. Any click outside the address, or Esc, shrinks it back.
let mailVeil=null;
// scrollbar-gutter:stable keeps the layout width, so this only hides the bar drawn over the cover's right edge
const setScrollLock=on=>document.documentElement.classList.toggle('mail-open',on);
// measured against the veil itself: it is fixed, so its width excludes the scrollbar and innerWidth would land 15px off
const btnClip=(v,r,rad)=>`inset(${r.top}px ${v.clientWidth-r.right}px ${v.clientHeight-r.bottom}px ${r.left}px round ${rad}px)`;
function closeMail(){const v=mailVeil;if(!v)return;mailVeil=null;v.classList.remove('is-on');v._from.focus({preventScroll:true});
 // the scrollbar stays hidden until the cover is gone: brought back earlier, it pops in over the dark cover's right edge
 const done=()=>{v.remove();setScrollLock(false)};
 if(reduce.matches){done();return}
 v.animate({clipPath:['inset(0px 0px 0px 0px round 0px)',btnClip(v,v._from.getBoundingClientRect(),8)]},{duration:380,delay:120,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'}).finished
  // the cover lands on the button as a blank dark box; fade it so the label shows through instead of popping in
  .then(()=>v.animate({opacity:[1,0]},{duration:140,easing:'ease-out',fill:'forwards'}).finished).then(done)}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href^="mailto:"]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
 e.preventDefault();if(mailVeil)return;
 const addr=a.getAttribute('href').slice(7).split('?')[0],v=mailVeil=document.createElement('div');
 v.className='mail-veil';v.setAttribute('role','dialog');v.setAttribute('aria-label',T.mailAria);v._from=a;
 v.innerHTML=`<div class="mail-box"><button type="button" class="mail-addr" data-copy="${esc(addr)}" aria-label="${esc(fill(T.copyAria,{addr}))}">${esc(addr)}</button></div>`;
 v.onclick=ev=>{if(!ev.target.closest('.mail-addr'))closeMail()};
 document.body.append(v);v.querySelector('.mail-addr').focus({preventScroll:true});
 const go=()=>{if(mailVeil!==v)return;setScrollLock(true);location.href=a.href};
 if(reduce.matches){v.classList.add('is-on');go();return}
 v.animate({clipPath:[btnClip(v,a.getBoundingClientRect(),8),'inset(0px 0px 0px 0px round 0px)']},{duration:500,easing:'cubic-bezier(.2,0,0,1)',fill:'forwards'}).finished.then(go);
 requestAnimationFrame(()=>v.classList.add('is-on'));
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMail()});
