import test from 'node:test';import assert from 'node:assert/strict';
import {foodMatch,foodIntent,buildFoodQuery,buildNearbyQuery} from '../public/food.js';
import {isGrocery,canonicalSearch} from '../public/search-vocabulary.js';
const center={lat:36,lon:-76};
test('browse groups select food courts, restaurants and smoothies from mapped metadata',()=>{
 assert.equal(foodMatch({name:'Central Plaza',amenity:'food_court'},'food court')?.kind,'related');
 assert.equal(foodMatch({name:'Burger Stand',amenity:'fast_food',category:'quick'},'food court'),null);
 assert.equal(foodMatch({name:'Local Kitchen',amenity:'restaurant',category:'restaurant'},'restaurants')?.kind,'related');
 assert.equal(foodMatch({name:'Tropical Smoothie Cafe'},'smoothy')?.kind,'mentioned');
 assert.match(buildFoodQuery(center,{query:'food court'}),/amenity="food_court"/);
 assert.match(buildFoodQuery(center,{query:'restaurants'}),/amenity="restaurant"/);
 assert.equal(canonicalSearch('sub way'),'Subway');assert.equal(isGrocery({name:'Subway'}),false);
 assert.ok(foodIntent('smoothies'));assert.match(buildNearbyQuery(center),/supermarket/);assert.match(buildNearbyQuery(center),/food_court/);
});
test('Korean BBQ, Korean hot pot and Burmese Chinese searches distinguish suggestions from listed dishes',()=>{
 for(const query of ['korean bbq','KBBQ','ကိုရီးယားအကင်ဆိုင်','korean hotpot','ကိုရီးယားဟော့ပေါ့ဆိုင်']){
  assert.equal(foodMatch({name:'Seoul Kitchen',cuisine:'korean'},query)?.kind,'related');
  assert.match(buildFoodQuery(center,{query}),/korean/);
  assert.equal(foodMatch({name:'Pizza Kitchen',cuisine:'italian'},query),null);
 }
 assert.equal(foodMatch({name:'Seoul BBQ',dishesText:'Korean BBQ'},'ကိုရီးယားအကင်ဆိုင်')?.kind,'listed');
 assert.equal(foodMatch({name:'Golden Kitchen',cuisine:'chinese'},'တရုတ်ထမင်းဆိုင်')?.kind,'mentioned');
 assert.equal(foodMatch({name:'Seoul Kitchen',cuisine:'korean'},'hot pots')?.kind,'related');
});
