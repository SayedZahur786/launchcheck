import nextEnv from '@next/env';
import {neon} from '@neondatabase/serverless';
nextEnv.loadEnvConfig(process.cwd());
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is required.');
const since=process.argv[2];if(!since||!Number.isFinite(Date.parse(since)))throw Error('Pass the launch timestamp in ISO format.');
const sql=neon(process.env.DATABASE_URL);
const rows=await sql`SELECT (SELECT count(*)::int FROM scans WHERE created_at>=${since}::timestamptz AND status='complete') AS completed_scans, (SELECT count(DISTINCT scan_id)::int FROM purchases WHERE created_at>=${since}::timestamptz) AS paid_reports, (SELECT round(100.0*count(*) FILTER (WHERE status='complete' AND (data->>'finishedAt')::timestamptz-created_at<interval '60 seconds')/NULLIF(count(*),0),1) FROM scans WHERE created_at>=${since}::timestamptz) AS within_60s_percent`;
console.table(rows);
