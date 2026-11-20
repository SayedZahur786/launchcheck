'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="main" className="wrap empty-page"><h1>A small interruption.</h1><p>We couldn’t load this page. Please retry in a moment.</p><button className="button" onClick={reset}>Try again</button></main>;}
