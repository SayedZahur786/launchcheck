'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
export function ScanForm(){const [target,setTarget]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const router=useRouter();
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/scans',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({target})});const data=await r.json();if(!r.ok)throw new Error(data.error);router.push(`/reports/${data.id}`);}catch(e){setError(e instanceof Error?e.message:'Unable to start scan.');setBusy(false);}}
 return <form onSubmit={submit} className="scan-form"><label htmlFor="target">Your website or public GitHub repository</label><div className="input-row"><span aria-hidden="true" className="input-icon">↗</span><input id="target" type="text" inputMode="url" value={target} onChange={e=>setTarget(e.target.value)} placeholder="https://your-launch.dev" required maxLength={2048} autoComplete="url"/><button className="button" disabled={busy}>{busy?'Starting scan…':'Check my launch'}</button></div><p className="input-note">Free summary. No sign-up. Only scan public sites you’re authorized to check.</p>{error&&<p role="alert" className="error-message">{error}</p>}</form>;
}
