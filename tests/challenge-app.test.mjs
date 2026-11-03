import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const entry=new URL('../src/app.mjs',import.meta.url),source=await readFile(entry,'utf8'),bindings={};
for(const match of source.matchAll(/^import \{[^\n]+\} from '([^']+)';/gm))Object.assign(bindings,await import(new URL(match[1],entry)));
// Event/DOM doubles exercise the real app and Game wiring, not browser layout or audio.
function boot({start=true,artCache=null,mobile=false}={}){
 const listeners={},events={},timers=[],clock={now:0},store=new Map(),focused=[];const blank={style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},contains(){return false;}},focus(){},querySelector(){return blank;},querySelectorAll(){return [];},setAttribute(){}};
 const nameInput={...blank,id:'player-name',value:'接線測試',selectionStart:2,selectionEnd:2,focus(){focused.push('player-name');},setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;}};
 const app={...blank,innerHTML:'',addEventListener:(name,fn)=>events[name]=fn,querySelector:s=>(s.startsWith('[data-action="home-')||['[data-action="lobby-more"]','[data-action="round-result"]'].includes(s))?{focus(){focused.push(s);}}:null,querySelectorAll:()=>[]},toast={...blank},elapsed={textContent:''},modal={...blank,querySelector:s=>s==='#player-name'?nameInput:blank};
 const document={hidden:false,activeElement:{dataset:{},tagName:'BUTTON',classList:blank.classList},documentElement:{style:blank.style},querySelector:s=>s==='#app'?app:s==='#toast'?toast:s==='#player-name'&&app.innerHTML.includes('id="player-name"')?nameInput:s==='#elapsed'&&app.innerHTML.includes('id="elapsed"')?elapsed:s==='.modal'&&app.innerHTML.includes('class="modal ')?modal:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners[name]=fn};
 const window={localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},addEventListener:(name,fn)=>listeners['window-'+name]=fn};
 class QuietSound{enabled=true;play(){}sync(){}stopAll(){}unlock(){return Promise.resolve(false);}setMuted(v){this.enabled=!v;}test(){return Promise.resolve(false);}}
 class QuietPanels{dialog=null;selection='';beforeRender(){}release(){}mount(){}close(){}}
 class QuietFlights{pending={};flights=[];cancel(){}mount(){}pause(){}landAll(){}queue(){}}
 class QuietSqueeze{mount(){}paint(){}}
 class QuietArtCache{ready(id){return artCache?artCache.ready(id):true;}load(id){return artCache?artCache.load(id):Promise.resolve(true);}warm(){return Promise.resolve();}}
 const context=vm.createContext({...bindings,document,window,URL,Blob,structuredClone,performance:{now:()=>clock.now},matchMedia:()=>({matches:true}),setInterval:fn=>timers.push(fn),setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},fetch(){throw new Error('No network service may be called');},CasinoSound:QuietSound,TableArtCache:QuietArtCache,TablePanels:QuietPanels,ChipFlights:QuietFlights,BaccaratSqueezeController:QuietSqueeze,updateGameViewport(){},mobileTableViewport:()=>mobile,mobilePokerViewport:()=>false,fitBaccaratSurface(){},fitBlackjackSurface(){},fitPokerSurface(){},fitRouletteSurface(){},fitLobbySurface(){}});
 const code=source.replace(/^import .*;\s*$/gm,'').replaceAll('import.meta.url',JSON.stringify(entry.href))+`;globalThis.subject={game,render,showRestored,openOverlay,closeOverlay};`;
 vm.runInContext(code,context);
 const act=(a,data={})=>{const target={disabled:false,dataset:{action:a,...data},tagName:'BUTTON',getAttribute:()=>null,closest:s=>s==='[data-action]'?target:s==='.modal'&&['resume','close-overlay','home','next','leave','finish','manual-save','cancel-table-entry','retry-table-entry','pause'].includes(a)?modal:null};events.click({target,preventDefault(){}});};
 if(start){events.input({target:{id:'player-name',value:'接線測試'}});act('enter');}
 return {subject:context.subject,app,elapsed,store,act,listeners,document,focused,nameInput,toast,setName(value){nameInput.value=value;events.input({target:nameInput});},submit(){events.submit({target:{id:'start-form'},preventDefault(){}});},elapse(ms){clock.now+=ms;},tick(ms){clock.now+=ms;timers[0]();}};
}
test('app starts the five-minute ruleset and shop HUD keeps counting down',()=>{
 const t=boot();assert.equal(t.subject.game.challenge,true);assert.ok(t.app.innerHTML.includes('lobby-map'));t.tick(1000);assert.equal(t.elapsed.textContent,'00:04:59');t.act('shop');assert.equal(t.subject.game.screen,'shop');assert.ok(t.app.innerHTML.includes('計時繼續'));t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,2000);assert.equal(t.elapsed.textContent,'00:04:58');
});
test('rules do not pause, but background pauses even with an information panel open and needs Continue',()=>{
 const t=boot();t.act('rules');assert.equal(t.subject.game.paused,false);t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,1000);t.document.hidden=true;t.listeners.visibilitychange();assert.equal(t.subject.game.paused,true);t.tick(20000);assert.equal(t.subject.game.profile.elapsedMs,1000);t.document.hidden=false;t.listeners.visibilitychange();assert.equal(t.subject.game.paused,true);t.act('resume');t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,2000);
});
test('manual pause freezes the active timer, then exact deadline opens the five-table result panel',()=>{
 const t=boot();t.tick(2000);t.act('pause');t.tick(50000);assert.equal(t.subject.game.profile.elapsedMs,2000);t.act('resume');t.tick(298000);assert.equal(t.subject.game.profile.status,'finished');assert.ok(t.app.innerHTML.includes('challenge-result-modal'));assert.equal((t.app.innerHTML.match(/data-stat-table=/g)||[]).length,5);assert.ok(!t.app.innerHTML.includes('上傳排行榜'));assert.equal([...t.store.keys()].filter(k=>k.includes('five-minute-v2')).length,1);
});
test('deadline inside an informational panel replaces it with the result and does not reset the clock',()=>{
 const t=boot();t.act('saves');t.tick(300000);assert.equal(t.subject.game.remainingMs,0);assert.ok(t.app.innerHTML.includes('本次五款遊戲統計'));assert.equal(t.subject.game.profile.rounds,0);assert.equal(t.subject.game.profile.bank,10000);
});
test('home shows the approved four choices and does not create a challenge while browsing menus',()=>{
 const t=boot({start:false});assert.equal((t.app.innerHTML.match(/class="title-menu-button /g)||[]).length,4);assert.ok(t.app.innerHTML.includes('alt="五分鐘賭神"'));assert.ok(!t.app.innerHTML.includes('id="start-form"'));t.tick(20000);assert.equal(t.subject.game.profile,null);assert.equal(t.store.size,0);
 for(const a of ['home-rank','home-support']){t.act(a);assert.ok(t.app.innerHTML.includes('aria-modal="true"'));assert.equal(t.subject.game.profile,null);t.act('close-overlay');}
});
test('home start validates the name, passes through the story, then starts exactly $100 and five minutes',()=>{
 const t=boot({start:false});t.act('home-start');assert.ok(t.app.innerHTML.includes('id="start-form"'));assert.equal(t.focused.at(-1),'player-name');t.setName('');t.submit();assert.ok(t.app.innerHTML.includes('home-dialog-start'));assert.ok(t.toast.textContent.includes('1–16'));t.setName('新賭神');t.submit();assert.ok(t.app.innerHTML.includes('class="story-page"'));assert.ok(!t.app.innerHTML.includes('aria-modal="true"'));t.tick(9000);assert.equal(t.subject.game.profile,null);t.act('enter');assert.equal(t.subject.game.profile.name,'新賭神');assert.equal(t.subject.game.profile.bank,10000);assert.equal(t.subject.game.remainingMs,300000);
});
test('home mode changes preserve escaped input and start the selected free challenge',()=>{
 const t=boot({start:false});t.act('home-start');t.setName('<測試>');t.act('mode',{mode:'free'});assert.ok(t.app.innerHTML.includes('value="&lt;測試&gt;"'));t.submit();t.act('enter');assert.equal(t.subject.game.profile.mode,'free');assert.equal(t.subject.game.profile.bank,10000);
});
test('home settings retains audio controls without starting the timer and closes back to its trigger',()=>{
 const t=boot({start:false});t.act('home-settings');assert.ok(t.app.innerHTML.includes('啟動並試聽'));assert.ok(t.app.innerHTML.includes('匯入挑戰存檔'));t.act('sound');assert.ok(t.app.innerHTML.includes('音效：關'));t.tick(30000);assert.equal(t.subject.game.profile,null);t.act('close-overlay');assert.equal(t.focused.at(-1),'[data-action="home-settings"]');assert.ok(!t.app.innerHTML.includes('aria-modal="true"'));
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
test('compact lobby puts shop and More in the HUD with all five stations and no bottom row or map heading',()=>{
 const t=boot();assert.ok(t.app.innerHTML.includes('class="hud lobby-hud"'));assert.ok(t.app.innerHTML.includes('data-action="shop"'));assert.ok(t.app.innerHTML.includes('data-action="lobby-more"'));assert.equal((t.app.innerHTML.match(/data-action="table"/g)||[]).length,5);assert.ok(!/class="lobby-bottom"|class="goal-bar"|class="section-heading"|class="goal-copy"/.test(t.app.innerHTML));assert.ok(!t.app.innerHTML.includes('data-action="home"'));assert.ok(!t.app.innerHTML.includes('data-action="saves"'));
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
function delayedArt(){let resolve;return {ready:()=>false,load:()=>new Promise(r=>resolve=r),complete(ok=true){resolve(ok);}};}
test('entry waits for decoded textures, keeps the challenge clock and opens only the requested table',async()=>{
 const art=delayedArt(),t=boot({artCache:art});t.act('table',{table:'roulette'});assert.equal(t.subject.game.screen,'lobby');assert.ok(t.app.innerHTML.includes('table-loading-modal'));t.tick(750);art.complete();await Promise.resolve();assert.equal(t.subject.game.screen,'table');assert.equal(t.subject.game.activeTable,'roulette');assert.equal(t.subject.game.profile.elapsedMs,750);
});
test('cancelled texture loading never navigates later; failure offers retry without starting a round',async()=>{
 const art=delayedArt(),t=boot({artCache:art});t.act('table',{table:'roulette'});t.act('cancel-table-entry');art.complete();await Promise.resolve();assert.equal(t.subject.game.screen,'lobby');assert.ok(!t.app.innerHTML.includes('table-loading-modal'));
 t.act('table',{table:'poker'});art.complete(false);await Promise.resolve();assert.equal(t.subject.game.screen,'lobby');assert.ok(t.app.innerHTML.includes('data-action="retry-table-entry"'));t.act('retry-table-entry');art.complete();await Promise.resolve();assert.equal(t.subject.game.activeTable,'poker');assert.equal(t.subject.game.profile.rounds,0);
});
test('background during texture preparation preserves pause until Continue; deadline cancels deferred entry',async()=>{
 const art=delayedArt(),t=boot({artCache:art});t.act('table',{table:'roulette'});t.tick(500);t.document.hidden=true;t.listeners.visibilitychange();art.complete();await Promise.resolve();t.tick(20000);assert.equal(t.subject.game.screen,'lobby');assert.equal(t.subject.game.profile.elapsedMs,500);assert.equal(t.subject.game.paused,true);t.document.hidden=false;t.act('resume');assert.equal(t.subject.game.screen,'table');assert.equal(t.subject.game.profile.elapsedMs,500);
 const art2=delayedArt(),u=boot({artCache:art2});u.act('table',{table:'poker'});u.tick(300000);art2.complete();await Promise.resolve();assert.equal(u.subject.game.screen,'lobby');assert.equal(u.subject.game.profile.status,'finished');assert.equal(u.subject.game.profile.rounds,0);assert.ok(u.app.innerHTML.includes('challenge-result-modal'));
});

test('Escape dismisses payout once and returns focus to View Payout',()=>{
 const t=boot();settledTable(t,'roulette');let prevented=false;t.listeners.keydown({key:'Escape',target:{},preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.ok(!t.app.innerHTML.includes('payout-modal'));assert.equal(t.focused.at(-1),'[data-action="round-result"]');t.subject.render();assert.ok(!t.app.innerHTML.includes('payout-modal'));
});
test('all-in loss shows the settled payout before final results and offers no new round',()=>{
 const t=boot(),g=t.subject.game;g.randomIndex=()=>0;t.act('table',{table:'roulette'});g.addBet('rou-black',10000);g.lock();for(let i=0;i<100&&g.round.phase!=='settled';i++)g.tick(1000);assert.equal(g.profile.status,'finished');assert.equal(g.profile.endReason,'bust');t.subject.render();assert.ok(t.app.innerHTML.includes('payout-modal'));assert.ok(!t.app.innerHTML.includes('data-action="next"'));assert.equal(g.profile.rounds,1);t.act('finish');assert.ok(t.app.innerHTML.includes('challenge-result-modal'));assert.equal(g.profile.bank,0);assert.equal(g.profile.rounds,1);
});
