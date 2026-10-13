import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {foodIntent,foodMatch,selectFoodPlaces,buildFoodQuery} from '../public/food.js';import {mergePlaces} from '../public/place-collection.js';
const places=JSON.parse(await readFile(new URL('../public/data/verified-places.json',import.meta.url))),center={lat:41.70037,lon:-73.92097};
test('all five official Adams branches are available within 30 straight-line miles without a map response',()=>{
 const found=selectFoodPlaces(places,{query:'Adams',center,radius:48280.32});assert.equal(found.length,5);
 assert.equal(selectFoodPlaces(places,{query:'Adams',center,radius:4828.032}).length,1);
 assert.equal(selectFoodPlaces(places,{query:'Adams',center:{lat:34.05223,lon:-118.24368},radius:48280.32}).length,0);
 for(const p of places){assert.match(p.source,/^https:/);assert.equal(p.sourceType,'Official business website');assert.equal(p.verifiedAt,'2026-10-13');}
 assert.equal(selectFoodPlaces(places,{query:'ဗီယက်နမ်',center,radius:48280.32})[0].name,'Miss Saigon');
});
test('official branch merges remove a nearby map duplicate but retain distinct branches',()=>{
 const first=places[0],mapped={...first,id:'osm-way-123',sourceType:'OpenStreetMap',name:'Adams Fairacre Farms',lat:first.lat+.0001};
 const result=mergePlaces([mapped,...places]);assert.equal(result.length,places.length);assert.ok(!result.some(p=>p.id===mapped.id));
 const remote={...mapped,id:'different-branch',lat:42};assert.ok(mergePlaces([remote,...places]).some(p=>p.id===remote.id));
 assert.equal(mergePlaces([...places,...places]).length,places.length);
});
test('cuisine language variants and restaurant suffixes match mapped cuisine',()=>{
 for(const [q,cuisine] of [['ဗီယက်နမ်ဆိုင်','vietnamese'],['လာအို','laotian'],['Thai restaurants','thai'],['အိန္ဒိယ','indian'],['ပါကစ္စတန်','pakistani'],['ဖီလစ်ပိုင်','filipino']]){
  assert.equal(foodMatch({name:'Local Kitchen',cuisine},q)?.kind,'mentioned',q);
  assert.ok(foodIntent(q));assert.ok(buildFoodQuery(center,{query:q}).includes(cuisine));
 }
});
test('dish plurals and misspellings work without turning a venue name into a dish',()=>{
 for(const [q,listed] of [['stakes','steak'],['lobsters','lobster'],['soups','soup'],['hot pots','hot pot']])assert.equal(foodMatch({name:'Kitchen',dishesText:listed},q)?.kind,'listed',q);
 assert.equal(foodMatch({name:'Seafood House',cuisine:'seafood'},'lobster')?.kind,'related');
 assert.equal(foodIntent('Red Pot'),null);assert.equal(foodMatch({name:'Red Pot'},'Red Pot')?.kind,'mentioned');
 assert.equal(foodMatch({name:'Red Pot'},'hot pot'),null);
 assert.match(buildFoodQuery(center,{query:'Adams'}),/\[shop\]/);
});
