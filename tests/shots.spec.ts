import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
test('capture production routes on desktop and mobile',async({page})=>{
 await mkdir('docs/screenshots',{recursive:true});
 await page.goto('/');await page.getByLabel('Your website or public GitHub repository').fill('https://launchcheck-sayed.vercel.app');await page.getByRole('button',{name:'Check my launch'}).click();await expect(page).toHaveURL(/\/reports\/[a-f0-9]{32}$/,{timeout:15000});await expect(page.getByRole('heading',{name:'Your launch checklist'})).toBeVisible({timeout:60000});const live=new URL(page.url()).pathname;
 for(const [device,width,height] of [['desktop',1440,1000],['mobile',390,844]] as const){await page.setViewportSize({width,height});for(const [name,route] of [['home','/'],['summary','/reports/demo'],['full','/reports/demo/full'],['live-summary',live],['paywall',`${live}/full`],['privacy','/privacy'],['terms','/terms'],['404','/missing-report']]){await page.goto(route);await expect(page.locator('main h1')).toBeVisible();await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:`docs/screenshots/${name}-${device}.png`,fullPage:true});}}
});
