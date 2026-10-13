import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),requests=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.addInitScript(()=>{
  window.geoCalls=0;window.clockOffset=0;const now=Date.now;Date.now=()=>now()+window.clockOffset;
  Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(success){window.geoCalls++;success({coords:{latitude:36,longitude:-76,accuracy:10}});}}});
 });
 await context.route('**/verified-places.json',route=>route.fulfill({json:[]}));
 await context.route('**/data/starter.json',r=>r.fulfill({json:[]}));
 await context.route('**/config.json',async route=>{const response=await route.fetch();await route.fulfill({json:{...await response.json(),cloudEnabled:false}});});
 await context.route('https://overpass*/**',async route=>{
  const query=new URL(route.request().url()).searchParams.get('data');requests.push(query);
  const [,lat,lon]=query.match(/around:[\d.]+,(-?[\d.]+),(-?[\d.]+)/);
  await route.fulfill({json:{elements:['Publix','Food Lion','Harris Teeter'].map((name,i)=>({type:'node',id:i+1,lat:Number(lat),lon:Number(lon),tags:{name,shop:'supermarket'}}))}});
 });
 await page.goto(process.env.FOOD_URL||'http://127.0.0.1:8876');
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 assert.equal(await page.evaluate(()=>window.geoCalls),0);
 await page.locator('#change-town').click();await page.locator('#city-query').fill('Poughkeepsie NY');
 await page.locator('#city-options button').filter({hasText:'Poughkeepsie'}).first().click();
 await page.waitForSelector('.place-card');assert.match(await page.locator('#search-center').innerText(),/Poughkeepsie/);
 assert.ok(requests[0].includes('41.70037,-73.92097'));
 for(const query of ['foodlion','harry teater','sushi','sub','sandwish','cakes','hot bar food']){
  await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#query').fill(query);await page.locator('#search-form button').click();
  await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
  assert.equal(await page.locator('.place-card').count(),['foodlion','harry teater'].includes(query)?1:3);
 }
 assert.match(await page.locator('.match-badge').first().innerText(),/Grocery/);
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#radius').selectOption('16093.44');
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 assert.equal(await page.locator('#query').inputValue(),'hot bar food');assert.match(requests.at(-1),/around:16093.44,41.70037,-73.92097/);
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#change-town').click();await page.locator('#city-query').fill('Los Angeles CA');await page.locator('#city-options button').filter({hasText:'Los Angeles'}).first().click();
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 assert.match(requests.at(-1),/34.05223,-118.24368/);assert.equal(await page.evaluate(()=>window.geoCalls),0);
 await page.reload();await page.waitForFunction(()=>document.querySelector('#search-center').textContent.includes('Los Angeles'));
 assert.equal(await page.evaluate(()=>window.geoCalls),0);
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#use-location').click();
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 assert.equal(await page.evaluate(()=>window.geoCalls),1);assert.match(requests.at(-1),/36,-76/);
 assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 console.log('PASS: mobile grocery aliases/dishes, remote town search, retained query/radius, remembered town, explicit GPS only, no page errors or horizontal overflow. Provider responses are fixtures.');
}finally{await browser.close();}
