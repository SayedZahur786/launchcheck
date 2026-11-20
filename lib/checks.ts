import * as cheerio from 'cheerio';
import type { Check } from './types';
export function check(id:string,category:string,title:string,pass:boolean,evidence:string,fix:string,weight=10):Check { return {id,category,title,pass,evidence,fix,weight}; }
export function score(checks:Check[]):number { const total=checks.reduce((s,c)=>s+c.weight,0); return total?Math.round(100*checks.filter(c=>c.pass).reduce((s,c)=>s+c.weight,0)/total):0; }
export function contentChecks(html:string):Check[] {
 const $=cheerio.load(html); $('script,style,noscript,template,pre,code').remove();
 const text=$('body').text().replace(/\s+/g,' ');
 const patterns=[new RegExp('lorem'+'\\s+ipsum','i'), /your (?:company|product) name/i,/coming soon/i,/replace this (?:text|content)/i];
 const found=patterns.find(p=>p.test(text));
 return [check('copy','Content','No unfinished launch copy',!found,found?'Unfinished launch language appears in visible page text.':'No known unfinished-copy patterns found.','Replace staging language with final product copy. This heuristic can flag intentional announcements.',20),
 check('title','Content','A useful page title',($('title').text().trim().length>=5),$('title').text().slice(0,160)||'No title found.','Add a descriptive, product-specific document title.',5)];
}
export function headerChecks(headers:Record<string,string>):Check[] {
 const h=Object.fromEntries(Object.entries(headers).map(([k,v])=>[k.toLowerCase(),v]));
 const csp=h['content-security-policy']||'';
 return [check('csp','Security','Restrictive content security policy',/default-src|script-src/.test(csp)&&!/'unsafe-eval'|\*/.test(csp)&&/object-src\s+'none'/.test(csp),csp.slice(0,300)||'Content-Security-Policy is absent.','Set a restrictive CSP with explicit script sources and object-src none. Test it against your application.',15),
 check('hsts','Security','HTTPS enforced with HSTS',/max-age\s*=\s*(\d+)/i.test(h['strict-transport-security']||'')&&Number((h['strict-transport-security'].match(/max-age\s*=\s*(\d+)/i)||[])[1])>=31536000,h['strict-transport-security']||'HSTS is absent.','Serve HTTPS and set Strict-Transport-Security with a one-year max-age.',10),
 check('nosniff','Security','MIME sniffing disabled',h['x-content-type-options']?.toLowerCase()==='nosniff',h['x-content-type-options']||'X-Content-Type-Options is absent.','Send X-Content-Type-Options: nosniff.',5),
 check('framing','Security','Embedding restricted',/frame-ancestors\s+'(?:none|self)'/.test(csp)||/^(deny|sameorigin)$/i.test(h['x-frame-options']||''),h['x-frame-options']||(/frame-ancestors[^;]*/.exec(csp)?.[0])||'No framing protection found.','Set frame-ancestors in CSP to restrict untrusted embedding.',5)];
}
export function policyCheck(kind:'privacy'|'terms',reachable:boolean,evidence:string):Check {return check(kind,'Policies',kind==='privacy'?'Privacy policy reachable':'Terms of use reachable',reachable,evidence,`Publish a substantive ${kind} page and link it from your footer. Detection does not certify legal adequacy.`,10);}
export function previewChecks(html:string,imageWorks:boolean):Check[] {
 const $=cheerio.load(html); const title=$('meta[property="og:title"]').attr('content')?.trim(); const description=$('meta[property="og:description"]').attr('content')?.trim();
 return [check('og-text','Social','Social title and description',!!title&&!!description,title&&description?`${title.slice(0,100)} — ${description.slice(0,160)}`:'Social title or description is missing.','Add og:title and og:description to the server-rendered page head.',10),check('og-image','Social','Social preview image loads',imageWorks,imageWorks?'The declared image returned a successful image response.':'No reachable image found at og:image.','Use an absolute, publicly reachable og:image URL that serves an image.',10)];
}
