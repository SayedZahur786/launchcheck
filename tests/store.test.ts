import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {demo} from '../lib/demo';
import {insertScan,getScan,claimScan,finishScan,recordPurchase,limit} from '../lib/store';
process.env.LOCAL_STORE='1';delete process.env.DATABASE_URL;
test('queue claims once, persists completion and fulfills only once',async()=>{const id=randomBytes(16).toString('hex');const scan={...demo,id,status:'queued' as const,demo:false};await insertScan(scan);const claims=await Promise.all([claimScan(id),claimScan(id)]);assert.equal(claims.filter(Boolean).length,1);await finishScan({...scan,status:'complete'});await recordPurchase(`session-${id}`,id);await recordPurchase(`session-${id}`,id);assert.equal((await getScan(id))?.paid,true);assert.equal((await getScan(id))?.status,'complete');});
test('shared limiter atomically rejects requests over the cap',async()=>{const key=randomBytes(12).toString('hex');const allowed=await Promise.all(Array.from({length:12},()=>limit(key,8)));assert.equal(allowed.filter(Boolean).length,8);});
