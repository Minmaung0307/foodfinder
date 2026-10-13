import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const verified=JSON.parse(await readFile(new URL('../public/data/verified-places.json',import.meta.url)));
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:1000}}),page=await ctx.newPage();let unavailable=false;
 await ctx.addInitScript(()=>{window.clockOffset=0;const now=Date.now;Date.now=()=>now()+window.clockOffset;});
 await ctx.route('**/data/starter.json',r=>r.fulfill({json:[]}));
 await ctx.route('**/config.json',async r=>{const response=await r.fetch();await r.fulfill({json:{...await response.json(),cloudEnabled:false,overpassEndpoints:['https://overpass-api.de/api/interpreter']}});});
 await ctx.route('https://overpass*/**',async r=>{
  if(unavailable)return r.fulfill({status:503,json:{error:'simulated outage'}});
  const p=verified[0];return r.fulfill({json:{elements:[{type:'node',id:111,lat:p.lat,lon:p.lon,tags:{name:'Adams Fairacre Farms',shop:'supermarket',phone:p.phone}}]}});
 });
 await page.goto(process.env.FOOD_URL||'http://127.0.0.1:8876');
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 await page.locator('#change-town').click();await page.locator('#city-query').fill('Poughkeepsie NY');await page.locator('#city-options button').filter({hasText:'Poughkeepsie'}).first().click();
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#radius').selectOption('48280.32');
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#query').fill('Adams');await page.locator('#search-form button').click();
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 assert.equal(await page.locator('.place-card').count(),5);assert.equal(await page.locator('.place-card').filter({hasText:'Poughkeepsie'}).count(),1);
 unavailable=true;await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#retry-search').click();
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');assert.equal(await page.locator('.place-card').count(),5);assert.match(await page.locator('#status').innerText(),/unavailable/);
 await page.locator('.place-card').first().getByRole('button',{name:'View details',exact:true}).click();assert.equal(await page.getByRole('link',{name:'Official business source ↗'}).count(),1);await page.locator('#place-close').click();
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#query').fill('ဗီယက်နမ်');await page.locator('#search-form button').click();
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');assert.equal(await page.locator('.place-card').count(),1);assert.match(await page.locator('.place-card').innerText(),/Miss Saigon/);
 await page.locator('#query').fill('Adams');await page.locator('#explore').scrollIntoViewIfNeeded();
 if(process.env.SCREENSHOT_PATH)await page.screenshot({path:process.env.SCREENSHOT_PATH,fullPage:true});
 console.log('PASS: actual sourced data shows five distinct Adams branches at 30 miles, deduplicates OSM, survives provider outage, links official sources, and finds Miss Saigon via Burmese cuisine search.');
}finally{await browser.close();}
