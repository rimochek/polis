import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword,createAccessToken,verifyAccessToken} from '../server/auth.js';

test('password hashes verify only the original password',async()=>{
 process.env.AUTH_SECRET='test-secret-with-at-least-32-characters';
 const encoded=await hashPassword('correct horse battery staple');
 assert.notEqual(encoded,'correct horse battery staple');
 assert.equal(await verifyPassword('correct horse battery staple',encoded),true);
 assert.equal(await verifyPassword('wrong password',encoded),false);
});

test('access tokens reject tampering and preserve user identity',()=>{
 process.env.AUTH_SECRET='test-secret-with-at-least-32-characters';
 const user={id:'user-1',email:'user@example.com'};
 const token=createAccessToken(user);
 assert.deepEqual(verifyAccessToken(token),user);
 assert.equal(verifyAccessToken(`${token}x`),null);
});