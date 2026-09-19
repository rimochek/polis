import test from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../src/api.js';

test('assistant-compatible API client includes session cookies and CSRF for mutations',async t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'document');Object.defineProperty(globalThis,'document',{configurable:true,value:{cookie:'polis_csrf=csrf-test'}});t.after(()=>{if(previous)Object.defineProperty(globalThis,'document',previous);else Reflect.deleteProperty(globalThis,'document');});
 t.mock.method(globalThis,'fetch',async(url:unknown,init?:RequestInit)=>{assert.equal(url,'/api/cases/owned/chat');assert.equal(init?.credentials,'include');assert.equal(new Headers(init?.headers).get('X-CSRF-Token'),'csrf-test');return new Response(JSON.stringify({ok:true}));});
 assert.deepEqual(await api('/cases/owned/chat',{method:'POST',body:'{}'}),{ok:true});
});
test('parallel expired-session requests share refresh and retry with the new CSRF cookie',async t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'document');const document={cookie:'polis_csrf=old'};Object.defineProperty(globalThis,'document',{configurable:true,value:document});t.after(()=>{if(previous)Object.defineProperty(globalThis,'document',previous);else Reflect.deleteProperty(globalThis,'document');});
 let refreshes=0;let fresh=false;let retries=0;
 t.mock.method(globalThis,'fetch',async(url:unknown,init?:RequestInit)=>{
  if(url==='/api/auth/refresh'){refreshes++;await new Promise(r=>setTimeout(r,20));fresh=true;document.cookie='polis_csrf=new';return new Response('{}');}
  if(!fresh)return new Response('{}',{status:401});
  retries++;assert.equal(new Headers(init?.headers).get('X-CSRF-Token'),'new');return new Response('{"ok":true}');
 });
 await Promise.all([api('/cases'),api('/chat')]);assert.equal(refreshes,1);assert.equal(retries,2);
});
