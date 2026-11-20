import nextEnv from '@next/env';
import {spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
nextEnv.loadEnvConfig(process.cwd());
const origin='https://launchcheck-sayed.vercel.app';
for(const [name,value] of Object.entries({DATABASE_URL:process.env.DATABASE_URL,APP_URL:origin,RATE_LIMIT_SALT:randomBytes(32).toString('hex')})){
 if(!value)throw Error(`${name} is missing`);
 const r=spawnSync('vercel',['env','add',name,'production','--sensitive','--yes'],{input:value,encoding:'utf8'});
 if(r.status!==0){console.error(`Could not configure ${name}. Check Vercel settings.`);process.exit(1);}
 console.log(`Configured ${name} for production.`);
}
