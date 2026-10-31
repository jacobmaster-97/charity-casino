import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Game} from '../src/game.mjs';
import {ROULETTE_POCKETS,ROULETTE_WHEEL,ROULETTE_BETS,rouletteColor,drawRoulette,rouletteExclusions,settleRouletteRound,rouletteSpin,rouletteCells,ROULETTE_SPIN_MS as SPIN} from '../src/roulette.mjs';
import {rouletteTableView,rouletteBoardMarkup,paintRouletteChips,fitRouletteSurface} from '../src/roulette-view.mjs';
import {ChipFlights} from '../src/board.mjs';
import {validateSave} from '../src/storage.mjs';
const seeded=(seed=17)=>n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
function setup(outcome='17',bank=10000){let saves=0;const g=new Game({randomIndex:seeded(),onComplete:()=>saves++});g.start('輪盤測試','free');g.profile.bank=bank;assert.equal(g.enterTable('roulette'),true);g.round.outcome=outcome;return {g,saves:()=>saves};}
const view=g=>rouletteTableView({game:g,art:p=>p,button:(a,t,c='',e='')=>`<button data-action="${a}" class="${c}" ${e}>${t}</button>`,icon:()=>'',chip:500,allIn:false});
const marked=html=>[...html.matchAll(/data-chip-target="([^"]+)"/g)].map(m=>m[1]);
test('American wheel has exactly 38 unique pockets and distinct opposite green zeroes',()=>{
 assert.equal(new Set(ROULETTE_POCKETS).size,38);assert.deepEqual([...ROULETTE_WHEEL].sort(),[...ROULETTE_POCKETS].sort());assert.equal(ROULETTE_WHEEL[0],'0');assert.equal(ROULETTE_WHEEL[19],'00');const colors=ROULETTE_POCKETS.map(rouletteColor);assert.equal(colors.filter(c=>c==='red').length,18);assert.equal(colors.filter(c=>c==='black').length,18);assert.equal(colors.filter(c=>c==='green').length,2);assert.equal(rouletteColor('12'),'red');assert.equal(rouletteColor('29'),'black');assert.throws(()=>rouletteColor('37'));assert.throws(()=>rouletteColor(0));
});
test('all 50 confirmed independent bets have correct hits and 36/38 expected gross return',()=>{
 assert.equal(ROULETTE_BETS.length,50);assert.equal(new Set(ROULETTE_BETS.map(b=>b.id)).size,50);assert.deepEqual(ROULETTE_BETS.reduce((m,b)=>(m[b.group]=(m[b.group]||0)+1,m),{}),{'單號':38,'十二數組':3,'直列':3,'外圍':6});
 for(const b of ROULETTE_BETS){let returned=0;for(const pocket of ROULETTE_POCKETS){const r=settleRouletteRound({[b.id]:100},pocket);assert.equal(r.returned,b.pockets.includes(pocket)?100*(b.rate+1):0);returned+=r.returned;}assert.equal(returned,3600,b.id);}
 assert.deepEqual(ROULETTE_BETS.find(b=>b.id==='rou-column-3').pockets,['3','6','9','12','15','18','21','24','27','30','33','36']);
});
test('0 and 00 only win their own straight-up bets; no outside half-return or parity exception',()=>{
 for(const pocket of ['0','00']){const bets=Object.fromEntries(ROULETTE_BETS.filter(b=>b.group!=='單號').map(b=>[b.id,100]));assert.equal(settleRouletteRound(bets,pocket).returned,0);assert.equal(settleRouletteRound({'rou-number-0':100,'rou-number-00':100},pocket).returned,3600);}
});
test('mixed bets settle independently and protection applies once to aggregate net loss',()=>{
 const r=settleRouletteRound({'rou-red':100,'rou-black':100,'rou-number-17':100,'rou-dozen-2':100},'17',true);assert.equal(r.returned,4100);assert.equal(r.refund,0);assert.equal(r.net,3700);
 const loss=settleRouletteRound({'rou-red':101,'rou-black':100,'rou-low':100},'0',true);assert.equal(loss.refund,150);assert.equal(loss.net,-151);assert.throws(()=>settleRouletteRound({'rou-split-1-2':100},'1'));assert.throws(()=>settleRouletteRound({'rou-red':.5},'1'));assert.throws(()=>settleRouletteRound({'rou-red':100},'37'));
});
test('pocket draws validate the source and exclusions sample five distinct non-winning pockets including zeroes',()=>{
 assert.equal(drawRoulette(()=>0),'0');assert.equal(drawRoulette(()=>1),'00');assert.throws(()=>drawRoulette(()=>38));assert.throws(()=>drawRoulette(()=>.1));
 for(const outcome of ROULETTE_POCKETS){const excluded=rouletteExclusions(outcome,seeded(12));assert.equal(new Set(excluded).size,5);assert.ok(excluded.every(n=>ROULETTE_POCKETS.includes(n)&&n!==outcome));}assert.ok(rouletteExclusions('17',()=>0).includes('0'));assert.ok(rouletteExclusions('17',()=>0).includes('00'));assert.throws(()=>rouletteExclusions('17',n=>n));
});
test('no free items, thirty-second betting and affordable multi-bet/clear/undo controls',()=>{
 const {g}=setup();assert.deepEqual(Object.values(g.profile.inventory),[0,0,0,0]);assert.equal(g.round.remaining,30000);assert.equal(g.addBet('rou-red',99),false);assert.equal(g.addBet('rou-red',NaN),false);assert.equal(g.addBet('big',100),false);assert.equal(g.addBet('rou-red',10001),false);assert.ok(g.addBet('rou-red',100));assert.ok(g.addBet('rou-column-2',200));assert.equal(g.stake,300);assert.equal(g.available,9700);assert.equal(g.profile.bank,10000);assert.ok(g.undoBet('rou-red'));assert.equal(g.stake,200);assert.ok(g.clearBets());assert.equal(g.stake,0);
});
test('low bankroll permits only the full remaining sub-dollar stake; final zero result is not an early bust',()=>{
 const {g}=setup('0',37);assert.equal(g.addBet('rou-number-0',36),false);assert.equal(g.addBet('rou-number-0',37),true);g.lock();assert.equal(g.profile.bank,0);assert.equal(g.profile.status,'active');g.tick(SPIN);assert.equal(g.profile.bank,1332);assert.equal(g.profile.status,'active');
});
test('spin locks bets, reveals after 4.8 seconds, saves once and rejects duplicate settlement',()=>{
 const {g,saves}=setup();g.addBet('rou-number-17',100);assert.ok(g.lock());assert.equal(g.round.phase,'rou-spinning');assert.equal(g.round.visibleOutcome,null);assert.equal(g.addBet('rou-red',100),false);assert.equal(g.clearBets(),false);assert.equal(g.leaveTable(),false);g.tick(SPIN-1);assert.equal(saves(),0);assert.equal(g.checkpoint,null);g.tick(1);assert.equal(g.round.phase,'settled');assert.equal(g.round.visibleOutcome,'17');assert.equal(g.profile.bank,13500);assert.equal(saves(),1);assert.equal(g.profile.rounds,1);assert.equal(g.settle(),false);assert.equal(g.finishRouletteSpin(),false);assert.equal(saves(),1);
});
test('no-bet timeout skips without charging, checkpointing or restoring a consumed coupon',()=>{
 const {g,saves}=setup();g.profile.inventory.reroll=2;const old=g.round.id;g.useItem('reroll');assert.equal(g.profile.inventory.reroll,1);g.tick(30000);assert.equal(g.round.phase,'betting');assert.equal(g.round.remaining,30000);assert.ok(g.round.id>old);assert.equal(g.round.used,null);assert.equal(g.profile.bank,10000);assert.equal(g.profile.rounds,0);assert.equal(saves(),0);
});
test('peek fixes the result and leaves all bets editable without resetting the clock or silently removing excluded bets',()=>{
 const {g}=setup('17');g.profile.inventory.peek=1;g.addBet('rou-number-0',100);g.tick(7000);assert.ok(g.useItem('peek'));const expected=g.round.outcome,excluded=[...g.round.peek.excluded];assert.equal(g.round.remaining,23000);assert.equal(g.profile.inventory.peek,0);assert.equal(g.round.bets['rou-number-0'],100);g.clearBets();g.addBet('rou-red',200);g.addBet('rou-number-17',100);assert.deepEqual(g.round.peek.excluded,excluded);assert.equal(g.round.outcome,expected);g.lock();g.tick(SPIN);assert.equal(g.round.result.outcome,expected);
});
test('coupon exclusivity, timing and shared stock reject swap and a second item',()=>{
 const {g}=setup();g.profile.inventory={protect:1,peek:1,reroll:1,swap:1};assert.equal(g.useItem('swap'),false);assert.ok(g.useItem('protect'));assert.equal(g.useItem('peek'),false);assert.equal(g.useItem('reroll'),false);assert.equal(g.profile.inventory.reroll,1);g.addBet('rou-red',100);g.lock();assert.equal(g.useItem('peek'),false);g.tick(SPIN);assert.equal(g.round.used,'protect');
});
test('reroll possession alone neither starts a ten-second decision nor consumes inventory',()=>{
 const {g}=setup();g.profile.inventory.reroll=1;g.addBet('rou-red',100);g.lock();g.tick(SPIN);assert.equal(g.round.phase,'settled');assert.equal(g.profile.inventory.reroll,1);assert.equal(g.chooseRouletteReroll(true),false);
});
test('activated reroll accepts original result, is charged up front, and never pays before the decision',()=>{
 const {g,saves}=setup('0');g.profile.inventory.reroll=1;g.useItem('reroll');assert.equal(g.profile.inventory.reroll,0);g.addBet('rou-number-0',100);g.lock();g.tick(SPIN);assert.equal(g.round.phase,'rou-reroll');assert.equal(g.round.visibleOutcome,'0');assert.equal(g.round.remaining,10000);assert.equal(saves(),0);assert.equal(g.profile.bank,9900);assert.ok(g.chooseRouletteReroll(false));assert.equal(g.profile.bank,13500);assert.equal(g.profile.inventory.reroll,0);assert.equal(saves(),1);
});
test('reroll timeout keeps the original, consumes once, and cannot be activated again',()=>{
 const {g}=setup('00');g.profile.inventory.reroll=2;g.useItem('reroll');g.addBet('rou-number-00',100);g.lock();g.tick(SPIN+9999);assert.equal(g.round.phase,'rou-reroll');g.tick(1);assert.equal(g.round.phase,'settled');assert.equal(g.profile.inventory.reroll,1);assert.equal(g.round.result.outcome,'00');assert.equal(g.chooseRouletteReroll(true),false);
});
test('one reroll draws from all 38, may repeat, and settles every old bet only on its final result',()=>{
 for(const outcome of ['0','00','17']){const {g,saves}=setup('17');g.profile.inventory.reroll=1;g.useItem('reroll');g.addBet('rou-number-17',100);g.addBet('rou-number-'+(outcome==='17'?'0':outcome),200);g.lock();g.tick(SPIN);g.randomIndex=()=>ROULETTE_POCKETS.indexOf(outcome);assert.ok(g.chooseRouletteReroll(true));assert.equal(g.round.visibleOutcome,null);assert.equal(g.round.rerolls,1);assert.equal(g.addBet('rou-red',100),false);g.tick(SPIN);assert.equal(g.round.phase,'settled');assert.equal(g.round.result.outcome,outcome);assert.equal(g.round.result.returned,outcome==='17'?3600:7200);assert.equal(saves(),1);assert.equal(g.chooseRouletteReroll(true),false);assert.equal(g.profile.inventory.reroll,0);}
});
test('pause freezes bankroll, spin progress, decision timer and effective play time exactly',()=>{
 for(const phase of ['betting','rou-spinning','rou-reroll']){const {g}=setup();if(phase!=='betting'){g.profile.inventory.reroll=1;g.useItem('reroll');g.addBet('rou-red',100);g.lock();if(phase==='rou-reroll')g.tick(SPIN);}g.tick(1234);g.paused=true;const before=JSON.stringify(g);g.tick(999999);assert.equal(JSON.stringify(g),before);assert.equal(g.useItem('peek'),false);assert.equal(g.chooseRouletteReroll(true),false);g.paused=false;const left=g.round.remaining;g.tick(1);assert.equal(g.round.remaining,left-1);}
});
test('stale round actions and coupons cannot apply after a no-bet timeout has opened a new round',()=>{
 const {g}=setup();g.profile.inventory.peek=1;const previous=g.round.id;g.tick(30000);assert.equal(g.addRouletteBet('rou-red',100,previous),false);assert.equal(g.useRouletteItem('peek',previous),false);assert.equal(g.stake,0);assert.equal(g.profile.inventory.peek,1);assert.ok(g.addRouletteBet('rou-red',100,g.round.id));
});
test('victory, bust and protected survival are assessed only after final roulette settlement',()=>{
 const {g}=setup('0',2499999900);g.addBet('rou-number-0',100);g.lock();assert.equal(g.profile.status,'active');g.tick(SPIN);assert.equal(g.profile.status,'won');assert.equal(g.checkpoint.profile.status,'won');
 for(const protect of [false,true]){const {g:h}=setup('0',101);if(protect){h.profile.inventory.protect=1;h.useItem('protect');}h.addBet('rou-red',101);h.lock();assert.equal(h.profile.status,'active');h.tick(SPIN);assert.equal(h.profile.bank,protect?50:0);assert.equal(h.profile.status,protect?'active':'lost');}
});
test('roulette completion retains poker table and both shoes; older saves import without roulette fields',()=>{
 const {g}=setup();g.leaveTable();g.enterTable('blackjack');g.leaveTable();g.enterTable('baccarat');g.leaveTable();g.enterTable('poker');g.leaveTable();const before={bj:structuredClone(g.blackjackShoe),bac:structuredClone(g.baccaratShoe),poker:structuredClone(g.pokerTable)};g.enterTable('roulette');g.addBet('rou-number-0',100);g.lock();g.tick(SPIN);const clean=validateSave(g.checkpoint);assert.deepEqual(clean.blackjackShoe,before.bj);assert.deepEqual(clean.baccaratShoe,before.bac);assert.deepEqual(clean.pokerTable,before.poker);assert.equal(clean.schema,1);assert.ok(!('roulette' in clean));const restored=new Game();restored.restore(clean);assert.ok(restored.enterTable('roulette'));assert.deepEqual(restored.profile.inventory,g.profile.inventory);
});
test('each wheel/ball final angle lands on the named American pocket, including sequential rerolls',()=>{
 let previous=null;const modulo=n=>(n%360+360)%360;for(const outcome of [...ROULETTE_WHEEL,'0','00','00']){const m=rouletteSpin(outcome,previous),angle=modulo(m.ballTo-m.wheelTo),index=Math.round(angle/(360/38))%38;assert.equal(ROULETTE_WHEEL[index],outcome);assert.ok(m.wheelTo>m.wheelFrom);assert.ok(m.ballTo<m.ballFrom);assert.equal(m.duration,SPIN);if(previous){assert.equal(m.wheelFrom,previous.wheelTo);assert.equal(m.ballFrom,previous.ballTo);}previous=m;}assert.throws(()=>rouletteSpin('37'));
});
test('both layouts contain exactly 50 bounded non-overlapping cells with known number/column mapping',()=>{
 for(const portrait of [false,true]){const {width,height,cells}=rouletteCells(portrait);assert.equal(cells.length,50);assert.deepEqual(cells.map(c=>c.id).sort(),ROULETTE_BETS.map(b=>b.id).sort());for(const c of cells){assert.ok(c.x>=0&&c.y>=0&&c.x+c.w<=width&&c.y+c.h<=height);assert.ok(c.anchor.x>c.x&&c.anchor.x<c.x+c.w&&c.anchor.y>c.y&&c.anchor.y<c.y+c.h);for(const d of cells.filter(d=>d.id!==c.id))assert.ok(c.x+c.w<=d.x||d.x+d.w<=c.x||c.y+c.h<=d.y||d.y+d.h<=c.y,`${c.id} overlaps ${d.id}`);}}
 const cells=rouletteCells(false).cells;assert.equal(cells.find(c=>c.id==='rou-number-3').y,cells.find(c=>c.id==='rou-column-3').y);assert.ok(cells.find(c=>c.id==='rou-number-00').y<cells.find(c=>c.id==='rou-number-0').y);
});
test('actual view has full board, five chips, precision controls, phase lock and no premature result label',()=>{
 const {g}=setup('17'),html=view(g);assert.equal(marked(html).length,50);assert.equal((html.match(/data-action="chip"/g)||[]).length,5);assert.ok(html.includes('id="roulette-target"'));assert.ok(!html.includes('輪盤開出 17'));assert.ok(html.includes('data-roulette-round="'+g.round.id+'"'));g.addBet('rou-red',100);g.lock();const spinning=view(g);assert.ok(spinning.includes('輪盤轉動中'));assert.ok(!spinning.includes('data-action="chip"'));assert.ok(!spinning.includes('輪盤開出 17'));g.tick(SPIN);const result=view(g);assert.ok(result.includes('輪盤開出 17'));assert.ok(result.includes('已保存完成局'));assert.ok(!result.includes('data-action="rou-respin"'));const stack=[];for(const m of result.matchAll(/<(\/?)(div|section|article|header|button)\b[^>]*>/g)){if(m[1])assert.equal(stack.pop(),m[2]);else stack.push(m[2]);}assert.equal(stack.length,0);
});
test('wheel view resumes from exact delay and play state; reroll choices exist only after the first reveal',()=>{
 const {g}=setup();g.profile.inventory.reroll=1;g.useItem('reroll');g.addBet('rou-red',100);g.lock();g.tick(1234);g.paused=true;const html=view(g);assert.ok(html.includes('--rou-spin-delay:-1234ms'));assert.ok(html.includes('--rou-spin-state:paused'));g.paused=false;g.tick(SPIN-1234);const choice=view(g);assert.ok(choice.includes('data-action="rou-respin"'));assert.ok(choice.includes('data-action="rou-keep"'));g.chooseRouletteReroll(true);assert.ok(!view(g).includes('data-action="rou-respin"'));
});
test('mixed chip painting excludes pending flights, highlights final wins and preserves the round',()=>{
 const {g}=setup('0');g.addBet('rou-number-0',600);g.profile.inventory.peek=1;g.useItem('peek');g.lock();g.tick(SPIN);const node={dataset:{chipTarget:'rou-number-0'},innerHTML:''},flags={},amount={},cell={classList:{toggle:(k,v)=>flags[k]=v},querySelector:()=>amount,setAttribute(){}};const before=JSON.stringify(g.round);paintRouletteChips({root:{querySelectorAll:()=>[node],querySelector:()=>cell},game:g,art:p=>p,pending:{'rou-number-0':100},stacks:{'rou-number-0':[100,500]}});assert.equal((node.innerHTML.match(/class="chip-face"/g)||[]).length,2);assert.ok(node.innerHTML.includes('viewBox="20 155'));assert.ok(node.innerHTML.includes('viewBox="454.4 155'));assert.equal(flags['rou-hit'],true);assert.equal(flags['rou-paid'],true);assert.equal(JSON.stringify(g.round),before);
});
test('roulette chip flight uses its real DOM target and the shared 600ms arc',()=>{
 const previous=globalThis.document;let frames,options;globalThis.document={querySelector:()=>({getBoundingClientRect:()=>({x:100,y:200,width:30,height:30})}),body:{append(){}},createElement:()=>({style:{},setAttribute(){},remove(){},animate(f,o){frames=f;options=o;return {cancel(){}};}})};try{const fx=new ChipFlights({art:p=>p});fx.queue('rou-number-00',500,{x:0,y:0});fx.mount();assert.equal(options.duration,600);assert.ok(frames.at(-1).transform.includes('translate(100px,200px)'));}finally{globalThis.document=previous;}
});
test('fitted board stays within measured space; explicit zoom is separate and does not mutate gameplay',()=>{
 for(const [w,h,portrait,zoom] of [[1000,300,false,false],[300,500,true,false],[300,500,true,true]]){const style={},surface={dataset:{portrait:String(portrait)},style,querySelectorAll:()=>[]},wrap={clientWidth:w,clientHeight:h,dataset:{roundId:'1',enabled:'true'},classList:{contains:()=>zoom},querySelector:()=>surface},root={querySelector:()=>wrap};assert.equal(fitRouletteSurface(root),true);const width=parseFloat(style.width),height=parseFloat(style.height);if(!zoom){assert.ok(width<=w+1e-7);assert.ok(height<=h+1e-7);}else assert.ok(width>=600);}
 for(const portrait of [false,true]){const html=rouletteBoardMarkup(false,42,portrait);assert.equal(marked(html).length,50);assert.equal((html.match(/aria-disabled="true"/g)||[]).length,50);assert.ok(html.includes('data-roulette-round="42"'));}
});
test('2,000 mixed roulette rounds conserve cents and single-item use across skips, rerolls, cuts and imports',()=>{
 const random=seeded(24),g=new Game({randomIndex:random});g.start('輪盤模擬');g.profile.bank=100000000;g.profile.inventory={protect:4000,peek:4000,reroll:4000,swap:5};g.enterTable('roulette');
 for(let i=0;i<2000;i++){const before=g.profile.bank,inventory=structuredClone(g.profile.inventory);if(i%4===0)g.useItem('protect');else if(i%4===1)g.useItem('peek');else if(i%4===2)g.useItem('reroll');if(g.round.peek){assert.equal(new Set(g.round.peek.excluded).size,5);assert.ok(!g.round.peek.excluded.includes(g.round.outcome));}for(let n=0;n<4;n++)assert.ok(g.addBet(ROULETTE_BETS[random(50)].id,101+random(400)));g.lock();g.tick(SPIN);if(g.round.phase==='rou-reroll'){if(i%3===0)g.chooseRouletteReroll(true);else if(i%3===1)g.chooseRouletteReroll(false);else g.tick(10000);if(g.round.phase==='rou-spinning')g.tick(SPIN);}assert.equal(g.round.phase,'settled');const r=g.round.result;assert.equal(g.profile.bank,before+r.net);assert.equal(r.returned,r.lines.reduce((n,l)=>n+l.payout,0));assert.equal(Object.keys(inventory).reduce((n,k)=>n+inventory[k]-g.profile.inventory[k],0),g.round.used?1:0);assert.equal(g.profile.inventory.swap,5);assert.equal(g.settle(),false);assert.equal(validateSave(g.checkpoint).profile.bank,g.profile.bank);if(i<1999)g.newRound();}assert.equal(g.profile.rounds,2000);
});
