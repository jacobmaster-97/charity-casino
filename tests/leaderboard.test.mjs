import test from 'node:test';
import assert from 'node:assert/strict';
import {Leaderboard,scorePayload,leaderboardListView} from '../src/leaderboard.mjs';
import {Game} from '../src/game.mjs';
import {validateSave,Saves} from '../src/storage.mjs';
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),map};};
const finished=(name='測試')=>{const g=new Game({challenge:true});g.start(name);g.profile.submissionId=crypto.randomUUID();g.tick(300000);return g.checkpoint.profile;};
const response=(body,status=200)=>new Response(JSON.stringify(body),{status});
test('disabled endpoint never fetches; only completed race scores and exact cents accepted',async()=>{
 const l=new Leaderboard({apiBase:'',fetcher(){assert.fail('no networking');}});l.sync(finished());await l.load();await l.upload();assert.equal(l.configured,false);
 for(const apiBase of ['http://example.com','https://user:password@example.com','https://example.com?secret=x'])assert.equal(new Leaderboard({apiBase}).configured,false);
 assert.throws(()=>scorePayload({mode:'race',status:'active'}));assert.deepEqual(scorePayload({...finished(),bank:90071992547409931234567n}),{name:'測試',finalAmount:'900719925474099312345.67'});assert.throws(()=>scorePayload({...finished(),bank:10n**128n}));
});
test('timeout/error retry after reload reuses exact ID and payload, never uploads gameplay or removes save',async()=>{
 const store=storage(),profile=finished(),calls=[];store.setItem('local-result','untouched');
 let failing=true;const options={apiBase:'https://scores.example',storage:store,fetcher:async(url,init)=>{calls.push({url,init});if(failing)throw new Error('offline');return response({ok:true,entryId:'1'});}};
 const l=new Leaderboard(options);l.sync(profile);assert.equal(calls.length,0);await l.upload();assert.equal(l.uploadState,'error');
 const restored=new Leaderboard(options);restored.sync(structuredClone(profile));failing=false;await restored.upload();assert.equal(restored.uploadState,'sent');assert.equal(calls[0].init.headers['Idempotency-Key'],calls[1].init.headers['Idempotency-Key']);assert.equal(calls[0].init.body,calls[1].init.body);assert.deepEqual(JSON.parse(calls[0].init.body),{name:'測試',finalAmount:'100.00'});assert.equal(calls[0].init.credentials,'omit');assert.equal(store.getItem('local-result'),'untouched');await restored.upload();assert.equal(calls.length,2);
 const next=finished();restored.sync(next);await restored.upload();assert.equal(calls.length,3);assert.notEqual(calls[2].init.headers['Idempotency-Key'],calls[0].init.headers['Idempotency-Key']);
});
test('old completed save without ID stays compatible and its retry stays idempotent across reload',async()=>{
 const profile=finished();delete profile.submissionId;const store=storage(),ids=[];const opts={apiBase:'https://scores.example',storage:store,fetcher:async(u,i)=>{ids.push(i.headers['Idempotency-Key']);throw new Error('offline');}};
 const a=new Leaderboard(opts);a.sync(profile);await a.upload();const b=new Leaderboard(opts);b.sync(structuredClone(profile));await b.upload();assert.equal(ids[0],ids[1]);
 const g=new Game({challenge:true});g.start('舊玩家');g.saveCheckpoint();assert.ok(!('submissionId' in validateSave(g.checkpoint).profile));
 g.profile.submissionId=crypto.randomUUID();g.saveCheckpoint();const saves=new Saves(store,{challenge:true});saves.write(g.checkpoint);assert.equal(saves.read('race').profile.submissionId,g.profile.submissionId);g.checkpoint.profile.submissionId='bad';assert.throws(()=>validateSave(g.checkpoint));
});
test('storage refusal prevents POST, busy double tap ignored and stale completion cannot change next result',async()=>{
 let calls=0,resolve;const store=storage(),p=finished();const noStore=new Leaderboard({apiBase:'https://scores.example',storage:{setItem(){throw Error();}},fetcher(){calls++;}});noStore.sync(p);await noStore.upload();assert.equal(calls,0);assert.equal(noStore.uploadState,'error');
 const l=new Leaderboard({apiBase:'https://scores.example',storage:store,fetcher(){calls++;return new Promise(r=>resolve=r);}});l.sync(p);const pending=l.upload();await l.upload();assert.equal(calls,1);const next=finished();l.sync(next);resolve(response({ok:true,entryId:'1'}));await pending;assert.equal(l.uploadState,'idle');assert.equal(l.entry.id,next.submissionId);
});
test('read pagination, previous/refresh, malicious names escaped and malformed responses retryable',async()=>{
 const calls=[],responses=[{items:[{rank:1,name:'<img onerror=x>',finalAmount:'12.34'}],nextCursor:'abc'},{items:[{rank:21,name:'後頁',finalAmount:'1.00'}],nextCursor:null},{items:[],nextCursor:null}];
 const l=new Leaderboard({apiBase:'https://scores.example',fetcher:async(url)=>{calls.push(url);return response(responses.shift());}});await l.load();assert.equal(l.listState,'ready');await l.load('next');assert.equal(l.history.length,1);assert.match(calls[1],/cursor=abc/);await l.load('back');assert.equal(l.history.length,0);assert.ok(!calls[2].includes('cursor'));
 l.items=[{rank:1,name:'<img onerror=x>',finalAmount:'12.34'}];const html=leaderboardListView({leaderboard:l,button:()=>'',escape:s=>s.replaceAll('<','&lt;').replaceAll('>','&gt;')});assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
 l.fetcher=async()=>response({items:[{rank:1,name:'賭神',finalAmount:123}],nextCursor:null});await l.load();assert.equal(l.listState,'error');
});
test('request timeout returns a retryable state and keeps the durable submission key',async()=>{
 const store=storage(),ids=[];const l=new Leaderboard({apiBase:'https://scores.example',storage:store,timeoutMs:5,fetcher:async(u,init)=>{ids.push(init.headers['Idempotency-Key']);return new Promise((resolve,reject)=>init.signal.addEventListener('abort',()=>reject(new DOMException('timed out','AbortError')),{once:true}));}});
 l.sync(finished());await l.upload();assert.equal(l.uploadState,'error');assert.match(l.uploadMessage,/逾時/);l.fetcher=async(u,init)=>{ids.push(init.headers['Idempotency-Key']);return response({ok:true,entryId:'2'});};await l.upload();assert.equal(l.uploadState,'sent');assert.equal(ids[0],ids[1]);
});
