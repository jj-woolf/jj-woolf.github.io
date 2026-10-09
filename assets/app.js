'use strict';
let data;
const main=document.querySelector('#main');
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=value=>{const d=new Date(value+'T12:00:00');return isNaN(d)?value:d.toLocaleDateString('es-AR',{month:'short',day:'numeric',year:'numeric'});};
function publicationDetails(item){
 const parts=[];
 if(item.date)parts.push(`<time datetime="${escapeHTML(item.date)}">${escapeHTML(dateLabel(item.date))}</time>`);
 if(item.uploaded_by)parts.push(`<span>${escapeHTML(item.uploaded_by)}</span>`);
 return parts.length?`<div class="publication-meta">${parts.join('<span class="publication-separator" aria-hidden="true">—</span>')}</div>`:'';
}
let savedTheme;try{savedTheme=localStorage.getItem('theme');}catch{}
document.documentElement.dataset.theme=savedTheme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
document.querySelector('#theme').onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('theme',theme);}catch{}};
function controls(kind){const label={essays:'notas',poetry:'poesía',quotes:'citas'}[kind];return `<div class="tools"><input id="search" type="search" aria-label="Buscar ${label}" placeholder="Buscar ${label}…"><select id="sort" aria-label="Ordenar ${label}">${kind==='poetry'?'<option value="alpha">Por título</option><option value="author">Por autor</option>':kind==='essays'?'<option value="newest">Más recientes</option><option value="alpha">Orden alfabético</option>':'<option value="original">Orden de la colección</option><option value="author">Por autor</option>'}</select></div><div id="results" aria-live="polite"></div>`;}
function render(){
 const route=location.hash.slice(1)||'essays';const [section,id]=route.split('/');
 document.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.title=data.config.title;
 if(section==='poetry'&&id){
  const poem=data.poetry.find(p=>p.id===decodeURIComponent(id));
  if(!poem){main.innerHTML='<h1>No se encontró el poema</h1><p><a href="#poetry">Volver a poesía →</a></p>';return;}
  document.title=poem.title+' · '+data.config.title;
  main.innerHTML=`<article><a class="back" href="#poetry">← Todos los poemas</a><h1>${escapeHTML(poem.title)}</h1><p class="poem-author">${escapeHTML(poem.author)}</p>${publicationDetails(poem)}<div class="poem-text">${escapeHTML(poem.text)}</div></article>`;return;
 }
 if(section==='essays'&&id){
  const essay=data.essays.find(e=>e.id===decodeURIComponent(id));
  if(!essay){main.innerHTML='<h1>No se encontró la página</h1><p><a href="#essays">Volver a notas →</a></p>';return;}
  document.title=essay.title+' · '+data.config.title;
  main.innerHTML=`<article><a class="back" href="#essays">← Todas las notas</a><h1>${escapeHTML(essay.title)}</h1>${publicationDetails(essay)}<div class="body">${essay.body}</div></article>`;return;
 }
 const kind=section==='poetry'?'poetry':section==='quotes'?'quotes':'essays';
 const heading=kind==='poetry'?'Buena poesía':kind==='quotes'?'La pared de Seymour y Buddy':'<em>La Fiche</em>';
 if(!data[kind].length){
  const message=kind==='poetry'?'El primer poema está por llegar.':kind==='essays'?'La primera nota está por llegar.':'La colección comienza con la primera cita.';
  main.innerHTML=`<h1>${heading}</h1><p class="empty">${message}</p>`;return;
 }
 main.innerHTML=`<h1>${heading}</h1>${controls(kind)}`;
 function update(){
  const query=document.querySelector('#search').value.toLowerCase().trim();const sort=document.querySelector('#sort').value;
  let items=data[kind].filter(item=>[item.title,item.summary,item.text,item.author,item.source,item.uploaded_by,...(item.tags||[])].filter(Boolean).join(' ').toLowerCase().includes(query));
  if(sort==='newest')items.sort((a,b)=>b.date.localeCompare(a.date));
  if(sort==='alpha')items.sort((a,b)=>a.title.localeCompare(b.title));
  if(sort==='author')items.sort((a,b)=>a.author.localeCompare(b.author));
  document.querySelector('#results').innerHTML=items.length?items.map(item=>kind==='poetry'?`<div class="entry"><div><h2><a href="#poetry/${encodeURIComponent(item.id)}">${escapeHTML(item.title)}</a></h2><p class="poem-list-author">${escapeHTML(item.author)}</p>${publicationDetails(item)}</div></div>`:kind==='essays'?`<div class="entry"><div><h2><a href="#essays/${encodeURIComponent(item.id)}">${escapeHTML(item.title)}</a></h2>${item.summary?`<p>${escapeHTML(item.summary)}</p>`:''}${publicationDetails(item)}</div></div>`:`<figure class="quote"><blockquote><span class="quote-stanza">${escapeHTML(item.text).split(/\n\n+/).join('</span><span class="quote-stanza">')}</span></blockquote><figcaption><span class="quote-author">${escapeHTML(item.author)}</span>${item.source?`<span class="quote-attribution-separator"> · </span><cite class="quote-source">${escapeHTML(item.source)}</cite>`:''}</figcaption><div class="quote-bottom">${item.tags?.length?`<div class="quote-tags">${item.tags.map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</div>`:''}${publicationDetails(item)}</div></figure>`).join(''):`<p class="empty">${query?'No hay coincidencias. Probá otra búsqueda.':kind==='poetry'?'El primer poema está por llegar.':kind==='essays'?'La primera nota está por llegar.':'La colección comienza con la primera cita.'}</p>`;
 }
 document.querySelector('#search').oninput=update;document.querySelector('#sort').onchange=update;update();
}
fetch('data.json').then(response=>{if(!response.ok)throw Error('Could not load collection');return response.json();}).then(value=>{data=value;document.querySelector('.brand').textContent=data.config.title;render();window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});}).catch(()=>{main.innerHTML='<h1>No se pudo cargar la colección</h1><p>Actualizá la página para volver a intentarlo.</p>';});
