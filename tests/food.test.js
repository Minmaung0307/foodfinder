import test from 'node:test';
import assert from 'node:assert/strict';
import {foodIntent,foodMatch,containsFood,selectFoodPlaces,buildFoodQuery,buildNearbyQuery,mapsFoodUrl} from '../public/food.js';
import {liveCacheKey} from '../public/live.js';
test('Burmese foods and spelling variants resolve without inventing dish availability',()=>{
 for(const [q,id] of [['မုန့်တီ','mont-ti'],['မုန့်တီ','mont-ti'],['မုန့်ဟင်းခါး','mohinga'],['ထောပတ်ထမင်း','butter-rice'],['ဒန်ပေါက်','danbauk'],['ကော်ဖီ','coffee']])assert.equal(foodIntent(q)?.id,id);
 assert.equal(foodMatch({name:'Myanmar Kitchen',cuisine:'burmese'},'မုန့်တီ').kind,'related');
 assert.equal(foodMatch({name:'Thai Kitchen',cuisine:'thai'},'မုန့်တီ'),null);
 assert.equal(foodMatch({name:'Kitchen',dishesText:'Mohinga, mont ti'},'မုန့်ဟင်းခါး').kind,'listed');
 assert.equal(foodMatch({name:'Indian Kitchen',cuisine:'indian'},'ဒန်ပေါက်').kind,'related');
 assert.equal(containsFood('steak','tea'),false);assert.equal(containsFood('price','rice'),false);
});
test('nearby results honor radius and closest first',()=>{
 const center={lat:36,lon:-75};const places=[{id:'far',name:'Cafe Far',category:'cafe',lat:36.1,lon:-75},{id:'near',name:'Cafe Near',category:'cafe',lat:36.001,lon:-75},{id:'middle',name:'Cafe Middle',category:'cafe',lat:36.02,lon:-75}];
 assert.deepEqual(selectFoodPlaces(places,{query:'ကော်ဖီ',center,radius:5000}).map(p=>p.id),['near','middle']);
 assert.notEqual(liveCacheKey(center,5000,'coffee'),liveCacheKey(center,10000,'coffee'));
 assert.equal(liveCacheKey(center,5000,'coffee'),liveCacheKey(center,5000,'mohinga'));
});
test('targeted provider queries and external maps use food and actual search center',()=>{
 const c={lat:36,lon:-75};const q=buildFoodQuery(c,{query:'မုန့်တီ',radius:10000});assert.match(q,/around:10000,36,-75/);assert.match(q,/burmese/);assert.match(q,/nwr.food/);
 assert.match(new URL(mapsFoodUrl('ကော်ဖီ',c)).searchParams.get('query'),/coffee near 36,-75/);
 assert.match(buildFoodQuery(c,{query:'";out;[x'}),/\\"/);
});

test('location collection supports the full 100-mile radius without dish constraints',()=>{
 const q=buildNearbyQuery({lat:36,lon:-86},{radius:160934.4});assert.match(q,/around:160934.4,36,-86/);assert.match(q,/out center 2000/);assert.ok(!q.includes('cuisine'));
 const places=[{name:'Sakura',cuisine:'japanese',lat:36,lon:-86},{name:'Roma',cuisine:'italian',lat:36,lon:-86}];assert.deepEqual(selectFoodPlaces(places,{cuisine:'italian'}).map(p=>p.name),['Roma']);
});

test('hotpot, briyani and Burmese rice aliases distinguish listing and related cuisine',()=>{
 assert.equal(foodIntent('briyani').id,'danbauk');assert.equal(foodIntent('hotpot').id,'hotpot');assert.equal(foodIntent('ထမင်း').id,'rice');
 assert.equal(foodMatch({name:'Hot Pot House'},'hotpot').kind,'mentioned');
 assert.equal(foodMatch({name:'Chinese Kitchen',cuisine:'chinese'},'hotpot').kind,'related');
 assert.equal(foodMatch({name:'Pizza House',cuisine:'pizza'},'မုန့်တီ'),null);
});
