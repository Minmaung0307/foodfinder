import test from 'node:test';
import assert from 'node:assert/strict';
import {foodMatch,buildFoodQuery,mapsFoodUrl} from '../public/food.js';
import {canonicalSearch,isGrocery} from '../public/search-vocabulary.js';
import {fromOSM} from '../public/core.js';
import {liveCacheKey} from '../public/live.js';
const center={lat:35.9,lon:-75.6};
test('grocery chain spelling aliases work in listing, provider and external searches',()=>{
 for(const [query,name] of [['publix','Publix'],['foodlion','Food Lion'],['harry teater','Harris Teeter'],['harristeeter','Harris Teeter']]){
  assert.equal(canonicalSearch(query),name);
  assert.equal(foodMatch({name},query)?.kind,'mentioned');
  assert.ok(isGrocery({name}));
  assert.ok(new URL(mapsFoodUrl(query,center)).searchParams.get('query').startsWith(name));
  assert.equal(buildFoodQuery(center,{query}),buildFoodQuery(center,{query:name}));
  assert.equal(liveCacheKey(center,5000,query),liveCacheKey(center,5000,name));
 }
});
test('grocery food searches include supermarkets without promising menus or seating',()=>{
 const p=fromOSM({type:'node',id:12,lat:center.lat,lon:center.lon,tags:{name:'Neighborhood Market',shop:'supermarket'}},{name:'Town',country:'US'});
 assert.equal(p.shopType,'supermarket');
 for(const q of ['sushi','sub','subs','sandwish','sandwiches','cakes','hot bar food','grocery stores']){
  const match=foodMatch(p,q);assert.equal(match?.kind,'related',q);assert.match(match.label,/not confirmed/);
  assert.match(buildFoodQuery(center,{query:q}),/nwr.food\[shop~/);
 }
 assert.equal(foodMatch({name:'Library'},'sushi'),null);
 assert.equal(foodMatch({name:'Market',shopType:'supermarket',dishesText:'Fresh sushi'},'sushi')?.kind,'listed');
 assert.equal(foodMatch(p,'udon'),null);
});
