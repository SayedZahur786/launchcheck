import nextEnv from '@next/env';
import {neon} from '@neondatabase/serverless';
nextEnv.loadEnvConfig(process.cwd());
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required.');
const rows=await neon(process.env.DATABASE_URL)`DELETE FROM rate_limits WHERE expires_at<now() RETURNING key`;
console.log(`Removed ${rows.length} expired rate-limit buckets.`);
