// Topbar filters version – no sidebar
const DEFAULT_CENTER = { name: "Yangon", lat: 16.8409, lng: 96.1735 };
let map,
  places,
  center = DEFAULT_CENTER,
  results = [];

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
const el = (t, c) =>
  Object.assign(document.createElement(t), c ? { className: c } : {});
const priceSymbols = (n) =>
  n == null ? "—" : "₭".repeat(n).slice(0, 4).replace(/₭/g, "$");
const navUrl = (lat, lng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
const chip = (t) => {
  const c = el("span", "chip");
  c.textContent = t;
  return c;
};

// Google Maps callback
window.__WFE_onMapsReady = function () {
  if (!window.google || !google.maps) return;
  const mapEl = document.getElementById("map");
  if (mapEl) {
    map = new google.maps.Map(mapEl, { center, zoom: 14 });
    places = new google.maps.places.PlacesService(map);
  }
  // Use location from footer button
};

// Autocomplete dictionary
const VOCAB = [
  "မုန့်တီ",
  "မုန့်ဟင်းခါး",
  "မုန့်ချိုးလိမ်",
  "မုန့်လှော်",
  "မုန့်သလောက်",
  "ကော်ဖီ",
  "လ်ဘက်ရည်",
  "ဘိုဘိုတီ",
  "ရှပ်ပီ",
  "မန်ကျည်းဖျော်ရည်",
  "မာလကာသီးဖျော်ရည်",
  "လေမုန်အေး",
  "ထမင်းကြော်",
  "ရေညှိထမင်း",
  "ရှမ်းခေါက်ဆွဲ",
  "လက်ဖက်သုပ်",
  "ငပိသုပ်",
  "coffee",
  "milk tea",
  "bubble tea",
  "boba",
  "smoothie",
  "mango juice",
  "papaya juice",
  "lemonade",
  "fried rice",
  "shan noodle",
  "tea leaf salad",
  "ramen",
  "udon",
  "soba",
  "burger",
  "pizza",
  "pasta",
  "salad",
  "chicken noodle",
  "korean noodle",
  "sushi",
  "curry rice",
];
function makeSuggestions(q) {
  const s = (q || "").trim().toLowerCase();
  if (!s) return [];
  const starts = VOCAB.filter((v) => v.toLowerCase().startsWith(s));
  const inc = VOCAB.filter(
    (v) => !v.toLowerCase().startsWith(s) && v.toLowerCase().includes(s)
  );
  return [...new Set([...starts, ...inc])].slice(0, 12);
}

// Query expansion
const SUGGESTIONS = [
  "fried rice",
  "mohinga",
  "shan noodle",
  "ramen",
  "sushi",
  "bbq",
  "noodle",
  "curry",
  "juice",
  "dessert",
];
const MM_HINTS = [
  {
    mm: ["ဖျော်ရည်", "သီးဖျော်ရည်", "မန်ကျည်း", "မာလကာ"],
    en: ["juice", "smoothie", "fruit juice", "mango", "papaya"],
  },
  { mm: [" ခေါက်ဆွဲ", "ခေါက်ဆွဲ"], en: ["noodle"] },
  { mm: ["မုန့်"], en: ["noodle", "rice noodle", "snack"] },
  { mm: ["သုပ်", "ထမင်း"], en: ["salad", "rice"] },
];
function expandQueries(raw) {
  const term = (raw || "").trim();
  const variants = new Set();
  const gens = [
    "restaurant",
    "food",
    "shop",
    "cafe",
    "drink",
    "dessert",
    "noodle",
    "rice",
    "juice",
  ];
  if (!term) {
    variants.add(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]);
  } else {
    variants.add(term);
    gens.forEach((g) => variants.add(`${term} ${g}`));
    const hasMM = /[\u1000-\u109F]/.test(term);
    if (hasMM) {
      for (const hint of MM_HINTS) {
        if (hint.mm.some((m) => term.includes(m)))
          hint.en.forEach((e) => variants.add(e));
      }
      ["restaurant", "food", "noodle", "juice", "salad"].forEach((e) =>
        variants.add(`${term} ${e}`)
      );
    } else {
      ["မြန်မာ", "ကိုရီးယား", "တာိုင်", "အိန္ဒိယ"].forEach((mm) =>
        variants.add(`${term} ${mm}`)
      );
    }
  }
  return [...variants].slice(0, 10);
}

// Places search
async function runTextSearches(qList) {
  if (!places) return [];
  const seen = new Set();
  const out = [];
  for (const q of qList) {
    const res = await new Promise((resolve) => {
      const req = {
        query: q,
        location: new google.maps.LatLng(center.lat, center.lng),
        radius: 15000,
      };
      places.textSearch(req, (arr, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !arr)
          return resolve([]);
        resolve(arr);
      });
    });
    const detailed = (
      await Promise.allSettled(res.map((r) => getPlaceDetails(r.place_id)))
    )
      .filter((x) => x.status === "fulfilled")
      .map((x) => x.value);
    for (const p of detailed) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
      }
    }
    if (out.length >= 30) break;
  }
  return out;
}
function getPlaceDetails(placeId) {
  return new Promise((resolve, reject) => {
    places.getDetails(
      {
        placeId,
        fields: [
          "name",
          "rating",
          "price_level",
          "photos",
          "geometry",
          "formatted_address",
          "opening_hours",
          "website",
          "user_ratings_total",
        ],
      },
      (p, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !p)
          return reject(status);
        const photo =
          p.photos?.[0]?.getUrl({ maxWidth: 900, maxHeight: 600 }) || "";
        resolve({
          id: placeId,
          name: p.name,
          rating: p.rating ?? null,
          ratings: p.user_ratings_total || 0,
          price_level: p.price_level ?? null,
          photo,
          lat: p.geometry?.location?.lat(),
          lng: p.geometry?.location?.lng(),
          addr: p.formatted_address || "",
          openNow: p.opening_hours?.isOpen?.() ?? null,
          website: p.website || "",
        });
      }
    );
  });
}

// ====== DISH KNOWLEDGE: Ingredients + Nutrition (approx) ======
const RECIPES = [
  {
    keys: ['မုန့်ဟင်းခါး','mohinga','mont hingar','fish noodle soup'],
    display: 'မုန့်ဟင်းခါး (Mohinga)',
    ingredients: ['ငါးဟင်းရည်','လေးပါးသီး','နနွင်းမှုန့်','ပဲမှုန့်','အာလူး (optional)','လျှပ်','မုန့် (rice noodle)','ချဉ်ထန်းနို့','အကြော်သီးရွက်','ပဲမျို','ဓါတ်ငွေ့မြစ်အမြစ်'],
    nutrition: { calories: 420, protein_g: 22, carbs_g: 58, fat_g: 12, fiber_g: 5, sodium_mg: 980 },
    allergens: ['ငါး','ဂေလက်တင် (အကြော်တွင်)'],
    notes: 'မြန်မာရိုးရာ ငါးရည်ခေါက်ဆွဲ။ အရသာချိုဆားပေါင်းစပ်၊ နံနင်းမှုန့်နဲ့ အရောင်မွှေးကြိုင်။'
  },
  {
    keys: ['မုန့်တီ','mont ti','mont tee','rice vermicelli salad'],
    display: 'မုန့်တီ (Mont Ti)',
    ingredients: ['မုန့် (rice vermicelli)','ကြက်သွန်ဖြူ/နီ','ပဲမှုန့်မှုန်','ငရုတ်သီးမှုန့်','သံပုရာချဉ်/လိမ္မော်'],
    nutrition: { calories: 380, protein_g: 10, carbs_g: 66, fat_g: 8, fiber_g: 4, sodium_mg: 720 },
    allergens: ['ပဲ'],
    notes: 'ခန့်ချိုးပြီး သံပုရာ/သလောက်ချဉ်နဲ့ လက်ဖက်ရည်ဆိုင်တွေမှာ တွေ့ရတဲ့ အအေးခန်းကောင်းစား။'
  },
  {
    keys: ['ရှမ်းခေါက်ဆွဲ','shan noodle','shan khauk swe'],
    display: 'ရှမ်းခေါက်ဆွဲ (Shan Noodle)',
    ingredients: ['မုန့်','ကြက်/ဝက်အလွိုင်း','ပဲမှုန့်','ကြက်သွန်နီငရုတ်ဆီ','မြေပဲမျိုး','ချဉ်ထန်းနို့'],
    nutrition: { calories: 520, protein_g: 24, carbs_g: 70, fat_g: 16, fiber_g: 5, sodium_mg: 900 },
    allergens: ['ပဲ','မြေပဲ'],
    notes: 'ပဲမှုန့်ရည်ခန့်ချော် အနံ့အသက်ပြင်းခိုင်၊ မြေပဲမျိုးအနည်းငယ်ဖြင့် ဆာလောင်တင်းရင်း။'
  },
  {
    keys: ['fried rice','ထမင်းကြော်'],
    display: 'ထမင်းကြော် (Fried Rice)',
    ingredients: ['အေးအေးထမင်း','ကြက်ဥ','ကြက်သွန်','ဆီ','ဆီချက်မှုန့်','ငရုတ်သီး','အမဲ/ကြက်/ပုစွန် (optional)'],
    nutrition: { calories: 650, protein_g: 18, carbs_g: 90, fat_g: 22, fiber_g: 3, sodium_mg: 1100 },
    allergens: ['ဥ'],
    notes: 'ထမင်းအေးကိုကြော်ဖက် တစ်ပွဲအဖြစ် စားလို့ပြည့်ဝသွားတတ်။'
  },
  {
    keys: ['coffee','ကော်ဖီ','coffe'],
    display: 'Coffee',
    ingredients: ['ကော်ဖီမီွး','ရေ','နို့/condensed milk (optional)','အချို'],
    nutrition: { calories: 5, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sodium_mg: 5 },
    allergens: [],
    notes: 'Black coffee = calories နည်း။ နို့/ချိုစပ်ရင် ကယ်လိုရီတက်တယ်။'
  },
  {
    keys: ['milk tea','လ္ဘက်ရည်','milk-tea','bubble tea','boba'],
    display: 'Milk Tea',
    ingredients: ['လက်ဖက်','နို့','ဆန်ခွောက်/condensed milk','ချိုစပ်','တပော့ (optional)'],
    nutrition: { calories: 220, protein_g: 4, carbs_g: 36, fat_g: 7, fiber_g: 0, sodium_mg: 80 },
    allergens: ['နို့'],
    notes: 'တပော့ ထည့်ရင် ကယ်လိုရီ/စုတင် ဆင်ခြည်တက်နိုင်။'
  },
  {
    keys: ['chicken noodle','ကြက်ခေါက်ဆွဲ'],
    display: 'Chicken Noodle',
    ingredients: ['မုန့်','ကြက်သား','ပြောင်းလက်','ကြက်သွန်','ငရုတ်ကောင်း','အူမ','ရည်'],
    nutrition: { calories: 560, protein_g: 30, carbs_g: 68, fat_g: 16, fiber_g: 3, sodium_mg: 950 },
    allergens: [],
    notes: 'အသင့်စားရည်နှင့် အနံ့အသက်နူးညံ့ပေါ့ပါး။'
  },
  {
    keys: ['korean noodle','ramyeon','ramen (korean)'],
    display: 'Korean Noodle (Ramyeon)',
    ingredients: ['ဆားမွှေးမုန့်ခေါက်ဆွဲ','အရောင်အသားမှုန့်','ငရုတ်သီးမှုန့်','အမဲ/ကြက်အသားခြောက် (optional)'],
    nutrition: { calories: 480, protein_g: 10, carbs_g: 72, fat_g: 16, fiber_g: 3, sodium_mg: 1600 },
    allergens: ['ဂလူတင် (ဂျုံ)'],
    notes: 'အရသာကြီး (sodium မြင့်) — ဆားနည်းထဲသောက်အပ်။'
  },
  {
    keys: ['sushi'],
    display: 'Sushi',
    ingredients: ['အလင်ခေါက် (vinegared rice)','ငါးစမ်း','ညက်ကူ','soy sauce','ဝါသာဘီ'],
    nutrition: { calories: 330, protein_g: 20, carbs_g: 50, fat_g: 6, fiber_g: 2, sodium_mg: 900 },
    allergens: ['ငါး','soy'],
    notes: 'အမျိုးအစားပေါ်မူတည်ပြီး ကယ်လိုရီကွာခြား။'
  },
  {
    keys: ['tea leaf salad','လက်ဖက်သုပ်','laphet thoke'],
    display: 'လက်ဖက်သုပ် (Tea Leaf Salad)',
    ingredients: ['လက်ဖက်','မြေပဲ','သေတ္တာပဲ','သံပုရာ','ဆား/သကြား','သကြားသောက်','ပဲသီးအကာ'],
    nutrition: { calories: 420, protein_g: 12, carbs_g: 28, fat_g: 28, fiber_g: 7, sodium_mg: 720 },
    allergens: ['မြေပဲ','ပဲ'],
    notes: 'အမေ့ကောင်းသော အချိုရစ်-ချဉ်သိမ်သိမ်၊ ဆီပါဝင်မှု မြင့်တတ်။'
  }
];

// fuzzy find by Burmese/English
function findRecipe(term) {
  const s = (term||'').toLowerCase();
  if (!s) return null;
  // exact or includes
  let best = null;
  for (const r of RECIPES) {
    for (const k of r.keys) {
      const key = k.toLowerCase();
      if (key === s || key.includes(s) || s.includes(key)) {
        return r;
      }
    }
    // keep startsWith as secondary
    if (!best && r.keys.some(k => k.toLowerCase().startsWith(s))) best = r;
  }
  return best;
}

// Filters & render
function applyFiltersAndRender(term) {
  const flags = new Set($$(".f:checked").map((x) => x.value));
  let list = results.slice();
  if (flags.has("openNow"))
    list = list.filter((x) => x.openNow === true || x.openNow === null);
  const priceWanted = ["price1", "price2", "price3"].filter((f) =>
    flags.has(f)
  );
  if (priceWanted.length) {
    const allow = new Set(
      priceWanted.map((f) => ({ price1: 0, price2: 1, price3: 2 }[f]))
    );
    list = list.filter((x) => allow.has(x.price_level));
  }
  if (flags.has("rating4")) list = list.filter((x) => (x.rating || 0) >= 4);
  render(list, term);
}
function render(list, term) {
  const grid = $("#grid");
  if (!grid) return;
  grid.innerHTML = "";
  const tpl = $("#cardTpl");
  list.forEach((r) => {
    const node = tpl.content.cloneNode(true);
    const img = node.querySelector(".img");
    img.src =
      r.photo ||
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop";
    img.alt = r.name;
    node.querySelector(".title").textContent = r.name;
    node.querySelector(".badge").textContent = "Near you";
    node.querySelector(".addr").textContent = r.addr || "";
    const pillRow = node.querySelector(".pill-row");
    const p = el("span", "pill");
    p.textContent = `${r.rating ?? "—"}★ (${r.ratings || 0})`;
    pillRow.appendChild(p);
    const p2 = el("span", "pill");
    p2.textContent = `price: ${priceSymbols(r.price_level)}`;
    pillRow.appendChild(p2);
    if (r.openNow !== null) {
      const p3 = el("span", "pill");
      p3.textContent = r.openNow ? "Open now" : "Closed";
      pillRow.appendChild(p3);
    }
    node.querySelector(".map").href = navUrl(r.lat, r.lng);
    const site = node.querySelector(".site");
    if (r.website) site.href = r.website;
    else site.style.display = "none";
    node
      .querySelector(".details")
      .addEventListener("click", () => openDetails(term || r.name));
    grid.appendChild(node);
  });
  const countBar = $("#countBar");
  if (countBar)
    countBar.textContent = `${list.length} result(s) for “${(
      term || "popular nearby"
    ).trim()}”`;
}
function openDetails(rawTerm){
  const body=$('#dlgBody'); if(!body) return; body.innerHTML='';

  const term = (rawTerm||'').trim();
  const r = findRecipe(term);

  // Header
  const head=el('div','recipe-head');
  const title=el('h4'); title.textContent = r?.display || (term || 'Details');
  const meta=el('div','recipe-meta');
  meta.append(chip('Ingredients'), chip('Nutrition Facts'));
  head.append(title, meta);
  body.append(head);

  if (r) {
    // Ingredients
    const ingWrap = el('div');
    const h = el('h5'); h.textContent = 'Ingredients';
    const ul = el('ul','shop-list');
    r.ingredients.forEach(i=> {
      const li = document.createElement('li'); li.textContent = i; ul.appendChild(li);
    });
    ingWrap.append(h, ul);
    body.append(ingWrap);

    // Nutrition Facts
    const n = r.nutrition || {};
    const nf = el('div');
    const h2 = el('h5'); h2.textContent = 'Nutrition (approx per serving)';
    const grid = el('div'); grid.style.display='grid'; grid.style.gridTemplateColumns='repeat(auto-fit,minmax(130px,1fr))'; grid.style.gap='.4rem';
    const cell = (label,val)=>{ const d=el('div'); d.className='pill'; d.textContent=`${label}: ${val}`; return d; };
    grid.append(
      cell('Calories', `${n.calories||'—'} kcal`),
      cell('Protein', `${n.protein_g||'—'} g`),
      cell('Carbs', `${n.carbs_g||'—'} g`),
      cell('Fat', `${n.fat_g||'—'} g`),
      cell('Fiber', `${n.fiber_g||'—'} g`),
      cell('Sodium', `${n.sodium_mg||'—'} mg`)
    );
    nf.append(h2, grid);
    body.append(nf);

    // Allergens & Notes
    if (r.allergens?.length || r.notes) {
      const more = el('div');
      if (r.allergens?.length) {
        const a = el('p'); a.innerHTML = `<strong>Allergens:</strong> ${r.allergens.join(', ')}`;
        more.append(a);
      }
      if (r.notes) {
        const t = el('p'); t.className='muted'; t.textContent = r.notes;
        more.append(t);
      }
      body.append(more);
    }
  } else {
    // Fallback when we don't have a recipe
    const p = el('p'); p.textContent = 'This dish is not in the built-in list yet. Showing nearby places with ratings, prices, and photos. You can also try a different spelling (MM/EN).';
    body.append(p);
  }

  // Open dialog
  const dlgTitleEl = document.getElementById('dlgTitle');
  if (dlgTitleEl) dlgTitleEl.textContent = 'Details';
  const dlgEl = document.getElementById('dlg');
  if (dlgEl && typeof dlgEl.showModal==='function') dlgEl.showModal();
}

// Orchestrator
function search() {
  const inputEl = document.getElementById("dish");
  if (!inputEl) return;
  const raw = inputEl.value;
  const queries = expandQueries(raw);
  const suggestBar = $("#suggestBar");
  if (suggestBar)
    suggestBar.textContent = raw
      ? `Trying: ${queries.map((q) => `“${q}”`).join(" · ")}`
      : `Tip: Searching popular nearby: “${queries[0]}”`;
  const countBar = $("#countBar");
  if (countBar) countBar.textContent = "Searching…";
  runTextSearches(queries)
    .then((list) => {
      results = list;
      applyFiltersAndRender(raw || queries[0]);
    })
    .catch(() => {
      results = [];
      render([], raw);
      if (countBar) countBar.textContent = "No results.";
    });
}
window.search = search;

// Bind UI
document.addEventListener("DOMContentLoaded", () => {
  const input = $("#dish");
  const btnSearch = $("#btnSearch");
  const acList = $("#acList");
  const btnFilter = $("#btnFilter");
  const filterMenu = $("#filterMenu");
  const mealSelect = $("#mealSelect");
  const btnLocate = $("#btnLocate");
  const dlgClose = $("#dlgClose");
  if (dlgClose) {
    dlgClose.addEventListener("click", () => $("#dlg")?.close());
  }

  if (btnFilter && filterMenu) {
    // a11y attributes
    btnFilter.setAttribute("aria-haspopup", "menu");
    btnFilter.setAttribute("aria-expanded", "false");

    function setOpen(open) {
      filterMenu.hidden = !open;
      btnFilter.setAttribute("aria-expanded", String(open));
    }
    function toggle() {
      setOpen(filterMenu.hidden); // if hidden ➜ open, else ➜ close
    }

    // Click the button ➜ toggle
    btnFilter.addEventListener("click", (e) => {
      e.stopPropagation(); // don’t bubble to document
      toggle();
    });

    // Click outside ➜ close
    document.addEventListener("click", (e) => {
      if (!filterMenu.hidden && !e.target.closest(".filter-wrap")) {
        setOpen(false);
      }
    });

    // Press Escape ➜ close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    // When any checkbox changes, keep menu state as-is but re-render
    $$(".f", filterMenu).forEach((cb) =>
      cb.addEventListener("change", () =>
        applyFiltersAndRender($("#dish")?.value)
      )
    );
  }

  if (mealSelect) {
    mealSelect.addEventListener("change", () => {
      search();
    });
  }

  if (btnLocate) {
    btnLocate.addEventListener("click", () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        center = {
          name: "Here",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        if (map) map.setCenter(center);
        search(); // refresh results for new center
      });
    });
  }

  if (!input || !btnSearch || !acList) return;

  const doSearch = () => {
    const v = input.value.trim();
    if (!v) return;
    search();
  };

  btnSearch.addEventListener("click", doSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const sel = acList.querySelector('li[aria-selected="true"]');
      if (sel) {
        input.value = sel.textContent;
        acList.hidden = true;
      }
      doSearch();
    }
  });

  let acIndex = -1;
  function renderAC(items) {
    acList.innerHTML = "";
    if (!items.length) {
      acList.hidden = true;
      return;
    }
    items.forEach((t, i) => {
      const li = document.createElement("li");
      li.textContent = t;
      li.role = "option";
      if (i === acIndex) li.setAttribute("aria-selected", "true");
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = t;
        acList.hidden = true;
        doSearch();
      });
      li.addEventListener("mouseenter", () => {
        acIndex = i;
        refreshSel();
      });
      acList.appendChild(li);
    });
    acList.hidden = false;
  }
  function refreshSel() {
    [...acList.children].forEach((li, i) => {
      if (i === acIndex) li.setAttribute("aria-selected", "true");
      else li.removeAttribute("aria-selected");
    });
  }
  input.addEventListener("input", () => {
    acIndex = -1;
    renderAC(makeSuggestions(input.value));
  });
  input.addEventListener("keydown", (e) => {
    if (acList.hidden) return;
    const items = [...acList.children];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      acIndex = Math.min(items.length - 1, acIndex + 1);
      refreshSel();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      acIndex = Math.max(0, acIndex - 1);
      refreshSel();
    } else if (e.key === "Escape") {
      acList.hidden = true;
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".ac")) acList.hidden = true;
  });
});
