// World Food Explorer — Nearby Food Finder
// No city picker. Geolocate user → show nearest places by dish name (or popular nearby).
// Meal filters: breakfast/lunch/dinner. Aside filters: open now, price tiers, rating.

// ===================== CONFIG =====================
const CONFIG = {
  GOOGLE_MAPS_API_KEY: 'AIzaSyAEb6TbKs1ex-9S8PQe2bd9k8oaXe34goQ',
  EDAMAM_APP_ID: '',
  EDAMAM_APP_KEY: '',
};

// Default fallback center (Yangon) if user denies geolocation
const DEFAULT_CENTER = { name: 'Yangon', lat: 16.8409, lng: 96.1735 };

// Suggestions if user doesn't know the exact name
const SUGGESTIONS = ['fried rice','mohinga','shan noodle','ramen','sushi','bbq','hotpot','noodle','curry','tea shop'];

// Lightweight dish DB for details panel
const DISH_DB = {
  'mohinga': {
    name: 'မုန့်ဟင်းခါး (Mohinga)',
    ingredients: ['Rice noodles','Fish','Lemongrass','Ginger','Garlic','Shallot','Chickpea flour','Turmeric','Banana stem (opt)','Egg','Fritter'],
    nutrition: { kcal: 550, protein: 28, fat: 15, carbs: 75, sodium: 'moderate' },
    steps: ['Simmer fish with aromatics; flake.','Fry turmeric-shallot paste.','Thicken broth with chickpea/rice powder.','Serve over noodles with toppings.']
  },
  'fried rice': {
    name: 'ထမင်းကြော် (Fried Rice)',
    ingredients: ['Cooked rice','Egg','Garlic','Onion','Vegetables','Soy sauce','Oil'],
    nutrition: { kcal: 650, protein: 18, fat: 22, carbs: 95, sodium: 'moderate' },
    steps: ['Stir-fry aromatics','Add egg and scramble','Add rice + seasonings','Finish with veg']
  },
  'shan noodle': {
    name: 'ရှမ်းခေါက်ဆွဲ (Shan Noodle)',
    ingredients: ['Rice noodles','Tomato pork/tofu sauce','Garlic oil','Pickled greens','Peanuts'],
    nutrition: { kcal: 560, protein: 24, fat: 16, carbs: 80, sodium: 'moderate' },
    steps: ['Cook sauce','Boil noodles','Assemble bowl','Top with peanuts']
  }
};

// ===================== Helpers =====================
const $ = (s,p=document)=>p.querySelector(s);
const $$ = (s,p=document)=>Array.from(p.querySelectorAll(s));
const el = (t,c)=>Object.assign(document.createElement(t),c?{className:c}:{})
const priceSymbols = n => n==null? '—' : '₭'.repeat(n).slice(0,4).replace(/₭/g,'$');
const navUrl = (lat,lng)=>`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const chip = (t)=>{const c=el('span','chip'); c.textContent=t; return c};

function normalizeDishKey(t){
  const k = (t||'').toLowerCase().trim();
  if (k.includes('mohinga') || k.includes('မုန့်ဟင်း')) return 'mohinga';
  if (k.includes('fried rice') || k.includes('ထမင်းကြော်')) return 'fried rice';
  if (k.includes('shan')) return 'shan noodle';
  return k;
}

// ===================== State =====================
let map, places, center=DEFAULT_CENTER, results=[];
const FAV_KEY = 'wfe:fav';
let FAV = new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'));
function saveFav(){localStorage.setItem(FAV_KEY, JSON.stringify([...FAV]));}

// ===================== Maps Init =====================
window.__WFE_onMapsReady = () => {
  map = new google.maps.Map(document.getElementById('map'), { center, zoom: 14 });
  places = new google.maps.places.PlacesService(map);
  // Try geolocate on load (non-blocking)
  tryLocate();
};

function tryLocate(){
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos=>{
    center = { name:'Here', lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.setCenter({lat:center.lat, lng:center.lng});
  }, ()=>{/* ignore deny */}, { enableHighAccuracy:true, timeout:6000 });
}

// ===================== Search =====================
$('#btnSearch').addEventListener('click', search);
$('#dish').addEventListener('keydown', e=>{ if(e.key==='Enter') search(); });
$('#btnLocate').addEventListener('click', ()=> {
  if (!navigator.geolocation){ alert('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    center = { name:'Here', lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.setCenter({lat:center.lat, lng:center.lng});
    search(); // refresh search with better location
  }, err=> alert('Location denied'), { enableHighAccuracy:true, timeout:8000 });
});

function mealQuerySuffix(){
  const meals = new Set($$('.meal:checked').map(x=>x.value));
  if (!meals.size) return '';
  // Join meals as hints for Places text query
  return ' ' + [...meals].join(' ');
}

function buildQuery(term){
  let q = (term || '').trim();
  if (!q){
    // Suggest popular nearby query if user doesn't know exact name
    const pick = SUGGESTIONS[Math.floor(Math.random()*SUGGESTIONS.length)];
    $('#suggestBar').textContent = `Tip: Searching popular nearby: “${pick}”`;
    q = pick;
  } else {
    $('#suggestBar').textContent = '';
  }
  q += mealQuerySuffix();
  return q;
}

function search(){
  const term = $('#dish').value;
  const query = buildQuery(term);
  $('#countBar').textContent = 'Searching…';
  const request = {
    query,
    location: new google.maps.LatLng(center.lat, center.lng),
    radius: 15000, // 15km
  };
  places.textSearch(request, async (res, status)=>{
    if(status !== google.maps.places.PlacesServiceStatus.OK || !res){
      render([]); $('#countBar').textContent = 'No results.'; return;
    }
    // Get details per place
    const detailed = (await Promise.allSettled(res.map(r=> getPlaceDetails(r.place_id))))
      .filter(x=>x.status==='fulfilled').map(x=>x.value);
    results = detailed;
    applyFiltersAndRender(query);
  });
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

  // basic filters
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

    const favBtn = node.querySelector('.fav');
    const favKey = `${r.name}|${r.addr}`;
    favBtn.textContent = FAV.has(favKey)? '★':'☆';
    favBtn.addEventListener('click', ()=>{
      if(FAV.has(favKey)) FAV.delete(favKey); else FAV.add(favKey);
      saveFav(); updateFavUI(); render(list, term);
    });

    grid.appendChild(node);
  });
  $('#countBar').textContent = `${list.length} result(s) for “${(term||'popular nearby').trim()}”`;
}

function updateFavUI(){
  const ul = $('#favList'); ul.innerHTML='';
  [...FAV].forEach(k=>{
    const li = el('li');
    const a = el('a'); a.href='#'; a.textContent = k; a.addEventListener('click', e=>{e.preventDefault(); /* no-op */});
    const rm = el('button','icon-btn'); rm.textContent='✕'; rm.addEventListener('click', ()=>{FAV.delete(k); saveFav(); updateFavUI();});
    li.append(a,rm); ul.appendChild(li);
  });
}
updateFavUI();

// ===================== Details (Ingredients / Nutrition) =====================
async function openDetails(rawTerm){
  const key = normalizeDishKey(rawTerm);
  const base = DISH_DB[key];

  const body = $('#dlgBody'); body.innerHTML='';
  const head = document.createElement('div'); head.className='recipe-head';
  const title = document.createElement('h4'); title.textContent = base?.name || rawTerm;
  const meta = document.createElement('div'); meta.className='recipe-meta';

  if (base?.nutrition){
    meta.append(chip(`${base.nutrition.kcal} kcal`), chip(`${base.nutrition.protein}g protein`), chip(`${base.nutrition.fat}g fat`), chip(`${base.nutrition.carbs}g carbs`));
  }

  const hIng = document.createElement('h4'); hIng.textContent = '🛒 Ingredients';
  const ul = document.createElement('ul'); ul.className='shop-list';
  (base?.ingredients||['—']).forEach(x=>{const li=document.createElement('li'); li.textContent=x; ul.appendChild(li);});

  const hSteps = document.createElement('h4'); hSteps.textContent = '👩‍🍳 Steps';
  const ol = document.createElement('ol'); ol.className='steps';
  (base?.steps||['—']).forEach(s=>{const li=document.createElement('li'); li.textContent = s; ol.appendChild(li);});

  head.append(title, meta);
  body.append(head, hIng, ul, hSteps, ol);

  // Optional: Edamam live nutrition if no base
  if (!base && CONFIG.EDAMAM_APP_ID && CONFIG.EDAMAM_APP_KEY){
    try{
      const q = encodeURIComponent(rawTerm);
      const url = `https://api.edamam.com/api/nutrition-data?app_id=${CONFIG.EDAMAM_APP_ID}&app_key=${CONFIG.EDAMAM_APP_KEY}&ingr=1%20${q}`;
      const data = await fetch(url).then(r=>r.json());
      const more = document.createElement('p'); more.className='muted'; more.textContent = `Est. calories: ${Math.round(data.calories||0)} kcal (Edamam)`; body.append(more);
    }catch(e){ console.warn('Edamam failed', e); }
  }

  document.getElementById('dlgTitle').textContent = 'Details';
  document.getElementById('dlg').showModal();
}
