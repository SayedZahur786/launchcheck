import {demo} from '@/lib/demo';
import {getScan} from '@/lib/store';
import {validId} from '@/lib/auth';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(id!=='demo'&&!validId(id))return new Response('Not found',{status:404});
 try{const scan=id==='demo'?demo:await getScan(id);if(!scan||scan.status!=='complete')return new Response('Not found',{status:404});const score=Math.max(0,Math.min(100,Number(scan.score)||0));
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="214" height="28" role="img" aria-label="Launchcheck ${scan.demo?'demo ':''}${score} of 100"><rect width="214" height="28" rx="5" fill="#102d2b"/><rect x="130" width="84" height="28" rx="5" fill="#b8ed80"/><g font-family="Arial,sans-serif" font-size="12" text-anchor="middle"><text x="65" y="18" fill="white">Launchcheck${scan.demo?' demo':''}</text><text x="172" y="18" fill="#102d2b">${score} / 100</text></g></svg>`;
 return new Response(svg,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public,max-age=300','Content-Security-Policy':"default-src 'none'; style-src 'none'; sandbox"}});
 }catch{return new Response('Unavailable',{status:503});}
}
