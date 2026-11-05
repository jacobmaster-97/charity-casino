// Explicit post-deployment smoke. Read-only unless --write-test-score is passed.
import assert from 'node:assert/strict';
const api=process.argv.find(a=>a.startsWith('--api='))?.slice(6);
if(!api)throw new Error('Usage: node scripts/smoke-leaderboard.mjs --api=https://YOUR.workers.dev [--write-test-score]');
const url=new URL(api);if(url.protocol!=='https:'||url.pathname!=='/'||url.username||url.password||url.search||url.hash)throw new Error('Use the public HTTPS Worker origin only.');
const origin='https://jacobmaster-97.github.io';
const read=await fetch(url.origin+'/v1/leaderboard?limit=20',{headers:{Origin:origin},signal:AbortSignal.timeout(15000)});
assert.equal(read.status,200);assert.equal(read.headers.get('Access-Control-Allow-Origin'),origin);const data=await read.json();assert.ok(Array.isArray(data.items));assert.ok(data.items.length<=20);
for(let i=1;i<data.items.length;i++)assert.ok(BigInt(data.items[i-1].finalAmount.replace('.',''))>=BigInt(data.items[i].finalAmount.replace('.','')));
console.log('Public GET, CORS and ordering passed.');
if(process.argv.includes('--write-test-score')){
 const id=crypto.randomUUID(),options={method:'POST',headers:{Origin:origin,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({name:'連線驗證',finalAmount:'0.00'})};
 const first=await fetch(url.origin+'/v1/scores',{...options,signal:AbortSignal.timeout(15000)});assert.equal(first.status,201);const created=await first.json();
 const retry=await fetch(url.origin+'/v1/scores',{...options,signal:AbortSignal.timeout(15000)});assert.equal(retry.status,200);const repeated=await retry.json();assert.equal(created.entryId,repeated.entryId);assert.equal(repeated.deduplicated,true);
 console.log('POST and idempotent retry passed. One PUBLIC test row remains; entryId='+created.entryId+'.');
}else console.log('No upload performed. POST/duplicate handling not tested on the public service.');
