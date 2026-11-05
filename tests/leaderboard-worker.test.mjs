import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker from '../cloudflare/worker.mjs';
import {Leaderboard} from '../src/leaderboard.mjs';
import {Game} from '../src/game.mjs';
const origin='https://jacobmaster-97.github.io',base='https://scores.example';
let requestIP=0;
function setup(){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../cloudflare/migrations/0001_scores.sql',import.meta.url),'utf8'));
 const DB={prepare(query){return {bind(...args){const stmt=sql.prepare(query);return {async first(){return stmt.get(...args)||null;},async all(){return {results:stmt.all(...args)};}};},async first(){return sql.prepare(query).get()||null;}};}};
 const keys=[],limiter={async limit({key}){keys.push(key);return {success:true};}},env={DB,ALLOWED_ORIGINS:origin,WRITE_LIMITER:limiter,READ_LIMITER:limiter};
 const pending=[],ctx={waitUntil(p){pending.push(p);}};
 const call=(path,options={})=>worker.fetch(new Request(base+path,{...options,headers:{Origin:origin,'CF-Connecting-IP':'192.0.2.'+(++requestIP),...options.headers}}),env,ctx);
 const post=(name='賭神',amount='100.00',id=crypto.randomUUID(),extra={})=>call('/v1/scores',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({name,finalAmount:amount,...extra})});
 return {sql,env,call,post,keys,pending};
}
test('same-name completed challenges each remain, retry idempotent, conflicting retry rejected',async()=>{
 const {post,sql}=setup(),id=crypto.randomUUID();assert.equal((await post('同名','123.45',id)).status,201);
 const retry=await post('同名','123.45',id);assert.equal(retry.status,200);assert.equal((await retry.json()).deduplicated,true);
 assert.equal((await post('同名','124.45',id)).status,409);assert.equal((await post('同名','123.45')).status,201);
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM scores').get().n,2);
 assert.deepEqual(sql.prepare('PRAGMA table_xinfo(scores)').all().map(r=>r.name),['id','submission_id','name','amount_cents','amount_digits']);
});
test('reject numeric/imprecise/negative/exponent/excess precision and gameplay fields, preserve arbitrary exact huge amounts',async()=>{
 const {post}=setup();for(const value of [100,0,-1,'-1.00','1','1.0','1.001','1e3','01.00','9'.repeat(127)+'.00',null])assert.equal((await post('名',value)).status,400,String(value));
 assert.equal((await post('名','10.00',undefined,{bets:[]})).status,400);assert.equal((await post('名','9'.repeat(126)+'.99')).status,201);
 for(const name of ['', '名'.repeat(17),'\u202e偽裝','\u0001名','\ud800'])assert.equal((await post(name)).status,400);
 assert.equal((await post('🃏賭神')).status,201);assert.equal((await post("');DROP--")).status,201);
 assert.equal((await post('  賭神  ','0.00')).status,201);
});
test('real SQL sorts huge cents numerically with stable ties, keyset snapshot excludes later inserts',async()=>{
 const {post,call}=setup();for(const [name,money] of [['甲','9.99'],['乙','100.00'],['丙','100.00'],['丁','900719925474099312345.67'],['戊','0.00']])await post(name,money);
 let response=await call('/v1/leaderboard?limit=2'),data=await response.json();assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'public, max-age=15');assert.deepEqual(data.items.map(r=>r.name),['丁','乙']);assert.equal(data.items[0].finalAmount,'900719925474099312345.67');assert.ok(!JSON.stringify(data).includes('submission'));
 await post('新來','99999999999999999999999999999.00');let second=await (await call('/v1/leaderboard?limit=2&cursor='+encodeURIComponent(data.nextCursor))).json();assert.deepEqual(second.items.map(r=>r.name),['丙','甲']);assert.deepEqual(second.items.map(r=>r.rank),[3,4]);
 const third=await (await call('/v1/leaderboard?limit=2&cursor='+encodeURIComponent(second.nextCursor))).json();assert.deepEqual(third.items.map(r=>r.name),['戊']);assert.equal(third.nextCursor,null);
 assert.equal((await (await call('/v1/leaderboard?limit=2')).json()).items[0].name,'新來');
});
test('bounded JSON stream, methods, query and UUID validation',async()=>{
 const {call}=setup(),headers={'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()};
 assert.equal((await call('/v1/scores',{method:'POST',headers,body:'x'.repeat(1025)})).status,413);
 const chunks=new ReadableStream({start(c){c.enqueue(new Uint8Array(600));c.enqueue(new Uint8Array(600));c.close();}});assert.equal((await call('/v1/scores',{method:'POST',headers,body:chunks,duplex:'half'})).status,413);
 assert.equal((await call('/v1/scores',{method:'POST',headers,body:new Uint8Array([0xff])})).status,400);
 assert.equal((await call('/v1/scores',{method:'POST',headers,body:'{'})).status,400);
 assert.equal((await call('/v1/scores',{method:'POST',body:'{}'})).status,400);
 assert.equal((await call('/v1/scores',{method:'POST',headers:{'Idempotency-Key':crypto.randomUUID()},body:'{}'})).status,415);
 for(const query of ['?limit=0','?limit=51','?limit=01','?limit=2&limit=3','?cursor=%%%','?cursor=','?bets=1'])assert.equal((await call('/v1/leaderboard'+query)).status,400,query);
 assert.equal((await call('/missing')).status,404);assert.equal((await call('/v1/scores',{method:'DELETE'})).status,405);
});
test('CORS is restricted for browsers; public read allowed without origin; limiters fail closed without raw IP storage',async()=>{
 const {call,env,keys,post}=setup();assert.equal((await call('/v1/scores',{method:'OPTIONS'})).status,204);
 const denied=await call('/v1/leaderboard',{headers:{Origin:'https://evil.example'}});assert.equal(denied.status,403);assert.equal(denied.headers.get('Access-Control-Allow-Origin'),null);
 const good=await call('/v1/leaderboard');assert.equal(good.headers.get('Access-Control-Allow-Origin'),origin);assert.equal(good.headers.get('Vary'),'Origin');assert.match(keys[0],/^[a-f0-9]{64}$/);assert.ok(!keys[0].includes('192.0.2.1'));
 const publicRead=await worker.fetch(new Request(base+'/v1/leaderboard',{headers:{'CF-Connecting-IP':'192.0.2.2'}}),env,{waitUntil(){}});assert.equal(publicRead.status,200);assert.equal(publicRead.headers.get('Access-Control-Allow-Origin'),null);
 const noOrigin=await worker.fetch(new Request(base+'/v1/scores',{method:'POST'}),env,{});assert.equal(noOrigin.status,403);
 env.WRITE_LIMITER={async limit(){return {success:false};}};const limited=await post();assert.equal(limited.status,429);assert.equal(limited.headers.get('Retry-After'),'60');
 delete env.WRITE_LIMITER;assert.equal((await post()).status,503);env.DB={prepare(){throw new Error('private SQL details');}};const error=await call('/v1/leaderboard');assert.equal(error.status,503);assert.ok(!(await error.text()).includes('private'));
});
test('cached read responses never cache an Access-Control-Allow-Origin header',async()=>{
 const old=globalThis.caches,map=new Map();globalThis.caches={default:{async match(r){return map.get(r.url)?.clone();},async put(r,response){map.set(r.url,response);}}};
 try{const {call,env,pending}=setup();env.ALLOWED_ORIGINS+=',https://second.example';await call('/v1/leaderboard');await Promise.all(pending);assert.equal([...map.values()][0].headers.get('Access-Control-Allow-Origin'),null);const second=await call('/v1/leaderboard',{headers:{Origin:'https://second.example'}});assert.equal(second.headers.get('Access-Control-Allow-Origin'),'https://second.example');}finally{if(old===undefined)delete globalThis.caches;else globalThis.caches=old;}
});
test('client to real SQL Worker: lost successful response, reload, retry and public list leave only one result',async()=>{
 const {call,sql}=setup(),map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const g=new Game({challenge:true});g.start('完整流程');g.profile.submissionId=crypto.randomUUID();g.tick(300000);const profile=g.checkpoint.profile;let lose=true;
 const options={apiBase:base,storage,fetcher:async(url,init)=>{const u=new URL(url),result=await call(u.pathname+u.search,init);if(init.method==='POST'&&lose){lose=false;throw Error('response lost after commit');}return result;}};
 const first=new Leaderboard(options);first.sync(profile);await first.upload();assert.equal(first.uploadState,'error');assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM scores').get().n,1);
 const restored=new Leaderboard(options);restored.sync(structuredClone(profile));await restored.upload();assert.equal(restored.uploadState,'sent');assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM scores').get().n,1);await restored.load();assert.equal(restored.items[0].name,'完整流程');assert.equal(restored.items[0].finalAmount,'100.00');assert.equal(g.profile.bank,10000);assert.equal(g.profile.elapsedMs,300000);
});
test('short burst is limited even while the native binding is permissive, then expires without adding D1 data',async()=>{
 const {call,sql}=setup(),headers={'CF-Connecting-IP':'203.0.113.30','Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()},body='{"invalid":true}';
 for(let n=0;n<10;n++)assert.equal((await call('/v1/scores',{method:'POST',headers,body})).status,400);
 const limited=await call('/v1/scores',{method:'POST',headers,body});assert.equal(limited.status,429);assert.equal(limited.headers.get('Retry-After'),'60');assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM scores').get().n,0);
 const original=Date.now,now=original();Date.now=()=>now+61000;
 try{assert.equal((await call('/v1/scores',{method:'POST',headers,body})).status,400);}finally{Date.now=original;}
});
