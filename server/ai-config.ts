import fs from 'node:fs';
import {parseEnv} from 'node:util';
import {z} from 'zod';
export function getAIConfig(){
 const env={...process.env,...(fs.existsSync('.env')?parseEnv(fs.readFileSync('.env','utf8')):{})};
 const provider=env.AI_PROVIDER||(env.GOOGLE_API_KEY?'vertex':env.OPENAI_API_KEY?'openai':'vertex');
 const key=provider==='vertex'?(env.GOOGLE_ACCESS_TOKEN||env.GOOGLE_API_KEY):env.OPENAI_API_KEY;
 return {provider,key:key||'',auth:env.GOOGLE_ACCESS_TOKEN?'token':'key',model:provider==='vertex'?(env.GOOGLE_MODEL||'gemini-3.8-flash'):(env.OPENAI_MODEL||'gpt-5.6-terra'),project:env.GOOGLE_CLOUD_PROJECT||'',location:env.GOOGLE_CLOUD_LOCATION||'global',express:env.GOOGLE_VERTEX_EXPRESS==='true'};
}
export const publicAIConfig=()=>{const c=getAIConfig();return {configured:!!c.key,provider:c.provider,model:c.model,project:c.project,express:c.express,local:true};};
export function saveGoogleConfig(input:unknown){
 const c=z.object({key:z.string().trim().min(20).max(5000).regex(/^[A-Za-z0-9._~-]+$/),auth:z.enum(['key','token']).default('key'),project:z.string().trim().max(100).regex(/^[a-z0-9-]*$/),model:z.string().trim().regex(/^gemini-[a-z0-9.-]+$/).default('gemini-3.8-flash'),express:z.boolean().default(false)}).parse(input);
 const env=fs.existsSync('.env')?parseEnv(fs.readFileSync('.env','utf8')):{};
 Object.assign(env,{AI_PROVIDER:'vertex',GOOGLE_API_KEY:c.auth==='key'?c.key:'',GOOGLE_ACCESS_TOKEN:c.auth==='token'?c.key:'',GOOGLE_MODEL:c.model,GOOGLE_CLOUD_PROJECT:c.project,GOOGLE_CLOUD_LOCATION:'global',GOOGLE_VERTEX_EXPRESS:String(c.express)});
 fs.writeFileSync('.env',Object.entries(env).map(([k,v])=>`${k}=${JSON.stringify(v)}`).join('\n')+'\n',{mode:0o600});
 return publicAIConfig();
}
