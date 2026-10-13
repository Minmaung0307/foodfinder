import {normalize} from './core.js';
// Spelling aliases only: these do not assert a branch's menu or services.
const brands=[
 {name:'Subway',aliases:['subway','sub way']},
 {name:'Adams Fairacre Farms',aliases:['adams','adams fairacre farms','adams fairacre farm']},
 {name:'Publix',aliases:['publix']},
 {name:'Food Lion',aliases:['food lion','foodlion']},
 {name:'Harris Teeter',aliases:['harris teeter','harristeeter','harry teater','harry teeter','harris teater']},
];
const key=s=>normalize(s).replace(/[^\p{L}\p{N}]/gu,'');
export function canonicalSearch(query){const text=String(query||'').trim();return brands.find(b=>b.aliases.some(a=>key(a)===key(text)))?.name||text;}
export const groceryShopTypes=['supermarket','grocery','convenience','deli'];
export function isGrocery(place){return groceryShopTypes.includes(place.shopType)||brands.filter(b=>b.name!=='Subway').some(b=>[place.name,place.localName,place.searchNames].some(name=>key(name).includes(key(b.name))));}

export function brandSearchTerms(query){return brands.find(b=>b.aliases.some(a=>key(a)===key(query)))?.aliases||null;}
