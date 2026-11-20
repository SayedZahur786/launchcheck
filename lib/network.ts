import https from 'node:https';
import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
export function publicAddress(value:string):boolean { try { const a=ipaddr.process(value); return a.range()==='unicast'; } catch{return false;} }
export function normalizeTarget(value:string):{target:string;kind:'url'|'repo'} {
 if(value.length>2048)throw new Error('Use a shorter public URL.');
 const u=new URL(value.includes('://')?value:`https://${value}`);
 if(u.protocol!=='https:'||u.username||u.password||u.port&&u.port!=='443'||u.search||u.hash)throw new Error('Use a public HTTPS URL without credentials, query strings or fragments.');
 if(u.hostname==='localhost'||u.hostname.endsWith('.local')||u.hostname.endsWith('.internal')||u.hostname.includes(':')||/^\d+\./.test(u.hostname))throw new Error('Only public hostnames are supported.');
 if(u.hostname==='github.com') {const parts=u.pathname.split('/').filter(Boolean);if(parts.length!==2||!parts.every(x=>/^[\w.-]+$/.test(x)))throw new Error('Use the GitHub owner/repository URL.');u.pathname='/'+parts.join('/');return {target:u.href,kind:'repo'};}
 return {target:u.href,kind:'url'};
}
export type Fetched={url:string;status:number;headers:Record<string,string>;body:string};
export async function safeFetch(input:string,deadline:number,limit=1_000_000,redirects=0):Promise<Fetched> {
 if(Date.now()>=deadline)throw new Error('Scan deadline reached.');
 const u=new URL(input);
 if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443'))throw new Error('Unsupported destination.');
 const addresses=await Promise.race([lookup(u.hostname,{all:true}),new Promise<never>((_,reject)=>{const timer=setTimeout(()=>reject(new Error('DNS timeout.')),Math.min(4000,deadline-Date.now()));timer.unref();})]);
 if(!addresses.length||addresses.some(a=>!publicAddress(a.address)))throw new Error('Private destinations are blocked.');
 const a=addresses[0];
 // Pin the vetted DNS answer through connection establishment to prevent rebinding.
 const response=await new Promise<Fetched>((resolve,reject)=>{
  const req=https.get(u,{family:a.family,lookup:(_host,_options,cb)=>cb(null,a.address,a.family),headers:{'user-agent':'Launchcheck/1.0 (launch-readiness scan)','accept':'text/html,application/json,image/*;q=0.8','accept-encoding':'identity'}},res=>{
   const chunks:Buffer[]=[];let size=0;
   res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>limit){res.destroy();req.destroy(new Error('Response exceeds scan size limit.'));}else chunks.push(chunk);});
   res.on('error',reject);res.on('end',()=>resolve({url:u.href,status:res.statusCode||0,headers:Object.fromEntries(Object.entries(res.headers).map(([k,v])=>[k,Array.isArray(v)?v.join(', '):v||''])),body:Buffer.concat(chunks).toString('utf8')}));
  });
  const timer=setTimeout(()=>req.destroy(new Error('Destination timed out.')),Math.max(1,Math.min(7000,deadline-Date.now())));
  req.on('error',reject);req.on('close',()=>clearTimeout(timer));
 });
 if(response.status>=300&&response.status<400&&response.headers.location){if(redirects>=3)throw new Error('Too many redirects.');return safeFetch(new URL(response.headers.location,u).href,deadline,limit,redirects+1);}
 return response;
}
