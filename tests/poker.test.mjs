import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Game} from '../src/game.mjs';
import {makePokerDeck,pokerBest,pokerBlinds,pokerOptions,pokerPots,pokerPotLayers,pokerAI,validatePokerTable} from '../src/poker.mjs';
import {pokerTableView,paintPokerChips,queuePokerMotions,fitPokerSurface} from '../src/poker-view.mjs';
import {ChipFlights} from '../src/board.mjs';
import {validateSave} from '../src/storage.mjs';
const card=s=>{const rank='A23456789TJQK'.indexOf(s[0]),suit='shcd'.indexOf(s[1]);assert.ok(rank>=0&&suit>=0,s);return suit*13+rank;};
const cards=s=>s.split(' ').map(card);
function seeded(seed=7){return n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};}
function game(bank=10000,randomIndex=seeded()){const g=new Game({randomIndex});g.start('測試','free');g.profile.bank=bank;assert.equal(g.enterTable('poker'),true);return g;}
function advance(g){let steps=0;while(!['poker-player','settled'].includes(g.round.phase)){assert.ok(++steps<1000,'advance bound');g.tick(g.round.remaining||1);}return g;}
function setup(players,{actor=0,currentBet=100,lastFullRaise=100,streetIndex=0,bank=10000}={}){const g=game(bank);const r=g.round;r.players=r.players.map((p,i)=>({...p,cards:cards(['As Kh','Qs Qh','Js Jh','Ts Th','9s 9h','8s 8h'][i]),stack:i===0?bank:10000,folded:i>=players.length,...players[i]}));r.phase=actor===0?'poker-player':'poker-ai';r.actor=actor;r.turnId=3;r.currentBet=currentBet;r.lastFullRaise=lastFullRaise;r.streetIndex=streetIndex;r.remaining=30000;r.deck=Array.from({length:52},(_,i)=>i).filter(c=>!r.players.flatMap(p=>p.cards).includes(c));r.cursor=0;r.board=[];return g;}
function settle(g){let guard=0;while(g.round.phase!=='settled'){assert.ok(++guard<200);assert.notEqual(g.round.phase,'poker-player');g.tick(g.round.remaining||1);}}
const view=(g,ui={})=>pokerTableView({game:g,art:p=>p,button:(a,t,c='',e='')=>`<button data-action="${a}" class="${c}" ${e}>${t}</button>`,icon:()=>'',ui});
test('all nine rankings, wheel, kickers, two triples and seven-card best five',()=>{
 const hands=['As Jh 9d 5c 3s','As Ah Kd 5c 3s','As Ah Kd Kc 3s','As Ah Ad Kc 3s','As 2h 3d 4c 5s','As Js 9s 5s 3s','As Ah Ad Kc Ks','As Ah Ad Ac Ks','9s Ts Js Qs Ks'].map(s=>pokerBest(cards(s)));
 assert.deepEqual(hands.map(h=>h.category),[0,1,2,3,4,5,6,7,8]);for(let i=1;i<hands.length;i++)assert.ok(hands[i].score>hands[i-1].score);
 assert.equal(hands[4].tie[0],5);assert.ok(pokerBest(cards('2s 3h 4d 5c 6s')).score>hands[4].score);
 assert.equal(pokerBest(cards('As Ah Ad Kc Ks Kh 2s')).tie[0],14);assert.equal(pokerBest(cards('As Ks Qs Js Ts 2h 3h')).name,'皇家同花順');
 assert.ok(pokerBest(cards('As Ah Kd Qc 5s')).score>pokerBest(cards('Ad Ac Ks Jh 9s')).score);assert.throws(()=>pokerBest(cards('As As Qs Js Ts')));
});
test('52 unique cards, exact shuffle validation and capital-based blinds',()=>{
 const deck=makePokerDeck(seeded());assert.equal(new Set(deck).size,52);assert.deepEqual([...deck].sort((a,b)=>a-b),Array.from({length:52},(_,i)=>i));assert.throws(()=>makePokerDeck(n=>n));
 assert.deepEqual([1,99,100,99999,100000,1000000,10000000,100000000].map(n=>pokerBlinds(n).big),[1,99,100,100,1000,10000,100000,1000000]);
});
test('main and side pots include folded money and refund uncalled excess',()=>{
 const ps=Array.from({length:6},(_,i)=>({total:[100,300,500,300,0,0][i],folded:i>=3,cards:cards(['As Ah','Ks Kh','Qs Qh','Js Jh','9s 9h','8s 8h'][i])}));
 const r=pokerPots(ps,cards('2s 3h 6d 7c 9c'),5);assert.equal(r.total,1200);assert.deepEqual(r.pots.map(p=>p.amount),[400,600,200]);assert.deepEqual(r.payouts,[400,600,200,0,0,0]);assert.ok(r.pots[2].uncalled);
});
test('board ties split each pot with odd cents clockwise left of dealer',()=>{
 const ps=Array.from({length:6},(_,i)=>({total:i<3?1:0,folded:i>=2,cards:cards(['2h 3h','4h 5h','6h 7h','8h 9h','Th Jh','Qh Kh'][i])}));
 assert.deepEqual(pokerPots(ps,cards('As Ks Qs Js Ts'),0).payouts,[1,2,0,0,0,0]);assert.deepEqual(pokerPots(ps,cards('As Ks Qs Js Ts'),1).payouts,[2,1,0,0,0,0]);
});
test('fold win needs no board, cannot award to a folded hand, and pays only once',()=>{
 const g=setup([{total:100,street:100},{total:100,street:100,folded:true}],{currentBet:100});g.continuePoker(0);assert.equal(g.round.phase,'poker-collect');settle(g);assert.equal(g.round.result.returned,200);const bank=g.profile.bank;assert.equal(g.settle(),false);assert.equal(g.profile.bank,bank);assert.equal(g.profile.rounds,1);
});
test('six seats, no free coupons, full funds and initial/replacement AI 20–120%',()=>{
 const g=game();assert.deepEqual(Object.values(g.profile.inventory),[0,0,0,0]);assert.equal(g.round.players[0].stack,g.profile.bank);assert.equal(g.round.players.length,6);
 assert.ok(g.pokerTable.seats.every(p=>p.stack>=2000&&p.stack<=12000));const old=g.pokerTable.seats.map(p=>({...p}));g.round.phase='settled';g.pokerTable.seats[2].stack=0;g.profile.bank=8000;g.newRound();assert.ok(g.pokerTable.seats[2].id!==old[2].id);assert.ok(g.pokerTable.seats[2].stack>=1600&&g.pokerTable.seats[2].stack<=9600);assert.deepEqual(g.pokerTable.seats[0],old[0]);
});
test('start rotates button, posts legal blinds, deals round-robin and never checkpoints early',()=>{
 const g=game();assert.equal(g.round.phase,'poker-ready');assert.equal(g.checkpoint,null);assert.equal(g.startPoker(),true);const r=g.round;assert.equal(r.button,0);assert.equal(r.smallSeat,1);assert.equal(r.bigSeat,2);const expected=[...r.deck];while(r.phase==='poker-dealing')g.tick(r.remaining);for(let n=1;n<=6;n++)assert.deepEqual(r.players[n%6].cards,[expected[n-1],expected[n+5]]);assert.equal(r.cursor,12);assert.equal(r.actor,3);assert.equal(g.checkpoint,null);assert.equal(g.leaveTable(),false);
});
test('big blind gets option after limpers; first actor after flop is left of button',()=>{
 const g=setup(Array.from({length:6},()=>({street:100,total:100,hasActed:true,lastActedBet:100})),{actor:1});g.round.players[2].hasActed=false;g.continuePoker(1);assert.equal(g.round.actor,2);assert.equal(pokerOptions(g,2).check,true);assert.equal(g.pokerAction('check',null,null,2),true);assert.equal(g.round.phase,'poker-collect');g.tick(g.round.remaining);while(g.round.phase==='poker-dealing')g.tick(g.round.remaining);assert.equal(g.round.board.length,3);assert.equal(g.round.burn.length,1);assert.equal(g.round.actor,1);
});
test('full raises, minimum amounts, short all-ins and no borrowing',()=>{
 const g=setup([{street:0,total:0},{street:100,total:100}],{bank:250});assert.equal(g.pokerAction('raise',150),false);assert.equal(g.pokerAction('raise',251),false);assert.equal(g.pokerAction('raise',200),true);assert.equal(g.profile.bank,50);assert.equal(g.round.currentBet,200);assert.equal(g.round.lastFullRaise,100);
 const h=setup([{street:0,total:0},{street:100,total:100}],{bank:150});assert.equal(h.pokerAction('all-in'),true);assert.equal(h.profile.bank,0);assert.equal(h.profile.status,'active');assert.equal(h.round.currentBet,150);assert.equal(h.round.lastFullRaise,100);
});
test('short all-in does not reopen an already acted player; cumulative full raises do',()=>{
 const g=setup([{street:100,total:100,hasActed:true,lastActedBet:100},{street:150,total:150,stack:0},{street:100,total:100}],{currentBet:150});assert.equal(pokerOptions(g).raise,false);assert.equal(pokerOptions(g).allIn,false);assert.equal(g.pokerAction('raise',250),false);
 const h=setup([{street:100,total:100,hasActed:true,lastActedBet:100},{street:150,total:150,stack:0},{street:200,total:200,stack:400},{street:100,total:100}],{currentBet:200});assert.equal(pokerOptions(h).raise,true);assert.equal(h.pokerAction('raise',300),true);
});
test('uncalled live stack may not bet against only all-in opponents',()=>{
 const g=setup([{street:50,total:50},{street:100,total:100,stack:0}],{currentBet:100});assert.equal(pokerOptions(g).raise,false);assert.equal(pokerOptions(g).allIn,false);assert.equal(g.pokerAction('call'),true);assert.equal(g.round.phase,'poker-collect');
});
test('player turn token rejects stale actions and coupons',()=>{
 const g=setup([{street:100,total:100},{street:100,total:100}],{currentBet:100});g.profile.inventory.peek=1;assert.equal(g.pokerAction('check',null,2),false);assert.equal(g.usePokerItem('peek',1,2),false);assert.equal(g.profile.inventory.peek,1);assert.equal(g.pokerAction('check',null,3),true);
});
test('timeout checks when free, folds when facing a bet, and pause freezes both clocks',()=>{
 const g=setup([{street:100,total:100},{street:100,total:100}],{});g.tick(18000);assert.equal(g.round.remaining,12000);g.paused=true;const state=JSON.stringify(g);g.tick(99999);assert.equal(JSON.stringify(g),state);g.paused=false;g.tick(12000);assert.equal(g.round.players[0].lastAction,'過牌');
 const h=setup([{street:0,total:0},{street:100,total:100}],{});h.tick(30000);assert.equal(h.round.players[0].folded,true);
});
test('ready protects before blinds, no leave after coupon, peek random single card without timer reset',()=>{
 const g=game();g.profile.inventory.protect=1;assert.equal(g.usePokerItem('protect'),true);assert.equal(g.leaveTable(),false);assert.equal(g.profile.inventory.protect,0);assert.equal(g.startPoker(),true);
 const h=setup([{street:100,total:100},{street:100,total:100},{street:100,total:100,folded:true}],{});h.profile.inventory.peek=1;h.tick(2000);assert.equal(h.usePokerItem('peek',2),false);assert.equal(h.usePokerItem('peek',1),true);assert.equal(h.round.remaining,28000);assert.equal(h.round.peek.seat,1);assert.ok(h.round.players[1].cards.includes(h.round.peek.card));assert.equal(h.usePokerItem('protect'),false);
});
test('swap samples remaining deck, discards once, consumes original action time and cannot repeat',()=>{
 const g=setup([{street:100,total:100},{street:100,total:100}],{});g.profile.inventory.swap=1;g.round.remaining=12000;const old=g.round.players[0].cards[0];assert.equal(g.usePokerItem('swap',2),false);assert.equal(g.usePokerItem('swap',0),true);assert.equal(g.profile.inventory.swap,0);g.paused=true;const state=JSON.stringify(g.round);g.tick(60000);assert.equal(JSON.stringify(g.round),state);g.paused=false;g.tick(900);assert.equal(g.round.phase,'poker-player');assert.equal(g.round.remaining,11100);assert.deepEqual(g.round.discard,[old]);assert.notEqual(g.round.players[0].cards[0],old);assert.equal(g.usePokerItem('swap',1),false);
 const h=setup([{street:100,total:100},{street:100,total:100}],{});h.profile.inventory.swap=1;h.round.remaining=200;h.usePokerItem('swap',0);h.tick(900);assert.equal(h.round.playerHasActed,true);assert.equal(h.round.players[0].lastAction,'過牌');
});
test('coupons cannot be used after first action or after the flop except peek',()=>{
 const g=setup([{street:0,total:100},{street:0,total:100}],{currentBet:0,streetIndex:1});g.profile.inventory={protect:1,peek:1,swap:1,reroll:0};g.round.playerHasActed=true;assert.equal(g.usePokerItem('protect'),false);assert.equal(g.usePokerItem('swap',0),false);assert.equal(g.usePokerItem('peek',1),true);
});
test('protect compensates only player net loss, never debits opponents; status waits until refund',()=>{
 const g=setup([{stack:0,total:101,street:101,folded:true},{stack:0,total:101,street:101}],{bank:101});g.profile.bank=0;g.round.used='protect';g.continuePoker(0);settle(g);assert.equal(g.profile.bank,50);assert.equal(g.round.result.refund,50);assert.equal(g.round.players[1].stack,202);assert.equal(g.profile.status,'active');assert.equal(g.profile.rounds,1);
});
test('single-cent bankroll and automatic all-in runout settle without an early bust',()=>{
 const g=game(1);g.pokerTable.seats.forEach(p=>p.stack=1);g.round.players.forEach(p=>p.stack=1);g.startPoker();advance(g);let guard=0;while(g.round.phase!=='settled'){assert.ok(++guard<200);if(g.round.phase==='poker-player')g.pokerAction('all-in');else g.tick(g.round.remaining||1);}assert.equal(g.profile.rounds,1);assert.ok(['active','lost'].includes(g.profile.status));assert.equal(g.round.board.length,5);
});
test('normal/fast affects future waits, not player 30 seconds; every animation pauses',()=>{
 const g=game();assert.equal(g.setPokerSpeed('bad'),false);assert.equal(g.setPokerSpeed('fast'),true);g.startPoker();assert.equal(g.round.remaining,180);g.paused=true;assert.equal(g.setPokerSpeed('normal'),false);const snapshot=JSON.stringify(g.round);g.tick(1e5);assert.equal(JSON.stringify(g.round),snapshot);g.paused=false;advance(g);if(g.round.phase==='poker-player')assert.equal(g.round.remaining,30000);
});
test('AI decision cannot access opponents or future deck and returns legal short all-in raises',()=>{
 const options={check:false,call:100,owed:100,raise:true,minTo:200,maxTo:150};const decision=pokerAI({cards:cards('As Ah'),board:[],options,pot:1000,big:100,style:1,difficulty:2,randomIndex:()=>0});assert.equal(decision.to,150);const g=game();assert.ok(!pokerAI.toString().includes('deck'));assert.equal(typeof g.pokerTable.speed,'string');
});
test('completed save preserves AI stacks/button/speed, both shoes, and old saves remain valid',()=>{
 const g=setup([{total:100,street:100},{total:100,street:100,folded:true}],{});g.continuePoker(0);settle(g);const save=validateSave(g.checkpoint);assert.deepEqual(save.pokerTable,g.pokerTable);const h=game();h.restore(save);h.enterTable('poker');assert.equal(h.round.button,(save.pokerTable.button+1)%6);assert.equal(h.pokerTable.seats[0].stack,save.pokerTable.seats[0].stack);delete save.pokerTable;assert.ok(!('pokerTable' in validateSave(save)));assert.equal(h.leaveTable(),true);h.enterTable('sicbo');h.addBet('big',100);h.lock();h.tick(20000);assert.ok(h.checkpoint.pokerTable);
 assert.throws(()=>validatePokerTable({...g.pokerTable,seats:[...g.pokerTable.seats.slice(0,4),g.pokerTable.seats[0]]}));assert.throws(()=>validatePokerTable({...g.pokerTable,button:6}));
});
test('live side-pot layers need only commitments and hide no future card or winner',()=>{
 const g=setup([{total:100,street:100},{total:300,street:300},{total:500,street:500},{total:300,street:300,folded:true}],{currentBet:500});const layers=pokerPotLayers(g.round.players);assert.deepEqual(layers.map(p=>p.amount),[400,600,200]);assert.deepEqual(layers[1].eligible,[1,2]);const html=view(g);assert.ok(html.includes('主池 $4'));assert.ok(html.includes('邊池1 $6'));assert.ok(html.includes('待跟注額 $2'));assert.ok(!html.includes('aria-label="Q♠"'));
});
test('actual six-seat view contains five colors, precise action token, split-free controls and valid containers',()=>{
 const g=setup(Array.from({length:6},()=>({total:100,street:100})),{});const html=view(g),stack=[];for(const m of html.matchAll(/<(\/?)(div|section|article|header|button|span)\b[^>]*>/g)){if(m[1])assert.equal(stack.pop(),m[2]);else stack.push(m[2]);}assert.equal(stack.length,0);assert.equal((html.match(/data-action="pk-chip"/g)||[]).length,5);assert.equal((html.match(/class="pk-opponent /g)||[]).length,5);assert.equal((html.match(/data-poker-action=/g)||[]).length,4);assert.ok(html.includes('data-poker-turn="3"'));assert.ok(html.includes('id="pk-raise-to"'));assert.ok(html.includes('data-chip-target="poker-pot"'));for(let i=0;i<6;i++)assert.ok(html.includes(`data-chip-target="poker-bet-${i}"`));
});
test('peek exposes just the selected random opponent card; folded cards stay hidden even at showdown',()=>{
 const g=setup([{},{},{folded:true}],{});g.profile.inventory.peek=1;let html=view(g);assert.ok(!html.includes('aria-label="Q♠"'));assert.ok(!html.includes('aria-label="Q♥"'));g.usePokerItem('peek',1);html=view(g);const shown=g.round.peek.index===0?'Q♠':'Q♥',hidden=g.round.peek.index===0?'Q♥':'Q♠';assert.ok(html.includes(`aria-label="${shown}"`));assert.ok(!html.includes(`aria-label="${hidden}"`));g.round.board=cards('2c 3d 4c 5d 6c');g.round.showdown=true;html=view(g);assert.ok(html.includes('aria-label="Q♠"'));assert.ok(html.includes('aria-label="Q♥"'));assert.ok(!html.includes('aria-label="J♠"'));assert.ok(!html.includes('aria-label="J♥"'));
});
test('item choice shows only own two swap buttons or eligible peek targets, without consuming until use',()=>{
 const g=setup([{},{},{folded:true}],{});g.profile.inventory.swap=1;const before=JSON.stringify(g.round),html=view(g,{selection:{kind:'swap',turn:3}});assert.equal((html.match(/data-action="pk-swap-card"/g)||[]).length,2);assert.ok(!html.includes('data-poker-action="fold"'));assert.equal(JSON.stringify(g.round),before);assert.equal(g.profile.inventory.swap,1);
 const peek=view(g,{selection:{kind:'peek',turn:3}});assert.ok(peek.includes('data-action="pk-peek-seat"'));assert.ok(!/data-action="pk-peek-seat"[^>]*data-seat="2"/.test(peek));
});
test('chip painting retains accepted mixed colors, excludes flights and never alters money',()=>{
 const g=game(),node={dataset:{chipTarget:'poker-bet-0',amount:'1600'},innerHTML:''},root={querySelectorAll:()=>[node]};g.round.chipStacks['poker-bet-0']=[100,500,1000];const before=JSON.stringify(g.round);paintPokerChips({root,game:g,art:p=>p,pending:{'poker-bet-0':1000},pendingCounts:{'poker-bet-0':1}});assert.equal((node.innerHTML.match(/class="chip-face"/g)||[]).length,2);assert.ok(node.innerHTML.includes('viewBox="20 155'));assert.ok(node.innerHTML.includes('viewBox="454.4 155'));assert.equal(JSON.stringify(g.round),before);
});
test('seat bets, collection and payouts queue once from real source rectangles',()=>{
 const g=game();g.startPoker();const rect={x:10,y:20,width:40,height:40},root={querySelector:()=>({getBoundingClientRect:()=>rect})},events=[],flights={queue:(...args)=>events.push(args)};const seen=queuePokerMotions({root,game:g,flights});assert.equal(events.length,2);assert.deepEqual(events[0].slice(0,3),['poker-bet-1',50,{x:30,y:40}]);assert.equal(queuePokerMotions({root,game:g,flights,seen}),seen);assert.equal(events.length,2);g.collectPokerStreet();queuePokerMotions({root,game:g,flights,seen});assert.ok(events.some(e=>e[0]==='poker-pot'));
});
test('real chip flight controller lands on poker DOM targets and preserves its 600ms arc',()=>{
 const previous=globalThis.document;let frames,options,style;globalThis.document={querySelector:()=>({getBoundingClientRect:()=>({x:100,y:200,width:44,height:44})}),body:{append(){}},createElement:()=>({style:(style={}),setAttribute(){},remove(){},animate(f,o){frames=f;options=o;return {cancel(){}};}})};
 try{const fx=new ChipFlights({art:p=>p});fx.queue('poker-pot',500,{x:0,y:0});fx.mount();assert.equal(style.width,'44px');assert.equal(options.duration,600);assert.ok(frames.at(-1).transform.includes('translate(100px,200px)'));}finally{globalThis.document=previous;}
});
test('card fitting contains five board cards and two own cards without changing gameplay',()=>{
 const widths=[];for(const [width,height,count] of [[100,70,5],[320,140,5],[96,62,2]]){const style={},node={clientWidth:width,clientHeight:height,querySelectorAll:()=>Array(count).fill(0),style:{setProperty:(k,v)=>style[k]=v}},root={querySelector:()=>({}),querySelectorAll:()=>[node]};assert.equal(fitPokerSurface(root),true);const w=parseFloat(style['--pk-card-width']);assert.ok(w*count+(count-1)*4<=width+1e-8);assert.ok(w*7/5<=height+1e-8);widths.push(w);}assert.ok(widths[2]>=44);
});
test('complete poker checkpoint also retains both prior shoes across import and table switching',()=>{
 const g=game();g.leaveTable();g.enterTable('blackjack');const blackjack=structuredClone(g.blackjackShoe);g.leaveTable();g.enterTable('baccarat');const baccarat=structuredClone(g.baccaratShoe);g.leaveTable();g.enterTable('poker');g.startPoker();let guard=0;while(g.round.phase!=='settled'){assert.ok(++guard<600);if(g.round.phase==='poker-player')g.pokerAction(pokerOptions(g).check?'check':'fold');else g.tick(g.round.remaining||1);}const clean=validateSave(g.checkpoint);assert.deepEqual(clean.blackjackShoe,blackjack);assert.deepEqual(clean.baccaratShoe,baccarat);const h=new Game();h.restore(clean);assert.deepEqual(h.pokerTable,g.pokerTable);assert.deepEqual(h.blackjackShoe,blackjack);assert.deepEqual(h.baccaratShoe,baccarat);
});
test('goal and bust are assessed after the whole pot distribution; no mid-hand checkpoint exists',()=>{
 const g=setup([{total:100,street:100},{total:100,street:100,folded:true}],{bank:2499999900});g.continuePoker(0);assert.equal(g.profile.status,'active');assert.equal(g.checkpoint,null);settle(g);assert.equal(g.profile.bank,2500000100);assert.equal(g.profile.status,'won');assert.equal(g.checkpoint.profile.status,'won');
 const h=setup([{total:100,street:100,stack:0,folded:true},{total:100,street:100}],{bank:100});h.profile.bank=0;h.continuePoker(0);assert.equal(h.profile.status,'active');settle(h);assert.equal(h.profile.status,'lost');assert.equal(h.checkpoint.profile.status,'lost');
});
test('AI and showdown phases pause without moving cards, funds, elapsed time or timers',()=>{
 for(const phase of ['poker-ai','poker-showdown']){const g=game();g.startPoker();while(g.round.phase==='poker-dealing')g.tick(g.round.remaining);if(phase==='poker-showdown')g.finishPoker(true);g.paused=true;const before=JSON.stringify({profile:g.profile,round:g.round,table:g.pokerTable});assert.equal(g.tick(90000),false);assert.equal(JSON.stringify({profile:g.profile,round:g.round,table:g.pokerTable}),before);}
});
test('only settled winning opponents receive gold frames, including uncontested wins without revealing cards',()=>{
 const g=setup([{total:100,street:100},{total:100,street:100}],{});g.round.board=cards('2s 3h 7d 8c 9c');assert.ok(!view(g).includes('data-winner-seat='));g.finishPoker(true);assert.ok(!view(g).includes('data-winner-seat='));settle(g);const before=JSON.stringify(g),html=view(g);assert.deepEqual([...html.matchAll(/data-winner-seat="(\d)"/g)].map(m=>Number(m[1])),[1]);assert.ok(/class="pk-opponent [^"]*pk-winning" data-seat="1"/.test(html));assert.ok(html.includes('阿豪，本手彩池得主'));assert.ok(html.includes('aria-live="polite">本手完成'));assert.ok(!html.includes('pk-winner-badge'));assert.equal(JSON.stringify(g),before);
 const folded=setup([{total:100,street:100,folded:true},{total:200,street:200}],{});folded.finishPoker(false);settle(folded);const f=view(folded);assert.deepEqual([...f.matchAll(/data-winner-seat="(\d)"/g)].map(m=>Number(m[1])),[1]);assert.ok(!f.includes('aria-label="Q♠"'));assert.ok(!f.includes('aria-label="Q♥"'));
});
test('all tied and side-pot winning opponents get frames; player wins and uncalled refunds get no opponent mark',()=>{
 const tied=setup(Array.from({length:6},(_,i)=>({total:i<3?100:0,street:i<3?100:0,folded:i>=3,cards:cards(['2h 3h','4h 5h','6h 7h','8h 9h','Th Jh','Qh Kh'][i])})),{});tied.round.board=cards('As Ks Qs Js Ts');tied.finishPoker(true);settle(tied);assert.deepEqual([...view(tied).matchAll(/data-winner-seat="(\d)"/g)].map(m=>Number(m[1])),[1,2]);
 const g=setup([{total:100,street:100,cards:cards('As Ah')},{total:300,street:300,cards:cards('Ks Kh')},{total:500,street:500,cards:cards('Qs Qh')},{total:300,street:300,folded:true}],{});g.round.board=cards('2s 3h 6d 7c 9c');g.finishPoker(true);settle(g);assert.equal(g.round.result.payouts[2],200);assert.deepEqual([...view(g).matchAll(/data-winner-seat="(\d)"/g)].map(m=>Number(m[1])),[1]);g.newRound();assert.ok(!view(g).includes('data-winner-seat='));
});
test('last seat bet lands before collection, with no early payout or save and a pausable 600ms hold',()=>{
 const g=setup([{total:100,street:100},{total:100,street:100,folded:true}],{});g.continuePoker(0);assert.equal(g.round.phase,'poker-collect');assert.equal(g.round.players[0].street,100);assert.equal(g.round.remaining,600);g.tick(599);const bank=g.profile.bank;g.paused=true;g.tick(5000);assert.equal(g.round.remaining,1);assert.equal(g.checkpoint,null);g.paused=false;g.tick(1);assert.equal(g.round.phase,'poker-showdown');assert.equal(g.round.players[0].street,0);assert.equal(g.profile.bank,bank);assert.equal(g.checkpoint,null);g.tick(1600);assert.equal(g.round.phase,'settled');assert.equal(g.profile.bank,bank+200);assert.ok(g.round.motions.some(m=>m.to==='poker-pot'));assert.ok(g.round.motions.some(m=>m.from==='poker-pot'&&m.to==='poker-stack-0'));
});
test('2,000 mixed six-seat hands conserve every cent through side pots, coupons and reloads',()=>{
 const random=seeded(103);let g=game(10000,random),hands=0,showdowns=0,sidePots=0;for(;hands<2000;hands++){
   if(g.profile.status!=='active')g=game(10000,random);else if(g.round.phase==='settled')g.newRound();
   g.setPokerSpeed('fast');const total=g.round.players.reduce((n,p)=>n+p.stack,0);g.profile.inventory={protect:1,peek:1,swap:1,reroll:0};if(hands%4===0)g.usePokerItem('protect');g.startPoker();let guard=0;
   while(g.round.phase!=='settled'){assert.ok(++guard<1500,`hand ${hands} ${g.round.phase}`);const r=g.round;
     assert.equal(r.players.reduce((n,p)=>n+p.stack+p.total,0),total);assert.equal(g.profile.bank,r.players[0].stack);assert.ok(r.players.every(p=>Number.isSafeInteger(p.stack)&&p.stack>=0));assert.equal(new Set([...r.players.flatMap(p=>p.cards),...r.board,...r.burn,...r.discard]).size,r.cursor);
     if(r.phase==='poker-player'){const o=pokerOptions(g),roll=random(10);if(!r.used&&hands%7===0&&o.swap)g.usePokerItem('swap',random(2));else if(!r.used&&hands%5===0&&o.peek){const target=r.players.findIndex((p,i)=>i>0&&!p.folded);g.usePokerItem('peek',target);}else if(o.allIn&&roll===0)g.pokerAction('all-in');else if(o.raise&&roll<3)g.pokerAction('raise',Math.min(o.maxTo,o.minTo));else if(o.check)g.pokerAction('check');else if(roll<8)g.pokerAction('call');else g.pokerAction('fold');}
     else g.tick(r.remaining||1);
   }
   if(g.round.board.length===5)showdowns++;if(g.round.result.pots.filter(p=>!p.uncalled).length>1)sidePots++;assert.equal(g.round.players.reduce((n,p)=>n+p.stack,0),total+g.round.result.refund);assert.equal(g.round.result.payouts.reduce((a,b)=>a+b,0),g.round.result.total);assert.equal(g.profile.bank,g.round.players[0].stack);assert.deepEqual(validateSave(g.checkpoint).pokerTable,g.pokerTable);assert.equal(g.profile.status,g.profile.bank>=2500000000?'won':g.profile.bank===0?'lost':'active');
 }
 assert.equal(hands,2000);assert.ok(showdowns>200,`showdowns ${showdowns}`);assert.ok(sidePots>50,`side pots ${sidePots}`);
});
