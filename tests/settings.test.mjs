import test from 'node:test';
import assert from 'node:assert/strict';
import {Saves,validateSave} from '../src/storage.mjs';
import {Game} from '../src/game.mjs';
import {settingsDialogView,settingsSavedTime,problemReport,SETTINGS_VERSION} from '../src/settings-view.mjs';
import {readFile} from 'node:fs/promises';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(a,t,c='',extra='')=>`<button data-action="${a}" class="${c}" ${extra}>${t}</button>`;
const view=options=>settingsDialogView({button,escape,...options});
function completed(){const g=new Game({challenge:true,roll:()=>2});g.start('備份測試');g.enterTable('sicbo');g.addBet('small',100);g.lock();g.tick(900);return g;}
function storage(){const map=new Map();return {map,getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};}
test('new saves record actual write time without mutating checkpoint or restoring five minutes',()=>{
 const g=completed(),before=JSON.stringify(g.checkpoint),store=storage(),saves=new Saves(store,{challenge:true,now:()=>1700000000000});
 const result=saves.write(g.checkpoint),read=saves.read('race');assert.equal(read.savedAt,1700000000000);assert.equal(result.savedAt,1700000000000);assert.equal(JSON.stringify(g.checkpoint),before);
 const restored=new Game({challenge:true});restored.restore(read);assert.equal(restored.remainingMs,299100);assert.equal(restored.profile.bank,9900);assert.equal(restored.profile.rounds,1);assert.deepEqual(restored.profile.stats,g.profile.stats);
});
test('old challenge backups have honest unknown time and invalid timestamp metadata cannot replace a save',()=>{
 const g=completed(),old=validateSave(g.checkpoint);assert.ok(!Object.hasOwn(old,'savedAt'));assert.match(settingsSavedTime(old),/舊版存檔未記錄/);assert.match(settingsSavedTime(null),/尚未/);
 for(const savedAt of [-1,1.5,Infinity,NaN,'today',8640000000000001])assert.throws(()=>validateSave({...g.checkpoint,savedAt}),/保存時間/);
 assert.ok(!settingsSavedTime({...old,savedAt:0}).includes('未記錄'));
});
test('primary-write failure never changes the previous save or advances its reported timestamp',()=>{
 const g=completed(),store=storage();let now=10;const saves=new Saves(store,{challenge:true,now:()=>now});saves.write(g.checkpoint);const original=store.getItem(saves.key('race'));
 store.setItem=(k,v)=>{if(k===saves.key('race'))throw new Error('quota');store.map.set(k,v);};now=20;
 assert.throws(()=>saves.write({...g.checkpoint,profile:{...g.profile,name:'匯入玩家'}}),/quota/);assert.equal(store.getItem(saves.key('race')),original);assert.equal(saves.read('race').savedAt,10);
});
test('successful replacement keeps the previous complete record as backup and preserves submission identity',()=>{
 const store=storage();let now=1;const saves=new Saves(store,{challenge:true,now:()=>now}),g=completed();g.checkpoint.profile.submissionId=crypto.randomUUID();saves.write(g.checkpoint);const original=store.getItem(saves.key('race'));now=2;saves.write({...g.checkpoint,profile:{...g.checkpoint.profile,name:'新名稱'}});
 assert.equal(store.getItem(saves.key('race')+'-backup'),original);assert.equal(saves.read('race').profile.submissionId,g.checkpoint.profile.submissionId);assert.equal(saves.read('race').savedAt,2);
});
test('sound controls expose chosen levels and never offer an inaudible test',()=>{
 for(const sound of [{enabled:false,volume:70},{enabled:true,volume:0}])assert.match(view({sound}),/data-action="sound-test"[^>]*disabled/);
 const html=view({sound:{enabled:true,volume:35}});assert.ok(html.includes('35%'));assert.ok(html.includes('type="range"'));assert.ok(html.includes('min="0" max="100"'));assert.ok(!/data-action="sound-test"[^>]*disabled/.test(html));
});
test('data panel shows persistent state and keeps both import and completed-backup export honest',()=>{
 const empty=view({tab:'data'});assert.match(empty,/尚未有保存記錄/);assert.match(empty,/data-action="settings-export"[^>]*disabled/);assert.ok(empty.includes('settings-import'));
 const save=completed().checkpoint;save.profile.name='<script>';const html=view({tab:'data',save,canExport:true,warning:'quota <error>'});assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('&lt;error&gt;'));assert.ok(!html.includes('<script>'));assert.match(html,/最近一次保存未成功/);assert.match(html,/舊版存檔未記錄保存時間/);
});
test('about contains all five accurate game guides and current challenge timing, without enabling items',async()=>{
 const html=view({tab:'about'});assert.equal((html.match(/<details /g)||[]).length,6);for(const word of ['大小教學','百家樂教學','21點教學','德州撲克教學','輪盤教學','0.95:1','3:2','35:1','圍骰','六人無限注','五分鐘到時','只有手動暫停或切到背景'])assert.ok(html.includes(word),word);
 assert.ok(!html.includes('本局道具'));assert.ok(!html.includes(' · 計時繼續'));assert.equal(SETTINGS_VERSION,JSON.parse(await readFile(new URL('../package.json',import.meta.url))).version);
});
test('problem reports require deliberate description and never attach player or game data',()=>{
 assert.throws(()=>problemReport({description:'  '}),/描述/);const report=problemReport({description:'發牌畫面停住',name:'私人姓名',bank:'123.45',cards:'As',userAgent:'private-UA'});assert.ok(report.includes('發牌畫面停住'));assert.ok(!report.includes('private-UA'));assert.ok(!report.includes('私人姓名'));assert.ok(!report.includes('123.45'));
 const opted=problemReport({description:'問題',includeDevice:true,userAgent:'Safari',width:956,height:440});assert.ok(opted.includes('Safari'));assert.ok(opted.includes('956 × 440'));
 const html=view({tab:'about',reportText:'</textarea><script>alert(1)</script>'});assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;/textarea&gt;'));assert.ok(html.includes('rel="noopener noreferrer"'));assert.ok(html.includes('github.com/jacobmaster-97/charity-casino/issues/new'));
});
