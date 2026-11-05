// Result-only API. Client scores are not server-verified game outcomes.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const centsPattern=/^(0|[1-9][0-9]{0,127})$/;
// Per-isolate burst guard complements the provider's approximate per-edge limiter.
// Only hashed transport keys and counters, at most 4096 entries; nothing goes to D1.
const burstCounters=new Map();
function allowBurst(key,write){
 const bucket=(write?'write:':'read:')+key,now=Date.now(),limit=write?10:60;
 let entry=burstCounters.get(bucket);
 if(!entry||entry.until<=now){
  if(!entry&&burstCounters.size>=4096)burstCounters.delete(burstCounters.keys().next().value);
  entry={until:now+60000,count:0};burstCounters.set(bucket,entry);
 }
 if(entry.count>=limit)return false;entry.count++;return true;
}
class ApiError extends Error{constructor(status,code){super(code);this.status=status;this.code=code;}}
const fail=(status,code)=>{throw new ApiError(status,code);};
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store',...headers}});
export function validateResult(body){
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).sort().join(',')!=='finalAmount,name')fail(400,'invalid_fields');
 if(typeof body.name!=='string')fail(400,'invalid_name');const name=body.name.trim().normalize('NFC');
 if([...name].length<1||[...name].length>16||/[\u0000-\u001f\u007f-\u009f\u061c\u200e-\u200f\u202a-\u202e\u2066-\u2069\ud800-\udfff]/u.test(name))fail(400,'invalid_name');
 if(typeof body.finalAmount!=='string'||!/^(0|[1-9][0-9]{0,125})\.[0-9]{2}$/.test(body.finalAmount))fail(400,'invalid_amount');
 const cents=BigInt(body.finalAmount.replace('.','')).toString();if(!centsPattern.test(cents))fail(400,'invalid_amount');return {name,cents};
}
const dollars=cents=>{const s=cents.padStart(3,'0');return s.slice(0,-2)+'.'+s.slice(-2);};
async function bodyJSON(request){
 if(request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')fail(415,'json_required');
 if(Number(request.headers.get('Content-Length'))>1024)fail(413,'body_too_large');
 const reader=request.body?.getReader();if(!reader)fail(400,'invalid_json');let size=0;const chunks=[];
 try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>1024){await reader.cancel();fail(413,'body_too_large');}chunks.push(part.value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{fail(400,'invalid_json');}
}
function cursorEncode(value){return btoa(JSON.stringify(value)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
function cursorDecode(text){
 try{
  if(!text||text.length>512||!/^[A-Za-z0-9_-]+$/.test(text))throw 0;
  const x=JSON.parse(atob(text.replaceAll('-','+').replaceAll('_','/')));
  if(Object.keys(x).sort().join(',')!=='a,c,id,n,v'||x.v!==1||!centsPattern.test(x.a)||typeof x.a!=='string'||!Number.isSafeInteger(x.id)||x.id<1||!Number.isSafeInteger(x.c)||x.c<x.id||!Number.isSafeInteger(x.n)||x.n<1||x.n>1000000000)throw 0;
  return x;
 }catch{fail(400,'invalid_cursor');}
}
async function rateLimit(request,env,write){
 const limiter=write?env.WRITE_LIMITER:env.READ_LIMITER;if(!limiter?.limit||!env.DB?.prepare)fail(503,'not_configured');
 // Transient edge rate-limit key only. Never store IP, UA or this digest in D1 or application logs.
 const ip=request.headers.get('CF-Connecting-IP');if(!ip)fail(503,'rate_key_unavailable');
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('scores-v1|'+ip));const key=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 const result=await limiter.limit({key});if(!result.success||!allowBurst(key,write))fail(429,'rate_limited');
}
async function submit(request,env){
 const id=request.headers.get('Idempotency-Key');if(!id||!uuid.test(id))fail(400,'invalid_submission_id');
 const {name,cents}=validateResult(await bodyJSON(request));
 const inserted=await env.DB.prepare('INSERT INTO scores(submission_id,name,amount_cents) VALUES(?,?,?) ON CONFLICT(submission_id) DO NOTHING RETURNING id,name,amount_cents').bind(id.toLowerCase(),name,cents).first();
 const row=inserted||await env.DB.prepare('SELECT id,name,amount_cents FROM scores WHERE submission_id=?').bind(id.toLowerCase()).first();
 if(!row)fail(503,'storage_unavailable');if(row.name!==name||row.amount_cents!==cents)fail(409,'submission_conflict');
 return json({ok:true,entryId:String(row.id),deduplicated:!inserted},inserted?201:200);
}
async function list(request,env,ctx){
 const url=new URL(request.url),params=url.searchParams;
 if([...params.keys()].some(k=>!['limit','cursor'].includes(k))||params.getAll('limit').length>1||params.getAll('cursor').length>1)fail(400,'invalid_query');
 const limitText=params.get('limit')||'20';if(!/^[1-9][0-9]?$/.test(limitText)||Number(limitText)>50)fail(400,'invalid_limit');
 const limit=Number(limitText),cursor=params.has('cursor')?cursorDecode(params.get('cursor')):null;
 const cache=globalThis.caches?.default,cacheURL=new URL('/v1/leaderboard',url.origin);cacheURL.searchParams.set('limit',String(limit));if(cursor)cacheURL.searchParams.set('cursor',params.get('cursor'));
 const cacheKey=new Request(cacheURL);const hit=cache&&await cache.match(cacheKey);if(hit)return hit;
 const ceiling=cursor?.c??(await env.DB.prepare('SELECT COALESCE(MAX(id),0) AS ceiling FROM scores').first()).ceiling;
 const sql=cursor?'SELECT id,name,amount_cents FROM scores WHERE id<=? AND (amount_digits<? OR (amount_digits=? AND amount_cents<?) OR (amount_digits=? AND amount_cents=? AND id>?)) ORDER BY amount_digits DESC,amount_cents DESC,id ASC LIMIT ?':'SELECT id,name,amount_cents FROM scores WHERE id<=? ORDER BY amount_digits DESC,amount_cents DESC,id ASC LIMIT ?';
 const query=env.DB.prepare(sql).bind(...(cursor?[ceiling,cursor.a.length,cursor.a.length,cursor.a,cursor.a.length,cursor.a,cursor.id,limit+1]:[ceiling,limit+1]));
 const rows=(await query.all()).results,more=rows.length>limit,shown=rows.slice(0,limit),n=cursor?.n||0,last=shown.at(-1);
 const response=json({items:shown.map((r,i)=>({entryId:String(r.id),rank:n+i+1,name:r.name,finalAmount:dollars(r.amount_cents)})),nextCursor:more?cursorEncode({v:1,c:ceiling,a:last.amount_cents,id:last.id,n:n+shown.length}):null});
 // A short, per-edge snapshot cache; new scores can take up to 15 seconds to appear.
 response.headers.set('Cache-Control','public, max-age=15');if(cache)ctx.waitUntil(cache.put(cacheKey,response.clone()).catch(()=>{}));return response;
}
export default {
 async fetch(request,env,ctx){
  const origin=request.headers.get('Origin'),allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean),url=new URL(request.url);
  const cors=response=>{const result=new Response(response.body,response);result.headers.set('Vary','Origin');if(origin&&allowed.includes(origin)){result.headers.set('Access-Control-Allow-Origin',origin);result.headers.set('Access-Control-Expose-Headers','Retry-After');}return result;};
  try{
   if(origin&&!allowed.includes(origin))fail(403,'origin_not_allowed');
   if(request.method==='OPTIONS'){
    if(!origin||!allowed.includes(origin))fail(403,'origin_not_allowed');
    return cors(new Response(null,{status:204,headers:{'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Idempotency-Key','Access-Control-Max-Age':'600'}}));
   }
   if(request.method==='POST'&&url.pathname==='/v1/scores'){
    if(!origin)fail(403,'origin_required');await rateLimit(request,env,true);return cors(await submit(request,env));
   }
   if(request.method==='GET'&&url.pathname==='/v1/leaderboard'){await rateLimit(request,env,false);return cors(await list(request,env,ctx));}
   fail(request.method==='GET'||request.method==='POST'?404:405,'not_found');
  }catch(error){const status=error instanceof ApiError?error.status:503;return cors(json({error:error instanceof ApiError?error.code:'service_unavailable'},status,status===429?{'Retry-After':'60'}:{}));}
 }
};
