import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const entry=new URL('../src/app.mjs',import.meta.url),source=await readFile(entry,'utf8'),bindings={};
for(const match of source.matchAll(/^import \{[^\n]+\} from '([^']+)';/gm))Object.assign(bindings,await import(new URL(match[1],entry)));
// Event/DOM doubles exercise the real app and Game wiring, not browser layout or audio.
function boot({start=true}={}){
 const listeners={},events={},timers=[],clock={now:0},store=new Map(),focused=[];const blank={style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},contains(){return false;}},focus(){},querySelector(){return blank;},querySelectorAll(){return [];},setAttribute(){}};
 const nameInput={...blank,id:'player-name',value:'接線測試',selectionStart:2,selectionEnd:2,focus(){focused.push('player-name');},setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;}};
 const app={...blank,innerHTML:'',addEventListener:(name,fn)=>events[name]=fn,querySelector:s=>s.startsWith('[data-action="home-')?{focus(){focused.push(s);}}:null,querySelectorAll:()=>[]},toast={...blank},elapsed={textContent:''},modal={...blank,querySelector:s=>s==='#player-name'?nameInput:blank};
 const document={hidden:false,activeElement:{dataset:{},tagName:'BUTTON',classList:blank.classList},documentElement:{style:blank.style},querySelector:s=>s==='#app'?app:s==='#toast'?toast:s==='#player-name'&&app.innerHTML.includes('id="player-name"')?nameInput:s==='#elapsed'&&app.innerHTML.includes('id="elapsed"')?elapsed:s==='.modal'&&app.innerHTML.includes('class="modal ')?modal:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners[name]=fn};
 const window={localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},addEventListener:(name,fn)=>listeners['window-'+name]=fn};
 class QuietSound{enabled=true;play(){}sync(){}stopAll(){}unlock(){return Promise.resolve(false);}setMuted(v){this.enabled=!v;}test(){return Promise.resolve(false);}}
 class QuietPanels{dialog=null;selection='';beforeRender(){}release(){}mount(){}close(){}}
 class QuietFlights{pending={};flights=[];cancel(){}mount(){}pause(){}landAll(){}queue(){}}
 class QuietSqueeze{mount(){}paint(){}}
 const context=vm.createContext({...bindings,document,window,URL,Blob,structuredClone,performance:{now:()=>clock.now},matchMedia:()=>({matches:true}),setInterval:fn=>timers.push(fn),setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},fetch(){throw new Error('No network service may be called');},CasinoSound:QuietSound,TablePanels:QuietPanels,ChipFlights:QuietFlights,BaccaratSqueezeController:QuietSqueeze,updateGameViewport(){},mobileTableViewport:()=>false,mobilePokerViewport:()=>false,fitBaccaratSurface(){},fitBlackjackSurface(){},fitPokerSurface(){},fitRouletteSurface(){},fitLobbySurface(){}});
 const code=source.replace(/^import .*;\s*$/gm,'').replaceAll('import.meta.url',JSON.stringify(entry.href))+`;globalThis.subject={game,render,showRestored,openOverlay,closeOverlay};`;
 vm.runInContext(code,context);
 const act=(a,data={})=>{const target={disabled:false,dataset:{action:a,...data},tagName:'BUTTON',getAttribute:()=>null,closest:s=>s==='[data-action]'?target:s==='.modal'&&['resume','close-overlay','home'].includes(a)?modal:null};events.click({target,preventDefault(){}});};
 if(start){events.input({target:{id:'player-name',value:'接線測試'}});act('enter');}
 return {subject:context.subject,app,elapsed,store,act,listeners,document,focused,nameInput,toast,setName(value){nameInput.value=value;events.input({target:nameInput});},submit(){events.submit({target:{id:'start-form'},preventDefault(){}});},tick(ms){clock.now+=ms;timers[0]();}};
}
test('app starts the five-minute ruleset and shop HUD keeps counting down',()=>{
 const t=boot();assert.equal(t.subject.game.challenge,true);assert.ok(t.app.innerHTML.includes('五分鐘最高資金挑戰'));t.tick(1000);assert.equal(t.elapsed.textContent,'00:04:59');t.act('shop');assert.equal(t.subject.game.screen,'shop');assert.ok(t.app.innerHTML.includes('計時繼續'));t.tick(1000);assert.equal(t.subject.game.profile.elapsedMs,2000);assert.equal(t.elapsed.textContent,'00:04:58');
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
