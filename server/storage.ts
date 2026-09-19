import {Client} from 'minio';

const documentPrefix='documents/';

export type StorageConfig={
  endpoint:string;
  bucket:string;
  region:string;
  accessKey:string;
  secretKey:string;
};

const required=(name:string)=>{
  const value=process.env[name]?.trim();
  if(!value)throw new Error(`Missing required storage configuration: ${name}`);
  return value;
};

export const storageConfig=():StorageConfig=>({
  endpoint:required('STORAGE_ENDPOINT'),
  bucket:required('STORAGE_BUCKET'),
  region:process.env.STORAGE_REGION?.trim()||'us-east-1',
  accessKey:required('STORAGE_ACCESS_KEY_ID'),
  secretKey:required('STORAGE_SECRET_ACCESS_KEY'),
});

const endpointParts=(endpoint:string)=>{
  let url:URL;
  try{url=new URL(endpoint);}catch{throw new Error('STORAGE_ENDPOINT must be a valid URL.');}
  if(url.protocol!=='http:'&&url.protocol!=='https:')throw new Error('STORAGE_ENDPOINT must use http or https.');
  if(url.pathname!=='/'||url.search||url.hash)throw new Error('STORAGE_ENDPOINT must contain only the protocol, host, and optional port.');
  return {endPoint:url.hostname,port:url.port?Number(url.port):url.protocol==='https:'?443:80,useSSL:url.protocol==='https:'};
};

export const documentStorageKey=(documentId:string)=>`${documentPrefix}${documentId}.pdf`;

export class DocumentStorage{
  private readonly client:Client;
  private readonly config:StorageConfig;

  constructor(config:StorageConfig){
    this.config=config;
    this.client=new Client({...endpointParts(config.endpoint),accessKey:config.accessKey,secretKey:config.secretKey,region:config.region});
  }

  async ensureBucket(){
    if(!(await this.client.bucketExists(this.config.bucket)))await this.client.makeBucket(this.config.bucket,this.config.region);
  }

  async put(documentId:string,bytes:Buffer,contentType='application/pdf'){
    await this.client.putObject(this.config.bucket,documentStorageKey(documentId),bytes,bytes.length,{'Content-Type':contentType});
  }

  async get(documentId:string){
    const stream=await this.client.getObject(this.config.bucket,documentStorageKey(documentId));
    const chunks:Buffer[]=[];
    for await(const chunk of stream)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));
    return Buffer.concat(chunks);
  }

  async delete(documentId:string){
    await this.client.removeObject(this.config.bucket,documentStorageKey(documentId));
  }
}

export const createDocumentStorage=()=>new DocumentStorage(storageConfig());