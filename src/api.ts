let refreshing:Promise<boolean>|null=null;
const csrf=()=>decodeURIComponent(document.cookie.split('; ').find(item=>item.startsWith('polis_csrf='))?.split('=').slice(1).join('=')??'');
export async function apiFetch(path:string,options?:RequestInit,retried=false):Promise<Response>{
 const headers=new Headers(options?.headers);const token=csrf();if(token)headers.set('X-CSRF-Token',token);
 const response=await fetch(`/api${path}`,{...options,headers,credentials:'include'});
 if(response.status===401&&!retried&&(!path.startsWith('/auth/')||path==='/auth/me')){
  refreshing??=fetch('/api/auth/refresh',{method:'POST',credentials:'include'}).then(r=>r.ok).finally(()=>{refreshing=null;});
  if(await refreshing)return apiFetch(path,options,true);
 }
 return response;
}
export async function api<T>(path:string,options?:RequestInit):Promise<T>{const response=await apiFetch(path,options);const data=await response.json();if(!response.ok)throw new Error(data.error||'Не удалось выполнить действие.');return data;}
export const json=(data:unknown)=>({headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
