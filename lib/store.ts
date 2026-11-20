import { neon } from '@neondatabase/serverless';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import type { Scan } from './types';
type State={scans:Record<string,Scan>;purchases:Record<string,string>;limits:Record<string,number>};
const dir=path.join(process.cwd(),'.data');
let chain:Promise<unknown>=Promise.resolve();
function sql(){if(!process.env.DATABASE_URL)throw new Error('Database is not configured.');return neon(process.env.DATABASE_URL,{fetchOptions:{signal:AbortSignal.timeout(5000)}});}
export function configured(){return !!process.env.DATABASE_URL||process.env.LOCAL_STORE==='1'&&!process.env.VERCEL;}
function local(){return !process.env.DATABASE_URL&&process.env.LOCAL_STORE==='1'&&!process.env.VERCEL;}
async function transact<T>(fn:(s:State)=>T):Promise<T>{
 const run=chain.then(async()=>{await mkdir(dir,{recursive:true});let s:State;try{s=JSON.parse(await readFile(path.join(dir,'store.json'),'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;s={scans:{},purchases:{},limits:{}};}const result=fn(s);await writeFile(path.join(dir,'store.tmp'),JSON.stringify(s),{mode:0o600});await rename(path.join(dir,'store.tmp'),path.join(dir,'store.json'));return result;});chain=run.catch(()=>{});return run;
}
export async function insertScan(scan:Scan){if(local())return transact(s=>{s.scans[scan.id]=scan;});await sql()`INSERT INTO scans (id,data,status) VALUES (${scan.id},${JSON.stringify(scan)}::jsonb,${scan.status})`;}
export async function getScan(id:string):Promise<Scan|null>{
 if(local())return transact(s=>{const a=s.scans[id];return a?{...a,paid:Object.values(s.purchases).includes(id)}:null;});
 const rows=await sql()`SELECT data, status, EXISTS(SELECT 1 FROM purchases WHERE scan_id=scans.id) AS paid FROM scans WHERE id=${id}`;
 return rows[0]?{...rows[0].data,status:rows[0].status,paid:rows[0].paid}:null;
}
export async function claimScan(id:string):Promise<boolean>{const time=new Date().toISOString();if(local())return transact(s=>{const a=s.scans[id];if(!a||a.status!=='queued')return false;a.status='running';a.startedAt=time;return true;});const rows=await sql()`UPDATE scans SET status='running', data=jsonb_set(data,'{startedAt}',to_jsonb(${time}::text)) WHERE id=${id} AND status='queued' RETURNING id`;return rows.length===1;}
export async function finishScan(scan:Scan){if(local())return transact(s=>{s.scans[scan.id]=scan;});await sql()`UPDATE scans SET data=${JSON.stringify(scan)}::jsonb,status=${scan.status} WHERE id=${scan.id} AND status='running'`;}
export async function recordPurchase(session:string,id:string){if(local())return transact(s=>{s.purchases[session]=id;});await sql()`INSERT INTO purchases(session_id,scan_id) VALUES(${session},${id}) ON CONFLICT DO NOTHING`;}
export async function limit(key:string,max:number):Promise<boolean>{const bucket=`${key}:${Math.floor(Date.now()/3600000)}`;if(local())return transact(s=>{s.limits[bucket]=(s.limits[bucket]||0)+1;return s.limits[bucket]<=max;});const rows=await sql()`INSERT INTO rate_limits(key,count,expires_at) VALUES(${bucket},1,now()+interval '2 hours') ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1 RETURNING count`;return Number(rows[0].count)<=max;}
