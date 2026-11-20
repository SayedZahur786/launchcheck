import {after,NextResponse} from 'next/server';
import {validId} from '@/lib/auth';
import {demo} from '@/lib/demo';
import {getScan,finishScan} from '@/lib/store';
import {runScan} from '@/lib/scanner';
import {summary} from '@/lib/types';
export const maxDuration=60;
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(id==='demo')return NextResponse.json(summary(demo));if(!validId(id))return NextResponse.json({error:'Report not found.'},{status:404});
 try{const scan=await getScan(id);if(!scan)return NextResponse.json({error:'Report not found.'},{status:404});
 if(scan.status==='queued')after(()=>runScan(id));
 if(scan.status==='running'&&Date.now()-Date.parse(scan.startedAt||scan.createdAt)>60000){scan.status='failed';scan.error='The scan timed out. Please start a new scan.';await finishScan(scan);}
 return NextResponse.json(summary(scan),{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Reports are temporarily unavailable.'},{status:503});}
}
