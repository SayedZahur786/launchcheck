import { after,NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { body,cookieName,hash,newCapability,networkKey,sameOrigin } from '@/lib/auth';
import { normalizeTarget } from '@/lib/network';
import { configured,insertScan,limit } from '@/lib/store';
import {runScan} from '@/lib/scanner';
export const maxDuration=60;
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Request origin rejected.'},{status:403});
 if(!configured())return NextResponse.json({error:'Live scans are awaiting database setup. Explore the sample report meanwhile.'},{status:503});
 try{
  if(!await limit('scan:'+networkKey(request),8)||!await limit('scan:global',100))return NextResponse.json({error:'Scan limit reached. Please try again in an hour.'},{status:429});
  const input=await body(request);if(typeof input.target!=='string')return NextResponse.json({error:'Enter a public website or GitHub repository URL.'},{status:400});
  let target;try{target=normalizeTarget(input.target.trim());}catch{return NextResponse.json({error:'Enter a public HTTPS URL without credentials, a query or a fragment. GitHub links must identify one repository.'},{status:400});}
  const id=randomBytes(16).toString('hex');const token=newCapability();
  await insertScan({id,...target,status:'queued',createdAt:new Date().toISOString(),checks:[],pages:0,scope:'',ownerHash:hash(token),paid:false,demo:false});
  after(()=>runScan(id));const response=NextResponse.json({id},{status:202});response.cookies.set(cookieName(id),token,{httpOnly:true,secure:process.env.NODE_ENV==='production'&&!process.env.LOCAL_STORE,sameSite:'lax',path:'/',maxAge:60*60*24*30});return response;
 }catch{return NextResponse.json({error:'Scan service is temporarily unavailable. Please retry.'},{status:503});}
}
