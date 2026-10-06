import {normalize,coordinates,distance} from './core.js';
// Search vocabulary, not a claim about a restaurant's current menu.
export const FOODS=[
 {id:'hotpot',label:'Hot pot',english:'hot pot',aliases:['hotpot','hot pot','hot-pot','ဟော့ပေါ့'],related:['chinese','sichuan'],hint:'Related cuisine — hot pot is not confirmed'},
 {id:'rice',label:'ထမင်း',english:'rice',aliases:['ထမင်း','rice','ထမင်းကြော်','fried rice'],related:['burmese','myanmar','indian','chinese','thai','japanese','korean','vietnamese'],hint:'Related cuisine — ask about the rice dishes served'},

 {id:'mont-ti',label:'မုန့်တီ',english:'mont ti',aliases:['မုန့်တီ','မုန့်တီ','မုန့်တီသုပ်','မုန့်တီသုပ်','mont ti','mont tee','mont di','montti'],related:['burmese','myanmar'],hint:'Burmese restaurants to ask about mont ti'},
 {id:'mohinga',label:'မုန့်ဟင်းခါး',english:'mohinga',aliases:['မုန့်ဟင်းခါး','မုန့်ဟင်းခါး','mohinga','moh hin ga','moh hin khar'],related:['burmese','myanmar'],hint:'Burmese restaurants to ask about mohinga'},
 {id:'butter-rice',label:'ထောပတ်ထမင်း',english:'Burmese butter rice',aliases:['ထောပတ်ထမင်း','ပဲထောပတ်ထမင်း','butter rice','buttered rice','Burmese butter rice','htaw bat htamin','htaw but htamin'],related:['burmese','myanmar'],hint:'Burmese restaurants to ask about butter rice'},
 {id:'danbauk',label:'ဒန်ပေါက်',english:'biryani',aliases:['ဒန်ပေါက်','danbauk','dan bauk','danpauk','biryani','briyani','biriyani','biriani'],related:['burmese','myanmar','indian','pakistani','bangladeshi'],hint:'Related cuisine — Burmese-style danbauk is not confirmed'},
 {id:'coffee',label:'ကော်ဖီ',english:'coffee',aliases:['ကော်ဖီ','coffee','espresso','cappuccino','latte','cafe','café'],related:['coffee','coffee shop'],categories:['cafe'],hint:'Café or coffee shop — check the drinks menu'},
 {id:'tea',label:'လက်ဖက်ရည်',english:'tea',aliases:['လက်ဖက်ရည်','tea','milk tea','လက်ဖက်ရည်ဆိုင်'],related:['tea','tea shop'],categories:['cafe'],hint:'Café or tea shop — check the drinks menu'},
 {id:'noodles',label:'ခေါက်ဆွဲ',english:'noodles',aliases:['ခေါက်ဆွဲ','noodle','noodles'],related:['burmese','myanmar','chinese','thai','vietnamese','japanese'],hint:'Related cuisine — ask which noodle dishes are served'},
 {id:'shan-noodles',label:'ရှမ်းခေါက်ဆွဲ',english:'Shan noodles',aliases:['ရှမ်းခေါက်ဆွဲ','shan noodles','shan noodle'],related:['burmese','myanmar','shan'],hint:'Burmese / Shan restaurants to ask about Shan noodles'},
 {id:'coconut-noodles',label:'အုန်းနို့ခေါက်ဆွဲ',english:'ohn no khao swe',aliases:['အုန်းနို့ခေါက်ဆွဲ','ohn no khao swe','ohn no khauk swe','Burmese coconut noodles'],related:['burmese','myanmar'],hint:'Burmese restaurants to ask about coconut noodles'},
 {id:'pizza',label:'ပီဇာ',english:'pizza',aliases:['ပီဇာ','pizza'],related:['italian'],hint:'Italian cuisine — pizza is not confirmed'},
 {id:'burger',label:'ဘာဂါ',english:'burger',aliases:['ဘာဂါ','burger','burgers','hamburger'],related:['american'],hint:'Related cuisine — check the menu'},
 {id:'ice-cream',label:'ရေခဲမုန့်',english:'ice cream',aliases:['ရေခဲမုန့်','ရေခဲမုန့်','ice cream','icecream','gelato'],related:['ice cream','gelato'],hint:'A related dessert listing — check the menu'},
];
export const foodNormalize=s=>normalize(s).replace(/\u103a\u1037/g,'\u1037\u103a').replace(/[_–—-]+/g,' ').replace(/\s+/g,' ').trim();
const compact=s=>foodNormalize(s).replace(/\s+/g,'');
export function foodIntent(query){const q=foodNormalize(query).replace(/\s+(near me|nearby)$/,'');return FOODS.find(f=>f.aliases.some(a=>compact(a)===compact(q)))||null;}
export function containsFood(text,term){const hay=foodNormalize(text),needle=foodNormalize(term);if(!needle)return false;if(/[\u1000-\u109f]/.test(needle))return compact(hay).includes(compact(needle));const escaped=needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^\\p{L}\\p{N}])'+escaped+'(?=$|[^\\p{L}\\p{N}])','u').test(hay);}
export function foodMatch(p,query){
 if(!query.trim())return {kind:'all',label:''};
 const intent=foodIntent(query),terms=intent?.aliases||[query],menu=p.dishesText||'',listing=[p.name,p.localName,p.cuisine,p.description].filter(Boolean).join(' ');
 if(terms.some(t=>containsFood(menu,t)))return {kind:'listed',label:'Dish listed by the editor · confirm availability'};
 if(terms.some(t=>containsFood(listing,t)))return {kind:'mentioned',label:'Name or listing matches · check the menu'};
 if(intent&&(intent.related.some(t=>containsFood([p.cuisine,p.name,p.localName].join(' '),t))||intent.categories?.includes(p.category)))return {kind:'related',label:intent.hint};
 // Unknown foods / restaurant names stay literal. Do not silently turn them into all restaurants.
 if(!intent&&foodNormalize(query).split(' ').filter(Boolean).every(t=>containsFood(listing,t)))return {kind:'mentioned',label:'Listing matches · check the menu'};
 return null;
}
export function selectFoodPlaces(places,{query='',center=null,radius=5000,category='all',cuisine='all',sort='distance',limitToRadius=true}={}){
 return places.filter(p=>(category==='all'||p.category===category)&&(cuisine==='all'||(cuisine==='unknown'?!p.cuisine:containsFood(p.cuisine||'',cuisine)))&&foodMatch(p,query)&&(!limitToRadius||!center||center.kind==='area'||coordinates(p.lat,p.lon)&&distance(center,p)*1000<=radius)).sort((a,b)=>sort==='distance'&&center&&center.kind!=='area'?distance(center,a)-distance(center,b):a.name.localeCompare(b.name));
}
export function mapsFoodUrl(query,center){const food=foodIntent(query)?.english||query.trim()||'restaurants';const near=center&&coordinates(center.lat,center.lon)&&center.kind!=='area'?` near ${center.lat},${center.lon}`:' near me';const url=new URL('https://www.google.com/maps/search/');url.searchParams.set('api','1');url.searchParams.set('query',food+near);return url.href;}
export function buildFoodQuery(center,{query='',radius=5000,limit=300}={}){
 if(!coordinates(center.lat,center.lon))throw Error('Choose a valid search location.');radius=Math.min(25000,Math.max(1000,Number(radius)||5000));limit=Math.min(500,Math.max(1,Number(limit)||300));
 const around=`(around:${radius},${center.lat},${center.lon})`,base=`(nwr${around}[amenity~"^(restaurant|cafe|fast_food|food_court|ice_cream)$"][name];nwr${around}[shop~"^(bakery|confectionery)$"][name];)`;
 if(!query.trim())return `[out:json][timeout:15];${base};out center ${limit};`;
 const intent=foodIntent(query),terms=intent?[...intent.aliases,...intent.related]:[query.trim().slice(0,100)];
 const regex=terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replaceAll(' ','[ _-]+')).join('|');
 const selectors=['name','name:en','name:my','cuisine','description'].map(key=>`nwr.food[${JSON.stringify(key)}~${JSON.stringify(regex)},i];`);
 if(intent?.categories?.includes('cafe'))selectors.push('nwr.food[amenity=cafe];');
 return `[out:json][timeout:15];${base}->.food;(${selectors.join('')});out center ${limit};`;
}

// Location-first collection: food/name filters never change the network request.
export function buildNearbyQuery(center,{radius=4828.032,limit=2000}={}){
 if(!coordinates(center.lat,center.lon))throw Error('Choose a valid location.');
 radius=Math.min(160934.4,Math.max(1000,Number(radius)||4828.032));
 limit=Math.min(2000,Math.max(1,Number(limit)||2000));
 const around=`(around:${radius},${center.lat},${center.lon})`;
 return `[out:json][timeout:15];(nwr${around}[amenity~"^(restaurant|cafe|fast_food|food_court|ice_cream)$"][name];nwr${around}[shop~"^(bakery|confectionery)$"][name];);out center ${limit};`;
}
