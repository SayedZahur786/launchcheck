import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required.');
const sql=neon(process.env.DATABASE_URL);
for(const statement of (await readFile('migrations/001_initial.sql','utf8')).split(';').filter(x=>x.trim()))await sql.query(statement);
console.log('Database migration applied.');
