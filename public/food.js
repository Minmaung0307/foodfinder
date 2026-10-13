import {normalize,coordinates,distance} from './core.js';
import {canonicalSearch,isGrocery,groceryShopTypes,brandSearchTerms} from './search-vocabulary.js';
// Search vocabulary, not a claim about a restaurant's current menu.
export const FOODS=[
 {id:'korean',label:'Korean',english:'Korean',aliases:['korean','korea','ကိုရီးယား','ကိုရီးယားဆိုင်'],related:[],hint:'Korean listing — check the menu'},
 {id:'chinese',label:'Chinese',english:'Chinese',aliases:['chinese','china','တရုတ်','တရုတ်ဆိုင်','တရုတ်ထမင်းဆိုင်','တရုတ်အစားအစာ'],related:[],hint:'Chinese listing — check the menu'},
 {id:'korean-bbq',label:'Korean BBQ',english:'Korean BBQ',aliases:['korean bbq','korean barbecue','korean barbeque','kbbq','k bbq','ကိုရီးယားအကင်','ကိုရီးယားအကင်ဆိုင်'],related:['korean'],hint:'Korean cuisine — barbecue service is not confirmed'},
 {id:'korean-hotpot',label:'Korean hot pot',english:'Korean hot pot',aliases:['korean hot pot','korean hot pots','korean hotpot','ကိုရီးယားဟော့ပေါ့','ကိုရီးယားဟော့ပေါ့ဆိုင်'],related:['korean'],hint:'Korean cuisine — hot pot service is not confirmed'},
 {id:'restaurants',label:'Restaurants',english:'restaurants',aliases:['restaurant','restaurants','စားသောက်ဆိုင်'],related:[],categories:['restaurant'],amenities:['restaurant'],hint:'Restaurant listing — check the menu'},
 {id:'food-court',label:'Food courts',english:'food court',aliases:['food court','food courts','foodcourt'],related:[],amenities:['food_court'],hint:'Food court listing — individual counters may vary'},
 {id:'smoothies',label:'Smoothies & juice',english:'smoothies',aliases:['smoothy','smoothie','smoothies','juice','juice bar'],related:['juice','juice bar'],categories:['cafe'],hint:'Café or juice listing — smoothies are not confirmed'},
 {"id": "vietnamese", "label": "Vietnamese", "english": "Vietnamese", "aliases": ["vietnamese", "vietnam", "ဗီယက်နမ်", "ဗီယက်နမ်ဆိုင်"], "related": [], "hint": "Cuisine listing — check the menu"},
 {"id": "lao", "label": "Lao", "english": "Lao", "aliases": ["lao", "laos", "laotian", "လာအို", "လာအိုဆိုင်"], "related": [], "hint": "Cuisine listing — check the menu"},
 {"id": "thai", "label": "Thai", "english": "Thai", "aliases": ["thai", "thailand", "ထိုင်း", "ထိုင်းဆိုင်"], "related": [], "hint": "Cuisine listing — check the menu"},
 {"id": "indian", "label": "Indian", "english": "Indian", "aliases": ["indian", "india", "အိန္ဒိယ", "အိန္ဒိယဆိုင်"], "related": [], "hint": "Cuisine listing — check the menu"},
 {"id": "pakistani", "label": "Pakistani", "english": "Pakistani", "aliases": ["pakistani", "pakistan", "ပါကစ္စတန်", "ပါကစ္စတန်ဆိုင်"], "related": [], "hint": "Cuisine listing — check the menu"},
 {"id": "filipino", "label": "Filipino", "english": "Filipino", "aliases": ["filipino", "philippine", "philippines", "pilipino", "ဖီလစ်ပိုင်", "ဖိလစ်ပိုင်", "ဖီလစ်ပိုင်ဆိုင်"], "related": [], "hint": "Cuisine listing — check the menu"},
 {id:'steak',label:'Steak',english:'steak',aliases:['steak','steaks','stakes','steakhouse','steak house'],related:['grill','american'],hint:'Related cuisine — steak is not confirmed'},
 {id:'lobster',label:'Lobster',english:'lobster',aliases:['lobster','lobsters','lobster roll','lobster rolls'],related:['seafood'],hint:'Seafood listing — lobster is not confirmed'},
 {id:'soup',label:'Soup',english:'soup',aliases:['soup','soups'],related:['vietnamese','thai','lao','chinese','japanese','deli'],grocery:true,hint:'Related cuisine — check soup availability'},
 {id:'sushi',label:'Sushi',english:'sushi',aliases:['sushi','ဆူရှီ'],related:['japanese'],grocery:true,hint:'Japanese cuisine — check the sushi menu'},
 {id:'sandwich',label:'Sandwiches & subs',english:'sandwich',aliases:['sandwich','sandwiches','sandwish','sandwishes','sub','subs','sub sandwich','sub sandwiches','hoagie'],related:['sandwich','deli'],grocery:true,hint:'Deli or sandwich listing — check the menu'},
 {id:'cake',label:'Cakes',english:'cake',aliases:['cake','cakes','ကိတ်','ကိတ်မုန့်'],related:['bakery'],categories:['sweet'],grocery:true,hint:'Bakery or sweets listing — check cake availability'},
 {id:'hot-bar',label:'Hot bar & prepared food',english:'hot bar food',aliases:['hot bar','hot bar food','hot food','hot foods','prepared food','prepared foods','ready to eat','ready-to-eat'],related:['deli','buffet'],grocery:true,hint:'Deli or buffet listing — check prepared-food hours'},
 {id:'grocery',label:'Grocery stores & delis',english:'grocery stores',aliases:['grocery','groceries','grocery store','grocery stores','supermarket','supermarkets','food market','deli'],related:[],grocery:true,hint:'Grocery or deli — check available food counters'},
 {id:'udon',label:'Udon',english:'udon',aliases:['udon','うどん','အူဒုံ'],related:['japanese'],hint:'Japanese cuisine — udon is not confirmed; check the menu'},
 {id:'ramen',label:'Ramen',english:'ramen',aliases:['ramen','ラーメン'],related:['japanese'],hint:'Japanese cuisine — ramen is not confirmed; check the menu'},
 {id:'pho',label:'Phở',english:'pho',aliases:['pho','phở'],related:['vietnamese'],hint:'Vietnamese cuisine — pho is not confirmed; check the menu'},
 {id:'hotpot',label:'Hot pot',english:'hot pot',aliases:['hotpot','hotpots','hot pot','hot pots','hot-pot','hot_pot','ဟော့ပေါ့'],related:['chinese','sichuan','korean'],hint:'Related cuisine — hot pot is not confirmed'},
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
export function foodIntent(query){const q=foodNormalize(query).replace(/\s+(near me|nearby)$/,'').replace(/\s+(restaurants?|food|cuisine|shops?)$/,'');return FOODS.find(f=>f.aliases.some(a=>compact(a)===compact(q)||compact(a)===compact(query)))||null;}
export function containsFood(text,term){const hay=foodNormalize(text),needle=foodNormalize(term);if(!needle)return false;if(/[\u1000-\u109f]/.test(needle))return compact(hay).includes(compact(needle));const escaped=needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^\\p{L}\\p{N}])'+escaped+'(?=$|[^\\p{L}\\p{N}])','u').test(hay);}
export function foodMatch(p,query){
 query=canonicalSearch(query);
 if(!query.trim())return {kind:'all',label:''};
 const nameKey=s=>foodNormalize(s).replace(/[^\p{L}\p{N}]/gu,'');
 const nameQuery=nameKey(query);
 const intent=foodIntent(query),terms=intent?.aliases||brandSearchTerms(query)||[query],menu=p.dishesText||'',listing=[p.name,p.localName,p.searchNames,p.cuisine,p.description].filter(Boolean).join(' ');
 if(terms.some(t=>containsFood(menu,t)))return {kind:'listed',label:'Food listed in the source · confirm availability'};
 if(terms.some(t=>containsFood(listing,t)))return {kind:'mentioned',label:'Name or listing matches · check the menu'};
 if(!intent&&nameQuery&&[p.name,p.localName,p.searchNames].some(name=>nameKey(name).includes(nameQuery)))return {kind:'mentioned',label:'Name matches · check the menu'};
 if(intent?.grocery&&isGrocery(p))return {kind:'related',label:'Grocery / deli suggestion · this food, counter hours and seating are not confirmed at this branch'};
 if(intent&&(intent.amenities?.includes(p.amenity)||intent.related.some(t=>containsFood([p.cuisine,p.name,p.localName].join(' '),t))||intent.categories?.includes(p.category)))return {kind:'related',label:intent.hint};
 // Unknown foods / restaurant names stay literal. Do not silently turn them into all restaurants.
 if(!intent&&foodNormalize(query).split(' ').filter(Boolean).every(t=>containsFood(listing,t)))return {kind:'mentioned',label:'Listing matches · check the menu'};
 return null;
}
export function selectFoodPlaces(places,{query='',center=null,radius=5000,category='all',cuisine='all',sort='distance',limitToRadius=true}={}){
 return places.filter(p=>(category==='all'||p.category===category)&&(cuisine==='all'||(cuisine==='unknown'?!p.cuisine:containsFood(p.cuisine||'',cuisine)))&&foodMatch(p,query)&&(!limitToRadius||!center||center.kind==='area'||coordinates(p.lat,p.lon)&&distance(center,p)*1000<=radius)).sort((a,b)=>sort==='distance'&&center&&center.kind!=='area'?distance(center,a)-distance(center,b):a.name.localeCompare(b.name));
}
export function mapsFoodUrl(query,center){const food=foodIntent(query)?.english||canonicalSearch(query)||'restaurants';const near=center&&coordinates(center.lat,center.lon)&&center.kind!=='area'?` near ${center.lat},${center.lon}`:' near me';const url=new URL('https://www.google.com/maps/search/');url.searchParams.set('api','1');url.searchParams.set('query',food+near);return url.href;}
export function buildFoodQuery(center,{query='',radius=5000,limit=300}={}){
 query=canonicalSearch(query);
 if(!coordinates(center.lat,center.lon))throw Error('Choose a valid search location.');radius=Math.min(160934.4,Math.max(1000,Number(radius)||5000));limit=Math.min(2000,Math.max(1,Number(limit)||300));
 const around=`(around:${radius},${center.lat},${center.lon})`,base=`(nwr${around}[amenity~"^(restaurant|cafe|fast_food|food_court|ice_cream|bar|pub|marketplace)$"];nwr${around}[shop~"^(bakery|confectionery|supermarket|grocery|convenience|deli|greengrocer|butcher|seafood|cheese|farm|health_food)$"];)`;
 if(!query.trim())return `[out:json][timeout:20][maxsize:${radius<=10000?67108864:268435456}];${base};out center ${limit};`;
 const intent=foodIntent(query),brandTerms=brandSearchTerms(query),terms=intent?[...intent.aliases,...intent.related]:brandTerms||[query.trim().slice(0,100)];
 const regex=terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replaceAll(' ','[ _-]*').replace(/([a-zA-Z])([0-9])/g,'$1[ _-]*$2')).join('|');
 const selectors=['name','name:en','name:my','alt_name','short_name','brand','cuisine','description'].map(key=>`nwr.food[${JSON.stringify(key)}~${JSON.stringify(regex)},i];`);
 if(brandTerms)for(const key of ['name','name:en','brand'])selectors.push(`nwr${around}[${JSON.stringify(key)}~${JSON.stringify(regex)},i][shop];`);
 if(intent?.amenities)for(const amenity of intent.amenities)selectors.push(`nwr.food[amenity=${JSON.stringify(amenity)}];`);
 if(intent?.grocery)selectors.push(`nwr.food[shop~"^(${groceryShopTypes.join('|')})$"];`);
 if(intent?.categories?.includes('sweet'))selectors.push('nwr.food[shop~"^(bakery|confectionery)$"];nwr.food[amenity=ice_cream];');
 if(intent?.categories?.includes('cafe'))selectors.push('nwr.food[amenity=cafe];');
 return `[out:json][timeout:20][maxsize:${radius<=10000?67108864:268435456}];${base}->.food;(${selectors.join('')});out center ${limit};`;
}

// Nearby browsing and targeted searches use separate requests and caches.
export function buildNearbyQuery(center,{radius=4828.032,limit=2000}={}){
 if(!coordinates(center.lat,center.lon))throw Error('Choose a valid location.');
 radius=Math.min(160934.4,Math.max(1000,Number(radius)||4828.032));
 limit=Math.min(2000,Math.max(1,Number(limit)||2000));
 const around=`(around:${radius},${center.lat},${center.lon})`;
 return `[out:json][timeout:20][maxsize:${radius<=10000?67108864:268435456}];(nwr${around}[amenity~"^(restaurant|cafe|fast_food|food_court|ice_cream|bar|pub|marketplace)$"];nwr${around}[shop~"^(bakery|confectionery|supermarket|grocery|convenience|deli|greengrocer|butcher|seafood|cheese|farm|health_food)$"];);out center ${limit};`;
}
