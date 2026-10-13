import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage(),queries=[];let hold=false,release,fail=false;
 await ctx.addInitScript(()=>{window.clockOffset=0;const now=Date.now;Date.now=()=>now()+window.clockOffset;});
 await ctx.route('**/data/starter.json',r=>r.fulfill({json:[]}));
 await ctx.route('**/config.json',async r=>{const response=await r.fetch();await r.fulfill({json:{...await response.json(),cloudEnabled:false,overpassEndpoints:['https://overpass-api.de/api/interpreter']}});});
 await ctx.route('**/verified-places.json',r=>r.fulfill({json:[]}));
 await ctx.route('https://overpass*/**',async r=>{
  const q=new URL(r.request().url()).searchParams.get('data');queries.push(q);if(hold)await new Promise(resolve=>release=resolve);
  if(fail)return r.fulfill({status:503,json:{error:'test outage'}});
  const [,lat,lon]=q.match(/around:[\d.]+,(-?[\d.]+),(-?[\d.]+)/);
  const tags=[{name:'Publix',shop:'supermarket'},{name:'Local Kitchen',amenity:'restaurant',cuisine:'pakistani'},{name:'Central Plaza',amenity:'food_court'},{name:'Island Kitchen',amenity:'restaurant',cuisine:'filipino'},{name:'Spice Kitchen',amenity:'restaurant',cuisine:'indian'},{name:'Tropical Smoothie Cafe',amenity:'cafe'},{name:'Subway',amenity:'fast_food',cuisine:'sandwich'},{name:'Pizza Corner',amenity:'fast_food',cuisine:'pizza'},{name:'Gelato House',amenity:'ice_cream'}];
  await r.fulfill({json:{elements:tags.map((tags,i)=>({type:'node',id:i+1,lat:Number(lat),lon:Number(lon),tags}))}});
 });
 const settled=()=>page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 const advance=()=>page.evaluate(()=>window.clockOffset+=20000);
 await page.goto(process.env.FOOD_URL||'http://127.0.0.1:8876');await settled();
 await page.locator('#change-town').click();await page.locator('#city-query').fill('Poughkeepsie NY');await page.locator('#city-options button').filter({hasText:'Poughkeepsie'}).first().click();await settled();
 for(const [group,name] of [['grocery','Publix'],['restaurants','Local Kitchen'],['food court','Central Plaza'],['smoothies','Tropical Smoothie Cafe'],['sandwich','Subway'],['Subway','Subway'],['pizza','Pizza Corner'],['ice cream','Gelato House']]){
  const before=queries.length;await advance();await page.locator(`[data-browse="${group}"]`).click();await settled();assert.ok(queries.length>before);assert.ok(await page.locator('.place-card').filter({hasText:name}).count()>0,group);
 }
 for(const cuisine of ['filipino','pakistani','indian']){await advance();await page.locator('#browse-cuisine').selectOption(cuisine);await settled();assert.equal(await page.locator('.place-card').count(),1);}
 await advance();await page.locator('[data-browse=""]').click();await settled();assert.equal(await page.locator('#query').inputValue(),'');assert.equal(await page.locator('.place-card').count(),9);assert.ok(queries.some(q=>!q.includes('nwr.food')));
 hold=true;await advance();await page.locator('#query').fill('not in loaded data');await page.locator('#search-form button').click();
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Searching'));
 assert.equal(await page.locator('#result-count').innerText(),'Searching…');assert.ok(!(await page.locator('#food-explanation').innerText()).includes('No matches'));
 while(!release)await new Promise(r=>setTimeout(r,10));hold=false;fail=true;release();await settled();assert.match(await page.locator('#food-explanation').innerText(),/could not complete/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 console.log('PASS: all browse groups trigger searches, cuisine filters match metadata, All reloads all types, pending requests never show zero as final, failures are distinct, mobile layout fits. Simulated provider data.');
}finally{await browser.close();}
