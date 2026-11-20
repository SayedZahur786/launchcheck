import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import Stripe from 'stripe';
import {demo} from '../lib/demo';
import {insertScan,getScan} from '../lib/store';
import {fulfill} from '../lib/payments';
import {POST} from '../app/api/webhooks/stripe/route';
process.env.LOCAL_STORE='1';delete process.env.DATABASE_URL;
process.env.STRIPE_SECRET_KEY='integration-only-key';process.env.STRIPE_WEBHOOK_SECRET=randomBytes(24).toString('hex');
test('signed webhook grants one report, while forged or wrong-amount events cannot',async()=>{
 const id=randomBytes(16).toString('hex');await insertScan({...demo,id,demo:false});
 const session={id:`cs_${id}`,metadata:{scanId:id},payment_status:'paid',mode:'payment',amount_total:900,currency:'usd'} as unknown as Stripe.Checkout.Session;
 await assert.rejects(fulfill({...session,amount_total:1}),/does not match/);await assert.rejects(fulfill({...session,payment_status:'unpaid'}),/does not match/);await assert.rejects(fulfill({...session,currency:'inr'}),/does not match/);
 const payload=JSON.stringify({id:`evt_${id}`,type:'checkout.session.completed',data:{object:session}});
 const signature=Stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET!});
 const forged=await POST(new Request('https://launchcheck.dev/api/webhooks/stripe',{method:'POST',body:payload,headers:{'stripe-signature':'invalid'}}));assert.equal(forged.status,400);assert.equal((await getScan(id))?.paid,false);
 for(let i=0;i<2;i++){const result=await POST(new Request('https://launchcheck.dev/api/webhooks/stripe',{method:'POST',body:payload,headers:{'stripe-signature':signature}}));assert.equal(result.status,200);}
 assert.equal((await getScan(id))?.paid,true);
});
