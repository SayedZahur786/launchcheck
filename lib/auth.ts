import { createHash,randomBytes,timingSafeEqual } from 'node:crypto';
import type { Scan } from './types';
export const newCapability=()=>randomBytes(32).toString('hex');
export const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export function owns(scan:Scan,token?:string){if(!token||!scan.ownerHash)return false;const a=Buffer.from(hash(token));const b=Buffer.from(scan.ownerHash);return a.length===b.length&&timingSafeEqual(a,b);}
export function cookieName(id:string){return `lc_${id}`;}
export function validId(id:string){return /^[a-f0-9]{32}$/.test(id);}
export function sameOrigin(request:Request){return request.headers.get('origin')===new URL(process.env.APP_URL||request.url).origin;}
export async function body(request:Request,max=4096){if(Number(request.headers.get('content-length')||0)>max)throw new Error('Request too large.');const reader=request.body?.getReader();if(!reader)throw new Error('Missing body.');let size=0;const chunks:Uint8Array[]=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error('Request too large.');chunks.push(value);}}finally{await reader.cancel();}return JSON.parse(Buffer.concat(chunks).toString());}
export function networkKey(request:Request){if(process.env.VERCEL&&!process.env.RATE_LIMIT_SALT)throw new Error('Rate limiter is not configured.');const network=process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||'unknown':'local';return hash(`${process.env.RATE_LIMIT_SALT||'local-only'}:${network}`);}
