import type {Metadata} from 'next';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {Analytics} from '@/components/analytics';
import {ErrorBoundary} from '@/components/error-boundary';
import './globals.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={metadataBase:new URL(process.env.APP_URL||'http://localhost:3000'),title:{default:'Launchcheck — Ship with fewer surprises',template:'%s · Launchcheck'},description:'Check your launch for unfinished copy, missing security headers, missing policies and broken social previews. Free summary. $9 full report.',openGraph:{title:'Launchcheck — Ship with fewer surprises',description:'A second pair of eyes before your first visitor.',images:['/og.png']},twitter:{card:'summary_large_image',title:'Launchcheck',images:['/og.png']}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header name="◈ Launchcheck" links={[{href:'/reports/demo',label:'Sample report'},{href:'/#pricing',label:'Pricing'},{href:'/#scan',label:'Run a check'}]}/><ErrorBoundary>{children}</ErrorBoundary><Footer name="Launchcheck" year={2026}/><Analytics consent={false}/></body></html>;}
