'use strict';
let data;
const main=document.querySelector('#main');
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=value=>{const d=new Date(value+'T12:00:00');return isNaN(d)?value:d.toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'});};
let savedTheme;try{savedTheme=localStorage.getItem('theme');}catch{}
document.documentElement.dataset.theme=savedTheme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
document.querySelector('#theme').onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('theme',theme);}catch{}};
function controls(kind){return `<div class="tools"><input id="search" type="search" aria-label="Search ${kind}" placeholder="Search ${kind}…"><select id="sort" aria-label="Sort ${kind}">${kind==='essays'?'<option value="newest">Newest first</option><option value="alpha">Alphabetical</option>':'<option value="original">Collection order</option><option value="author">By author</option>'}</select></div><div id="results" aria-live="polite"></div>`;}
function render(){
 const route=location.hash.slice(1)||'essays';const [section,id]=route.split('/');
 document.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.title=data.config.title;
 if(section==='about'){
  main.innerHTML=`<article><div class="eyebrow">The person behind the pages</div><h1>About</h1><p class="meta">${escapeHTML(data.config.author)}</p><div class="body">${data.about}</div></article>`;return;
 }
 if(section==='essays'&&id){
  const essay=data.essays.find(e=>e.id===decodeURIComponent(id));
  if(!essay){main.innerHTML='<h1>Page not found</h1><p><a href="#essays">Return to essays →</a></p>';return;}
  document.title=essay.title+' · '+data.config.title;
  main.innerHTML=`<article><a class="back" href="#essays">← All essays</a><h1>${escapeHTML(essay.title)}</h1><p class="meta">${escapeHTML(dateLabel(essay.date))}</p><div class="body">${essay.body}</div></article>`;return;
 }
 const kind=section==='quotes'?'quotes':'essays';
 main.innerHTML=`<div class="eyebrow">${kind==='essays'?'A place to think out loud':'A commonplace collection'}</div><h1>${kind==='essays'?'Essays & notes':'Words worth keeping'}</h1><p class="intro">${kind==='essays'?escapeHTML(data.config.description):'Passages that linger. Ideas to revisit. A collection gathered along the way.'}</p>${controls(kind)}`;
 function update(){
  const query=document.querySelector('#search').value.toLowerCase().trim();const sort=document.querySelector('#sort').value;
  let items=data[kind].filter(item=>[item.title,item.summary,item.text,item.author,item.source,...(item.tags||[])].filter(Boolean).join(' ').toLowerCase().includes(query));
  if(sort==='newest')items.sort((a,b)=>b.date.localeCompare(a.date));
  if(sort==='alpha')items.sort((a,b)=>a.title.localeCompare(b.title));
  if(sort==='author')items.sort((a,b)=>a.author.localeCompare(b.author));
  document.querySelector('#results').innerHTML=items.length?items.map(item=>kind==='essays'?`<div class="entry"><div><h2><a href="#essays/${encodeURIComponent(item.id)}">${escapeHTML(item.title)}</a></h2>${item.summary?`<p>${escapeHTML(item.summary)}</p>`:''}</div><time datetime="${escapeHTML(item.date)}">${escapeHTML(dateLabel(item.date))}</time></div>`:`<figure class="quote"><blockquote>${escapeHTML(item.text)}</blockquote><figcaption>— ${escapeHTML(item.author)}${item.source?`, <cite>${escapeHTML(item.source)}</cite>`:''}</figcaption>${(item.tags||[]).map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</figure>`).join(''):`<p class="empty">${query?'No matches. Try another search.':kind==='essays'?'The first essay is still to come.':'The collection begins with the first quote.'}</p>`;
 }
 document.querySelector('#search').oninput=update;document.querySelector('#sort').onchange=update;update();
}
fetch('data.json').then(response=>{if(!response.ok)throw Error('Could not load collection');return response.json();}).then(value=>{data=value;document.querySelector('.brand').textContent=data.config.title;render();window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});}).catch(()=>{main.innerHTML='<h1>Unable to load the collection</h1><p>Please refresh the page to try again.</p>';});
