import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.mjs';
import {MobileRoundReveal,mobileTableViewport} from '../src/table-layout.mjs';
import {sicboTableView} from '../src/sicbo-view.mjs';
import {rouletteTableView} from '../src/roulette-view.mjs';
import {baccaratTableView} from '../src/baccarat-view.mjs';
const button=(action,text,cls='',extra='')=>`<button data-action="${action}" class="${cls}" ${extra}>${text}</button>`;
const options=game=>({game,button,art:p=>p,icon:()=>'',chip:500,allIn:false,storageWarning:'',peekIndex:0,peekSide:'player',boardZoom:false,preciseBet:'small'});
function setup(kind='sicbo'){let saves=0;const game=new Game({roll:()=>2,randomIndex:()=>0,onComplete:()=>saves++});game.start('手機','free');game.enterTable(kind);return {game,view:new MobileRoundReveal(),saves:()=>saves};}
function tick(g,view,ms,enabled=true){view.sync(g,enabled);g.tick(ms);view.tick(ms,g,enabled);}
function tree(html){const stack=[],all=[];for(const m of html.matchAll(/<(\/?)(div|section)\b([^>]*)>/g)){if(m[1])assert.equal(stack.pop()?.tag,m[2]);else{const n={tag:m[2],attrs:m[3],parent:stack.at(-1)};all.push(n);stack.push(n);}}assert.equal(stack.length,0);return all;}
test('mobile profile covers phone orientations and small browser windows without changing normal tablet/desktop layouts',()=>{
 for(const [w,h] of [[320,568],[390,844],[568,320],[667,375],[844,390],[915,412],[1024,600]])assert.ok(mobileTableViewport(w,h));
 for(const [w,h] of [[768,1024],[1024,768],[1280,720],[1440,900]])assert.equal(mobileTableViewport(w,h),false);
 assert.equal(mobileTableViewport(NaN,390),false);
});
test('empty betting expiration never opens a fake reveal or adds a save in either popup game',()=>{
 for(const kind of ['sicbo','roulette']){const {game,view,saves}=setup(kind);tick(game,view,30000);assert.equal(game.round.phase,'betting');assert.equal(view.visible,false);assert.equal(saves(),0);assert.equal(game.profile.bank,10000);}
});
test('Sic Bo opens only after locking; result dwell preserves exactly one settlement and closes without another save',()=>{
 const {game:g,view:v,saves}=setup();v.sync(g,true);g.addBet('small',500);v.sync(g,true);assert.equal(v.visible,false);g.lock();v.sync(g,true);assert.equal(v.visible,true);assert.equal(saves(),0);tick(g,v,900);assert.equal(g.round.phase,'settled');assert.equal(v.remaining,1400);assert.equal(saves(),1);const checkpoint=structuredClone(g.checkpoint),bank=g.profile.bank;tick(g,v,1399);assert.equal(v.visible,true);tick(g,v,1);assert.equal(v.visible,false);assert.deepEqual(g.checkpoint,checkpoint);assert.equal(g.profile.bank,bank);assert.equal(saves(),1);v.sync(g,true);assert.equal(v.visible,false);
});
test('popup pause freezes the exact shake, decision and local result dwell; resume does not restart',()=>{
 const {game:g,view:v}=setup();g.profile.inventory.reroll=1;g.addBet('small',500);g.lock();tick(g,v,420);g.paused=true;tick(g,v,9000);assert.equal(g.round.remaining,480);assert.equal(v.visible,true);g.paused=false;tick(g,v,480);assert.equal(g.round.phase,'reroll');assert.equal(g.round.remaining,10000);tick(g,v,1200);g.paused=true;tick(g,v,9000);assert.equal(g.round.remaining,8800);assert.equal(v.close(g),false);g.paused=false;g.chooseReroll();v.sync(g,true);tick(g,v,399);g.paused=true;tick(g,v,9000);assert.equal(v.remaining,1001);g.paused=false;tick(g,v,1001);assert.equal(v.visible,false);
});
test('Sic Bo reroll view keeps all three choices and accept until Game consumes the coupon',()=>{
 const {game:g,view:v,saves}=setup();g.profile.inventory.reroll=1;g.addBet('small',500);g.lock();tick(g,v,900);const html=sicboTableView({...options(g),mobile:true,popup:v.visible});tree(html);assert.equal((html.match(/data-action="reroll"/g)||[]).length,3);assert.ok(html.includes('data-action="accept"'));assert.ok(html.includes('mobile-table-background" inert'));assert.equal((html.match(/data-action="bet"/g)||[]).length,51);assert.equal(saves(),0);tick(g,v,10000);assert.equal(g.profile.inventory.reroll,0);assert.equal(saves(),1);assert.ok(v.visible);
});
test('roulette popup retains exact wheel position and ten-second decision across repeated view rendering and respin',()=>{
 const {game:g,view:v,saves}=setup('roulette');g.profile.inventory.reroll=1;g.useRouletteItem('reroll');g.addBet('rou-red',500);g.lock();tick(g,v,1234);const before=structuredClone({round:g.round,profile:g.profile,checkpoint:g.checkpoint});const html=rouletteTableView({...options(g),mobile:true,popup:v.visible});tree(html);assert.ok(html.includes('--rou-spin-delay:-1234ms'));assert.ok(html.includes('mobile-table-background" inert'));assert.equal((html.match(/class="roulette-wheel/g)||[]).length,1);assert.deepEqual({round:g.round,profile:g.profile,checkpoint:g.checkpoint},before);tick(g,v,4800-1234);assert.equal(g.round.phase,'rou-reroll');const choice=rouletteTableView({...options(g),mobile:true,popup:v.visible});assert.equal((choice.match(/data-action="rou-respin"/g)||[]).length,1);assert.equal((choice.match(/data-action="rou-keep"/g)||[]).length,1);assert.equal(saves(),0);g.chooseRouletteReroll(true);v.sync(g,true);assert.equal(g.round.phase,'rou-spinning');assert.equal(v.visible,true);tick(g,v,4800);assert.equal(saves(),1);assert.equal(v.visible,true);assert.equal(v.close(g),true);assert.equal(v.visible,false);assert.equal(g.profile.inventory.reroll,0);
});
test('roulette keep and timeout settle exactly once; viewport changes and result dismissal never consume another coupon',()=>{
 for(const accept of [true,false]){const {game:g,view:v,saves}=setup('roulette');g.profile.inventory.reroll=1;g.useRouletteItem('reroll');g.addBet('rou-red',500);g.lock();tick(g,v,4800);if(accept)g.chooseRouletteReroll();else tick(g,v,10000);v.sync(g,true);const final=structuredClone({profile:g.profile,round:g.round,checkpoint:g.checkpoint});v.close(g);v.sync(g,false);v.sync(g,true);assert.deepEqual({profile:g.profile,round:g.round,checkpoint:g.checkpoint},final);assert.equal(saves(),1);assert.equal(g.profile.inventory.reroll,0);assert.equal(v.visible,false);}
});
test('orientation changes retain in-flight outcomes and new rounds cannot reopen an old result popup',()=>{
 const {game:g,view:v}=setup();g.addBet('small',500);g.lock();tick(g,v,300);const dice=[...g.round.dice],remaining=g.round.remaining;v.sync(g,false);assert.equal(v.visible,false);v.sync(g,true);assert.equal(v.visible,true);assert.deepEqual(g.round.dice,dice);assert.equal(g.round.remaining,remaining);tick(g,v,remaining);v.close(g);g.newRound();v.sync(g,true);assert.equal(v.visible,false);assert.equal(v.remaining,0);
});
test('both mobile popup tables preserve their original boards; roulette has no persistent wheel and desktop still does',()=>{
 for(const kind of ['sicbo','roulette']){const {game:g}=setup(kind),draw=kind==='sicbo'?sicboTableView:rouletteTableView;const html=draw({...options(g),mobile:true});tree(html);assert.ok(!html.includes('mobile-reveal-layer'));assert.ok(!html.includes('class="roulette-wheel'));assert.ok(!html.includes('class="dice-stage'));assert.equal((html.match(/class="printed-cell/g)||[]).length,50);assert.ok(html.includes('data-action="table-tools"'));const desktop=draw(options(g));tree(desktop);assert.ok(desktop.includes(kind==='sicbo'?'class="dice-stage':'class="roulette-wheel'));}
});
test('Baccarat unified table keeps six cells, actionable swap cards, squeeze flow and shoe data',()=>{
 const {game:g}=setup('baccarat');const before=structuredClone({profile:g.profile,round:g.round,shoe:g.baccaratShoe});const html=baccaratTableView(options(g));tree(html);assert.equal((html.match(/class="printed-cell/g)||[]).length,6);assert.ok(html.includes('baccarat-felt'));assert.ok(html.includes('data-action="table-tools"'));assert.deepEqual({profile:g.profile,round:g.round,shoe:g.baccaratShoe},before);g.profile.inventory.swap=1;g.useBaccaratItem('swap');g.addBet('bac-player',500);g.lock();g.tick(4*400/0.7);assert.equal(g.round.phase,'swapping');const swap=baccaratTableView(options(g));tree(swap);assert.equal((swap.match(/data-action="swap-card"/g)||[]).length,4);assert.ok(swap.includes('data-action="keep-cards"'));assert.ok(!swap.includes('hand.png'));
});

test('a bust result can finish its popup even after Game correctly stops its scoring clock',()=>{
 const {game:g,view:v,saves}=setup();g.addBet('small',10000);g.lock();tick(g,v,900);assert.equal(g.profile.status,'lost');const elapsed=g.profile.elapsedMs,checkpoint=structuredClone(g.checkpoint);assert.equal(v.visible,true);tick(g,v,1400);assert.equal(v.visible,false);assert.equal(g.profile.elapsedMs,elapsed);assert.deepEqual(g.checkpoint,checkpoint);assert.equal(saves(),1);
});
