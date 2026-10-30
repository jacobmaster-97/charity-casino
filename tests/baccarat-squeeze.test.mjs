import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Game} from '../src/game.mjs';
import {BACCARAT_DEAL_MS as D,BACCARAT_UNFOLD_MS as U,BACCARAT_RETURN_MS as R} from '../src/baccarat.mjs';
import {BaccaratSqueezeController,squeezeScene,squeezePanel} from '../src/baccarat-squeeze.mjs';
import {baccaratTableView} from '../src/baccarat-view.mjs';
import {validateSave} from '../src/storage.mjs';
import {runBaccaratToSettlement} from './baccarat-fixtures.mjs';
function setup(first=[0,1,2,3,5,6],bets={'bac-player':100}){
 const game=new Game();game.start('咪牌測試','free');game.baccaratShoe={cards:[...first,...Array.from({length:416},(_,i)=>i).filter(c=>!first.includes(c))],cursor:0,cycle:1};game.enterTable('baccarat');for(const [id,n] of Object.entries(bets))game.addBet(id,n);return game;
}
function ready(game){game.lock();game.tick(D*4);for(let i=0;i<3&&game.round.phase!=='squeezing';i++)game.tick(game.round.remaining);assert.equal(game.round.phase,'squeezing');}
test('dealing runs at 70% of former speed; all four cards precede squeeze delivery',()=>{
 assert.equal(D,400/.7);const g=setup();g.lock();g.tick(400);assert.equal(g.round.revealed,0);g.tick(D-400);assert.equal(g.round.revealed,1);g.tick(D*3);assert.equal(g.round.revealed,4);assert.equal(g.round.phase,'delivering');assert.equal(g.round.drawShown,0);g.tick(D);assert.equal(g.round.phase,'squeezing');assert.equal(g.round.remaining,0);
});
test('manual wait has no timeout and counts play time; pause preserves progress, shoe and cash',()=>{
 const g=setup();ready(g);const before=structuredClone(g.round.final),cursor=g.baccaratShoe.cursor,bank=g.profile.bank;g.updateBaccaratSqueeze(.42);g.tick(12000);assert.equal(g.round.phase,'squeezing');assert.equal(g.round.squeeze.progress,.42);const elapsed=g.profile.elapsedMs;g.paused=true;g.tick(60000);assert.equal(g.updateBaccaratSqueeze(.9),false);assert.equal(g.finishBaccaratSqueeze(),false);assert.equal(g.profile.elapsedMs,elapsed);g.paused=false;g.updateBaccaratSqueeze(.2);assert.equal(g.round.squeeze.progress,.42);assert.equal(g.baccaratShoe.cursor,cursor);assert.equal(g.profile.bank,bank);assert.deepEqual(g.round.final,before);assert.equal(g.checkpoint,null);
});
test('direct reveal unfolds and returns before settlement; duplicate decisions do not pay twice',()=>{
 const g=setup();ready(g);assert.ok(g.finishBaccaratSqueeze());assert.equal(g.finishBaccaratSqueeze(),false);g.tick(U/2);g.paused=true;const remaining=g.round.remaining;g.tick(60000);assert.equal(g.round.remaining,remaining);assert.equal(g.advanceBaccaratSqueeze(),false);g.paused=false;g.tick(U/2);assert.equal(g.round.phase,'returning');assert.equal(g.round.drawShown,0);g.tick(R);assert.equal(g.round.drawShown,1);assert.equal(g.round.phase,'drawing');g.tick(D);assert.equal(g.round.phase,'settled');const bank=g.profile.bank;assert.equal(g.finishBaccaratSqueeze(),false);assert.equal(g.commitBaccaratDraw(),false);assert.equal(g.settle(),false);assert.equal(g.profile.bank,bank);assert.equal(g.profile.rounds,1);assert.equal(validateSave(g.checkpoint).profile.bank,bank);
});
test('player and Lucky Six interests reveal in normal player-then-banker order',()=>{
 const g=setup(undefined,{'bac-player':100,'bac-lucky-six':100});ready(g);assert.equal(g.round.squeeze.side,'player');const final=structuredClone(g.round.final),cursor=g.baccaratShoe.cursor;assert.equal(g.revealBaccaratDraw(),false);assert.equal(g.commitBaccaratDraw(),false);g.finishBaccaratSqueeze();g.tick(U+R+D);assert.equal(g.round.phase,'squeezing');assert.equal(g.round.squeeze.side,'banker');assert.equal(g.round.drawShown,1);g.finishBaccaratSqueeze();g.tick(U+R);assert.equal(g.round.phase,'settled');assert.deepEqual(g.round.final,final);assert.equal(g.baccaratShoe.cursor,cursor);
});
test('Lucky Six alone permits banker squeeze regardless of eventual side-bet result',()=>{
 const g=setup([9,1,22,2,3,52],{'bac-lucky-six':100});ready(g);assert.equal(g.round.squeeze.side,'banker');assert.equal(g.round.drawShown,1);runBaccaratToSettlement(g);assert.equal(g.round.final.bankerTotal,6);assert.equal(g.round.result.returned,2100);
 const loss=setup(undefined,{'bac-lucky-six':100});ready(loss);assert.equal(loss.round.squeeze.side,'banker');runBaccaratToSettlement(loss);assert.equal(loss.round.result.returned,0);
});
test('pair-only and tie-only remain automatic; naturals and no-supplement hands never squeeze',()=>{
 for(const id of ['bac-player-pair','bac-banker-pair','bac-tie']){const g=setup(undefined,{[id]:100});g.lock();g.tick(D*6);assert.equal(g.round.phase,'settled');assert.ok(!g.round.squeeze);}
 for(const first of [[0,7,1,12],[1,0,3,4]]){const g=setup(first,{'bac-player':100,'bac-lucky-six':100});g.lock();g.tick(D*4);assert.equal(g.round.phase,'settled');assert.ok(!g.round.squeeze);}
});
test('swap selection occurs first; replacing into a natural removes squeeze entirely',()=>{
 const g=setup();g.profile.inventory.swap=1;g.useItem('swap');g.lock();g.tick(D*4);assert.equal(g.round.phase,'swapping');assert.ok(!g.round.squeeze);g.chooseBaccaratSwap(0);assert.equal(g.round.phase,'settled');assert.equal(g.round.final.natural,true);assert.equal(g.profile.inventory.swap,0);assert.deepEqual(g.round.discard,[0]);
});
test('wagers and incomplete saves remain locked throughout all squeeze stages',()=>{
 const g=setup();ready(g);const bets=structuredClone(g.round.bets);for(const advance of [()=>{},()=>g.finishBaccaratSqueeze(),()=>g.tick(U)]){advance();assert.equal(g.addBet('bac-player',100),false);assert.equal(g.clearBets(),false);assert.equal(g.leaveTable(),false);assert.equal(g.settle(),false);assert.equal(g.checkpoint,null);assert.deepEqual(g.round.bets,bets);}
});
test('squeeze is contextual, has real card/hand assets, hides underlying table, and reveals no future total',()=>{
 const g=setup();ready(g);const art=p=>p,options={game:g,art,button:(a,t)=>`<button data-action="${a}">${t}</button>`,icon:()=>'',chip:500};const html=baccaratTableView(options);assert.ok(html.includes('baccarat-table-content" inert'));assert.ok(html.includes('role="slider"'));assert.ok(html.includes('data-action="squeeze-reveal"'));assert.ok(!html.includes('winning-hand'));assert.ok(!squeezeScene(g.round,art).includes('font-size="82"'));g.updateBaccaratSqueeze(.5);assert.ok(squeezeScene(g.round,art).includes('hand.png'));assert.ok(squeezeScene(g.round,art).includes('live-peel-flap'));assert.ok(squeezePanel(g.round).includes('aria-valuenow="50"'));assert.ok(!squeezeScene(g.round,art,true).includes('hand.png'));
});
function controllerFixture(game){
 const events={},attributes={},layer={innerHTML:''},svg={addEventListener:(k,fn)=>events[k]=fn,querySelector:()=>layer,focus(){},setPointerCapture(id){this.captured=id;},getScreenCTM:()=>({a:.5}),setAttribute:(k,v)=>attributes[k]=v};let changed=0;
 const c=new BaccaratSqueezeController({root:{querySelector:()=>svg},game,art:p=>p,advance:()=>{},onChange:()=>changed++,reduced:()=>false});c.mount();
 const event=(extra={})=>({pointerId:1,clientX:200,clientY:200,button:0,isPrimary:true,preventDefault(){},...extra});return {c,svg,events,attributes,layer,event,changed:()=>changed};
}
test('actual pointer controller keeps partial progress across release/cancel and ignores other fingers',()=>{
 const g=setup();ready(g);const {events,event,svg}=controllerFixture(g);events.pointerdown(event());assert.equal(svg.captured,1);events.pointermove(event({pointerId:2,clientX:100,clientY:100}));assert.equal(g.round.squeeze.progress,0);events.pointermove(event({clientX:180,clientY:180}));const p=g.round.squeeze.progress;assert.ok(p>0&&p<1);events.pointerup(event());events.pointermove(event({clientX:0,clientY:0}));assert.equal(g.round.squeeze.progress,p);events.pointerdown(event());events.pointercancel(event());events.pointermove(event({clientX:0,clientY:0}));assert.equal(g.round.squeeze.progress,p);g.paused=true;events.pointerdown(event());events.pointermove(event({clientX:0,clientY:0}));assert.equal(g.round.squeeze.progress,p);
});
test('controller drag completion, keyboard and direct reveal converge on the same single decision',()=>{
 for(const mode of ['drag','keyboard','direct']){const g=setup();ready(g);const f=controllerFixture(g);if(mode==='drag'){f.events.pointerdown(f.event());f.events.pointermove(f.event({clientX:0,clientY:0}));}else if(mode==='keyboard'){f.events.keydown(f.event({key:'ArrowLeft'}));assert.ok(g.round.squeeze.progress>0);f.events.keydown(f.event({key:'Enter'}));}else f.c.finish();assert.equal(g.round.phase,'unfolding');assert.equal(f.changed(),1);f.c.finish();assert.equal(f.changed(),1);}
});
test('runtime hand is the exact approved preview PNG; app mounts controller and animation clock',async()=>{
 const runtime=await readFile(new URL('../public/art/baccarat-b/hand.png',import.meta.url));assert.equal(createHash('sha256').update(runtime).digest('hex'),'e658775f6de71933c17890c57aae194ab9c98efc04d9e49d087c6d0883a94d21');const app=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8');assert.ok(app.includes('squeeze.mount()'));assert.ok(app.includes('squeeze.paint()'));assert.ok(app.includes("if(a==='squeeze-reveal')game.finishBaccaratSqueeze()"));assert.ok(app.includes('requestAnimationFrame(animateBaccarat)'));
});
