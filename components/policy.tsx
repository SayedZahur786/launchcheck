import {readFile} from 'node:fs/promises';
import path from 'node:path';
export async function Policy({name}:{name:'privacy'|'terms'}){const text=await readFile(path.join(process.cwd(),'content',name+'.md'),'utf8');return <main id="main" className="wrap policy">{text.split('\n\n').map((p,i)=>p.startsWith('# ')?<h1 key={i}>{p.slice(2)}</h1>:p.startsWith('## ')?<h2 key={i}>{p.slice(3)}</h2>:<p key={i}>{p.split(/(https:\/\/github.com\/SayedZahur786)/).map((t,j)=>t.startsWith('https://')?<a key={j} href={t}>Sayed Zahur’s contact profile</a>:t)}</p>)}</main>;}
