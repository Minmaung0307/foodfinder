import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 const page=await browser.newPage();
 await page.route('**/config.json',async r=>{const response=await r.fetch();await r.fulfill({json:{...await response.json(),cloudEnabled:false}});});
 await page.goto(process.env.FOOD_URL||'http://127.0.0.1:8876');
 await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');
 for(const width of [320,390,540,768,1024,1440]){
  await page.setViewportSize({width,height:1000});
  const boxes=await page.evaluate(()=>{const panel=document.querySelector('.search-discovery').getBoundingClientRect(),select=document.querySelector('#browse-cuisine').getBoundingClientRect(),chips=[...document.querySelectorAll('[data-browse]')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom,height:r.height}});return {overflow:document.documentElement.scrollWidth>innerWidth,panel:{x:panel.x,right:panel.right,height:panel.height},select:{height:select.height,x:select.x,right:select.right,y:select.y},chips};});
  assert.equal(boxes.overflow,false,`${width}: horizontal overflow`);assert.equal(boxes.select.height,48);
  assert.ok(boxes.chips.every(b=>b.x>=boxes.panel.x&&b.right<=boxes.panel.right&&b.height>=44));
  if(width<=680)assert.ok(boxes.select.y>=Math.max(...boxes.chips.map(b=>b.bottom)));
  assert.ok(boxes.panel.height<600,`${width}: panel too tall`);
  if([390,768,1440].includes(width)&&process.env.SCREENSHOT_DIR)await page.locator('.search-discovery').screenshot({path:`${process.env.SCREENSHOT_DIR}/search-${width}.png`});
 }
 console.log('PASS: 320, 390, 540, 768, 1024 and 1440px; no overflow; 48px cuisine control; 44px minimum chips; correct stacked layout.');
}finally{await browser.close();}
