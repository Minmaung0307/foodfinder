import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1280,height:1000}});let failed=0;
 await page.addInitScript(()=>{window.clockOffset=0;const now=Date.now;Date.now=()=>now()+window.clockOffset;});
 await page.route('**/config.json',async r=>{const response=await r.fetch();await r.fulfill({json:{...await response.json(),cloudEnabled:false}});});
 await page.route('https://overpass*/**',r=>{failed++;return r.fulfill({status:504,json:{error:'simulated overloaded server'}});});
 const settled=()=>page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 await page.goto(process.env.FOOD_URL||'http://127.0.0.1:8876');await settled();
 await page.locator('#change-town').click();await page.locator('#city-query').fill('Poughkeepsie NY');await page.locator('#city-options button').filter({hasText:'Poughkeepsie'}).first().click();await settled();
 assert.equal(failed,2);assert.equal(await page.locator('#result-count').innerText(),'164 places');assert.match(await page.locator('#snapshot-note').innerText(),/2026-10-13/);assert.equal(await page.locator('.place-card').count(),12);
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#browse-cuisine').selectOption('filipino');await settled();assert.match(await page.locator('#results').innerText(),/Hapág Bistro/);
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('#browse-cuisine').selectOption('indian');await settled();assert.match(await page.locator('#results').innerText(),/Kismat/);
 await page.evaluate(()=>window.clockOffset+=20000);await page.locator('[data-browse=""]').click();await settled();assert.equal(await page.locator('#result-count').innerText(),'164 places');
 console.log('PASS: with BOTH live providers returning 504, fresh browser shows 164 sourced local places, dated snapshot notice, paging, Filipino Hapag Bistro and Indian Kismat.');
}finally{await browser.close();}
