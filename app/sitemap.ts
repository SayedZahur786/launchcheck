import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.APP_URL||'http://localhost:3000';return ['','/privacy','/terms'].map(p=>({url:base+p,changeFrequency:'monthly',priority:p?0.3:1}));}
