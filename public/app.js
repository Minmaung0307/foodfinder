import {categories,node,link,directions,distance,phoneUrl,safeUrl,coordinates,readLocal,writeLocal,fetchJSON} from './core.js';
import {setupCityPicker,countryName,cities} from './cities.js';
import {foodIntent,foodMatch,selectFoodPlaces,mapsFoodUrl} from './food.js';
import {findLive,cachedLive} from './live.js';
const $=s=>document.querySelector(s),params=new URLSearchParams(location.search);
let config,starter=[],city=null,places=[],cloudPlaces=[],category='all',query='',savedOnly=params.get('saved')==='1',pageSize=12,requestVersion=0,busy=false,locationChosen=false,map=null,markers=null,mapLoaded=false,collectionState='preview';

let favorites=readLocal('favorites',[]);if(!Array.isArray(favorites))favorites=[];favorites=favorites.filter(p=>p&&typeof p.id==='string'&&categories[p.category]&&typeof p.name==='string').slice(0,100);
const saved=p=>favorites.some(f=>f.id===p.id),radius=()=>Number($('#radius').value)||4828.032;
let areaController;
const unique=items=>[...new Map(items.map(p=>[p.id,p])).values()];
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,4500);}
function status(text,error=false){$('#status').textContent=text;$('#status').classList.toggle('error',error);}
function setBusy(value){busy=value;$('#results').setAttribute('aria-busy',String(value));}
function save(p){const next=saved(p)?favorites.filter(f=>f.id!==p.id):[...favorites,p].slice(-100);if(!writeLocal('favorites',next))return toast('Your browser could not save this place. Storage may be full or disabled.');favorites=next;render();toast(saved(p)?'Saved on this device.':'Removed from saved places.');}
function areaPlaces(){return selectFoodPlaces(savedOnly?favorites:unique([...places,...cloudPlaces]),{query:'',center:city,radius:radius(),category,sort:$('#sort').value,limitToRadius:!savedOnly});}
function searchMatches(){return areaPlaces().filter(p=>foodMatch(p,query));}
function filtered(){const base=areaPlaces(),matches=base.filter(p=>foodMatch(p,query));return query&&matches.length===0?base:matches;}
function formatDistance(p){if(!city||city.kind==='area'||!coordinates(p.lat,p.lon))return '';const km=distance(city,p);return `${(km/1.609344).toFixed(1)} mi / ${km.toFixed(1)} km from ${city.nearby?'you':'town center'}`;}
function card(p){
 const c=categories[p.category]||categories.restaurant,article=node('article','','place-card'),art=node('div','','card-art '+c.color),image=document.createElement('img');image.src=`art/${c.icon}.svg`;image.alt='';image.width=88;image.height=88;image.loading='lazy';
 const fav=node('button',saved(p)?'♥':'♡','save-button');fav.setAttribute('aria-label',`${saved(p)?'Unsave':'Save'} ${p.name}`);fav.setAttribute('aria-pressed',String(saved(p)));fav.onclick=()=>save(p);art.append(image,node('span',c.label,'card-tag'),fav);
 const body=node('div','','card-body'),h=node('h3'),title=node('button',p.name);title.onclick=()=>detail(p);h.append(title);body.append(h,node('p',[p.city,p.country?countryName(p.country):''].filter(Boolean).join(', '),'card-location'));
 const d=formatDistance(p);if(d)body.append(node('p',d,'distance-label'));const match=foodMatch(p,query);if(query&&match)body.append(node('span',match.kind==='listed'?'Dish listed':match.kind==='related'?'Related cuisine · ask first':'Listing matches · check menu','match-badge '+match.kind));
 body.append(node('p',p.cuisine||'Menu details are not listed.','card-description'));const bottom=node('div','','card-bottom'),details=node('button','View details');details.onclick=()=>detail(p);bottom.append(link('Get directions ↗',directions(p)),details);body.append(bottom);article.append(art,body);return article;
}
function updateSearchContext(list){
 $('#search-center').textContent=city?.nearby?'Searching near your location':locationChosen&&city?`Searching around ${city.name}`:'Find places near you';
 $('#location-note').textContent=city?.nearby?`Location shared for this search${city.accuracy?` · accuracy about ${Math.round(city.accuracy)} m`:''}. Distances are straight-line estimates.`:locationChosen&&city?.kind!=='area'?'Using the town center, not your current position. Use Near me for your actual location.':'Allow location access to show nearby places automatically, or choose a town.';
 const matches=searchMatches(),intent=foodIntent(query),direct=matches.filter(p=>foodMatch(p,query)?.kind!=='related').length,related=matches.length-direct;
 $('#food-explanation').textContent=query&&matches.length===0?`No matches for “${query}” in the nearby places. မတွေ့ပါ။ Showing the ${areaPlaces().length} selected places below.`:query?(intent?`${intent.label} · ${intent.english}. `:'')+`${direct} listing matches · ${related} related places. A match is not a promise this dish is available. မီနူးမှာ ပါမပါ ဆိုင်ကို အတည်ပြုပါ။`:'';
 $('#search-recovery').hidden=!query&&!$('#status').classList.contains('error');$('#maps-food').href=mapsFoodUrl(query,locationChosen?city:null);$('#retry-search').hidden=city?.kind==='area'||!locationChosen;
 
}
function render(){
 document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));$('#all-category').classList.toggle('active',category==='all');$('#saved-toggle').setAttribute('aria-pressed',String(savedOnly));const list=filtered();
 $('#results-title').textContent=savedOnly?'Your saved places':`${query&&searchMatches().length?foodIntent(query)?.english||query:category==='all'?'Places to try':categories[category].label}${city?.nearby?' near you':city?' in '+city.name:''}`;$('#collection-summary').textContent=`${areaPlaces().length} loaded places${query?' · '+searchMatches().length+' search matches':''} · ${list.length} shown.`;$('#result-count').textContent=`${list.length} ${list.length===1?'place':'places'}`;
 const results=$('#results');results.replaceChildren();if(!list.length&&busy){results.append(node('p','Finding nearby places… You can change distance or search while this loads.','small muted'));}
 else if(!list.length){const empty=node('div','','empty');empty.append(node('h3',savedOnly?'Your next favorite is out there.':collectionState==='error'&&areaPlaces().length===0?'The area list could not load.':!city?'Start with Near me.':query?'No match in the loaded places.':'No places in this collection yet.'),node('p',savedOnly?'Tap the heart on a place to keep it here. Saved places stay on this device.':collectionState==='error'?'This is a connection or search-service problem, not evidence that there are no restaurants here. Reload the area later or open Google Maps.':!city?'Choose a distance or press Search, to request your location and load nearby places. You can also choose a town.':query?'This does not mean nobody serves it. Try a larger radius, a different location, or the Google Maps search below. Open map data does not include every menu.':'Choose your location or another town, then search nearby.'));const clear=node('button','Clear filters','secondary');clear.onclick=reset;if(city||savedOnly)empty.append(clear);const town=node('button','Choose a town','secondary');town.onclick=()=>openCity();empty.append(town);results.append(empty);}else results.append(...list.slice(0,pageSize).map(card));
 $('#more').hidden=list.length<=pageSize;updateSearchContext(list);updateMap(list);
}
function reset(){query='';$('#query').value='';category='all';savedOnly=false;pageSize=12;render();}
function detail(p){
 const wrap=$('#place-detail');wrap.replaceChildren();wrap.append(node('h2',p.name,'detail-title'),node('p',`${categories[p.category]?.label||'Food stop'} · ${p.city}`,'muted'));if(p.localName&&p.localName!==p.name)wrap.append(node('p',p.localName));
 const match=foodMatch(p,query);if(query&&match)wrap.append(node('p',match.label+'. Please ask the venue before visiting.','note'));
 for(const [label,value] of [['Distance',formatDistance(p)],['Address',p.address||'Street address not listed. Directions use the mapped location.'],['Cuisine',p.cuisine||'Not listed'],['Dishes',p.dishesText],['Hours',p.hours||'Not listed — please contact the venue.'],['About',p.description]]){if(!value)continue;const row=node('div','','detail-row');row.append(node('strong',label),node('span',value));wrap.append(row);}
 if(p.cloud&&p.hasImage){const image=document.createElement('img');image.className='cover-preview';image.alt=p.name+' — photo supplied by the directory editor';wrap.append(image);import('./cloud.js').then(m=>m.getImage(p.id.replace('community-',''))).then(data=>{if(data&&image.isConnected)image.src=data;}).catch(()=>image.remove());}
 const actions=node('div','','detail-actions');actions.append(link('Get directions ↗',directions(p),'primary'));if(phoneUrl(p.phone))actions.append(link('Call venue',phoneUrl(p.phone),'secondary'));if(safeUrl(p.menuUrl))actions.append(link('Check menu ↗',safeUrl(p.menuUrl),'secondary'));if(safeUrl(p.website))actions.append(link('Visit website ↗',safeUrl(p.website),'secondary'));const fav=node('button',saved(p)?'♥ Saved':'♡ Save place','secondary');fav.onclick=()=>{save(p);fav.textContent=saved(p)?'♥ Saved':'♡ Save place';};actions.append(fav);wrap.append(actions,node('p','Please confirm opening hours, menu, dietary needs and accessibility directly with the venue before visiting.','small muted'));if(safeUrl(p.source))wrap.append(link('View source on OpenStreetMap ↗',safeUrl(p.source),'detail-source'));else wrap.append(node('p','Community listing, published by the directory editor.','small muted'));if(!$('#place-dialog').open)$('#place-dialog').showModal();
}
function starterNear(center){const source=unique(starter.flatMap(c=>c.places));return center.kind==='area'?source.filter(p=>center.members.includes(p.cityId)):source.filter(p=>coordinates(p.lat,p.lon)&&distance(center,p)*1000<=radius());}
async function communityFor(center){if(!config.cloudEnabled)return [];const {published}=await import('./cloud.js');let ids=center.kind==='area'?center.members:center.id;
 if(center.nearby){const all=await cities();ids=all.filter(c=>c.kind!=='area'&&distance(center,c)<=Math.max(30,radius()/1000+15)).sort((a,b)=>distance(center,a)-distance(center,b)).slice(0,10).map(c=>c.id);if(!ids.length)return [];}
 return published(ids);
}
async function loadCity(next,{live=false,keepSaved=false,keepQuery=false,chosen=true}={}){
 if(!config)return;if(!keepQuery){query='';$('#query').value='';}const version=++requestVersion,searchRadius=radius(),sameCenter=city&&city.lat===next.lat&&city.lon===next.lon;
 areaController?.abort();areaController=new AbortController();const signal=areaController.signal;
 city=next;locationChosen=chosen;collectionState='loading';if(!keepSaved)savedOnly=false;category='all';pageSize=12;$('#sort').value='distance';places=unique([...(sameCenter?places:[]),...(cachedLive(next,searchRadius)?.places||[]),...starterNear(next)]);cloudPlaces=sameCenter?cloudPlaces:[];setBusy(true);status('');render();
 const bundle=starter.find(c=>c.id===next.id),isArea=next.kind==='area';
 // Cloud suggestions are independent: a map-provider outage must not skip reviewed local listings.
 const cloudTask=communityFor(next).then(list=>{if(version===requestVersion){cloudPlaces=list;render();}}).catch(()=>{if(version===requestVersion)toast('Community listings are temporarily unavailable. Other results still work.');});
 try{
  if(!isArea&&(live||!bundle)){
   const result=await findLive(next,config,{radius:searchRadius,refresh:false,signal});if(version!==requestVersion)return;
   places=unique([...result.places,...starterNear(next)]);collectionState=result.stale?'error':'ready';status(`${result.cached?'Saved search':'Mapped results'} · ${new Date(result.at).toLocaleDateString()} · within ${Math.round(searchRadius/1609.344)} miles${result.limited?' · partial collection, capped at 2,000 records; these are not necessarily the nearest 2,000. Try a smaller radius':''}.`,false);
  }else {collectionState='preview';status(isArea?'Outer Banks starter collection. For food nearest to you, press Near me.':'Starter collection loaded. Load places in this area to refresh the collection.');}
 }catch(e){if(version!==requestVersion)return;collectionState='error';status(areaPlaces().length?'':e.message||'Nearby search is unavailable. Try again later or use Google Maps.',!areaPlaces().length);}
 finally{if(version===requestVersion){setBusy(false);render();}}
 // Do not make the form wait for optional Firebase data.
 void cloudTask;
}
async function locate(){
 if(!config)return;query=$('#query').value.trim();savedOnly=false;category='all';if(!navigator.geolocation){status('This browser cannot share location. Choose a town instead.',true);render();return;}
 const version=++requestVersion;setBusy(true);status('Please allow location access to find food near you.');render();
 navigator.geolocation.getCurrentPosition(pos=>{if(version!==requestVersion)return;loadCity({id:'nearby',name:'your location',country:'',lat:Number(pos.coords.latitude.toFixed(4)),lon:Number(pos.coords.longitude.toFixed(4)),nearby:true,accuracy:pos.coords.accuracy},{live:true,keepQuery:true});},error=>{if(version!==requestVersion)return;setBusy(false);status(error.code===1?'Location permission was declined. Choose a town to search around its center, or allow location access in browser settings.':'We could not determine your location. Try Near me again, or choose a town.',true);render();},{timeout:12000,maximumAge:60000,enableHighAccuracy:true});
}
async function performFoodSearch(){query=$('#query').value.trim();savedOnly=false;pageSize=12;render();if(!city)return locate();if(collectionState==='error'&&!places.length&&!cloudPlaces.length)return loadArea();}
async function loadArea(){if(!locationChosen||!city||city.kind==='area')return locate();return loadCity(city,{live:true,keepQuery:true});}
async function openMap(){const wrap=$('#map-wrap');wrap.hidden=!wrap.hidden;$('#show-map').setAttribute('aria-expanded',String(!wrap.hidden));if(wrap.hidden)return;if(!mapLoaded){try{const css=document.createElement('link');css.rel='stylesheet';css.href='vendor/leaflet/leaflet.css';document.head.append(css);await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='vendor/leaflet/leaflet.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});map=L.map('map');L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).on('tileerror',()=>toast('Some map tiles could not load. Directions and the list still work.')).addTo(map);markers=L.layerGroup().addTo(map);mapLoaded=true;}catch{toast('Map could not load. Use directions instead.');return;}}map.invalidateSize();updateMap(filtered());}
function updateMap(list){if(!map||$('#map-wrap').hidden)return;markers.clearLayers();const points=[];for(const p of list.filter(p=>coordinates(p.lat,p.lon)).slice(0,100)){const point=[p.lat,p.lon],content=node('button',p.name);content.onclick=()=>detail(p);L.marker(point).bindPopup(content).addTo(markers);points.push(point);}if(city&&city.kind!=='area'){L.circleMarker([city.lat,city.lon],{radius:7,color:'#294d3e',fillOpacity:1}).bindPopup(city.nearby?'Your search location':'Selected town center').addTo(markers);points.push([city.lat,city.lon]);}if(points.length)map.fitBounds(points,{padding:[30,30],maxZoom:15});else map.setView([20,20],2);}
const openCity=setupCityPicker(c=>{loadCity(c,{keepQuery:true,live:true});$('#explore').scrollIntoView({behavior:'smooth'});});
$('#near-me').onclick=locate;$('#choose-city').onclick=openCity;$('#use-location').onclick=locate;$('#place-close').onclick=()=>$('#place-dialog').close();$('#show-map').onclick=openMap;$('#reset').onclick=reset;$('#all-category').onclick=()=>{category='all';pageSize=12;render();};$('#saved-toggle').onclick=()=>{savedOnly=!savedOnly;pageSize=12;render();};$('#more').onclick=()=>{pageSize+=12;render();};$('#sort').onchange=render;$('#radius').onchange=()=>{reset();loadArea();};$('#retry-search').onclick=loadArea;
$('#search-form').onsubmit=e=>{e.preventDefault();performFoodSearch();};
$('#query').addEventListener('input',()=>{query=$('#query').value.trim();pageSize=12;render();});
async function init(){setBusy(true);render();try{[config,starter]=await Promise.all([fetchJSON('./config.json'),fetchJSON('./data/starter.json')]);setBusy(false);status('');render();if(!savedOnly)locate();}catch{setBusy(false);status('The guide could not load. Please reload.',true);render();}}
init();
