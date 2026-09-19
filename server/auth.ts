import {createHmac,randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import type {NextFunction,Request,RequestHandler,Response} from 'express';
import {prisma} from './db.js';

const scrypt=promisify(scryptCallback);
const accessLifetimeSeconds=15*60;
const refreshLifetimeMs=30*24*60*60*1000;
const accessCookie='polis_access';
const refreshCookie='polis_refresh';
const csrfCookie='polis_csrf';
const isProduction=process.env.NODE_ENV==='production';

export type AuthUser={id:string;email:string};
declare global {namespace Express {interface Request {user?:AuthUser;csrfToken?:string;}}}

function secret(){const value=process.env.AUTH_SECRET;if(!value||value.length<32)throw new Error('AUTH_SECRET должен содержать минимум 32 символа.');return value;}
function base64(value:string|Buffer){return Buffer.from(value).toString('base64url');}
function unbase64(value:string){return Buffer.from(value,'base64url').toString('utf8');}
function sign(value:string){return base64(createHmac('sha256',secret()).update(value).digest());}

export async function hashPassword(password:string){
 const salt=randomBytes(16);const derived=await scrypt(password,salt,64) as Buffer;
 return `scrypt$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}

export async function verifyPassword(password:string,encoded:string){
 const [,saltText,digestText]=encoded.split('$');if(!saltText||!digestText)return false;
 const digest=await scrypt(password,Buffer.from(saltText,'base64url'),64) as Buffer;const expected=Buffer.from(digestText,'base64url');
 return expected.length===digest.length&&timingSafeEqual(expected,digest);
}

export function createAccessToken(user:AuthUser){
 const header=base64(JSON.stringify({alg:'HS256',typ:'JWT'}));
 const payload=base64(JSON.stringify({sub:user.id,email:user.email,exp:Math.floor(Date.now()/1000)+accessLifetimeSeconds}));
 return `${header}.${payload}.${sign(`${header}.${payload}`)}`;
}

export function verifyAccessToken(token:string):AuthUser|null{
 const parts=token.split('.');if(parts.length!==3)return null;const [header,payload,signature]=parts;if(!header||!payload||!signature)return null;
 const expected=sign(`${header}.${payload}`);const actual=Buffer.from(signature);const wanted=Buffer.from(expected);if(actual.length!==wanted.length||!timingSafeEqual(actual,wanted))return null;
 try{const data=JSON.parse(unbase64(payload)) as {sub?:string;email?:string;exp?:number};if(!data.sub||!data.email||!data.exp||data.exp<Math.floor(Date.now()/1000))return null;return {id:data.sub,email:data.email};}catch{return null;}
}

export function hashRefreshToken(token:string){return createHmac('sha256',secret()).update(token).digest('hex');}
export function newRefreshToken(){return randomBytes(48).toString('base64url');}
export function newCsrfToken(){return randomBytes(24).toString('base64url');}

function cookie(name:string,value:string,maxAge:number,httpOnly:boolean,path='/'){
 const parts=[`${name}=${encodeURIComponent(value)}`,`Max-Age=${Math.max(0,Math.floor(maxAge/1000))}`,`Path=${path}`,'SameSite=Lax'];
 if(httpOnly)parts.push('HttpOnly');if(isProduction)parts.push('Secure');return parts.join('; ');
}

export function setAuthCookies(res:Response,user:AuthUser,refreshToken:string,csrfToken=newCsrfToken()){
 res.setHeader('Set-Cookie',[
  cookie(accessCookie,createAccessToken(user),accessLifetimeSeconds*1000,true),
  cookie(refreshCookie,refreshToken,refreshLifetimeMs,true,'/api/auth'),
  cookie(csrfCookie,csrfToken,refreshLifetimeMs,false)
 ]);return csrfToken;
}
export function clearAuthCookies(res:Response){res.setHeader('Set-Cookie',[cookie(accessCookie,'',0,true),cookie(refreshCookie,'',0,true,'/api/auth'),cookie(csrfCookie,'',0,false)]);}

export function cookies(req:Request){return Object.fromEntries((req.headers.cookie??'').split(';').filter(Boolean).map(item=>{const index=item.indexOf('=');return [item.slice(0,index).trim(),decodeURIComponent(item.slice(index+1))];}));}
export function accessUser(req:Request){const token=cookies(req)[accessCookie];return token?verifyAccessToken(token):null;}

export const requireAuth:RequestHandler=(req,res,next)=>{const user=accessUser(req);if(!user)return res.status(401).json({error:'Войдите в аккаунт.'});req.user=user;next();};

export const requireCsrf:RequestHandler=(req,res,next)=>{if(['GET','HEAD','OPTIONS'].includes(req.method))return next();const origin=req.headers.origin;const appOrigin=process.env.APP_ORIGIN?.replace(/\/$/,'');const allowedOrigins=['http://127.0.0.1:5173','http://localhost:5173','http://127.0.0.1:5174',appOrigin].filter(Boolean);if(origin&&!allowedOrigins.includes(origin))return res.status(403).json({error:'Источник запроса не разрешён.'});const parsed=cookies(req)[csrfCookie];const header=req.headers['x-csrf-token'];if(!parsed||typeof header!=='string'||parsed!==header)return res.status(403).json({error:'Проверка запроса не пройдена.'});req.csrfToken=parsed;next();};

export async function startSession(user:AuthUser){const refreshToken=newRefreshToken();const familyId=randomBytes(18).toString('hex');await prisma.authSession.create({data:{userId:user.id,familyId,refreshTokenHash:hashRefreshToken(refreshToken),expiresAt:new Date(Date.now()+refreshLifetimeMs)}});return {refreshToken,csrfToken:newCsrfToken()};}

export async function rotateSession(refreshToken:string){
 const hash=hashRefreshToken(refreshToken);
 const rotated=await prisma.$transaction(async tx=>{
  const current=await tx.authSession.findUnique({where:{refreshTokenHash:hash}});if(!current)return null;
  if(current.revokedAt||current.expiresAt<=new Date()){if(current.revokedAt&&current.replacedByTokenHash)await tx.authSession.updateMany({where:{familyId:current.familyId,revokedAt:null},data:{revokedAt:new Date()}});return null;}
  const next=newRefreshToken();const nextHash=hashRefreshToken(next);const now=new Date();
  const updated=await tx.authSession.updateMany({where:{id:current.id,revokedAt:null,expiresAt:{gt:now}},data:{revokedAt:now,replacedByTokenHash:nextHash}});
  if(!updated.count)return null;
  await tx.authSession.create({data:{userId:current.userId,familyId:current.familyId,refreshTokenHash:nextHash,expiresAt:new Date(Date.now()+refreshLifetimeMs)}});
  const user=await tx.user.findUnique({where:{id:current.userId},select:{id:true,email:true}});
  return user?{user,refreshToken:next}:null;
 });
 return rotated?{...rotated,csrfToken:newCsrfToken()}:null;
}

export async function revokeSession(refreshToken:string){const hash=hashRefreshToken(refreshToken);const current=await prisma.authSession.findUnique({where:{refreshTokenHash:hash},select:{familyId:true}});if(current)await prisma.authSession.updateMany({where:{familyId:current.familyId,revokedAt:null},data:{revokedAt:new Date()}});}

export function authErrorHandler(error:unknown,_req:Request,res:Response,_next:NextFunction){res.status(500).json({error:error instanceof Error?error.message:'Не удалось выполнить действие.'});}