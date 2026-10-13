import test from 'node:test';import assert from 'node:assert/strict';
import {findLive,cachedLive,liveCacheKey} from '../public/live.js';
const city={id:'5132143',name:'Poughkeepsie',country:'US',lat:41.70037,lon:-73.92097};
test('504 switches to backup, remembers success, and keeps older area results across cache/radius changes',async()=>{
 const original={fetch:globalThis.fetch,storage:globalThis.localStorage,now:Date.now};const store=new Map();let now=Date.now();Date.now=()=>now;globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const config={liveSearchEnabled:true,overpassEndpoints:['https://primary.example/api','https://backup.example/api']},calls=[];
 const elements=Array.from({length:47},(_,i)=>({type:'node',id:i+1,lat:city.lat,lon:city.lon,tags:{name:`Place ${i}`,amenity:'restaurant'}}));
 globalThis.fetch=async url=>{calls.push(new URL(url).hostname);return new URL(url).hostname==='primary.example'?{ok:false,status:504}:{ok:true,json:async()=>({elements})};};
 try{
  const result=await findLive(city,config,{radius:4828.032});assert.equal(result.places.length,47);assert.deepEqual(calls,['primary.example','backup.example']);
  now+=20000;await findLive(city,config,{radius:4828.032,refresh:true});assert.equal(calls.at(-1),'backup.example');assert.equal(calls.length,3);
  const fallback=cachedLive(city,48280.32,'pizza');assert.equal(fallback.partial,true);assert.equal(fallback.places.length,47);
  now+=20000;globalThis.fetch=async()=>({ok:false,status:504});const failed=await findLive(city,config,{radius:48280.32,query:'pizza'});assert.equal(failed.stale,true);assert.equal(failed.partial,true);assert.equal(failed.places.length,47);
  assert.equal(cachedLive({...city,lat:34},48280.32),null);
  const oldKey='v4:41.7004,-73.9210:1000:nearby';store.set('ff:cacheKeys',JSON.stringify([oldKey]));store.set('ff:'+oldKey,JSON.stringify({places:[{id:'old-place'}],at:now-86400000}));
  assert.equal(cachedLive(city,5000,'coffee').places[0].id,'old-place');
 }finally{globalThis.fetch=original.fetch;globalThis.localStorage=original.storage;Date.now=original.now;}
});
