import assert from 'node:assert/strict';
import test from 'node:test';
import {documentStorageKey,storageConfig} from '../server/storage.js';

const storageEnvironment={
  STORAGE_ENDPOINT:process.env.STORAGE_ENDPOINT,
  STORAGE_BUCKET:process.env.STORAGE_BUCKET,
  STORAGE_REGION:process.env.STORAGE_REGION,
  STORAGE_ACCESS_KEY_ID:process.env.STORAGE_ACCESS_KEY_ID,
  STORAGE_SECRET_ACCESS_KEY:process.env.STORAGE_SECRET_ACCESS_KEY,
};

const restoreStorageEnvironment=()=>{
  for(const [name,value] of Object.entries(storageEnvironment)){
    if(value===undefined)delete process.env[name];
    else process.env[name]=value;
  }
};

test.afterEach(restoreStorageEnvironment);

test('storage config requires credentials and preserves the endpoint settings',()=>{
  process.env.STORAGE_ENDPOINT='http://127.0.0.1:9000';
  process.env.STORAGE_BUCKET='polis-documents';
  delete process.env.STORAGE_REGION;
  process.env.STORAGE_ACCESS_KEY_ID='access';
  process.env.STORAGE_SECRET_ACCESS_KEY='secret';

  assert.deepEqual(storageConfig(),{
    endpoint:'http://127.0.0.1:9000',
    bucket:'polis-documents',
    region:'us-east-1',
    accessKey:'access',
    secretKey:'secret',
  });
});

test('storage config rejects a missing required value',()=>{
  delete process.env.STORAGE_ENDPOINT;
  process.env.STORAGE_BUCKET='polis-documents';
  process.env.STORAGE_ACCESS_KEY_ID='access';
  process.env.STORAGE_SECRET_ACCESS_KEY='secret';

  assert.throws(()=>storageConfig(),/Missing required storage configuration: STORAGE_ENDPOINT/);
});

test('document keys are stable and scoped to the document prefix',()=>{
  assert.equal(documentStorageKey('document-123'),'documents/document-123.pdf');
});