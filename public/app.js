// Free‑Text Finder + Bilingual Autocomplete
const CONFIG = { GOOGLE_MAPS_API_KEY: 'AIzaSyAEb6TbKs1ex-9S8PQe2bd9k8oaXe34goQ', EDAMAM_APP_ID: '', EDAMAM_APP_KEY: '' };
const DEFAULT_CENTER = { name: 'Yangon', lat: 16.8409, lng: 96.1735 };
const SUGGESTIONS = ['fried rice','mohinga','shan noodle','ramen','sushi','bbq','hotpot','noodle','curry','tea shop','juice','dessert'];
// Autocomplete vocabulary (MM + EN). Add as many as you like.
const VOCAB = [
  // Burmese core
  'မုန့်ဟင်းခါး','မုန့်တီ','မုန့်ချိုးလိမ်','မုန့်လှော်','မုန့်သလောက်','ကော်ဖီ','လ်ဘက်ရည်','နို့ဆီကျို','ရေညှိထမင်း','ထမင်းကြော်','ရှမ်းခေါက်ဆွဲ','လက်ဖက်သုပ်','ငပိသုပ်','ဝက်သားကာဘော','ကြက်သားခေါက်ဆွဲ','ခေါက်ဆွဲသုတ်','ကောက်ညှင်းပေါင်း','အုန်းနို့သုပ်',
  // Drinks / desserts
  'မာလကာသီးဖျော်ရည်','မန်ကျည်းဖျော်ရည်','သရက်သီးဖျော်ရည်','လေမုန်အေး','ခင်မင့်','ရှားဆီဖျော်ရည်','ဘိုဘိုတီ','ရှပ်ပီ','ရှပ်ပီအေး',
  // English
  'mohinga','mont ti','fried rice','shan noodle','tea leaf salad','fish curry','pork curry','beef curry','grilled pork','barbecue','bbq',
  'coffee','milk tea','bubble tea','boba','smoothie','mango juice','papaya juice','lemonade',
  'chicken noodle','korean noodle','ramen','udon','soba','sushi','donburi','curry rice','naan','biryani','tandoori',
  'burger','pizza','pasta','steak','salad','sandwich','dessert','ice cream'
];
// Myanmar → English hint groups (for query expansion)
const MM_HINTS = [
  { mm: ['ဖျော်ရည်','သီးဖျော်ရည်','မန်ကျည်း','မာလကာ'], en: ['juice','smoothie','fruit juice','mango','papaya'] },
  { mm: ['ခေါက်ဆွဲ','ကြက်သားခေါက်ဆွဲ'], en: ['noodle','chicken noodle'] },
  { mm: ['သုပ်','ထမင်း'], en: ['salad','rice'] },
  { mm: ['မုန့်'], en: ['noodle','rice noodle','snack'] },
  { mm: ['ကော်ဖီ','လ်ဘက်ရည်'], en: ['coffee','milk tea','tea','latte'] },
];

const $ = (s,p=document)=>p.querySelector(s);
const $$ = (s,p=document)=>Array.from(p.querySelectorAll(s));
const el = (t,c)=>Object.assign(document.createElement(t),c?{className:c}:{});
const priceSymbols = n => n==null? '—' : '₭'.repeat(n).slice(0,4).replace(/₭/g,'$');
const navUrl = (lat,lng)=>`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const chip = (t)=>{const c=el('span','chip'); c.textContent=t; return c};

let map, places, center=DEFAULT_CENTER, results=[];
const FAV_KEY='wfe:fav'; let FAV = new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));
function saveFav(){localStorage.setItem(FAV_KEY, JSON.stringify([...FAV]));}

// ===================== Maps Init =====================
window.__WFE_onMapsReady=()=>{
  map=new google.maps.Map(document.getElementById('map'),{center,zoom:14});
  places=new google.maps.places.PlacesService(map);
  tryLocate();
};

function tryLocate(){
  if(!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos=>{
    center={name:'Here',lat:pos.coords.latitude,lng:pos.coords.longitude};
    map.setCenter({lat:center.lat,lng:center.lng});
  },()=>{}, {enableHighAccuracy:true,timeout:6000});
}

// ===================== Autocomplete =====================
const acList = $('#acList');
const input = $('#dish');
let acIndex = -1;

function makeSuggestions(query){
  const q = (query||'').trim().toLowerCase();
  if (!q) return [];
  // rank: startsWith > includes; limit 12
  const starts = VOCAB.filter(v=> v.toLowerCase().startsWith(q));
  const inc = VOCAB.filter(v=> !v.toLowerCase().startsWith(q) && v.toLowerCase().includes(q));
  const pool = [...new Set([...starts, ...inc])];
  return pool.slice(0, 12);
}

function showAC(items){
  acList.innerHTML='';
  if (!items.length){ acList.hidden=true; return; }
  items.forEach((txt,i)=>{
    const li = document.createElement('li');
    li.role='option';
    li.textContent = txt;
    if (i===acIndex) li.setAttribute('aria-selected','true');
    li.addEventListener('mousedown', e=>{ e.preventDefault(); input.value = txt; acList.hidden=true; });
    li.addEventListener('click', ()=> { input.value = txt; acList.hidden=true; search(); });
    acList.appendChild(li);
  });
  acList.hidden=false;
}

input.addEventListener('input', ()=>{
  acIndex = -1;
  showAC(makeSuggestions(input.value));
});
input.addEventListener('keydown', (e)=>{
  const items = [...acList.querySelectorAll('li')];
  if (e.key==='ArrowDown'){ e.preventDefault(); acIndex = Math.min(items.length-1, acIndex+1); showAC(items.map(it=>it.textContent)); }
  else if (e.key==='ArrowUp'){ e.preventDefault(); acIndex = Math.max(0, acIndex-1); showAC(items.map(it=>it.textContent)); }
  else if (e.key==='Enter'){
    if (!acList.hidden && acIndex>=0){ e.preventDefault(); input.value = items[acIndex].textContent; acList.hidden=true; search(); }
  } else if (e.key==='Escape'){ acList.hidden=true; }
});
document.addEventListener('click', (e)=>{ if (!e.target.closest('.ac')) acList.hidden = true; });

// ===================== Query Expansion =====================
function expandQueries(raw){
  const term=(raw||'').trim();
  const variants=new Set();
  const gens=['restaurant','food','shop','place','cafe','drink','dessert','noodle','rice','juice'];
  if(!term){
    variants.add(SUGGESTIONS[Math.floor(Math.random()*SUGGESTIONS.length)]);
  }else{
    variants.add(term);
    gens.forEach(g=> variants.add(`${term} ${g}`));
    const hasMM = /[\u1000-\u109F]/.test(term);
    if(hasMM){
      for(const hint of MM_HINTS){
        if(hint.mm.some(m=> term.includes(m))) hint.en.forEach(e=> variants.add(e));
      }
      ['restaurant','food','juice','noodle','salad'].forEach(e=> variants.add(`${term} ${e}`));
    }else{
      ['ရောင်းသော','စားသောက်','မြန်မာ','ကိုရီးယား','တာိုင်','အိန္ဒိယ'].forEach(mm=> variants.add(`${term} ${mm}`));
    }
  }
  return [...variants].slice(0,10);
}

// ===================== Search (multi) =====================
$('#btnSearch').addEventListener('click', search);
input.addEventListener('keydown', e=>{ if(e.key==='Enter' && acList.hidden) search(); });
$('#btnLocate').addEventListener('click', ()=>{
  if(!navigator.geolocation){ alert('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    center={name:'Here',lat:pos.coords.latitude,lng:pos.coords.longitude};
    map.setCenter({lat:center.lat,lng:center.lng});
    search();
  }, err=> alert('Location denied'), {enableHighAccuracy:true, timeout:8000});
});

function search(){
  const raw = input.value;
  const queries = expandQueries(raw);
  if(!raw) $('#suggestBar').textContent = `Tip: Searching popular nearby: “${queries[0]}”`;
  else $('#suggestBar').textContent = `Trying: ${queries.map(q=>`“${q}”`).join(' · ')}`;
  $('#countBar').textContent = 'Searching…';
  runTextSearches(queries).then(list=>{
    results = list;
    applyFiltersAndRender(raw || queries[0]);
  }).catch(()=>{
    results = []; render([], raw); $('#countBar').textContent = 'No results.';
  });
}

async function runTextSearches(qList){
  const seen=new Set(); const out=[];
  for(const q of qList){
    const res = await new Promise((resolve)=>{
      const request = { query: q, location: new google.maps.LatLng(center.lat, center.lng), radius: 15000 };
      places.textSearch(request, (arr,status)=>{
        if(status !== google.maps.places.PlacesServiceStatus.OK || !arr) return resolve([]);
        resolve(arr);
      });
    });
    const detailed = (await Promise.allSettled(res.map(r=> getPlaceDetails(r.place_id)))).filter(x=>x.status==='fulfilled').map(x=>x.value);
    for(const p of detailed){ if(!seen.has(p.id)){ seen.add(p.id); out.push(p); } }
    if(out.length>=30) break;
  }
  return out;
}

function getPlaceDetails(placeId){
  return new Promise((resolve,reject)=>{
    places.getDetails({
      placeId,
      fields: ['name','rating','price_level','photos','geometry','formatted_address','opening_hours','website','user_ratings_total']
    }, (p, status)=>{
      if(status !== google.maps.places.PlacesServiceStatus.OK || !p) return reject(status);
      const photoUrl = p.photos && p.photos.length ? p.photos[0].getUrl({maxWidth:900,maxHeight:600}) : '';
      resolve({
        id: placeId,
        name: p.name,
        rating: p.rating||null,
        ratings: p.user_ratings_total||0,
        price_level: p.price_level??null,
        photo: photoUrl,
        lat: p.geometry?.location?.lat(),
        lng: p.geometry?.location?.lng(),
        addr: p.formatted_address||'',
        openNow: p.opening_hours?.isOpen?.() ?? null,
        website: p.website||''
      });
    });
  });
}

// ===================== Filters & Render =====================
$$('.f').forEach(cb=> cb.addEventListener('change', ()=> applyFiltersAndRender($('#dish').value)));
$('#dlgClose').addEventListener('click', ()=> $('#dlg').close());

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
  const grid = $('#grid'); grid.innerHTML='';
  const tpl = $('#cardTpl');
  list.forEach(r=>{
    const node = tpl.content.cloneNode(true);
    const img = node.querySelector('.img'); img.src = r.photo || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop'; img.alt = r.name;
    node.querySelector('.title').textContent = r.name;
    node.querySelector('.badge').textContent = `Near you`;
    node.querySelector('.addr').textContent = r.addr || '';
    const pillRow = node.querySelector('.pill-row');
    const p = el('span','pill'); p.textContent = `${r.rating??'—'}★ (${r.ratings||0})`; pillRow.appendChild(p);
    const p2 = el('span','pill'); p2.textContent = `price: ${priceSymbols(r.price_level)}`; pillRow.appendChild(p2);
    if (r.openNow !== null){ const p3 = el('span','pill'); p3.textContent = r.openNow? 'Open now' : 'Closed'; pillRow.appendChild(p3); }
    const btnNav = node.querySelector('.map'); btnNav.href = navUrl(r.lat, r.lng);
    const btnSite = node.querySelector('.site'); if (r.website) { btnSite.href = r.website; } else { btnSite.style.display='none'; }
    node.querySelector('.details').addEventListener('click', ()=> openDetails(term||r.name));
    const favBtn = node.querySelector('.fav'); const favKey = `${r.name}|${r.addr}`;
    favBtn.textContent = FAV.has(favKey)? '★':'☆';
    favBtn.addEventListener('click', ()=>{ if(FAV.has(favKey)) FAV.delete(favKey); else FAV.add(favKey); saveFav(); updateFavUI(); render(list, term); });
    grid.appendChild(node);
  });
  $('#countBar').textContent = `${list.length} result(s) for “${(term||'popular nearby').trim()}”`;
}

function updateFavUI(){
  const ul = $('#favList'); ul.innerHTML='';
  [...FAV].forEach(k=>{
    const li = el('li');
    const a = el('a'); a.href='#'; a.textContent = k; a.addEventListener('click', e=>{e.preventDefault();});
    const rm = el('button','icon-btn'); rm.textContent='✕'; rm.addEventListener('click', ()=>{FAV.delete(k); saveFav(); updateFavUI();});
    li.append(a,rm); ul.appendChild(li);
  });
}
updateFavUI();

// ===================== Details (generic) =====================
async function openDetails(rawTerm){
  const body = $('#dlgBody'); body.innerHTML='';
  const head = el('div','recipe-head');
  const title = el('h4'); title.textContent = rawTerm || 'Dish details';
  const meta = el('div','recipe-meta'); meta.append(chip('Free‑text search'), chip('Nearby places'));
  head.append(title, meta);
  const note = document.createElement('p'); note.className='muted'; note.textContent = 'Tips: Menu photos & staff can confirm availability.';
  body.append(head, note);
  if (CONFIG.EDAMAM_APP_ID && CONFIG.EDAMAM_APP_KEY && rawTerm){
    try{
      const q = encodeURIComponent(rawTerm);
      const url = `https://api.edamam.com/api/nutrition-data?app_id=${CONFIG.EDAMAM_APP_ID}&app_key=${CONFIG.EDAMAM_APP_KEY}&ingr=1%20${q}`;
      const data = await fetch(url).then(r=>r.json());
      const more = document.createElement('p'); more.className='muted'; more.textContent = `Est. calories: ${Math.round(data.calories||0)} kcal (Edamam approx)`; body.append(more);
    }catch(e){}
  }
  document.getElementById('dlgTitle').textContent = 'Details';
  document.getElementById('dlg').showModal();
}
