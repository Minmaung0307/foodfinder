// Free-Text Finder + Bilingual Autocomplete (Fixed)
// - All DOM lookups happen after DOMContentLoaded
// - Global Maps callback exposed on window
// - No "input before initialization" errors
// - Single source of truth for event bindings

// ===================== CONFIG & DATA =====================
const CONFIG = { GOOGLE_MAPS_API_KEY: 'AIzaSyAEb6TbKs1ex-9S8PQe2bd9k8oaXe34goQ', EDAMAM_APP_ID: '', EDAMAM_APP_KEY: '' };
const DEFAULT_CENTER = { name: 'Yangon', lat: 16.8409, lng: 96.1735 };
const SUGGESTIONS = ['fried rice','mohinga','shan noodle','ramen','sushi','bbq','hotpot','noodle','curry','tea shop','juice','dessert'];

const VOCAB = [
  // Burmese core
  'မုန့်ဟင်းခါး','မုန့်တီ','မုန့်ချိုးလိမ်','မုန့်လှော်','မုန့်သလောက်','ကော်ဖီ','လ်ဘက်ရည်','နို့ဆီကျို','ရေညှိထမင်း','ထမင်းကြော်','ရှမ်းခေါက်ဆွဲ','လက်ဖက်သုပ်','ငပိသုပ်','ဝက်သားကာဘော','ကြက်သားခေါက်ဆွဲ','ခေါက်ဆွဲသုတ်','ကောက်ညှင်းပေါင်း','အုန်းနို့သုပ်',
  // Drinks / desserts
  'မာလကာသီးဖျော်ရည်','မန်ကျည်းဖျော်ရည်','သရက်သီးဖျော်ရည်','လေမုန်အေး','ခင်မင့်','ရှားဆီဖျော်ရည်','ဘိုဘိုတီ','ရှပ်ပီ','ရှပ်ပီအေး',
  'ကော်ဖီ','လ်ဘက်ရည်','ဘိုဘိုတီ','ရှပ်ပီ','မန်ကျည်းဖျော်ရည်','မာလကာသီးဖျော်ရည်','လေမုန်အေး',
  // Popular MM foods
  'ထမင်းကြော်','ရေညှိထမင်း','ရှမ်းခေါက်ဆွဲ','လက်ဖက်သုပ်','ငပိသုပ်',
  // English
  'mohinga','mont ti','fried rice','shan noodle','tea leaf salad','fish curry','pork curry','beef curry','grilled pork','barbecue','bbq',
  'coffee','milk tea','bubble tea','boba','smoothie','mango juice','papaya juice','lemonade',
  'chicken noodle','korean noodle','ramen','udon','soba','sushi','donburi','curry rice','naan','biryani','tandoori',
  'fried rice','shan noodle','tea leaf salad','ramen','udon','soba',
  'burger','pizza','pasta','steak','salad','sandwich','dessert','ice cream'
];

// prefix-first suggestions
function makeSuggestions(q){
  const s = (q||'').trim().toLowerCase();
  if (!s) return [];
  const starts = VOCAB.filter(v=> v.toLowerCase().startsWith(s));
  const inc = VOCAB.filter(v=> !v.toLowerCase().startsWith(s) && v.toLowerCase().includes(s));
  return [...new Set([...starts, ...inc])].slice(0, 12);
}

// ====== Query expansion (keeps your free-text power) ======
const MM_HINTS = [
  { mm: ['ဖျော်ရည်','သီးဖျော်ရည်','မန်ကျည်း','မာလကာ'], en: ['juice','smoothie','fruit juice','mango','papaya'] },
  { mm: ['ခေါက်ဆွဲ','ကြက်သားခေါက်ဆွဲ'], en: ['noodle','chicken noodle'] },
  { mm: ['သုပ်','ထမင်း'], en: ['salad','rice'] },
  { mm: ['မုန့်'], en: ['noodle','rice noodle','snack'] },
  { mm: ['ကော်ဖီ','လ်ဘက်ရည်'], en: ['coffee','milk tea','tea','latte'] },
];

// ===================== HELPERS =====================
const $ = (s,p=document)=>p.querySelector(s);
const $$ = (s,p=document)=>Array.from(p.querySelectorAll(s));
const el = (t,c)=>Object.assign(document.createElement(t),c?{className:c}:{});
const priceSymbols = n => n==null? '—' : '₭'.repeat(n).slice(0,4).replace(/₭/g,'$');
const navUrl = (lat,lng)=>`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const chip = (t)=>{const c=el('span','chip'); c.textContent=t; return c};

// ===================== STATE =====================
let map, places, center=DEFAULT_CENTER, results=[];
const FAV_KEY='wfe:fav';
let FAV = new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));
function saveFav(){localStorage.setItem(FAV_KEY, JSON.stringify([...FAV]));}

// ===================== MAPS CALLBACK =====================
window.__WFE_onMapsReady = function(){
  if (!window.google || !google.maps) return;
  const mapEl = document.getElementById('map');
  if (mapEl){
    map = new google.maps.Map(mapEl, { center, zoom: 14 });
    places = new google.maps.places.PlacesService(map);
  }
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      pos=>{ center={name:'Here',lat:pos.coords.latitude,lng:pos.coords.longitude}; map && map.setCenter(center); },
      ()=>{}, {enableHighAccuracy:true, timeout:6000}
    );
  }
};

function tryLocate(){
  if(!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos=>{
    center={name:'Here',lat:pos.coords.latitude,lng:pos.coords.longitude};
    if (map) map.setCenter({lat:center.lat,lng:center.lng});
  },()=>{}, {enableHighAccuracy:true,timeout:6000});
}

// ===================== AUTOCOMPLETE CORE (pure) =====================
function makeSuggestions(query){
  const q = (query||'').trim().toLowerCase();
  if (!q) return [];
  const starts = VOCAB.filter(v=> v.toLowerCase().startsWith(q));
  const inc = VOCAB.filter(v=> !v.toLowerCase().startsWith(q) && v.toLowerCase().includes(q));
  return [...new Set([...starts, ...inc])].slice(0,12);
}

function expandQueries(raw){
  const term=(raw||'').trim();
  const variants=new Set();
  const gens=['restaurant','food','shop','cafe','drink','dessert','noodle','rice','juice'];
  if(!term){ variants.add(SUGGESTIONS[Math.floor(Math.random()*SUGGESTIONS.length)]); }
  else{
    variants.add(term);
    gens.forEach(g=> variants.add(`${term} ${g}`));
    const hasMM=/[\u1000-\u109F]/.test(term);
    if(hasMM){
      for(const hint of MM_HINTS){ if(hint.mm.some(m=>term.includes(m))) hint.en.forEach(e=>variants.add(e)); }
      ['restaurant','food','noodle','juice','salad'].forEach(e=> variants.add(`${term} ${e}`));
    }else{
      ['မြန်မာ','ကိုရီးယား','တာိုင်','အိန္ဒိယ'].forEach(mm=> variants.add(`${term} ${mm}`));
    }
  }
  return [...variants].slice(0,10);
}

// ===================== SEARCH FLOW (no global input dependencies) =====================
function search(){
  const inputEl = document.getElementById('dish'); if(!inputEl) return;
  const raw = inputEl.value;
  const queries = expandQueries(raw);
  const suggestBar=$('#suggestBar');
  if(suggestBar) suggestBar.textContent = raw
    ? `Trying: ${queries.map(q=>`“${q}”`).join(' · ')}`
    : `Tip: Searching popular nearby: “${queries[0]}”`;
  const countBar=$('#countBar'); if(countBar) countBar.textContent='Searching…';
  runTextSearches(queries).then(list=>{
    results=list; applyFiltersAndRender(raw||queries[0]);
  }).catch(()=>{
    results=[]; render([], raw); if(countBar) countBar.textContent='No results.';
  });
}

// ====== Places search core ======
async function runTextSearches(qList){
  if (!places) return [];
  const seen=new Set(); const out=[];
  for(const q of qList){
    const res = await new Promise(resolve=>{
      const req={ query:q, location:new google.maps.LatLng(center.lat,center.lng), radius:15000 };
      places.textSearch(req,(arr,status)=>{
        if(status !== google.maps.places.PlacesServiceStatus.OK || !arr) return resolve([]);
        resolve(arr);
      });
    });
    const detailed=(await Promise.allSettled(res.map(r=>getPlaceDetails(r.place_id))))
      .filter(x=>x.status==='fulfilled').map(x=>x.value);
    for(const p of detailed){ if(!seen.has(p.id)){ seen.add(p.id); out.push(p); } }
    if(out.length>=30) break;
  }
  return out;
}

function getPlaceDetails(placeId){
  return new Promise((resolve,reject)=>{
    places.getDetails({
      placeId,
      fields:['name','rating','price_level','photos','geometry','formatted_address','opening_hours','website','user_ratings_total']
    },(p,status)=>{
      if(status!==google.maps.places.PlacesServiceStatus.OK||!p) return reject(status);
      const photo = p.photos?.[0]?.getUrl({maxWidth:900,maxHeight:600}) || '';
      resolve({
        id:placeId, name:p.name, rating:p.rating??null, ratings:p.user_ratings_total||0,
        price_level:p.price_level??null, photo,
        lat:p.geometry?.location?.lat(), lng:p.geometry?.location?.lng(),
        addr:p.formatted_address||'', openNow:p.opening_hours?.isOpen?.() ?? null, website:p.website||''
      });
    });
  });
}

// ===================== FILTER & RENDER =====================
$$('.f').forEach(cb=> cb.addEventListener('change', ()=> applyFiltersAndRender($('#dish').value)));
$('#dlgClose')?.addEventListener('click', ()=> $('#dlg').close());

// ====== Render & filters (unchanged skeleton; keep your existing UI) ======
function applyFiltersAndRender(term){
  const flags = new Set($$('.f:checked').map(x=>x.value));
  let list = results.slice();
  if(flags.has('openNow')) list = list.filter(x=> x.openNow === true || x.openNow === null);
  const priceWanted = ['price1','price2','price3'].filter(f=>flags.has(f));
  if(priceWanted.length){
    const allow = new Set(priceWanted.map(f=> ({price1:0,price2:1,price3:2})[f]));
    list = list.filter(x=> allow.has(x.price_level));
  }
  if(flags.has('rating4')) list = list.filter(x=> (x.rating||0) >= 4);
  render(list, term);
}

function render(list, term){
  const grid=$('#grid'); if(!grid) return; grid.innerHTML='';
  const tpl=$('#cardTpl');
  list.forEach(r=>{
    const node=tpl.content.cloneNode(true);
    const img=node.querySelector('.img'); img.src=r.photo || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop'; img.alt=r.name;
    node.querySelector('.title').textContent=r.name;
    node.querySelector('.badge').textContent='Near you';
    node.querySelector('.addr').textContent=r.addr||'';
    const pillRow=node.querySelector('.pill-row');
    const p=el('span','pill'); p.textContent=`${r.rating??'—'}★ (${r.ratings||0})`; pillRow.appendChild(p);
    const p2=el('span','pill'); p2.textContent=`price: ${priceSymbols(r.price_level)}`; pillRow.appendChild(p2);
    if(r.openNow!==null){ const p3=el('span','pill'); p3.textContent=r.openNow?'Open now':'Closed'; pillRow.appendChild(p3); }
    node.querySelector('.map').href = navUrl(r.lat,r.lng);
    const site=node.querySelector('.site'); if(r.website) site.href=r.website; else site.style.display='none';
    node.querySelector('.details').addEventListener('click', ()=> openDetails(term||r.name));
    $('#grid').appendChild(node);
  });
  const countBar=$('#countBar'); if(countBar) countBar.textContent=`${list.length} result(s) for “${(term||'popular nearby').trim()}”`;
}

function updateFavUI(){
  const ul = $('#favList'); if (!ul) return; ul.innerHTML='';
  [...FAV].forEach(k=>{
    const li = el('li');
    const a = el('a'); a.href='#'; a.textContent = k; a.addEventListener('click', e=>{e.preventDefault();});
    const rm = el('button','icon-btn'); rm.textContent='✕'; rm.addEventListener('click', ()=>{FAV.delete(k); saveFav(); updateFavUI();});
    li.append(a,rm); ul.appendChild(li);
  });
}
updateFavUI();

// ===================== DETAILS =====================
function openDetails(rawTerm){
  const body=$('#dlgBody'); if(!body) return; body.innerHTML='';
  const head=el('div','recipe-head'); const title=el('h4'); title.textContent=rawTerm||'Details';
  const meta=el('div','recipe-meta'); meta.append(chip('Free-text search'), chip('Nearby places'));
  head.append(title, meta); body.append(head);
  const dlgTitleEl = document.getElementById('dlgTitle'); if (dlgTitleEl) dlgTitleEl.textContent = 'Details';
  const dlgEl = document.getElementById('dlg'); if (dlgEl && typeof dlgEl.showModal==='function') dlgEl.showModal();
}

// ===================== UI BINDINGS (MOBILE-FIRST) =====================
document.addEventListener('DOMContentLoaded', ()=>{
  const input = $('#dish');
  const btnSearch = $('#btnSearch');
  const acList = $('#acList');
  if(!input || !btnSearch || !acList) return;

  function doSearch(){
    const v=input.value.trim();
    if(!v) return;
    search(); // uses global search()
  }

  // Icon click
  btnSearch.addEventListener('click', doSearch);
  // Enter key
  input.addEventListener('keydown', e=>{
    if(e.key==='Enter'){
      // If AC visible & a row selected, choose it; else search
      const sel = acList.querySelector('li[aria-selected="true"]');
      if(sel){ input.value = sel.textContent; acList.hidden = true; }
      doSearch();
    }
  });

  // Autocomplete
  let acIndex=-1;
  function renderAC(items){
    acList.innerHTML='';
    if(!items.length){ acList.hidden=true; return; }
    items.forEach((t,i)=>{
      const li=document.createElement('li'); li.textContent=t; li.role='option';
      if(i===acIndex) li.setAttribute('aria-selected','true');
      li.addEventListener('mousedown', e=>{ e.preventDefault(); input.value=t; acList.hidden=true; doSearch(); });
      li.addEventListener('mouseenter', ()=>{ acIndex=i; refreshSel(); });
      acList.appendChild(li);
    });
    acList.hidden=false;
  }
  function refreshSel(){
    [...acList.children].forEach((li,i)=>{
      if(i===acIndex) li.setAttribute('aria-selected','true'); else li.removeAttribute('aria-selected');
    });
  }
  input.addEventListener('input', ()=>{ acIndex=-1; renderAC(makeSuggestions(input.value)); });
  input.addEventListener('keydown', e=>{
    if(acList.hidden) return;
    const items=[...acList.children];
    if(e.key==='ArrowDown'){ e.preventDefault(); acIndex=Math.min(items.length-1, acIndex+1); refreshSel(); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); acIndex=Math.max(0, acIndex-1); refreshSel(); }
    else if(e.key==='Escape'){ acList.hidden=true; }
  });
  document.addEventListener('click', e=>{ if(!e.target.closest('.ac')) acList.hidden=true; });
});