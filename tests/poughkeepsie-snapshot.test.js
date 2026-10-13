import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {distance} from '../public/core.js';import {selectFoodPlaces} from '../public/food.js';
const bundles=JSON.parse(await readFile(new URL('../public/data/starter.json',import.meta.url))),bundle=bundles.find(c=>c.id==='5132143');
test('dated Poughkeepsie snapshot has sourced records within three miles including local cuisines',()=>{
 assert.equal(bundle.places.length,163);assert.equal(new Set(bundle.places.map(p=>p.id)).size,163);
 for(const p of bundle.places){assert.ok(distance(bundle,p)*1000<=4828.032);assert.match(p.source,/openstreetmap.org\/(node|way|relation)\/\d+$/);assert.equal(p.snapshotAt,'2026-10-13');}
 assert.ok(selectFoodPlaces(bundle.places,{query:'filipino',center:bundle,radius:4828.032}).some(p=>p.name==='Hapág Bistro'));
 assert.ok(selectFoodPlaces(bundle.places,{query:'indian',center:bundle,radius:4828.032}).some(p=>p.name==='Kismat'));
 assert.equal(selectFoodPlaces(bundle.places,{center:{lat:34,lon:-118},radius:4828.032}).length,0);
});
