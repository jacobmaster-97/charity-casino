import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const entry=new URL('../src/app.mjs',import.meta.url),source=await readFile(entry,'utf8'),bindings={};
for(const match of source.matchAll(/^import \{[^\n]+\} from '([^']+)';/gm))Object.assign(bindings,await import(new URL(match[1],entry)));
// Event/DOM doubles exercise the real app and Game wiring, not browser layout or audio.
function boot(){
 const listeners={},events={},timers=[],clock={now:0},store=new Map();const blank={style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},contains(){return false;}},focus(){},querySelector(){return blank;},querySelectorAll(){return [];},setAttribute(){}};
 const app={...blank,innerHTML:'',addEventListener:(name,fn)=>events[name]=fn,querySelector:()=>null,querySelectorAll:()=>[]},toast={...blank},elapsed={textContent:''},modal={...blank};
 const document={hidden:false,activeElement:{dataset:{},tagName:'BUTTON',classList:blank.classList},documentElement:{style:blank.style},querySelector:s=>s==='#app'?app:s==='#toast'?toast:s==='#elapsed'&&app.innerHTML.includes('id="elapsed"')?elapsed:s==='.modal'&&app.innerHTML.includes('class="modal ')?modal:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners[name]=fn};
 const window={localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},addEventListener:(name,fn)=>listeners['window-'+name]=fn};
 class QuietSound{enabled=true;play(){}sync(){}stopAll(){}unlock(){return Promise.resolve(false);}}
 class QuietPanels{dialog=null;selection='';beforeRender(){}release(){}mount(){}close(){}}
 class QuietFlights{pending={};flights=[];cancel(){}mount(){}pause(){}landAll(){}queue(){}}
 class QuietSqueeze{mount(){}paint(){}}
 const context=vm.createContext({...bindings,document,window,URL,Blob,structuredClone,performance:{now:()=>clock.now},matchMedia:()=>({matches:true}),setInterval:fn=>timers.push(fn),setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},fetch(){throw new Error('No network service may be called');},CasinoSound:QuietSound,TablePanels:QuietPanels,ChipFlights:QuietFlights,BaccaratSqueezeController:QuietSqueeze,updateGameViewport(){},mobileTableViewport:()=>false,mobilePokerViewport:()=>false,fitBaccaratSurface(){},fitBlackjackSurface(){},fitPokerSurface(){},fitRouletteSurface(){},fitLobbySurface(){}});
 const code=source.replace(/^import .*;\s*$/gm,'').replaceAll('import.meta.url',JSON.stringify(entry.href))+`;globalThis.subject={game,render,showRestored,openOverlay,closeOverlay};`;
 vm.runInContext(code,context);
 const act=(a,data={})=>{const target={disabled:false,dataset:{action:a,...data},tagName:'BUTTON',getAttribute:()=>null,closest:s=>s==='[data-action]'?target:s==='.modal'&&['resume','close-overlay','home'].includes(a)?modal:null};events.click({target,preventDefault(){}});};
 events.input({target:{id:'player-name',value:'接線測試'}});act('enter');
 return {subject:context.subject,app,elapsed,store,act,listeners,document,tick(ms){clock.now+=ms;timers[0]();}};
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
