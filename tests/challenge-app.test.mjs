import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const entry=new URL('../src/app.mjs',import.meta.url),source=await readFile(entry,'utf8'),bindings={};
for(const match of source.matchAll(/^import \{[^\n]+\} from '([^']+)';/gm))Object.assign(bindings,await import(new URL(match[1],entry)));
// Event/DOM doubles exercise the real app and Game wiring, not browser layout or audio.
function boot({viewport=null,start=true,artCache=null,mobile=false,blackjackLandscape={enabled:false},features=bindings.GAME_FEATURES,installNavigator={userAgent:'iPhone Safari/605.1',platform:'iPhone'},online=null,localFile=false,storageFault={fail:false}}={}){
 const listeners={},events={},timers=[],deferred=[],clock={now:0},store=new Map(),focused=[];const blank={style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},contains(){return false;}},focus(){},querySelector(){return blank;},querySelectorAll(){return [];},setAttribute(){}};
 const nameInput={...blank,id:'player-name',value:'接線測試',selectionStart:2,selectionEnd:2,focus(){focused.push('player-name');},setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;}};
 const app={...blank,innerHTML:'',addEventListener:(name,fn)=>events[name]=fn,querySelector:s=>(s.startsWith('[data-action="home-')||['[data-action="lobby-more"]','[data-action="round-result"]'].includes(s))?{focus(){focused.push(s);}}:null,querySelectorAll:()=>[]},toast={...blank},elapsed={textContent:''},modal={...blank,querySelector:s=>s==='#player-name'?nameInput:blank};
 const document={hidden:false,activeElement:{dataset:{},tagName:'BUTTON',classList:blank.classList},documentElement:{style:blank.style},querySelector:s=>s==='#app'?app:s==='#toast'?toast:s==='#player-name'&&app.innerHTML.includes('id="player-name"')?nameInput:s==='#elapsed'&&app.innerHTML.includes('id="elapsed"')?elapsed:s==='.modal'&&app.innerHTML.includes('class="modal ')?modal:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners[name]=fn};
 const downloads=[],objectURLs=new Map();class TestURL extends URL{static createObjectURL(blob){const url='blob:unit-'+objectURLs.size;objectURLs.set(url,blob);return url;}static revokeObjectURL(url){objectURLs.delete(url);}}
 document.body={append(){}};document.createElement=()=>({href:'',download:'',click(){downloads.push({filename:this.download,blob:objectURLs.get(this.href)});},remove(){}});const importInput={click(){importInput.clicks=(importInput.clicks||0)+1;}};const originalQuery=document.querySelector;document.querySelector=s=>s==='#import-file'?importInput:originalQuery(s);
 const window={location:{protocol:localFile?'file:':'https:'},navigator:installNavigator,requestIdleCallback:fn=>deferred.push(fn),localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>{if(storageFault.fail)throw new Error('quota');store.set(k,v);}},addEventListener:(name,fn)=>{const key='window-'+name,previous=listeners[key];listeners[key]=previous?(...args)=>{previous(...args);fn(...args);}:fn;}};
 if(viewport)Object.assign(window,viewport);
 class QuietSound{enabled=true;volume=100;setVolume(v){this.volume=v;return v;}play(){}sync(){}stopAll(){}unlock(){return Promise.resolve(false);}setMuted(v){this.enabled=!v;}test(){return Promise.resolve(false);}}
 class QuietPanels{dialog=null;selection='';beforeRender(){}release(){}mount(){}close(){}}
 class QuietFlights{pending={};flights=[];cancel(){}mount(){}pause(){}landAll(){}queue(){}}
 class QuietSqueeze{mount(){}paint(){}}
 class QuietRecordShare{source=null;state='ready';message='';fallback=false;sync(profile){this.source=profile;}reset(){this.source=null;}share(){this.shared=(this.shared||0)+1;return Promise.resolve('shared');}downloadImage(){this.downloads=(this.downloads||0)+1;}}
 class WiredLeaderboard extends bindings.Leaderboard{constructor(options){super({...options,...(online?{fetcher:online}:{})});}}
 class QuietArtCache{prefetch(id){return artCache?artCache.prefetch(id):Promise.resolve(true);}}
 const context=vm.createContext({...bindings,Leaderboard:WiredLeaderboard,LEADERBOARD_API:online?'https://scores.example':'',GAME_FEATURES:features,document,window,URL:TestURL,Blob,structuredClone,performance:{now:()=>clock.now},matchMedia:()=>({matches:true}),setInterval:fn=>timers.push(fn),setTimeout:fn=>{deferred.push(fn);return deferred.length;},clearTimeout(){},requestAnimationFrame(){},fetch(){throw new Error('No network service may be called');},CasinoSound:QuietSound,RecordShare:QuietRecordShare,TableArtCache:QuietArtCache,TablePanels:QuietPanels,ChipFlights:QuietFlights,BaccaratSqueezeController:QuietSqueeze,updateGameViewport(){},mobileTableViewport:()=>mobile,mobilePokerViewport:()=>false,mobileBlackjackViewport:()=>blackjackLandscape.enabled,fitBaccaratSurface(){},fitBlackjackSurface(){},fitPokerSurface(){},fitRouletteSurface(){},fitLobbySurface(){}});
 const code=source.replace(/^import .*;\s*$/gm,'').replaceAll('import.meta.url',JSON.stringify(entry.href))+`;globalThis.subject={game,render,showRestored,openOverlay,closeOverlay,recordShare,leaderboard,sounds,music};`;
 vm.runInContext(code,context);
 const act=(a,data={})=>{const target={disabled:false,dataset:{action:a,...data},tagName:'BUTTON',getAttribute:()=>null,closest:s=>s==='[data-action]'?target:s==='.modal'&&['resume','close-overlay','home','next','leave','finish','manual-save','pause','share-record','download-record','retry-record','upload-score','rank-refresh','rank-next','rank-back','settings','settings-tab','settings-export','settings-import','confirm-import','cancel-import','sound','sound-test','music'].includes(a)?modal:null};events.click({target,preventDefault(){}});};
 if(start){events.input({target:{id:'player-name',value:'接線測試'}});act('enter');}
 return {subject:context.subject,app,elapsed,store,act,downloads,importInput,input(id,value){events.input({target:{id,value}});},listeners,document,focused,nameInput,toast,async importSave(save,{confirm=true}={}){const text=JSON.stringify(save);await events.change({target:{id:'import-file',files:[{size:text.length,text:async()=>text}]}});if(confirm&&app.innerHTML.includes('data-action="confirm-import"'))act('confirm-import');},runDeferred(){for(const fn of deferred.splice(0))fn();},hint(type,id,{disabled=false}={}){events[type]({target:{closest:()=>({dataset:{table:id},disabled})}});},setName(value){nameInput.value=value;events.input({target:nameInput});},submit(){events.submit({target:{id:'start-form'},preventDefault(){}});},elapse(ms){clock.now+=ms;},tick(ms){clock.now+=ms;timers[0]();}};
}
test('online integration sends only after explicit final upload; retry preserves score and new run gets a different ID',async()=>{
 const calls=[];let fail=true;const t=boot({online:async(url,init)=>{calls.push({url,init});if(fail)throw new Error('offline');return new Response(JSON.stringify({ok:true,entryId:'1'}));}});
 const id=t.subject.game.profile.submissionId;assert.match(id,/^[a-f0-9-]{36}$/);t.tick(1000);t.act('pause');t.act('resume');assert.equal(calls.length,0);t.tick(299000);assert.ok(t.app.innerHTML.includes('上傳排行榜'));assert.equal(calls.length,0);
 const before=JSON.stringify(t.subject.game.checkpoint);t.act('upload-score');await new Promise(r=>setImmediate(r));assert.equal(t.subject.leaderboard.uploadState,'error');assert.ok(t.app.innerHTML.includes('重試上傳排行榜'));assert.equal(JSON.stringify(t.subject.game.checkpoint),before);
 fail=false;t.act('upload-score');await new Promise(r=>setImmediate(r));assert.equal(calls.length,2);assert.equal(calls[0].init.body,calls[1].init.body);assert.deepEqual(JSON.parse(calls[0].init.body),{name:'接線測試',finalAmount:'100.00'});assert.equal(calls[0].init.headers['Idempotency-Key'],id);assert.ok(t.app.innerHTML.includes('已上傳排行榜'));t.act('home');t.act('enter');assert.notEqual(t.subject.game.profile.submissionId,id);assert.equal(t.subject.game.profile.bank,10000);
});
test('online home leaderboard loads only on opening, displays escaped names and never creates a game',async()=>{
 let calls=0;const t=boot({start:false,online:async()=>{calls++;return new Response(JSON.stringify({items:[{entryId:'1',rank:1,name:'<賭神>',finalAmount:'123.45'}],nextCursor:null}));}});assert.equal(calls,0);t.act('home-rank');await new Promise(r=>setImmediate(r));assert.equal(calls,1);assert.ok(t.app.innerHTML.includes('&lt;賭神&gt;'));assert.ok(t.app.innerHTML.includes('$123.45'));assert.equal(t.subject.game.profile,null);
});
test('app starts the five-minute ruleset and shop HUD keeps counting down',()=>{
 const t=boot({features:{shop:true,items:true}});assert.equal(t.subject.game.challenge,true);assert.ok(t.app.innerHTML.includes('lobby-map'));t.tick(1000);assert.equal(t.elapsed.textContent,'00:04:59');t.act('shop');assert.equal(t.subject.game.screen,'shop');assert.ok(t.app.innerHTML.includes('計時繼續'));t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,2000);assert.equal(t.elapsed.textContent,'00:04:58');
});
test('rules do not pause, but background pauses even with an information panel open and needs Continue',()=>{
 const t=boot();t.act('rules');assert.equal(t.subject.game.paused,false);t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,1000);t.document.hidden=true;t.listeners.visibilitychange();assert.equal(t.subject.game.paused,true);t.tick(20000);assert.equal(t.subject.game.profile.elapsedMs,1000);t.document.hidden=false;t.listeners.visibilitychange();assert.equal(t.subject.game.paused,true);t.act('resume');t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,2000);
});
test('manual pause freezes the active timer, then exact deadline opens the five-table result panel',()=>{
 const t=boot();t.tick(2000);t.act('pause');t.tick(50000);assert.equal(t.subject.game.profile.elapsedMs,2000);t.act('resume');t.tick(298000);assert.equal(t.subject.game.profile.status,'finished');assert.ok(t.app.innerHTML.includes('challenge-result-modal'));assert.equal((t.app.innerHTML.match(/data-stat-table=/g)||[]).length,5);assert.ok(!t.app.innerHTML.includes('上傳排行榜'));assert.equal([...t.store.keys()].filter(k=>k.includes('five-minute-v2')).length,1);
});
test('deadline inside an informational panel replaces it with the result and does not reset the clock',()=>{
 const t=boot();t.act('saves');t.tick(300000);assert.equal(t.subject.game.remainingMs,0);assert.ok(t.app.innerHTML.includes('五桌戰績'));assert.equal(t.subject.game.profile.rounds,0);assert.equal(t.subject.game.profile.bank,10000);
});
test('home shows the approved five choices and does not create a challenge while browsing menus',()=>{
 const t=boot({start:false});assert.equal((t.app.innerHTML.match(/class="title-menu-button /g)||[]).length,5);assert.ok(t.app.innerHTML.includes('alt="五分鐘賭神"'));assert.ok(!t.app.innerHTML.includes('id="start-form"'));t.tick(20000);assert.equal(t.subject.game.profile,null);assert.equal(t.store.size,0);
 assert.ok(t.app.innerHTML.includes('href="https://buymeacoffee.com/studios_16"'));assert.ok(!t.app.innerHTML.includes('data-action="home-support"'));for(const a of ['home-rank']){t.act(a);assert.ok(t.app.innerHTML.includes('aria-modal="true"'));assert.equal(t.subject.game.profile,null);t.act('close-overlay');}
});
test('home start validates the name, passes through the story, then starts exactly $100 and five minutes',()=>{
 const t=boot({start:false});t.act('home-start');assert.ok(t.app.innerHTML.includes('id="start-form"'));assert.equal(t.focused.at(-1),'player-name');t.setName('');t.submit();assert.ok(t.app.innerHTML.includes('home-dialog-start'));assert.ok(t.toast.textContent.includes('1–16'));t.setName('新賭神');t.submit();assert.ok(t.app.innerHTML.includes('class="story-page"'));assert.ok(!t.app.innerHTML.includes('aria-modal="true"'));t.tick(9000);assert.equal(t.subject.game.profile,null);t.act('enter');assert.equal(t.subject.game.profile.name,'新賭神');assert.equal(t.subject.game.profile.bank,10000);assert.equal(t.subject.game.remainingMs,300000);
});
test('stale mode actions cannot reopen free mode and preserve the entered name',()=>{
 const t=boot({start:false});t.act('home-start');t.setName('<測試>');t.act('mode',{mode:'free'});assert.ok(t.app.innerHTML.includes('value="&lt;測試&gt;"'));t.submit();t.act('enter');assert.equal(t.subject.game.profile.mode,'race');assert.equal(t.subject.game.profile.bank,10000);assert.equal(t.subject.game.remainingMs,300000);
});
test('home settings retains audio controls without starting the timer and closes back to its trigger',()=>{
 const t=boot({start:false});t.act('home-settings');assert.ok(t.app.innerHTML.includes('data-action="sound-test"'));assert.ok(t.app.innerHTML.includes('試聽'));assert.ok(t.app.innerHTML.includes('id="sound-volume"'));assert.ok(t.app.innerHTML.includes('存檔與資料'));assert.ok(!t.app.innerHTML.includes('data-action="import"'));t.act('sound');assert.ok(t.app.innerHTML.includes('已關閉'));t.tick(30000);assert.equal(t.subject.game.profile,null);t.act('close-overlay');assert.equal(t.focused.at(-1),'[data-action="home-settings"]');assert.ok(!t.app.innerHTML.includes('aria-modal="true"'));
});
test('Escape closes a home information dialog and restores its trigger',()=>{
 const t=boot({start:false});t.act('home-rank');let prevented=false;t.listeners.keydown({key:'Escape',target:{},preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(t.focused.at(-1),'[data-action="home-rank"]');assert.ok(!t.app.innerHTML.includes('aria-modal="true"'));
});
test('a saved five-minute challenge continues through the new start dialog without refilling the clock',()=>{
 const previous=new bindings.Game({challenge:true});previous.start('保存玩家');previous.tick(12500);previous.saveCheckpoint();const t=boot({start:false});t.store.set('charity-casino-five-minute-v2-race-auto',JSON.stringify(previous.checkpoint));t.act('home-start');assert.ok(t.app.innerHTML.includes('繼續上次挑戰'));t.act('continue');assert.equal(t.subject.game.profile.name,'保存玩家');assert.equal(t.subject.game.remainingMs,287500);assert.ok(!t.app.innerHTML.includes('home-dialog-start'));
});
test('returning to home and opening a new challenge never brings old bankroll into the new run',()=>{
 const t=boot();t.subject.game.profile.bank=123456;t.act('home');t.act('home-start');t.setName('再挑戰');t.submit();t.act('enter');assert.equal(t.subject.game.profile.bank,10000);assert.equal(t.subject.game.profile.rounds,0);assert.equal(t.subject.game.remainingMs,300000);
});
test('a home start rerender retains the name input focus and caret for viewport changes',()=>{
 const t=boot({start:false});t.act('home-start');t.setName('手機玩家');t.document.activeElement=t.nameInput;t.subject.render();assert.equal(t.focused.at(-1),'player-name');assert.equal(t.nameInput.selectionStart,2);assert.ok(t.app.innerHTML.includes('value="手機玩家"'));
});
test('compact lobby keeps More and five stations while the temporary shop switch hides its entry',()=>{
 const t=boot();assert.ok(t.app.innerHTML.includes('class="hud lobby-hud"'));assert.ok(!t.app.innerHTML.includes('data-action="shop"'));assert.ok(t.app.innerHTML.includes('data-action="lobby-more"'));assert.equal((t.app.innerHTML.match(/data-action="table"/g)||[]).length,5);assert.ok(!/class="lobby-bottom"|class="goal-bar"|class="section-heading"|class="goal-copy"/.test(t.app.innerHTML));assert.ok(!t.app.innerHTML.includes('data-action="home"'));assert.ok(!t.app.innerHTML.includes('data-action="saves"'));
});
test('lobby More keeps counting and preserves the existing save route and keyboard trigger',()=>{
 const t=boot();t.act('lobby-more');assert.ok(t.app.innerHTML.includes('id="lobby-menu-dialog"'));assert.ok(t.app.innerHTML.includes('計時繼續'));assert.ok(t.app.innerHTML.includes('遊玩及存檔說明'));t.tick(1234);assert.equal(t.subject.game.profile.elapsedMs,1234);assert.equal(t.subject.game.paused,false);t.act('saves');assert.ok(t.app.innerHTML.includes('只保存已完成局'));t.act('close-overlay');assert.equal(t.focused.at(-1),'[data-action="lobby-more"]');assert.equal(t.subject.game.profile.bank,10000);
});
test('the challenge deadline replaces lobby More with the final result without adding a round',()=>{
 const t=boot();t.act('lobby-more');t.tick(300000);assert.equal(t.subject.game.profile.status,'finished');assert.ok(t.app.innerHTML.includes('challenge-result-modal'));assert.equal((t.app.innerHTML.match(/data-stat-table=/g)||[]).length,5);assert.ok(!t.app.innerHTML.includes('id="lobby-menu-dialog"'));assert.equal(t.subject.game.profile.rounds,0);assert.equal(t.subject.game.profile.bank,10000);
});
test('background still pauses both clocks while lobby More is open and Continue preserves the remaining time',()=>{
 const t=boot();t.act('lobby-more');t.tick(500);t.document.hidden=true;t.listeners.visibilitychange();assert.equal(t.subject.game.paused,true);t.tick(20000);assert.equal(t.subject.game.profile.elapsedMs,500);t.document.hidden=false;t.listeners.visibilitychange();assert.equal(t.subject.game.paused,true);t.act('resume');t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,1500);assert.equal(t.subject.game.screen,'lobby');
});
test('Escape leaves lobby More, and Return Home remains reachable from the relocated controls',()=>{
 const t=boot();t.act('lobby-more');t.elapse(75);let prevented=false;t.listeners.keydown({key:'Escape',target:{},preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(t.subject.game.profile.elapsedMs,75);assert.equal(t.focused.at(-1),'[data-action="lobby-more"]');assert.ok(!t.app.innerHTML.includes('id="lobby-menu-dialog"'));t.act('lobby-more');t.act('home');assert.equal(t.subject.game.screen,'home');assert.ok(t.app.innerHTML.includes('home-title-screen'));assert.ok(!t.app.innerHTML.includes('aria-modal="true"'));
});

function settledTable(t,id){
 const g=t.subject.game;g.randomIndex=()=>0;t.act('table',{table:id});
 if(id==='poker')g.startPoker();else{assert.ok(g.addBet(id==='sicbo'?'small':id==='roulette'?'rou-black':id==='baccarat'?'bac-player':'bj-main',100));g.lock();}
 for(let i=0;i<1500&&g.round.phase!=='settled';i++)g.tick(1000);
 assert.equal(g.round.phase,'settled');t.subject.render();return g;
}
test('all five completed games show one compact payout dialog without changing settlement or rendering inline panels',()=>{
 for(const id of ['sicbo','baccarat','blackjack','poker','roulette']){
  const t=boot(),g=settledTable(t,id),before=structuredClone(g.checkpoint),bank=g.profile.bank,rounds=g.profile.rounds;
  assert.ok(t.app.innerHTML.includes('payout-modal'),id);assert.ok(t.app.innerHTML.includes('aria-labelledby="round-result-title"'));
  assert.ok(t.app.innerHTML.includes('本局投注'));assert.ok(t.app.innerHTML.includes('退回及派彩'));
  assert.ok(!t.app.innerHTML.includes('class="result-box'),id);assert.ok(!t.app.innerHTML.includes('class="pk-result"'),id);
  t.subject.render();assert.equal(g.profile.bank,bank);assert.equal(g.profile.rounds,rounds);assert.deepEqual(g.checkpoint,before);
  t.act('close-overlay');assert.ok(!t.app.innerHTML.includes('payout-modal'));assert.ok(t.app.innerHTML.includes('data-action="round-result"'));
  t.tick(300);assert.ok(!t.app.innerHTML.includes('payout-modal'));t.act('round-result');assert.ok(t.app.innerHTML.includes('payout-modal'));
  t.act('leave');assert.equal(g.screen,'lobby');assert.equal(g.profile.rounds,rounds);
 }
});
test('payout does not pause, background still does, and next round does not pay the old round twice',()=>{
 const t=boot(),g=settledTable(t,'roulette'),bank=g.profile.bank,rounds=g.profile.rounds,elapsed=g.profile.elapsedMs;
 t.tick(1000);assert.equal(g.profile.elapsedMs,elapsed+1000);t.document.hidden=true;t.listeners.visibilitychange();t.tick(20000);assert.equal(g.profile.elapsedMs,elapsed+1000);t.document.hidden=false;t.act('resume');assert.ok(!t.app.innerHTML.includes('payout-modal'));t.act('round-result');t.act('next');assert.equal(g.round.phase,'betting');assert.equal(g.profile.bank,bank);assert.equal(g.profile.rounds,rounds);assert.ok(!t.app.innerHTML.includes('payout-modal'));
});
test('a payout open at the deadline disables another round and leads to the final five-table result',()=>{
 const t=boot(),g=settledTable(t,'roulette'),bank=g.profile.bank,rounds=g.profile.rounds;
 t.tick(g.remainingMs);assert.equal(g.profile.status,'finished');assert.ok(t.app.innerHTML.includes('payout-modal'));assert.ok(!t.app.innerHTML.includes('data-action="next"'));t.act('finish');assert.ok(t.app.innerHTML.includes('challenge-result-modal'));assert.equal(g.profile.bank,bank);assert.equal(g.profile.rounds,rounds);
});
test('mobile roulette preserves the spinning reveal before the payout dialog',()=>{
 const t=boot({mobile:true});t.act('table',{table:'roulette'});const g=t.subject.game;g.randomIndex=()=>0;g.addBet('rou-black',100);g.lock();t.subject.render();assert.ok(t.app.innerHTML.includes('mobile-reveal-dialog'));
 for(let i=0;i<100&&g.round.phase!=='settled';i++)t.tick(100);
 assert.equal(g.round.phase,'settled');assert.ok(!t.app.innerHTML.includes('payout-modal'));t.tick(1400);assert.ok(t.app.innerHTML.includes('payout-modal'));assert.ok(!t.app.innerHTML.includes('mobile-reveal-dialog'));
});
function delayedArt(){let resolve;const pending=new Promise(r=>resolve=r);return {calls:[],prefetch(id){this.calls.push(id);return pending;},complete(ok=true){resolve(ok);}};}
test('each table opens synchronously while the selected texture hint is still pending',()=>{
 for(const id of ['sicbo','baccarat','blackjack','poker','roulette']){const art=delayedArt(),t=boot({artCache:art});t.hint('pointerdown',id);t.act('table',{table:id});assert.equal(t.subject.game.screen,'table');assert.equal(t.subject.game.activeTable,id);assert.ok(!t.app.innerHTML.includes('table-loading-modal'));assert.equal(t.subject.game.profile.elapsedMs,0);assert.deepEqual(art.calls,[id]);}
});
test('a late or failed texture hint cannot navigate or change a subsequent game',async()=>{
 const art=delayedArt(),t=boot({artCache:art});t.hint('pointerover','roulette');t.act('table',{table:'roulette'});t.act('leave');t.act('table',{table:'poker'});const before=JSON.stringify(t.subject.game),html=t.app.innerHTML;art.complete(false);await Promise.resolve();assert.equal(JSON.stringify(t.subject.game),before);assert.equal(t.app.innerHTML,html);assert.equal(t.subject.game.activeTable,'poker');
});
test('background and deadline retain Game ownership while texture hints remain unresolved',async()=>{
 const art=delayedArt(),t=boot({artCache:art});t.hint('pointerdown','roulette');t.act('table',{table:'roulette'});t.tick(500);const remaining=t.subject.game.round.remaining;t.document.hidden=true;t.listeners.visibilitychange();art.complete();await Promise.resolve();t.tick(20000);assert.equal(t.subject.game.screen,'table');assert.equal(t.subject.game.profile.elapsedMs,500);assert.equal(t.subject.game.round.remaining,remaining);assert.equal(t.subject.game.paused,true);t.document.hidden=false;t.act('resume');assert.equal(t.subject.game.round.remaining,remaining);
 const art2=delayedArt(),u=boot({artCache:art2});u.hint('pointerover','poker');u.act('table',{table:'poker'});u.tick(300000);art2.complete();await Promise.resolve();assert.equal(u.subject.game.profile.status,'finished');assert.equal(u.subject.game.profile.rounds,0);assert.ok(u.app.innerHTML.includes('challenge-result-modal'));
});
test('home and lobby never schedule a bulk texture warmup or background requests',()=>{
 const art=delayedArt(),t=boot({start:false,artCache:art});t.runDeferred();assert.deepEqual(art.calls,[]);t.setName('啟動測試');t.act('enter');t.runDeferred();t.tick(5000);assert.deepEqual(art.calls,[]);assert.equal(t.subject.game.profile.elapsedMs,5000);
});
test('only a pointed, focused or touched lobby table gets hints; pause and other screens do not',()=>{
 const art=delayedArt(),t=boot({artCache:art});t.hint('pointerover','roulette');t.hint('focusin','poker');t.hint('pointerdown','baccarat');assert.deepEqual(art.calls,['roulette','poker','baccarat']);t.hint('pointerdown','sicbo',{disabled:true});t.act('lobby-more');t.hint('pointerover','sicbo');t.act('close-overlay');t.act('pause');t.hint('focusin','sicbo');t.act('resume');t.act('table',{table:'blackjack'});t.hint('pointerover','sicbo');assert.deepEqual(art.calls,['roulette','poker','baccarat']);
});

test('Escape dismisses payout once and returns focus to View Payout',()=>{
 const t=boot();settledTable(t,'roulette');let prevented=false;t.listeners.keydown({key:'Escape',target:{},preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.ok(!t.app.innerHTML.includes('payout-modal'));assert.equal(t.focused.at(-1),'[data-action="round-result"]');t.subject.render();assert.ok(!t.app.innerHTML.includes('payout-modal'));
});
test('all-in loss shows the settled payout before final results and offers no new round',()=>{
 const t=boot(),g=t.subject.game;g.randomIndex=()=>0;t.act('table',{table:'roulette'});g.addBet('rou-black',10000);g.lock();for(let i=0;i<100&&g.round.phase!=='settled';i++)g.tick(1000);assert.equal(g.profile.status,'finished');assert.equal(g.profile.endReason,'bust');t.subject.render();assert.ok(t.app.innerHTML.includes('payout-modal'));assert.ok(!t.app.innerHTML.includes('data-action="next"'));assert.equal(g.profile.rounds,1);t.act('finish');assert.ok(t.app.innerHTML.includes('challenge-result-modal'));assert.equal(g.profile.bank,0);assert.equal(g.profile.rounds,1);
});


test('slow textures never block a table click behind an all-images loading gate',()=>{
 const art={ready:()=>false,load:()=>new Promise(()=>{}),prefetch:()=>new Promise(()=>{})};
 const t=boot({artCache:art});t.act('table',{table:'roulette'});assert.equal(t.subject.game.screen,'table');assert.equal(t.subject.game.activeTable,'roulette');assert.ok(!t.app.innerHTML.includes('table-loading-modal'));
});

test('final-record sharing binds the saved result and leaves bankroll, clocks, statistics and save untouched',async()=>{
 const t=boot();t.tick(300000);const g=t.subject.game,record=t.subject.recordShare,before=JSON.stringify(g),saved=JSON.stringify([...t.store]);assert.equal(record.source,g.checkpoint.profile);assert.ok(t.app.innerHTML.includes('data-action="share-record"'));assert.ok(!t.app.innerHTML.includes('遊玩時間'));t.act('share-record');await Promise.resolve();assert.equal(record.shared,1);assert.equal(JSON.stringify(g),before);assert.equal(JSON.stringify([...t.store]),saved);
});
test('bust record keeps play time, home and PNG-share actions and clears prepared data on Home',()=>{
 const t=boot(),g=t.subject.game;g.randomIndex=()=>0;t.act('table',{table:'roulette'});g.addBet('rou-black',10000);g.lock();g.tick(10000);t.subject.render();t.act('finish');assert.ok(t.app.innerHTML.includes('挑戰失敗'));assert.ok(t.app.innerHTML.includes('遊玩時間'));assert.ok(t.app.innerHTML.includes('分享挑戰紀錄'));const before=JSON.stringify(g.checkpoint);t.act('download-record');assert.equal(t.subject.recordShare.downloads,1);t.act('home');assert.equal(t.subject.recordShare.source,null);assert.equal(g.screen,'home');assert.equal(JSON.stringify(g.checkpoint),before);
});
test('image preparation errors keep a reachable retry action on the finished record',()=>{
 const t=boot();t.tick(300000);const share=t.subject.recordShare;share.state='error';share.message='分享圖片準備失敗，請重新準備。';t.subject.render();assert.ok(t.app.innerHTML.includes('data-action="retry-record"'));t.act('retry-record');assert.equal(share.source,t.subject.game.checkpoint.profile);assert.ok(t.app.innerHTML.includes('返回主頁'));
});

test('landscape blackjack owns a single compact HUD and rotation preserves the live hand and clocks',()=>{
 const viewport={enabled:true},t=boot({mobile:true,blackjackLandscape:viewport});t.act('table',{table:'blackjack'});const g=t.subject.game;
 assert.ok(t.app.innerHTML.includes('mobile-blackjack-hud'));assert.equal((t.app.innerHTML.match(/id="countdown"/g)||[]).length,1);assert.ok(t.app.innerHTML.includes('data-action="table-tools"'));
 assert.ok(g.addBet('bj-main',500));assert.ok(g.lock());for(let i=0;i<20&&g.round.phase==='bj-dealing';i++)g.tick(g.round.remaining);t.subject.render();
 const live=g.round,snapshot=JSON.stringify(g);viewport.enabled=false;t.listeners['window-resize']();assert.ok(!t.app.innerHTML.includes('mobile-blackjack-hud'));assert.equal(JSON.stringify(g),snapshot);
 viewport.enabled=true;t.listeners['window-resize']();assert.ok(t.app.innerHTML.includes('blackjack-mobile'));assert.equal(g.round,live);assert.equal(JSON.stringify(g),snapshot);
 const remaining=g.round.remaining;t.act('pause');t.tick(10000);assert.equal(g.round.remaining,remaining);t.act('resume');assert.equal(g.round.remaining,remaining);
});

test('disabled shop and item actions cannot navigate, open selections or spend saved inventory',()=>{
 const t=boot(),g=t.subject.game;assert.equal(g.features.shop,false);assert.equal(g.features.items,false);assert.ok(!t.app.innerHTML.includes('data-action="shop"'));
 const before=JSON.stringify(g);for(const action of ['shop','buy','use','rou-item','pk-item','pk-swap-card','pk-peek-seat','bj-swap-card'])t.act(action,{item:'protect'});
 assert.equal(JSON.stringify(g),before);assert.equal(g.screen,'lobby');
});
test('all five live table UIs and rules hide inventory while ordinary betting remains available',()=>{
 for(const table of ['sicbo','baccarat','blackjack','poker','roulette']){
  const t=boot(),g=t.subject.game;t.act('table',{table});g.profile.inventory={protect:2,peek:2,reroll:2,swap:2};t.subject.render();
  assert.ok(!t.app.innerHTML.includes('class="inventory"'),table);assert.ok(!t.app.innerHTML.includes('data-action="use"'),table);assert.ok(!t.app.innerHTML.includes('data-action="pk-item"'),table);
  t.act('rules');assert.ok(!t.app.innerHTML.includes('道具'),table);t.act('close-overlay');
  if(table==='poker')assert.ok(g.startPoker());else assert.ok(g.addBet({sicbo:'small',baccarat:'bac-player',blackjack:'bj-main',roulette:'rou-black'}[table],500));
  assert.deepEqual(g.profile.inventory,{protect:2,peek:2,reroll:2,swap:2});
 }
});

test('home install opens matching instructions, switches browsers and returns focus without touching Game or saves',()=>{
 const t=boot({start:false}),before=JSON.stringify(t.subject.game);t.act('home-install');assert.ok(t.app.innerHTML.includes('home-dialog-install'));assert.ok(t.app.innerHTML.includes('選擇「加入主畫面」'));t.tick(5000);assert.equal(t.subject.game.profile,null);
 t.act('install-browser',{browser:'chrome'});assert.ok(t.app.innerHTML.includes('右下角「新增」'));t.act('close-overlay');assert.equal(t.focused.at(-1),'[data-action="home-install"]');assert.equal(JSON.stringify(t.subject.game),before);assert.equal(t.store.size,0);
});
test('Chrome iPhone automatically selects its manual guide without calling share or install prompts',()=>{
 const t=boot({start:false,installNavigator:{userAgent:'iPhone CriOS/140 Safari/605.1',share(){assert.fail('must not invoke native sharing');}}});t.act('home-install');assert.ok(t.app.innerHTML.includes('data-browser="chrome" aria-pressed="true"'));assert.ok(t.app.innerHTML.includes('右上角「分享」'));assert.equal(t.subject.game.profile,null);
});

test('free-mode saves remain byte-identical and cannot be imported or directly restored into the active challenge',async()=>{
 const old=new bindings.Game({challenge:true});old.start('舊自由','free');old.tick(12500);old.saveCheckpoint();const t=boot(),g=t.subject.game;
 t.store.set('charity-casino-five-minute-v2-free-auto',JSON.stringify(old.checkpoint));t.store.set('charity-casino-five-minute-v2-free-manual',JSON.stringify(old.checkpoint));t.store.set('charity-casino-free-auto','preserved legacy bytes');
 const before=JSON.stringify(g),saved=JSON.stringify([...t.store]);await t.importSave(old.checkpoint);assert.ok(t.toast.textContent.includes('只支援五分鐘挑戰'));assert.equal(JSON.stringify(g),before);assert.equal(JSON.stringify([...t.store]),saved);
 assert.equal(t.subject.showRestored(old.checkpoint),false);for(const action of ['mode','load-manual','manual-save'])t.act(action,{mode:'free'});assert.equal(JSON.stringify(g),before);assert.equal(JSON.stringify([...t.store]),saved);
});
test('only a race checkpoint is offered for continuation and resumes with its original remaining time',()=>{
 const old=new bindings.Game({challenge:true});old.start('舊自由','free');old.saveCheckpoint();const t=boot({start:false});t.store.set('charity-casino-five-minute-v2-free-auto',JSON.stringify(old.checkpoint));t.act('home-start');assert.ok(!t.app.innerHTML.includes('data-action="continue"'));assert.ok(!t.app.innerHTML.includes('data-action="mode"'));
 const race=new bindings.Game({challenge:true});race.start('五分鐘');race.tick(12500);race.saveCheckpoint();t.store.set('charity-casino-five-minute-v2-race-auto',JSON.stringify(race.checkpoint));t.subject.render();assert.ok(t.app.innerHTML.includes('data-action="continue"'));t.act('continue');assert.equal(t.subject.game.profile.mode,'race');assert.equal(t.subject.game.remainingMs,287500);assert.equal(t.store.get('charity-casino-five-minute-v2-free-auto'),JSON.stringify(old.checkpoint));
});

test('configured online feature stays disabled in the standalone file and never sends a score',()=>{
 const t=boot({localFile:true,online:async()=>assert.fail('local file must not contact the service')});t.tick(300000);assert.equal(t.subject.leaderboard.configured,false);assert.ok(!t.app.innerHTML.includes('data-action="upload-score"'));assert.equal(t.subject.game.profile.status,'finished');assert.ok(t.app.innerHTML.includes('分享挑戰紀錄'));
});
test('real empty leaderboard opens the new design and Start goes through the name form without altering saves',async()=>{
 const t=boot({start:false,online:async()=>new Response(JSON.stringify({items:[],nextCursor:null}))});t.act('home-rank');await new Promise(r=>setImmediate(r));assert.ok(t.app.innerHTML.includes('rank-dialog'));assert.ok(t.app.innerHTML.includes('龍虎榜尚未有人留名'));assert.ok(!t.app.innerHTML.includes('rank-champion-label'));const before=[...t.store.entries()];t.act('home-start');assert.ok(t.app.innerHTML.includes('id="start-form"'));assert.equal(t.subject.game.profile,null);assert.deepEqual([...t.store.entries()],before);
});
test('real rank next-page controls retain podium and failed refresh retains data without starting a game',async()=>{
 const queue=[{items:Array.from({length:20},(_,i)=>({entryId:String(i+1),rank:i+1,name:'榜單'+(i+1),finalAmount:'100.00'})),nextCursor:'next'},{items:[{entryId:'21',rank:21,name:'後頁玩家',finalAmount:'50.00'}],nextCursor:null},new Error('offline')],urls=[];
 const t=boot({start:false,online:async url=>{urls.push(url);const next=queue.shift();if(next instanceof Error)throw next;return new Response(JSON.stringify(next));}});t.act('home-rank');await new Promise(r=>setImmediate(r));t.act('rank-next');await new Promise(r=>setImmediate(r));assert.ok(t.app.innerHTML.includes('榜單1'));assert.ok(t.app.innerHTML.includes('後頁玩家'));assert.ok(t.app.innerHTML.includes('第 2 頁'));t.act('rank-refresh');await new Promise(r=>setImmediate(r));assert.ok(t.app.innerHTML.includes('保留上次榜單'));assert.ok(t.app.innerHTML.includes('後頁玩家'));assert.equal(t.subject.game.profile,null);assert.equal(t.store.size,0);assert.ok(urls.every(url=>url.includes('/v1/leaderboard?')));t.act('close-overlay');assert.equal(t.focused.at(-1),'[data-action="home-rank"]');
});

test('settings reached from a pause keeps both clocks frozen and returns to pause until Continue',()=>{
 const t=boot();t.act('table',{table:'sicbo'});t.tick(1000);t.act('pause');const before=JSON.stringify(t.subject.game);t.act('settings');assert.ok(t.app.innerHTML.includes('settings-dialog'));t.act('settings-tab',{tab:'about'});assert.ok(t.app.innerHTML.includes('輪盤教學'));t.tick(20000);assert.equal(JSON.stringify(t.subject.game),before);t.act('close-overlay');assert.ok(t.app.innerHTML.includes('賭局已暫停'));assert.equal(t.subject.game.paused,true);t.act('resume');t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,2000);
});
test('lobby settings continues the challenge and deadline closes settings into the true result',()=>{
 const t=boot();t.act('lobby-more');t.act('settings');t.act('settings-tab',{tab:'about'});t.tick(1234);assert.equal(t.subject.game.profile.elapsedMs,1234);assert.ok(t.app.innerHTML.includes('挑戰計時繼續'));t.tick(300000-1234);assert.equal(t.subject.game.profile.status,'finished');assert.ok(t.app.innerHTML.includes('challenge-result-modal'));assert.ok(!t.app.innerHTML.includes('settings-dialog'));
});
test('backup import is previewed, cancel keeps state, confirm persists once and retains paused status',async()=>{
 const t=boot();t.subject.game.saveCheckpoint();const original=t.store.get('charity-casino-five-minute-v2-race-auto');t.act('pause');t.act('settings');t.act('settings-tab',{tab:'data'});t.act('settings-import');assert.equal(t.importInput.clicks,1);
 const g=new bindings.Game({challenge:true});g.start('匯入玩家');g.tick(12345);g.saveCheckpoint();const before=JSON.stringify(t.subject.game);await t.importSave(g.checkpoint,{confirm:false});assert.ok(t.app.innerHTML.includes('確認匯入備份'));assert.equal(JSON.stringify(t.subject.game),before);assert.equal(t.store.get('charity-casino-five-minute-v2-race-auto'),original);t.act('cancel-import');assert.ok(t.app.innerHTML.includes('settings-dialog'));assert.equal(t.subject.game.paused,true);
 await t.importSave(g.checkpoint,{confirm:false});t.act('confirm-import');assert.equal(t.subject.game.profile.name,'匯入玩家');assert.equal(t.subject.game.remainingMs,287655);assert.equal(t.subject.game.paused,true);const raw=t.store.get('charity-casino-five-minute-v2-race-auto');assert.equal(typeof JSON.parse(raw).savedAt,'number');assert.equal(t.store.get('charity-casino-five-minute-v2-race-auto-backup'),original);t.act('confirm-import');assert.equal(t.store.get('charity-casino-five-minute-v2-race-auto'),raw);
});
test('quota failure while importing does not replace current wallet, timer or persisted record',async()=>{
 const fault={fail:false},t=boot({storageFault:fault});t.subject.game.saveCheckpoint();const raw=t.store.get('charity-casino-five-minute-v2-race-auto');t.act('pause');t.act('settings');const g=new bindings.Game({challenge:true});g.start('另一玩家');g.tick(1200);g.saveCheckpoint();await t.importSave(g.checkpoint,{confirm:false});const before=JSON.stringify(t.subject.game);fault.fail=true;t.act('confirm-import');assert.ok(t.app.innerHTML.includes('原挑戰未更改'));assert.equal(JSON.stringify(t.subject.game),before);assert.equal(t.store.get('charity-casino-five-minute-v2-race-auto'),raw);
});
test('failed automatic save can export its completed checkpoint without claiming a new successful timestamp',async()=>{
 const fault={fail:false},t=boot({storageFault:fault});t.subject.game.saveCheckpoint();const raw=t.store.get('charity-casino-five-minute-v2-race-auto');fault.fail=true;const g=t.subject.game;g.enterTable('sicbo');g.addBet('small',100);g.lock();g.tick(900);t.act('home');t.act('home-settings');t.act('settings-tab',{tab:'data'});assert.ok(t.app.innerHTML.includes('最近一次保存未成功'));t.act('settings-export');assert.equal(t.downloads.length,1);const data=JSON.parse(await t.downloads[0].blob.text());assert.equal(data.profile.rounds,1);assert.equal(data.profile.bank,g.checkpoint.profile.bank);assert.equal(t.store.get('charity-casino-five-minute-v2-race-auto'),raw);
});
test('author links replace the removed report controls and stale reporting actions have no effect',()=>{
 const copied=[],t=boot({start:false,installNavigator:{clipboard:{writeText:async text=>copied.push(text)}}});assert.ok(t.app.innerHTML.includes('作者：studios_16'));assert.ok(t.app.innerHTML.includes('href="https://buymeacoffee.com/studios_16"'));t.act('home-settings');t.act('settings-tab',{tab:'about'});assert.ok(t.app.innerHTML.includes('href="https://www.threads.com/@studios_16_"'));assert.ok(t.app.innerHTML.includes('輪盤教學'));assert.ok(!t.app.innerHTML.includes('回報問題'));t.input('settings-report-text','舊控制');t.act('report-copy');t.act('report-download');assert.equal(copied.length,0);assert.equal(t.downloads.length,0);assert.equal(t.subject.game.profile,null);assert.equal(t.store.size,0);
});
test('backgrounding from settings changes its return target to pause without losing either countdown',()=>{
 const t=boot();t.act('lobby-more');t.act('settings');t.tick(1500);t.document.hidden=true;t.listeners.visibilitychange();t.tick(20000);assert.equal(t.subject.game.profile.elapsedMs,1500);assert.equal(t.subject.game.paused,true);assert.ok(t.app.innerHTML.includes('settings-dialog'));t.document.hidden=false;t.act('close-overlay');assert.ok(t.app.innerHTML.includes('賭局已暫停'));t.act('resume');t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,2500);
});

function landscapePhone(){return {innerWidth:932,innerHeight:430,screen:{orientation:{type:'landscape-primary'}}};}
test('mobile portrait blocks all home actions before a challenge is created',()=>{
 const viewport=landscapePhone();viewport.screen.orientation.type='portrait-primary';const t=boot({start:false,viewport});assert.ok(t.app.innerHTML.includes('landscape-cover'));t.act('enter');assert.equal(t.subject.game.profile,null);assert.ok(t.app.innerHTML.includes('inert aria-hidden="true"'));viewport.screen.orientation.type='landscape-primary';t.listeners['window-resize']();assert.ok(!t.app.innerHTML.includes('landscape-cover'));t.input('player-name','橫向玩家');t.act('enter');assert.equal(t.subject.game.profile.bank,10000);
});
test('portrait rotation freezes both countdowns and preserves stakes, requires explicit Continue in landscape',()=>{
 const viewport=landscapePhone(),t=boot({viewport});t.act('table',{table:'sicbo'});t.subject.game.addBet('small',500);t.tick(2000);const g=t.subject.game,round=g.round,remaining=g.round.remaining,elapsed=g.profile.elapsedMs,bank=g.available;
 viewport.screen.orientation.type='portrait-primary';t.listeners['window-resize']();assert.equal(g.paused,true);t.tick(25000);t.act('resume');assert.equal(g.paused,true);assert.equal(g.profile.elapsedMs,elapsed);assert.equal(g.round.remaining,remaining);assert.equal(g.available,bank);assert.equal(g.round,round);
 viewport.screen.orientation.type='landscape-primary';t.listeners['window-resize']();t.tick(15000);assert.equal(g.paused,true);assert.equal(g.profile.elapsedMs,elapsed);t.act('resume');t.tick(1000);assert.equal(g.profile.elapsedMs,elapsed+1000);assert.equal(g.round.remaining,remaining-1000);assert.equal(g.round,round);
});
test('rotating while settings is open preserves the settings and pause return path',()=>{
 const viewport=landscapePhone(),t=boot({viewport});t.act('lobby-more');t.act('settings');t.tick(1000);viewport.screen.orientation.type='portrait-primary';t.listeners['window-resize']();assert.equal(t.subject.game.paused,true);assert.ok(t.app.innerHTML.includes('settings-dialog'));viewport.screen.orientation.type='landscape-primary';t.listeners['window-resize']();t.act('close-overlay');assert.ok(t.app.innerHTML.includes('賭局已暫停'));t.act('resume');assert.equal(t.subject.game.paused,false);assert.equal(t.subject.game.profile.elapsedMs,1000);
});
test('music settings and save keys are independent of sound effects and progress',()=>{
 const t=boot({start:false});t.act('home-settings');assert.ok(t.app.innerHTML.includes('music-volume'));t.act('music');assert.equal(t.subject.music.enabled,false);assert.equal(t.subject.sounds.enabled,true);t.input('music-volume','62');assert.equal(t.subject.music.volume,62);assert.equal(t.subject.sounds.volume,100);assert.equal(t.subject.game.profile,null);assert.equal([...t.store.keys()].filter(k=>k.includes('five-minute-v2')).length,0);
});
