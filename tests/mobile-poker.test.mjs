import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.mjs';
import {pokerOptions} from '../src/poker.mjs';
import {pokerTableView,pokerCommunityPlacement,fitPokerSurface} from '../src/poker-view.mjs';
import {mobilePokerViewport} from '../src/table-layout.mjs';
import {validateSave} from '../src/storage.mjs';
const button=(a,t,c='',e='')=>`<button data-action="${a}" class="${c}" ${e}>${t}</button>`;
const view=(game,ui={},mobile=true)=>pokerTableView({game,ui,mobile,button,art:p=>p,icon:()=>''});
function fixture(){let seed=29,saves=0;const g=new Game({randomIndex:n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);},onComplete:()=>saves++});g.start('橫向測試','free');g.enterTable('poker');return {g,saves:()=>saves};}
function turn(g){g.startPoker();for(let n=0;g.round.phase!=='poker-player';n++){assert.ok(n<500);assert.notEqual(g.round.phase,'settled');g.tick(g.round.remaining||1);}return g;}
function finish(g){let count=0;while(g.round.phase!=='settled'){assert.ok(++count<1000);if(g.round.phase==='poker-player')g.pokerAction(pokerOptions(g).check?'check':'fold');else g.tick(g.round.remaining||1);}}
const buttons=html=>[...html.matchAll(/<button\b([^>]*)>/g)].map(m=>m[1]);
test('poker layout selects landscape phones, including rotation between two otherwise mobile profiles',()=>{
 for(const [w,h] of [[568,320],[667,375],[740,360],[844,390],[915,412],[1100,600]])assert.equal(mobilePokerViewport(w,h),true);
 for(const [w,h] of [[375,667],[390,844],[320,568],[768,1024],[1024,768],[1440,900],[NaN,390]])assert.equal(mobilePokerViewport(w,h),false);
});
test('mobile ready view has six text-only seats, five board slots and all thirteen real chip destinations',()=>{
 const {g}=fixture(),before=JSON.stringify(g),h=view(g);assert.ok(h.includes('poker-mobile'));assert.ok(!/pk-avatar|portrait|avatar-/.test(h));assert.equal((h.match(/class="pk-opponent /g)||[]).length,5);assert.equal((h.match(/class="pk-player /g)||[]).length,1);assert.equal((h.match(/class="pk-card-slot"/g)||[]).length,5);
 const targets=[...h.matchAll(/data-chip-target="([^"]+)"/g)].map(m=>m[1]);assert.equal(targets.length,13);assert.equal(new Set(targets).size,13);assert.ok(h.includes('data-action="table-tools"'));assert.ok(h.includes('data-action="pk-start"'));assert.ok(!h.includes('data-action="pk-open-raise"'));assert.equal(JSON.stringify(g),before);
});
test('desktop keeps its original inline chip, amount and action controls',()=>{
 const {g}=fixture();turn(g);const h=view(g,{},false);assert.ok(h.includes('pk-avatar'));assert.ok(h.includes('pk-bet-controls'));assert.ok(h.includes('class="table-nav"'));assert.ok(!h.includes('poker-mobile'));assert.ok(!h.includes('poker-raise-panel'));assert.ok(!h.includes('pk-open-raise'));
});
test('player footer opens a separate raise panel and routes confirmation through the current turn token',()=>{
 const {g}=fixture();turn(g);const r=g.round,o=pokerOptions(g),h=view(g),panel=h.match(/<details class="poker-raise-panel">([\s\S]*?)<\/details>/)[1];
 assert.ok(h.includes('class="pk-mobile-actions"'));assert.ok(h.includes('data-action="pk-open-raise"'));assert.ok(!h.includes('pk-bet-controls'));assert.equal((h.match(/id="pk-raise-to"/g)||[]).length,1);assert.equal((panel.match(/data-action="pk-chip"/g)||[]).length,5);assert.ok(panel.includes('data-countdown'));assert.ok(panel.includes('本輪加注後總額'));assert.ok(panel.includes(`min="${Math.min(o.minTo,o.maxTo)/100}" max="${o.maxTo/100}"`));assert.ok(panel.includes('data-action="close-table-tool"'));assert.ok(buttons(panel).filter(b=>/data-action="pk-(chip|action)"/.test(b)).every(b=>b.includes(`data-poker-turn="${r.turnId}"`)));assert.ok(h.includes(`data-poker-action="${o.check?'check':'call'}"`));
});
test('opening or editing the raise view is read-only; confirm uses total rather than adding that total twice',()=>{
 const {g,saves}=fixture();turn(g);g.tick(3000);const before=JSON.stringify(g),o=pokerOptions(g),r=g.round,amount=Math.min(o.minTo,o.maxTo),bank=g.profile.bank,street=r.players[0].street,turnId=r.turnId;
 view(g,{raiseTo:amount});view(g,{raiseTo:amount+100});assert.equal(JSON.stringify(g),before);assert.equal(saves(),0);assert.equal(g.checkpoint,null);assert.equal(r.remaining,27000);
 assert.equal(g.pokerAction('raise',amount,turnId),true);assert.equal(g.profile.bank,bank-(amount-street));assert.equal(r.players[0].street,amount);assert.ok(r.motions.some(m=>m.to==='poker-bet-0'&&m.amount===amount-street));assert.equal(saves(),0);
});
test('illegal raises leave money and turn intact; a timeout invalidates the old confirmation',()=>{
 const {g}=fixture();turn(g);let o=pokerOptions(g),id=g.round.turnId,before=JSON.stringify(g);assert.equal(g.pokerAction('raise',o.maxTo+100,id),false);assert.equal(JSON.stringify(g),before);g.tick(30000);before=JSON.stringify(g);assert.equal(g.pokerAction('raise',o.minTo,id),false);assert.equal(JSON.stringify(g),before);assert.ok(!view(g).includes('poker-raise-panel'));
});
test('closed raise rights disable its opener and confirm without preventing a legal call',()=>{
 const {g}=fixture();turn(g);const r=g.round,p=r.players[0];p.hasActed=true;p.lastActedBet=r.currentBet;r.currentBet+=1;r.lastFullRaise=Math.max(2,r.lastFullRaise);assert.equal(pokerOptions(g).raise,false);const h=view(g);
 assert.ok(buttons(h).find(b=>b.includes('data-action="pk-open-raise"')).includes('disabled'));assert.ok(buttons(h).find(b=>b.includes('data-poker-action="raise"')).includes('disabled'));assert.ok(buttons(h).some(b=>b.includes('data-poker-action="call"')&&!b.includes('disabled')));
});
test('mobile opponents stay face down except the one legal peek, including folded cards at showdown',()=>{
 const {g}=fixture();turn(g);const r=g.round,seat=r.players.findIndex((p,i)=>i>0&&!p.folded);g.profile.inventory.peek=1;const hidden=view(g),opponentPart=h=>h.slice(h.indexOf('class="pk-opponents"'),h.indexOf('class="pk-community"'));
 assert.equal((opponentPart(hidden).match(/aria-label="未揭示的牌"/g)||[]).length,10);assert.equal(g.usePokerItem('peek',seat),true);assert.equal((opponentPart(view(g)).match(/aria-label="未揭示的牌"/g)||[]).length,9);r.players[seat].folded=true;r.showdown=true;const part=opponentPart(view(g)),folded=part.match(new RegExp(`<article[^>]*data-seat="${seat}"[\\s\\S]*?<\\/article>`))[0];assert.ok(folded.includes('aria-label="未揭示的牌"'));assert.ok(folded.includes('pk-folded'));
});
test('swap and peek target modes replace footer betting without spending inventory on selection',()=>{
 const {g}=fixture();turn(g);const r=g.round;g.profile.inventory.swap=1;g.profile.inventory.peek=1;const before=JSON.stringify(g),swap=view(g,{selection:{kind:'swap',turn:r.turnId}}),peek=view(g,{selection:{kind:'peek',turn:r.turnId}});
 assert.equal((swap.match(/data-action="pk-swap-card"/g)||[]).length,2);assert.ok(!swap.includes('data-poker-action="fold"'));assert.ok(!swap.includes('poker-raise-panel'));assert.ok(peek.includes('pk-peek-choice'));assert.equal((peek.match(/data-action="pk-peek-seat"/g)||[]).length,r.players.slice(1).filter(p=>!p.folded).length);assert.equal(JSON.stringify(g),before);
});
test('AI/deal/collect screens keep More accessible without an enabled player betting footer',()=>{
 const {g}=fixture();g.startPoker();for(const phase of ['poker-dealing','poker-ai','poker-collect','poker-showdown']){g.round.phase=phase;g.round.actor=1;const h=view(g);assert.ok(h.includes('pk-mobile-wait'));assert.ok(h.includes('data-action="table-tools"'));assert.ok(!h.includes('pk-mobile-actions'));assert.ok(!h.includes('poker-raise-panel'));}
});
test('mobile pause preserves the remaining seconds and the completed-hand save remains the only checkpoint',()=>{
 const {g,saves}=fixture();turn(g);g.tick(18000);g.paused=true;const before=JSON.stringify(g);g.tick(80000);view(g);assert.equal(JSON.stringify(g),before);assert.equal(saves(),0);assert.equal(g.round.remaining,12000);g.paused=false;assert.ok(view(g).includes('data-countdown>12 秒'));finish(g);assert.equal(saves(),1);const h=view(g);assert.ok(h.includes('pk-result'));assert.ok(!h.includes('poker-raise-panel'));const save=validateSave(g.checkpoint),restored=new Game();restored.restore(save);assert.deepEqual(restored.pokerTable,g.pokerTable);view(g);assert.equal(saves(),1);
});
test('mobile settlement marks only actual winning opponents, excluding refunds, without avatar or winner captions',()=>{
 const {g}=fixture();turn(g);finish(g);const h=view(g),expected=[...new Set(g.round.result.pots.filter(p=>!p.uncalled).flatMap(p=>p.winners).filter(i=>i>0))].sort(),actual=[...h.matchAll(/data-winner-seat="(\d)"/g)].map(m=>Number(m[1]));assert.deepEqual(actual,expected);assert.ok(!h.includes('pk-winner-badge'));assert.ok(!h.includes('pk-avatar'));assert.ok(h.includes('data-action="next"'));
});

test('landscape hand hint shows the own best rank and pending or folded states without exposing opponents',()=>{
 const {g}=fixture();turn(g);assert.ok(view(g).includes('class="pk-hand-hint" aria-live="polite">等待公共牌'));
 g.round.players[0].cards=[28,32];g.round.board=[30,0,6,2,34];const before=JSON.stringify(g),h=view(g);assert.ok(h.includes('class="pk-hand-hint" aria-live="polite">牌型：兩對'));assert.ok(h.includes('class="pk-board-caption">公共牌 · '));assert.equal(JSON.stringify(g),before);
 g.round.players[0].folded=true;assert.ok(view(g).includes('class="pk-hand-hint" aria-live="polite">已棄牌'));
});
test('community placement moves upward inside the free band without touching opponents or own cards',()=>{
 for(const [arenaTop,opponentsBottom,playerTop,preferredHeight] of [[43,122,241,93],[43,122,226,85],[43,91,177,77],[43,122,441,93],[55,155,310,93]]){
  const p=pokerCommunityPlacement({arenaTop,opponentsBottom,playerTop,preferredHeight});assert.ok(p);assert.ok(p.top+arenaTop>=opponentsBottom+8);assert.ok(p.top+arenaTop+p.height<=playerTop-10+.001);assert.ok(p.height<=preferredHeight);assert.ok(p.height>=42);
 }
 const p=pokerCommunityPlacement({arenaTop:43,opponentsBottom:122,playerTop:241,preferredHeight:93});assert.ok(p.top<101);assert.equal(pokerCommunityPlacement({arenaTop:43,opponentsBottom:122,playerTop:150,preferredHeight:93}),null);assert.equal(pokerCommunityPlacement({arenaTop:NaN,opponentsBottom:122,playerTop:241,preferredHeight:93}),null);
});
test('poker fitting uses opponent card footprints and restores preferred size after a short-height resize',()=>{
 let opponentBottom=122,playerTop=226;const writes={},style={setProperty:(k,v)=>writes[k]=v};const community={clientHeight:85,style},own={getBoundingClientRect:()=>({top:playerTop})},seat={getBoundingClientRect:()=>({bottom:91,width:128,height:48}),querySelectorAll:()=>[{getBoundingClientRect:()=>({bottom:opponentBottom,width:42,height:27})}]};const arena={getBoundingClientRect:()=>({top:43}),querySelector:s=>s==='.pk-community'?community:own,querySelectorAll:()=>[seat]},root={querySelector:s=>s==='.poker-screen'?{}:arena,querySelectorAll:()=>[]},old=globalThis.getComputedStyle;globalThis.getComputedStyle=()=>({getPropertyValue:()=> '85px'});
 try{fitPokerSurface(root);assert.ok(parseFloat(writes['--pk-fit-top'])+43>=130);opponentBottom=91;playerTop=177;fitPokerSurface(root);assert.ok(parseFloat(writes['--pk-fit-height'])<85);opponentBottom=122;playerTop=360;fitPokerSurface(root);assert.equal(writes['--pk-fit-height'],'85px');}finally{globalThis.getComputedStyle=old;}
});
