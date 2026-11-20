import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {body,cookieName,networkKey,owns,sameOrigin,validId} from '@/lib/auth';
import {getScan,limit} from '@/lib/store';
import {paymentsReady,stripe} from '@/lib/payments';
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Request origin rejected.'},{status:403});
 if(!paymentsReady())return NextResponse.json({error:'Payments are not open yet. No charge has been made.'},{status:503});
 try{const input=await body(request);if(typeof input.id!=='string'||!validId(input.id))return NextResponse.json({error:'Select a completed report.'},{status:400});
 const scan=await getScan(input.id);if(!scan||!owns(scan,(await cookies()).get(cookieName(input.id))?.value))return NextResponse.json({error:'Open the report in the browser that created it.'},{status:403});
 if(scan.status!=='complete'||scan.demo||scan.paid)return NextResponse.json({error:'This report is not eligible for checkout.'},{status:409});
 if(!await limit('checkout:'+networkKey(request),10))return NextResponse.json({error:'Please try checkout again later.'},{status:429});
 const base=process.env.APP_URL!;
 const session=await stripe().checkout.sessions.create({mode:'payment',client_reference_id:scan.id,metadata:{scanId:scan.id},line_items:[{price_data:{currency:'usd',unit_amount:900,product_data:{name:'Launchcheck full report',description:'Evidence and remediation for one launch-readiness scan'}},quantity:1}],success_url:`${base}/reports/${scan.id}/full?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${base}/reports/${scan.id}/full?cancelled=1`},{idempotencyKey:`report-${scan.id}-${Math.floor(Date.now()/3600000)}`});
 return NextResponse.json({url:session.url});
 }catch{return NextResponse.json({error:'Checkout is temporarily unavailable. Please retry.'},{status:503});}
}
