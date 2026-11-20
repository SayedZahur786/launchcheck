import Stripe from 'stripe';
import { recordPurchase } from './store';
export function stripe(){if(!process.env.STRIPE_SECRET_KEY)throw new Error('Payments are not configured.');return new Stripe(process.env.STRIPE_SECRET_KEY);}
export function paymentsReady(){return !!process.env.STRIPE_SECRET_KEY&&!!process.env.STRIPE_WEBHOOK_SECRET&&!!process.env.APP_URL;}
export async function fulfill(session:Stripe.Checkout.Session){
 const id=session.metadata?.scanId;
 if(session.payment_status!=='paid'||session.mode!=='payment'||session.amount_total!==900||session.currency!=='usd'||!id||!/^[a-f0-9]{32}$/.test(id))throw new Error('Payment does not match a report purchase.');
 await recordPurchase(session.id,id);
}
