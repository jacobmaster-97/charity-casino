import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Game} from '../src/game.mjs';
import {GOAL} from '../src/rules.mjs';
import {validateSave,Saves} from '../src/storage.mjs';
import {BLACKJACK_DEAL_MS as D,BLACKJACK_CUT,blackjackValue,blackjackNatural,blackjackHandNatural,makeBlackjackShoe,validateBlackjackShoe,blackjackOptions,settleBlackjackRound} from '../src/blackjack.mjs';
import {blackjackTableView,paintBlackjackChips,fitBlackjackSurface} from '../src/blackjack-view.mjs';
import {ChipFlights} from '../src/board.mjs';
const bjCard=(rank,suit=0,deck=0)=>deck*52+suit*13+rank-1;
function bjFixture(first){assert.equal(new Set(first).size,first.length);return {cards:[...first,...Array.from({length:312},(_,i)=>i).filter(n=>!first.includes(n))],cursor:0,cycle:1};}
function bjSetup(first=[9,22,5,6],bank=10000){const saves=[],g=new Game({randomIndex:n=>n-1,onComplete:s=>saves.push(s)});g.start('21點測試','free');g.profile.bank=bank;g.blackjackShoe=bjFixture(first);assert.ok(g.enterTable('blackjack'));return {g,saves};}
function bjAnimate(g){for(let i=0;i<100&&['bj-dealing','bj-animating'].includes(g.round.phase);i++)g.tick(g.round.remaining);assert.ok(!['bj-dealing','bj-animating'].includes(g.round.phase));}
function bjStart(g,amount=100){assert.ok(g.addBet('bj-main',amount));assert.ok(g.lock());bjAnimate(g);}
function bjFinish(g,decision=()=> 'stand'){for(let i=0;i<500&&g.round.phase!=='settled';i++){if(g.round.phase==='bj-player'){const action=decision(g);assert.ok(g.blackjackAction(action));}else if(g.round.phase==='bj-insurance')g.chooseBlackjackInsurance();else g.tick(g.round.remaining);}assert.equal(g.round.phase,'settled');}
function bjView(g,extra={}){return blackjackTableView({game:g,art:p=>p,button:(a,t,c='',e='')=>`<button data-action="${a}" class="${c}" ${e}>${t}</button>`,icon:()=>'',chip:500,allIn:false,storageWarning:'',...extra});}
test('six-deck shoe is a 312-card permutation; corrupt, duplicate and cross-table shoes reject',()=>{
 const s=makeBlackjackShoe();assert.equal(s.cards.length,312);assert.equal(new Set(s.cards).size,312);assert.deepEqual(validateBlackjackShoe(s),s);const ranks=Array(13).fill(0);s.cards.forEach(n=>ranks[n%13]++);assert.deepEqual(ranks,Array(13).fill(24));for(const bad of [{...s,cursor:-1},{...s,cursor:313},{...s,cards:[...s.cards.slice(1),s.cards[1]]},{...s,cycle:0}])assert.throws(()=>validateBlackjackShoe(bad));assert.throws(()=>makeBlackjackShoe(()=>-1));
});
test('aces choose the highest non-bust value, including multiple aces and soft-to-hard changes',()=>{
 assert.deepEqual(blackjackValue([0,5]),{total:17,soft:true,bust:false});assert.deepEqual(blackjackValue([0,5,9]),{total:17,soft:false,bust:false});assert.equal(blackjackValue([0,13,8]).total,21);assert.equal(blackjackValue([0,13,9]).total,12);assert.equal(blackjackValue([9,12,1]).bust,true);assert.ok(blackjackNatural([0,12]));assert.ok(!blackjackNatural([0,4,4]));
});
test('no free coupons; twenty-second betting, affordable amounts and low-bankroll all-in',()=>{
 const {g}=bjSetup();assert.deepEqual(g.profile.inventory,{protect:0,peek:0,reroll:0,swap:0});assert.equal(g.round.remaining,20000);assert.equal(g.addBet('bac-player',100),false);assert.equal(g.addBet('bj-main',99),false);assert.equal(g.addBet('bj-main',10001),false);assert.ok(g.addBet('bj-main',500));assert.equal(g.available,9500);assert.ok(g.clearBets());
 const {g:low}=bjSetup([0,9,12,7],37);assert.equal(low.addBet('bj-main',36),false);bjStart(low,37);bjFinish(low);assert.equal(low.profile.bank,92);assert.equal(low.profile.status,'active');
});
test('initial cards alternate player/dealer, one dealer card stays hidden and nothing saves mid-round',()=>{
 const {g,saves}=bjSetup();g.addBet('bj-main',100);g.lock();g.tick(D);assert.deepEqual(g.round.hands[0].cards,[9]);assert.deepEqual(g.round.dealer,[]);g.tick(D*3);assert.deepEqual(g.round.hands[0].cards,[9,5]);assert.deepEqual(g.round.dealer,[22,6]);assert.equal(g.round.dealerShown,false);assert.equal(saves.length,0);g.tick(D);assert.equal(g.round.phase,'bj-player');assert.equal(g.round.remaining,20000);assert.equal(g.round.dealerChecked,true);
});
test('natural Blackjack pays net 3:2 to cents and completes one checkpoint',()=>{
 const {g,saves}=bjSetup([0,9,12,7]);bjStart(g,1001);bjFinish(g);assert.equal(g.round.result.returned,2502);assert.equal(g.round.result.net,1501);assert.equal(g.profile.bank,11501);assert.equal(g.profile.rounds,1);assert.equal(saves.length,1);assert.equal(g.round.result.lines[0].outcome,'blackjack');const bank=g.profile.bank;assert.equal(g.settle(),false);assert.equal(g.profile.bank,bank);
});
test('dealer Blackjack with ten up is checked before offering player decisions',()=>{
 const {g}=bjSetup([8,9,7,0]);bjStart(g);assert.equal(g.round.phase,'settled');assert.equal(g.round.dealerShown,true);assert.equal(g.round.result.returned,0);assert.equal(g.blackjackAction('hit'),false);assert.equal(g.blackjackShoe.cursor,4);
});
test('Ace up offers insurance before checking; two naturals push main and insurance pays net 2:1',()=>{
 const {g}=bjSetup([0,13,9,12]);bjStart(g);assert.equal(g.round.phase,'bj-insurance');assert.equal(g.round.dealerChecked,false);assert.equal(g.useItem('peek'),false);assert.equal(g.blackjackAction('stand'),false);assert.equal(g.chooseBlackjackInsurance(51),false);assert.ok(g.chooseBlackjackInsurance(50));bjFinish(g);assert.equal(g.round.result.stake,150);assert.equal(g.round.result.returned,250);assert.equal(g.round.result.net,100);assert.equal(g.round.result.lines.find(l=>l.id==='bj-main').outcome,'push');
});
test('insurance respects remaining funds and timeout declines without an automatic wager',()=>{
 const {g}=bjSetup([7,0,5,6]);bjStart(g,10000);assert.equal(g.profile.bank,0);assert.equal(g.chooseBlackjackInsurance(1),false);g.tick(20000);assert.equal(g.round.insurance,0);assert.equal(g.round.phase,'bj-player');assert.ok(!g.round.bets['bj-insurance']);assert.equal(g.chooseBlackjackInsurance(0),false);
});
test('dealer stands on soft 17 and does not consume another card',()=>{
 const {g}=bjSetup([9,0,22,5,2]);bjStart(g);g.chooseBlackjackInsurance();bjFinish(g);assert.deepEqual(g.round.dealer,[0,5]);assert.equal(g.blackjackShoe.cursor,4);assert.equal(g.round.result.net,100);
});
test('normal hit starts a new decision clock; double consumes one card then stands',()=>{
 const {g}=bjSetup([7,9,4,6,56]);bjStart(g);g.tick(8000);assert.ok(g.blackjackAction('hit'));bjAnimate(g);assert.equal(g.round.phase,'bj-player');assert.equal(g.round.remaining,20000);assert.equal(blackjackOptions(g).double,false);bjFinish(g);assert.equal(g.round.result.net,100);
 const {g:d}=bjSetup([5,9,4,6,61]);bjStart(d);const outcome=d.blackjackAction('double');assert.deepEqual(outcome.betAdded,{id:'bj-main',amount:100});assert.equal(d.profile.bank,9800);bjFinish(d);assert.equal(d.round.hands[0].cards.length,3);assert.equal(d.round.hands[0].doubled,true);assert.equal(d.round.result.returned,400);assert.equal(d.round.result.net,200);
});
test('bust loses immediately for that hand; dealer does not draw when all hands are dead',()=>{
 const {g}=bjSetup([9,4,8,5,56,61]);bjStart(g);g.blackjackAction('hit');bjFinish(g);assert.equal(g.round.result.lines[0].outcome,'bust');assert.equal(g.round.result.returned,0);assert.equal(g.round.dealer.length,2);assert.equal(g.blackjackShoe.cursor,5);
});
test('doubling and splitting cannot borrow funds or bypass wrong-hand/phase guards',()=>{
 const {g}=bjSetup([7,9,20,6]);bjStart(g,10000);assert.equal(blackjackOptions(g).double,false);assert.equal(blackjackOptions(g).split,false);assert.equal(g.blackjackAction('double'),false);assert.equal(g.blackjackAction('split'),false);assert.equal(g.addBet('bj-main',100),false);assert.equal(g.clearBets(),false);assert.equal(g.leaveTable(),false);assert.equal(g.settle(),false);assert.equal(g.blackjackAction('peek'),false);
});
test('split creates an independent equal wager, permits DAS, and settles all hands only once',()=>{
 const {g,saves}=bjSetup([7,9,20,6,2,3,61]);bjStart(g);const result=g.blackjackAction('split');assert.equal(result.betAdded.id,'bj-hand-1');assert.equal(g.profile.bank,9800);bjAnimate(g);assert.equal(g.round.hands.length,2);assert.deepEqual(g.round.hands.map(h=>h.cards.length),[2,2]);assert.equal(blackjackOptions(g).surrender,false);assert.ok(g.blackjackAction('double'));bjAnimate(g);assert.equal(g.round.activeHand,1);assert.equal(g.round.remaining,20000);assert.equal(saves.length,0);bjFinish(g);assert.equal(g.round.result.stake,300);assert.equal(g.round.result.returned,400);assert.equal(g.profile.bank,10100);assert.equal(g.profile.rounds,1);assert.equal(saves.length,1);
});
test('ten and king can split; non-A resplits stop at four independent hands',()=>{
 const {g:ten}=bjSetup([9,5,12,22]);bjStart(ten);assert.equal(blackjackOptions(ten).split,true);
 const {g}=bjSetup([7,9,20,6,33,46,59,72,85,98]);bjStart(g);for(let i=0;i<3;i++){assert.ok(g.blackjackAction('split'));bjAnimate(g);}assert.equal(g.round.hands.length,4);assert.equal(new Set(g.round.hands.map(h=>h.id)).size,4);assert.equal(blackjackOptions(g).split,false);assert.equal(g.blackjackAction('split'),false);bjFinish(g);assert.equal(g.round.result.stake,400);assert.equal(g.blackjackShoe.cursor,10);
});
test('split A receives one card per hand, cannot resplit or double, and 21 pays ordinary 1:1',()=>{
 const {g}=bjSetup([0,9,13,6,22,12]);bjStart(g);g.blackjackAction('split');bjFinish(g);assert.ok(g.round.hands.every(h=>h.splitA&&h.cards.length===2&&!blackjackHandNatural(h)));assert.equal(g.round.result.returned,400);assert.equal(g.round.result.net,200);
 const {g:a}=bjSetup([0,9,13,6,26,39]);bjStart(a);a.blackjackAction('split');bjAnimate(a);assert.equal(a.round.phase,'settled');assert.equal(a.blackjackAction('split'),false);assert.equal(a.blackjackAction('double'),false);
});
test('an expired hand cannot send stale actions or coupons to the next split hand',()=>{
 const {g}=bjSetup([7,9,20,6,2,3]);g.profile.inventory.peek=1;bjStart(g);g.blackjackAction('split');bjAnimate(g);const oldId=g.round.hands[0].id;g.tick(20000);assert.equal(g.round.activeHand,1);const before=structuredClone({round:g.round,profile:g.profile});assert.equal(g.blackjackAction('double',oldId),false);assert.equal(g.useItem('peek',0,oldId),false);assert.deepEqual({round:g.round,profile:g.profile},before);assert.ok(g.useItem('peek',0,g.round.hands[1].id));
});
test('late surrender refunds half to cents; protection is applied once to the combined loss',()=>{
 const {g}=bjSetup();g.profile.inventory.protect=1;assert.ok(g.useItem('protect'));bjStart(g,1001);assert.ok(g.blackjackAction('surrender'));bjFinish(g);assert.equal(g.round.result.returned,500);assert.equal(g.round.result.refund,250);assert.equal(g.round.result.net,-251);assert.equal(g.profile.inventory.protect,0);
});
test('protection combines insurance and main losses; no per-line duplicate refund',()=>{
 const {g}=bjSetup([7,0,5,6]);g.profile.inventory.protect=1;g.useItem('protect');bjStart(g,1000);g.chooseBlackjackInsurance(250);bjFinish(g);assert.equal(g.round.result.stake,1250);assert.equal(g.round.result.returned,0);assert.equal(g.round.result.refund,625);assert.equal(g.round.result.net,-625);
});
test('peek is available only after dealer check, shows the actual hole card and does not reset clock',()=>{
 const {g}=bjSetup([7,0,5,6]);g.profile.inventory.peek=1;assert.equal(g.useItem('peek'),false);bjStart(g);assert.equal(g.useItem('peek'),false);g.chooseBlackjackInsurance();g.tick(8000);assert.ok(g.useItem('peek'));assert.equal(g.round.peek.card,6);assert.equal(g.round.remaining,12000);assert.equal(g.profile.inventory.peek,0);assert.equal(g.useItem('swap',0),false);assert.equal(g.chooseBlackjackInsurance(10),false);
});
test('swap discards one actual card, consumes one voucher and preserves the original clock including animation',()=>{
 const {g}=bjSetup([8,9,6,5,0]);g.profile.inventory.swap=1;bjStart(g);g.tick(8000);const cursor=g.blackjackShoe.cursor;assert.equal(g.useItem('swap',2),false);assert.equal(g.profile.inventory.swap,1);assert.ok(g.useItem('swap',1));g.tick(D/2);g.paused=true;const state=structuredClone(g.round),elapsed=g.profile.elapsedMs;g.tick(60000);assert.deepEqual(g.round,state);assert.equal(g.profile.elapsedMs,elapsed);g.paused=false;bjAnimate(g);assert.deepEqual(g.round.discard,[6]);assert.equal(g.round.hands[0].cards[1],0);assert.equal(g.blackjackShoe.cursor,cursor+1);assert.equal(g.profile.inventory.swap,0);assert.equal(g.round.phase,'bj-player');assert.ok(Math.abs(g.round.remaining-(12000-D*2))<1e-7);assert.equal(g.useItem('peek'),false);
});
test('swapped 21 is ordinary; an expired action clock stands after the replacement animation',()=>{
 const {g}=bjSetup([9,22,4,6,0]);g.profile.inventory.swap=1;bjStart(g);g.useItem('swap',1);bjFinish(g);assert.equal(g.round.result.lines[0].outcome,'win');assert.equal(g.round.result.returned,200);assert.equal(blackjackHandNatural(g.round.hands[0]),false);
 const {g:t}=bjSetup([8,9,6,5,0]);t.profile.inventory.swap=1;bjStart(t);t.tick(19500);t.useItem('swap',1);bjAnimate(t);assert.equal(t.round.phase,'settled');assert.equal(t.round.hands[0].status,'stood');
});
test('pause freezes betting, insurance, animation and per-hand action with no decision allowed',()=>{
 const {g}=bjSetup([7,0,5,6]);g.tick(8000);g.paused=true;g.tick(30000);assert.equal(g.round.remaining,12000);assert.equal(g.addBet('bj-main',100),false);g.paused=false;g.addBet('bj-main',100);g.lock();g.tick(D/2);g.paused=true;const cursor=g.blackjackShoe.cursor;g.tick(30000);assert.equal(g.blackjackShoe.cursor,cursor);assert.equal(g.advanceBlackjackAnimation(),false);g.paused=false;bjAnimate(g);g.tick(8000);g.paused=true;g.tick(30000);assert.equal(g.round.remaining,12000);assert.equal(g.chooseBlackjackInsurance(1),false);g.paused=false;g.chooseBlackjackInsurance();g.tick(8000);g.paused=true;g.tick(30000);assert.equal(g.round.remaining,12000);assert.equal(g.blackjackAction('stand'),false);
});
test('empty-bet timeout consumes used protection but no funds/cards; action timeout stops the current hand',()=>{
 const {g,saves}=bjSetup();g.profile.inventory.protect=1;g.useItem('protect');g.tick(20000);assert.equal(g.profile.inventory.protect,0);assert.equal(g.round.used,null);assert.equal(g.profile.bank,10000);assert.equal(g.blackjackShoe.cursor,0);assert.equal(saves.length,0);bjStart(g);g.tick(20000);bjFinish(g);assert.equal(g.round.hands[0].status,'stood');
});
test('completed save preserves both shoes; older schema-1 files and missing swap remain compatible',()=>{
 const {g,saves}=bjSetup();bjStart(g);bjFinish(g);const saved=validateSave(JSON.parse(JSON.stringify(g.checkpoint)));assert.equal(saved.blackjackShoe.cards.length,312);assert.equal(saves.length,1);const restored=new Game();restored.restore(saved);restored.enterTable('sicbo');restored.addBet('small',100);restored.lock();restored.tick(900);assert.deepEqual(restored.checkpoint.blackjackShoe,saved.blackjackShoe);restored.leaveTable();restored.enterTable('baccarat');restored.addBet('bac-player',100);restored.lock();for(let i=0;i<20&&restored.round.phase!=='settled';i++){if(restored.round.phase==='squeezing')restored.finishBaccaratSqueeze();else restored.tick(restored.round.remaining);}assert.ok(restored.checkpoint.baccaratShoe);assert.deepEqual(restored.checkpoint.blackjackShoe,saved.blackjackShoe);
 const old=structuredClone(saved);delete old.blackjackShoe;delete old.profile.inventory.swap;const clean=validateSave(old);assert.equal(clean.profile.inventory.swap,0);assert.ok(!clean.blackjackShoe);const bad=structuredClone(saved);bad.blackjackShoe.cards[0]=bad.blackjackShoe.cards[1];assert.throws(()=>validateSave(bad));const store=new Map(),io=new Saves({getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)});io.write(saved);assert.deepEqual(io.read('free').blackjackShoe,saved.blackjackShoe);
});
test('cut-card reshuffle is between rounds only; 104-card reserve is honored',()=>{
 assert.equal(BLACKJACK_CUT,104);const {g}=bjSetup();g.blackjackShoe.cursor=208;g.round=null;g.newRound();assert.equal(g.blackjackShoe.cycle,1);g.blackjackShoe.cursor=209;g.round=null;g.newRound();assert.equal(g.blackjackShoe.cycle,2);assert.equal(g.blackjackShoe.cursor,0);
});
test('goal and loss are determined after the whole final settlement, not when bank temporarily hits zero',()=>{
 const {g}=bjSetup([0,9,12,7],GOAL-100);bjStart(g,100);bjFinish(g);assert.equal(g.profile.status,'won');assert.equal(g.profile.bank,GOAL+50);
 const {g:zero}=bjSetup([9,22,5,6],100);zero.addBet('bj-main',100);zero.lock();assert.equal(zero.profile.bank,0);assert.equal(zero.profile.status,'active');bjAnimate(zero);zero.blackjackAction('stand');bjFinish(zero);assert.equal(zero.profile.status,'lost');
});
test('actual unified table hides the dealer rank until peek/reveal and renders all bottom controls',()=>{
 const {g}=bjSetup();let html=bjView(g);assert.ok(html.includes('blackjack-felt'));assert.ok(html.includes('presentation-unified'));assert.equal((html.match(/data-action="chip"/g)||[]).length,5);assert.ok(html.includes('data-chip-target="bj-main"'));assert.ok(!html.includes('hand.png'));g.profile.inventory.peek=1;bjStart(g);html=bjView(g);assert.ok(html.includes('aria-label="未揭示的牌"'));assert.equal((html.match(/data-bj-action=/g)||[]).length,5);assert.ok(!html.includes('data-action="roll"'));g.useItem('peek');assert.ok(!bjView(g).includes('aria-label="未揭示的牌"'));bjFinish(g);assert.ok(bjView(g).includes('data-action="next"'));assert.ok(!bjView(g).includes('data-bj-action='));
});
test('swap selection enables only the current hand cards and every split/insurance gets a distinct chip target',()=>{
 const {g}=bjSetup([7,9,20,6,2,3]);g.profile.inventory.swap=1;bjStart(g);g.blackjackAction('split');bjAnimate(g);const html=bjView(g,{swapHandId:g.round.hands[0].id});assert.equal((html.match(/data-action="bj-swap-card"/g)||[]).length,2);assert.ok(html.includes('data-action="bj-cancel-swap"'));assert.ok(!html.includes('data-bj-action='));assert.ok(html.includes('data-chip-target="bj-hand-1"'));assert.ok(html.includes('data-count="2"'));
 const {g:a}=bjSetup([7,0,5,6]);bjStart(a);a.chooseBlackjackInsurance(20);assert.ok(bjView(a).includes('data-chip-target="bj-insurance"'));
});
test('chip painting accounts for pending flights and retains mixed denomination stacks',()=>{
 const {g}=bjSetup();g.addBet('bj-main',600);const node={dataset:{chipTarget:'bj-main'},innerHTML:''},root={querySelectorAll:()=>[node]};paintBlackjackChips({root,game:g,art:p=>p,pending:{'bj-main':600}});assert.equal(node.innerHTML,'');paintBlackjackChips({root,game:g,art:p=>p,stacks:{'bj-main':[100,500]}});assert.equal((node.innerHTML.match(/class="chip-face"/g)||[]).length,2);assert.ok(node.innerHTML.includes('chips-five.png'));
});
test('split/double chip flight uses the actual hand DOM target and does not require an SVG matrix',()=>{
 const old=globalThis.document;let frames,style;globalThis.document={querySelector:s=>({getBoundingClientRect:()=>({x:100,y:200,width:68,height:54})}),body:{append(){}},createElement:()=>({style:(style={}),setAttribute(){},remove(){},animate(f){frames=f;return {cancel(){}};}})};
 try{const fx=new ChipFlights({art:p=>p});fx.queue('bj-hand-2',500,{x:0,y:0});fx.mount();assert.equal(style.width,'48px');assert.ok(frames.at(-1).transform.includes('translate(110px,203px)'));}finally{globalThis.document=old;}
});
test('card fitting keeps fanned long hands inside their measured area without mutating cards',()=>{
 const styles={},node={clientWidth:240,clientHeight:100,querySelectorAll:()=>Array(8).fill(0),style:{setProperty:(k,v)=>styles[k]=v}},root={querySelector:()=>({}),querySelectorAll:()=>[node]};assert.ok(fitBlackjackSurface(root));const width=Number(styles['--bj-card-width'].slice(0,-2)),gap=Number(styles['--bj-card-gap'].slice(0,-2));assert.ok(width*8+gap*7<=240+1e-8);assert.ok(width*1.4<=100+1e-8);
});
test('pure settlement preserves bust losses against dealer bust and distinguishes ordinary 21 from Blackjack',()=>{
 const round={originalBet:100,insurance:0,used:null,dealer:[9,6,5],hands:[{id:'bj-main',bet:100,cards:[9,12,4],status:'bust'},{id:'bj-hand-1',bet:100,cards:[9,22],fromSplit:true,status:'stood'}]};const result=settleBlackjackRound(round);assert.equal(result.dealerTotal,23);assert.equal(result.lines[0].payout,0);assert.equal(result.lines[1].payout,200);assert.equal(result.net,0);
 const dealerNatural={...round,dealer:[0,12],hands:[{id:'bj-main',bet:100,cards:[9,4,5],status:'stood'}]};assert.equal(settleBlackjackRound(dealerNatural).returned,0);
});
test('real table markup has balanced card/hand containers and accessible per-hand final results',()=>{
 const {g}=bjSetup([7,9,20,6,2,3,61]);bjStart(g);g.blackjackAction('split');bjAnimate(g);for(const stage of ['playing','settled']){if(stage==='settled')bjFinish(g);const html=bjView(g),stack=[];for(const m of html.matchAll(/<(\/?)(div|section|article|header)\b[^>]*>/g)){if(m[1])assert.equal(stack.pop(),m[2]);else stack.push(m[2]);}assert.equal(stack.length,0);assert.ok(html.includes('data-hand="bj-hand-1"'));if(stage==='settled')assert.ok(html.includes('輸 −$1'));}
});
test('2,000 mixed-action rounds conserve cash, shoe uniqueness and single coupon use across cuts',()=>{
 const g=new Game();g.start('21點連續局');g.profile.bank=100000000;g.profile.inventory={protect:3000,peek:3000,swap:3000,reroll:9};g.enterTable('blackjack');
 for(let i=0;i<2000;i++){const before=g.profile.bank,inventory=structuredClone(g.profile.inventory);if(i%4===0)g.useItem('protect');g.addBet('bj-main',101+i%200);g.lock();for(let step=0;step<500&&g.round.phase!=='settled';step++){if(g.round.phase==='bj-insurance')g.chooseBlackjackInsurance(i%3===0?Math.min(7,Math.floor(g.round.originalBet/2),g.profile.bank):0);else if(g.round.phase==='bj-player'){let opts=blackjackOptions(g);if(!g.round.used&&i%4===1&&opts.peek)g.useItem('peek');if(!g.round.used&&i%4===2&&opts.swap){g.useItem('swap',i%2);continue;}opts=blackjackOptions(g);const score=blackjackValue(g.round.hands[g.round.activeHand].cards).total;const action=opts.split&&i%3===0?'split':opts.double&&score<=11&&i%3===1?'double':opts.surrender&&score===16&&i%5===0?'surrender':score<15?'hit':'stand';assert.ok(g.blackjackAction(action));}else g.tick(g.round.remaining);}
  assert.equal(g.round.phase,'settled');const r=g.round.result;assert.equal(g.profile.bank,before+r.net);assert.equal(r.stake,Object.values(g.round.bets).reduce((a,b)=>a+b,0));assert.equal(r.returned,r.lines.reduce((n,l)=>n+l.payout,0));assert.equal(new Set(g.blackjackShoe.cards).size,312);assert.equal(g.profile.inventory.reroll,9);assert.equal(Object.keys(inventory).reduce((n,k)=>n+inventory[k]-g.profile.inventory[k],0),g.round.used?1:0);assert.equal(g.settle(),false);if(i%100===0)assert.equal(validateSave(g.checkpoint).profile.bank,g.profile.bank);if(i<1999)g.newRound();
 }
 assert.equal(g.profile.rounds,2000);assert.ok(g.blackjackShoe.cycle>20);
});
