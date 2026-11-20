import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import https from 'node:https';
import dns from 'node:dns/promises';
import {EventEmitter} from 'node:events';
import {safeFetch} from '../lib/network';
test('oversized responses settle with a rejection even when destroy emits no error',async()=>{
 mock.method(dns,'lookup',async()=>[{address:'1.1.1.1',family:4}]);
 mock.method(https,'get',(_url:unknown,_opts:unknown,callback:(r:unknown)=>void)=>{
  const request=Object.assign(new EventEmitter(),{destroy(){request.emit('close');}});
  const response=Object.assign(new EventEmitter(),{statusCode:200,headers:{'content-type':'text/html'},destroy(){response.emit('close');}});
  queueMicrotask(()=>{callback(response);response.emit('data',Buffer.alloc(20));});return request;
 });
 try{await assert.rejects(Promise.race([safeFetch('https://launchcheck.dev',Date.now()+1000,10),new Promise((_,reject)=>setTimeout(()=>reject(Error('Unsettled fetch')),100))]),/Response exceeds scan size limit/);}finally{mock.restoreAll();}
});
