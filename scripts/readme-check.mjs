import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1400,height:1000}});
await page.goto('https://github.com/SayedZahur786/launchcheck',{waitUntil:'domcontentloaded'});
const banner=page.locator('article img[alt="Launchcheck — Ship with fewer surprises"]');await banner.waitFor({timeout:20000});await banner.scrollIntoViewIfNeeded();await page.waitForTimeout(700);const first=await banner.screenshot();await page.waitForTimeout(1700);const second=await banner.screenshot();
const result={checkedAt:new Date().toISOString(),githubReadmeLoaded:true,headerLoaded:await banner.evaluate(i=>i.complete&&i.naturalWidth>0),animationFramesDiffer:!first.equals(second),imageSource:await banner.getAttribute('src')};
await page.screenshot({path:'docs/screenshots/github-readme.png',fullPage:false});await writeFile('docs/readme-verification.json',JSON.stringify(result,null,2));await browser.close();if(!result.headerLoaded||!result.animationFramesDiffer)throw Error('Animated banner verification failed.');console.log('GitHub README banner loads and changes between captured frames.');
