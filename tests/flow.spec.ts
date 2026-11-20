import {test,expect} from '@playwright/test';
test('URL scan reaches score, paywall, badge and rejects forged payment',async({page,request})=>{
 await page.goto('/');await page.getByLabel('Your website or public GitHub repository').fill('https://www.wikipedia.org/');await page.getByRole('button',{name:'Check my launch'}).click();await expect(page).toHaveURL(/\/reports\/[a-f0-9]{32}$/);await expect(page.getByRole('heading',{name:'Your launch checklist'})).toBeVisible({timeout:60000});
 const id=page.url().split('/').pop()!;await page.getByRole('link',{name:'Unlock full report · $9'}).click();await expect(page.getByRole('heading',{name:'Know what to fix. And why.'})).toBeVisible();await expect(page.getByRole('heading',{name:'What we found'})).toHaveCount(0);
 const publicReport=await request.get(`/api/scans/${id}`);expect(publicReport.ok()).toBeTruthy();const body=await publicReport.json();expect(body.score).toBeGreaterThanOrEqual(0);expect(body.checks[0]).not.toHaveProperty('evidence');expect(body).not.toHaveProperty('ownerHash');
 expect((await request.get(`/api/reports/${id}/badge`)).headers()['content-type']).toBe('image/svg+xml');
 const forbidden=await request.post('/api/scans',{headers:{origin:'https://attacker.invalid'},data:{target:'https://www.wikipedia.org/'}});expect(forbidden.status()).toBe(403);
 expect((await request.post('/api/webhooks/stripe',{data:{type:'checkout.session.completed'}})).status()).not.toBe(200);
});
test('sample and legal routes are usable without live services',async({page})=>{for(const route of ['/reports/demo','/reports/demo/full','/privacy','/terms']){await page.goto(route);await expect(page.locator('main h1')).toBeVisible();}const res=await page.goto('/not-a-report');expect(res?.status()).toBe(404);await expect(page.getByRole('link',{name:'Start a new check'})).toBeVisible();});
