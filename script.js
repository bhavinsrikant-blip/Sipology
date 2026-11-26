import { supabase, supabaseConfigured } from './src/supabaseClient.js';
import { fallbackMenu } from './src/menuData.js';

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
function setNavigation(open) { if (!toggle || !nav) return; nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); }
toggle?.addEventListener('click', () => setNavigation(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNavigation(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav?.classList.contains('open')) { setNavigation(false); toggle?.focus(); } });

const tabs = [...document.querySelectorAll('.menu-tab')];
const menuGrid = document.querySelector('#menu-grid');
function activateTab(tab, moveFocus = false) {
  if (!tab) return;
  const filter = tab.dataset.filter;
  tabs.forEach(item => { const active = item === tab; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
  if (menuGrid) menuGrid.setAttribute('aria-labelledby', tab.id);
  menuGrid?.querySelectorAll('.menu-card').forEach(card => { const show = filter === 'all' || card.dataset.category === filter || (filter === 'coffee' && card.dataset.category === 'drinks'); card.classList.toggle('hide', !show); card.setAttribute('aria-hidden', String(!show)); });
  if (moveFocus) tab.focus();
}
tabs.forEach((tab, index) => { tab.addEventListener('click', () => activateTab(tab)); tab.addEventListener('keydown', event => { let nextIndex = index; if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length; else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length; else if (event.key === 'Home') nextIndex = 0; else if (event.key === 'End') nextIndex = tabs.length - 1; else return; event.preventDefault(); activateTab(tabs[nextIndex], true); }); });

function safeImageUrl(value) { try { const u = new URL(value, location.origin); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
function createCard(item) {
  const card = document.createElement('article'); card.className='menu-card'; card.dataset.category=item.category;
  const imageWrap=document.createElement('div'); imageWrap.className='menu-image';
  if (item.image_url && safeImageUrl(item.image_url)) { const img=document.createElement('img'); img.loading='lazy'; img.decoding='async'; img.src=safeImageUrl(item.image_url); img.alt=item.name; imageWrap.append(img); }
  if(item.tag){ const tag=document.createElement('span'); tag.className='tag'; tag.textContent=item.tag; imageWrap.append(tag); }
  const info=document.createElement('div'); info.className='menu-info'; const descWrap=document.createElement('div'); const h=document.createElement('h3'); h.textContent=item.name; const d=document.createElement('p'); d.textContent=item.description||''; descWrap.append(h,d); const price=document.createElement('b'); price.textContent=`₹${Number(item.price).toLocaleString('en-IN')}`; info.append(descWrap,price); card.append(imageWrap,info); return card;
}
async function loadPublicSettings(){ if(!supabaseConfigured)return; try{const {data,error}=await supabase.from('cafe_settings').select('cafe_name,cafe_slug').eq('id',1).maybeSingle();if(error||!data?.cafe_name)return;document.title=`${data.cafe_name} — Coffee, made personal`;document.querySelectorAll('.brand span:not(.brand-mark)').forEach(el=>{const small=el.querySelector('small');el.childNodes[0].textContent=data.cafe_name.toUpperCase();});document.querySelectorAll('.map-label b').forEach(el=>el.textContent=data.cafe_name.toUpperCase());document.querySelectorAll('.quote-credit').forEach(el=>el.textContent=data.cafe_name.toUpperCase());}catch(e){console.warn('Cafe profile unavailable',e);} }
async function loadPublicMenu(){
  if(!menuGrid) return;
  if(supabaseConfigured){ try { const {data,error}=await supabase.from('menu_items').select('name,description,category,price,image_url,tag,active,sort_order').eq('active',true).order('sort_order'); if(error) throw error; if(data?.length){ menuGrid.replaceChildren(...data.map(createCard)); activateTab(document.querySelector('.menu-tab.active')||tabs[0]); } } catch(error){ console.warn('Using fallback menu while remote menu is unavailable:',error.message); } }
}
loadPublicSettings();
loadPublicMenu();
