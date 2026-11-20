import * as cheerio from 'cheerio';
import { safeFetch } from './network';
import { check,contentChecks,headerChecks,policyCheck,previewChecks,score } from './checks';
import {claimScan,getScan,finishScan} from './store';
import type { Check } from './types';
async function site(target:string,deadline:number){
 const home=await safeFetch(target,deadline);if(home.status!==200||!home.headers['content-type']?.includes('text/html'))throw new Error('The page did not return HTML successfully.');
 const $=cheerio.load(home.body);const checks=[...contentChecks(home.body),...headerChecks(home.headers)];let pages=1;
 const policies=await Promise.all((['privacy','terms'] as const).map(async kind=>{
  const anchor=$('a[href]').toArray().find(a=>new RegExp(kind==='privacy'?'privacy':'terms|conditions','i').test($(a).text()+' '+$(a).attr('href')));
  const url=new URL(anchor?$(anchor).attr('href')!:`/${kind}`,home.url);
  if(url.origin!==new URL(home.url).origin)return policyCheck(kind,false,'Policy link points to a different origin; verify manually.');
  try{const p=await safeFetch(url.href,deadline);pages++;const doc=cheerio.load(p.body);doc('script,style,nav,header,footer').remove();const text=doc('body').text().replace(/\s+/g,' ').trim();return policyCheck(kind,p.status===200&&p.headers['content-type']?.includes('text/html')&&text.length>=250&&new RegExp(kind,'i').test(text)&&p.url!==home.url,`${url.pathname}: HTTP ${p.status}; ${text.length} visible text characters.`);}catch{return policyCheck(kind,false,'Policy page could not be checked within scan limits.');}
 }));checks.push(...policies);
 let works=false;const image=$('meta[property="og:image"]').attr('content');if(image)try{const img=await safeFetch(new URL(image,home.url).href,deadline,5_000_000);works=img.status===200&&/^image\/(png|jpeg|webp|gif|avif)/i.test(img.headers['content-type']||'');}catch{}
 checks.push(...previewChecks(home.body,works));return {checks,pages,scope:'Homepage, up to two same-origin policy pages, and declared social image. Server-rendered HTML only; no JavaScript execution. Heuristic checks are not a security or legal audit.'};
}
async function repo(target:string,deadline:number){
 const [owner,name]=new URL(target).pathname.split('/').filter(Boolean);const root=`https://api.github.com/repos/${owner}/${name}`;
 const info=await safeFetch(root,deadline);if(info.status!==200)throw new Error('Public repository could not be read.');const meta=JSON.parse(info.body);
 const tree=await safeFetch(`${root}/git/trees/${encodeURIComponent(meta.default_branch)}?recursive=1`,deadline,2_000_000);if(tree.status!==200)throw new Error('Repository file listing unavailable.');const listing=JSON.parse(tree.body);const files=(listing.tree as {path:string;type:string;size?:number}[]).filter(x=>x.type==='blob');
 const selected=files.filter(x=>/\.(tsx?|jsx?|html|md|json)$/.test(x.path)&&!/(lock|node_modules|test|fixture|\.env)/i.test(x.path)&&Number(x.size)<100_000).slice(0,12);
 const chunks=await Promise.all(selected.map(async file=>{try{const r=await safeFetch(`https://raw.githubusercontent.com/${owner}/${name}/${encodeURIComponent(meta.default_branch)}/${file.path.split('/').map(encodeURIComponent).join('/')}`,deadline,100_000);return r.status===200?`${file.path}\n${r.body}`:'';}catch{return '';}}));
 if(!chunks.some(Boolean))throw new Error('No supported source files could be read.');const source=chunks.join('\n');
 const checks:Check[]=[check('copy','Content','No unfinished launch copy in sampled code',!new RegExp('lorem'+'\\s+ipsum|coming soon|replace this text','i').test(source),`${chunks.filter(Boolean).length} source files sampled. Matched text is not stored to avoid exposing embedded secrets.`,'Search your source and replace unfinished launch copy.',20),policyCheck('privacy',files.some(f=>/privacy/i.test(f.path)),'Checked file paths for a privacy page.'),policyCheck('terms',files.some(f=>/terms/i.test(f.path)),'Checked file paths for a terms page.'),check('og-text','Social','Social metadata declared',/openGraph|og:title/.test(source)&&/description/.test(source),'Static metadata declarations checked in sampled files.','Declare title and description in the page metadata.',10),check('og-image','Social','Social image declared',/og:image|opengraph-image|openGraph[\s\S]{0,500}images/.test(source)||files.some(f=>/opengraph-image/.test(f.path)),'Source declaration only; deployed image availability is unverified.','Add social image metadata and scan the deployed URL to verify it loads.',10),check('headers','Security','Security headers declared',/Content-Security-Policy/.test(source)&&/X-Content-Type-Options/.test(source),'Source declaration only; deployment headers are unverified.','Configure response headers and scan your deployed URL.',40)];
 return {checks,pages:chunks.filter(Boolean).length,scope:`Public default branch; first ${selected.length} supported files under 100 KB. ${listing.truncated?'GitHub truncated the tree. ':''}Static indicators only; no code execution, no runtime header or image verification. Repo and URL scores measure different checks.`};
}
export async function runScan(id:string){
 if(!await claimScan(id))return;const scan=await getScan(id);if(!scan)return;
 try{const result=await (scan.kind==='repo'?repo:site)(scan.target,Date.now()+45_000);await finishScan({...scan,...result,score:score(result.checks),status:'complete',finishedAt:new Date().toISOString()});}
 catch{await finishScan({...scan,status:'failed',finishedAt:new Date().toISOString(),error:'The target could not be scanned within the time or access limits. Check that it is public and reachable, then try again.'});}
}
