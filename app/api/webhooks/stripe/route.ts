import {NextResponse} from 'next/server';
import {stripe,fulfill} from '@/lib/payments';
export async function POST(request:Request){
 if(!process.env.STRIPE_WEBHOOK_SECRET)return new Response('Unavailable',{status:503});
 if(Number(request.headers.get('content-length')||0)>65536)return new Response('Too large',{status:413});
 const reader=request.body?.getReader();if(!reader)return new Response('Invalid',{status:400});let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();return new Response('Too large',{status:413});}chunks.push(value);}
 const event=stripe().webhooks.constructEvent(Buffer.concat(chunks),request.headers.get('stripe-signature')||'',process.env.STRIPE_WEBHOOK_SECRET);
 if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded')await fulfill(event.data.object);
 return NextResponse.json({received:true});
 }catch{return new Response('Invalid webhook',{status:400});}
}
