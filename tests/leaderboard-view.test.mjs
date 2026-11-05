import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Leaderboard} from '../src/leaderboard.mjs';
import {rankCash,leaderboardDialogView,captureLeaderboardSurface,restoreLeaderboardSurface} from '../src/leaderboard-view.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,cls='',extra='')=>`<button data-action="${action}" class="${cls}" ${extra}>${label}</button>`;
const rows=(start=1,count=20,prefix='真實回應')=>Array.from({length:count},(_,i)=>({entryId:String(start+i),rank:start+i,name:prefix+(start+i),finalAmount:(10000-start-i)+'.50'}));
const response=body=>new Response(JSON.stringify(body));
const make=responses=>new Leaderboard({apiBase:'https://scores.example',fetcher:async()=>{const value=responses.shift();if(value instanceof Error)throw value;return response(value);}});
const view=l=>leaderboardDialogView({leaderboard:l,escape,button,art:p=>p});
test('approved layout renders only real podium entries and remaining rows, with pinned controls',async()=>{
 const l=make([{items:rows(),nextCursor:'page2'}]);await l.load();const html=view(l);
 assert.ok(html.includes('class="modal rank-dialog"'));assert.ok(html.includes('id="rank-title"'));assert.ok(html.includes('aria-labelledby="rank-title"'));assert.equal((html.match(/class="rank-champion/g)||[]).length,2); // article and label
 assert.equal((html.match(/class="rank-medallist /g)||[]).length,2);assert.ok(html.includes('rank-podium-3'));assert.ok(html.includes('真實回應1'));assert.ok(html.includes('真實回應20'));assert.equal((html.match(/<tr><td class="rank-number">/g)||[]).length,17);
 for(const action of ['close-overlay','rank-refresh','rank-back','rank-next'])assert.ok(html.includes(`data-action="${action}"`));assert.ok(html.includes('data-rank-focus="list"'));assert.ok(!html.includes('設計預覽'));assert.ok(!html.includes('12,880.50'));
});
test('second page keeps first-page podium and refresh atomically replaces the snapshot',async()=>{
 const first=rows(),next=rows(21),fresh=rows(1,4,'新快照');const l=make([{items:first,nextCursor:'next'},{items:next,nextCursor:null},{items:fresh,nextCursor:null}]);
 await l.load();const podium=structuredClone(l.topThree);await l.load('next');assert.deepEqual(l.topThree,podium);assert.equal(l.history.length,1);const html=view(l);assert.ok(html.includes('真實回應1'));assert.ok(html.includes('真實回應21'));assert.ok(!html.includes('rank-medallist-21'));assert.ok(html.includes('第 2 頁'));
 await l.load();assert.deepEqual(l.topThree,fresh.slice(0,3));assert.equal(l.history.length,0);assert.ok(view(l).includes('新快照1'));assert.ok(!view(l).includes('真實回應1'));
});
test('failed next/refresh preserves both page and podium; stale responses cannot replace a newer snapshot',async()=>{
 const l=make([{items:rows(),nextCursor:'next'},new Error('offline')]);await l.load();const snapshot=JSON.stringify({items:l.items,top:l.topThree,revision:l.listRevision});await l.load('next');assert.equal(l.listState,'error');assert.equal(l.history.length,0);assert.equal(JSON.stringify({items:l.items,top:l.topThree,revision:l.listRevision}),snapshot);assert.ok(view(l).includes('保留上次榜單'));assert.ok(view(l).includes('真實回應1'));
 let resolve;const slow=new Leaderboard({apiBase:'https://scores.example',fetcher:()=>new Promise(r=>resolve=r)});const old=slow.load();slow.fetcher=async()=>response({items:rows(1,1,'最新'),nextCursor:null});await slow.load();resolve(response({items:rows(1,1,'過時'),nextCursor:null}));await old;assert.equal(slow.topThree[0].name,'最新1');assert.equal(slow.listRevision,1);
});
test('zero, one or two scores never fabricate podium entries; initial error and loading show honest states',async()=>{
 for(const count of [0,1,2]){const l=make([{items:rows(1,count),nextCursor:null}]);await l.load();const html=view(l);assert.equal(l.topThree.length,count);assert.equal((html.match(/<article /g)||[]).length,count);assert.ok(!html.includes('示例'));if(!count){assert.ok(html.includes('龍虎榜尚未有人留名'));assert.ok(html.includes('data-action="home-start"'));}}
 const failed=make([new Error('offline')]);await failed.load();assert.ok(view(failed).includes('暫時未能讀取龍虎榜'));assert.ok(!view(failed).includes('<article '));
 const loading=new Leaderboard({apiBase:'https://scores.example'});loading.listState='loading';assert.ok(view(loading).includes('正在讀取龍虎榜'));assert.ok(!view(loading).includes('龍虎榜尚未有人留名'));
 const disabled=new Leaderboard();assert.ok(view(disabled).includes('排行榜尚未連接'));
});
test('huge money remains exact and focusable, and unsafe names are text in podium as well as list',async()=>{
 const huge='9'.repeat(126)+'.99',name='"><img onerror=x';const fixture=rows(1,4);fixture[0].name=name;fixture[0].finalAmount=huge;fixture[3].name=name;fixture[3].finalAmount=huge;const l=make([{items:fixture,nextCursor:null}]);await l.load();const html=view(l),formatted=rankCash(huge);
 assert.equal(formatted.replaceAll(',','').slice(1),huge);assert.ok(html.includes(formatted));assert.ok(html.includes('可左右捲動查看完整金額'));assert.ok(html.includes('data-rank-focus="money-1"'));assert.ok(html.includes(escape(name)));assert.ok(!html.includes(name));assert.ok(!/1e\+|Infinity|NaN/.test(formatted));
});
test('scroll and money positions survive status rerenders, while a successful new page resets them and keeps focus',()=>{
 const body={dataset:{revision:'2'},scrollTop:80},list={dataset:{rankFocus:'list'},scrollTop:240,focus(){this.focused=true;}},money={dataset:{rankFocus:'money-4'},scrollLeft:120};
 const root={querySelector:s=>s==='.rank-content'?body:s==='.rank-list-scroll'?list:null,querySelectorAll:s=>s==='.rank-money'?[money]:[list,money]};const state=captureLeaderboardSurface(root,list);body.scrollTop=list.scrollTop=money.scrollLeft=0;assert.equal(restoreLeaderboardSurface(root,state),true);assert.equal(body.scrollTop,80);assert.equal(list.scrollTop,240);assert.equal(money.scrollLeft,120);assert.equal(list.focused,true);
 body.dataset.revision='3';body.scrollTop=list.scrollTop=money.scrollLeft=0;restoreLeaderboardSurface(root,state);assert.equal(body.scrollTop,0);assert.equal(list.scrollTop,0);assert.equal(money.scrollLeft,0);assert.equal(captureLeaderboardSurface({querySelector:()=>null}),null);
});
test('runtime ornament is an approved, small derivative with recorded provenance and valid WebP dimensions',async()=>{
 const meta=JSON.parse(await readFile(new URL('../public/art/leaderboard-b/assets.json',import.meta.url),'utf8')),b=await readFile(new URL('../public/art/leaderboard-b/dragon-tiger-v1.webp',import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(b.toString('ascii',12,16),'VP8 ');assert.equal(b.readUInt16LE(26)&16383,1200);assert.equal(b.readUInt16LE(28)&16383,400);assert.ok(b.length<180000);assert.equal(createHash('sha256').update(b).digest('hex'),meta.assets[0].sha256);assert.equal(meta.original_preserved,true);
});
