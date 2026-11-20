'use client';
export default function GlobalError({reset}:{reset:()=>void}){return <html lang="en"><body><main><h1>Launchcheck is temporarily unavailable</h1><p>Please retry in a moment.</p><button onClick={reset}>Try again</button></main></body></html>;}
