import test from 'node:test';
import assert from 'node:assert/strict';
import {foodMatch,buildFoodQuery,buildNearbyQuery,selectFoodPlaces} from '../public/food.js';
import {fromOSM} from '../public/core.js';
import {findLive,liveCacheKey} from '../public/live.js';
import {readFile} from 'node:fs/promises';
import {decodeCities,cityMatches} from '../public/cities.js';
const city={id:'5132143',name:'Poughkeepsie',country:'US',lat:41.70037,lon:-73.92097};
test('reported names, spelling variants, food shops and dishes remain searchable',()=>{
 for(const [name,q] of [['Adams Fairacre Farms','Adams'],['Saigon Cafe','Saigon'],['NB 96','NB96'],['NB96','NB 96'],['Phở Corner','Pho']])assert.equal(foodMatch({name},q)?.kind,'mentioned');
 assert.equal(foodMatch({name:'Kitchen',cuisine:'japanese'},'Udon')?.kind,'related');
 assert.equal(foodMatch({name:'Kitchen',cuisine:'vietnamese'},'Pho')?.kind,'related');
 assert.equal(foodMatch({name:'Kitchen',dishesText:'Udon soup'},'Udon')?.kind,'listed');
 assert.equal(foodMatch({name:'Pizza House',cuisine:'italian'},'Udon'),null);
 assert.equal(foodMatch({name:'Steak House'},'tea'),null);
 assert.equal(foodMatch({name:'Udon House',dishesText:'Udon soup'},'udon')?.kind,'listed');
 const p=fromOSM({type:'node',id:1,lat:city.lat,lon:city.lon,tags:{'name:en':'Market',shop:'supermarket',alt_name:'Adams'}},city);
 assert.equal(foodMatch(p,'Adams')?.kind,'mentioned');
 assert.match(buildNearbyQuery(city),/supermarket\|grocery\|convenience\|deli/);
 assert.match(buildFoodQuery(city,{query:'NB96',radius:80467.2}),/around:80467.2/);
 assert.match(buildFoodQuery(city,{query:'NB96'}),/NB\[ _-\]\*96/);
 assert.equal(selectFoodPlaces([{name:'Pizza House',lat:city.lat,lon:city.lon}],{query:'NB96',center:city}).length,0);
});
test('reported cities resolve correctly',async()=>{
 const rows=JSON.parse(await readFile(new URL('../public/data/cities.json',import.meta.url))),extras=JSON.parse(await readFile(new URL('../public/data/location-aliases.json',import.meta.url)));
 const cities=decodeCities(rows,extras);
 assert.equal(cityMatches(cities,'LA, CA')[0]?.name,'Los Angeles');
 assert.equal(cityMatches(cities,'Poughkeepsie, NY')[0]?.id,city.id);
});
test('live search targets query, isolates caches, refreshes, preserves stale results, and cancels',async()=>{
 const originalFetch=globalThis.fetch,originalStorage=globalThis.localStorage,originalNow=Date.now;
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 let now=originalNow(),requests=[];Date.now=()=>now;
 const config={liveSearchEnabled:true,overpassEndpoint:'https://example.com/interpreter',resultLimit:2000};
 globalThis.fetch=async url=>{requests.push(new URL(url).searchParams.get('data'));return {ok:true,json:async()=>({elements:[{type:'node',id:1,lat:city.lat,lon:city.lon,tags:{name:'Adams Fairacre Farms',shop:'supermarket'}}]})};};
 try{
  const first=await findLive(city,config,{query:'Adams'});assert.equal(first.places[0].name,'Adams Fairacre Farms');assert.match(requests[0],/adams/i);
  await findLive(city,config,{query:'Adams'});assert.equal(requests.length,1);
  now+=20000;await findLive(city,config,{query:'Saigon'});assert.equal(requests.length,2);assert.match(requests[1],/Saigon/);
  now+=20000;await findLive(city,config,{query:'Adams',refresh:true});assert.equal(requests.length,3);
  now+=20000;globalThis.fetch=async()=>{throw Error('Offline');};
  assert.equal((await findLive(city,config,{query:'Adams',refresh:true})).stale,true);
  const controller=new AbortController();controller.abort();
  await assert.rejects(findLive(city,config,{query:'new query',signal:controller.signal}),{name:'AbortError'});
  assert.notEqual(liveCacheKey(city,5000,'Adams'),liveCacheKey(city,5000,'Saigon'));
 }finally{globalThis.fetch=originalFetch;globalThis.localStorage=originalStorage;Date.now=originalNow;}
});
