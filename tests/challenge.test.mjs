import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.mjs';
import {validateSave,Saves} from '../src/storage.mjs';
import {cashAdd,cashSub,cashRatio,cashEncode,cashParse,cashDollars,parseDollars} from '../src/cash.mjs';
import {money,settleBets} from '../src/rules.mjs';
import {settleBaccaratRound} from '../src/baccarat.mjs';
import {settleBlackjackRound} from '../src/blackjack.mjs';
import {pokerOptions,pokerPots} from '../src/poker.mjs';
import {settleRouletteRound} from '../src/roulette.mjs';
import {challengeResultView} from '../src/challenge.mjs';
function setup(kind=null){let seed=29,index=0;const saves=[],g=new Game({challenge:true,roll:()=>[2,3,4][index++%3],randomIndex:n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);},onComplete:s=>saves.push(s)});g.start('挑戰測試','free');if(kind)g.enterTable(kind);return {g,saves};}
function close(g){for(let n=0;g.profile.status==='active';n++){assert.ok(n<2000,`${g.activeTable} ${g.round?.phase}`);g.tick(g.round?.remaining||1);}assert.equal(g.profile.status,'finished');assert.equal(g.closing,false);return g;}
function toPhase(g,phases){for(let n=0;!phases.includes(g.round.phase);n++){assert.ok(n<2000,g.round.phase);g.tick(g.round.remaining||1);}}
function prefixShoe(g,cards){const shoe=g.blackjackShoe;shoe.cards=[...cards,...Array.from({length:312},(_,i)=>i).filter(i=>!cards.includes(i))];shoe.cursor=0;}
function funds(g,amount){g.profile.bank=amount;g.profile.stats.sicbo={rounds:1,net:cashSub(amount,10000)};g.profile.rounds=1;}
const plain=x=>JSON.stringify(cashEncode(x));
test('new local challenge starts at $100 with all five zeroed statistics and no old goal cutoff',()=>{
 const {g}=setup('sicbo');assert.equal(g.profile.bank,10000);assert.equal(g.remainingMs,300000);assert.equal(g.profile.ruleset,'five-minute-v1');assert.equal(Object.keys(g.profile.stats).length,5);assert.ok(Object.values(g.profile.stats).every(s=>s.rounds===0&&s.net===0));funds(g,2500000000);g.newRound();g.addBet('small',100);g.lock();g.tick(900);assert.equal(g.profile.status,'active');assert.equal(g.profile.bank,2500000100);assert.equal(validateSave(g.checkpoint).schema,2);
});
test('lobby expires at exactly 300 seconds even with no completed wagers, once only',()=>{
 const {g,saves}=setup();g.tick(299999.5);assert.equal(g.remainingMs,.5);assert.equal(saves.length,0);assert.equal(g.tick(.5),true);assert.equal(g.profile.endReason,'timeout');assert.equal(g.profile.elapsedMs,300000);assert.equal(g.profile.rounds,0);assert.equal(saves.length,1);assert.equal(validateSave(g.checkpoint).profile.bank,10000);g.tick(999999);assert.equal(saves.length,1);assert.equal(g.enterTable(),false);
});
test('shop time counts and item spending reconciles separately from the table results',()=>{
 const {g,saves}=setup();g.tick(1000);g.shop();assert.equal(g.buy('protect'),1000);g.tick(299000);assert.equal(g.profile.status,'finished');assert.equal(g.profile.bank,9000);assert.equal(g.profile.itemsSpent,1000);assert.ok(Object.values(g.profile.stats).every(s=>s.net===0));assert.equal(saves.length,1);validateSave(g.checkpoint);assert.equal(g.buy('peek'),false);
});
test('manual/background pause freezes both clocks, bankroll, cards and used items, then keeps the original seconds',()=>{
 const {g}=setup('sicbo');g.addBet('small',500);g.tick(18000);g.paused=true;const before=plain(g);g.tick(900000);assert.equal(plain(g),before);assert.equal(g.round.remaining,12000);assert.equal(g.addBet('small',500),false);g.paused=false;g.tick(1000);assert.equal(g.round.remaining,11000);assert.equal(g.remainingMs,281000);
});
test('deadline locks an existing bet and preserves the animation; all-in zero is not bust before payout',()=>{
 const {g,saves}=setup();g.tick(299500);g.enterTable('sicbo');g.addBet('small',10000);g.tick(500);assert.equal(g.closing,true);assert.equal(g.profile.bank,0);assert.equal(g.profile.status,'active');assert.equal(g.round.phase,'revealing');assert.equal(g.round.remaining,900);assert.equal(g.addBet('big',100),false);assert.equal(g.clearBets(),false);assert.equal(g.newRound(),false);assert.equal(g.leaveTable(),false);assert.equal(g.chooseReroll(),false);assert.equal(saves.length,0);g.tick(899);assert.equal(g.profile.elapsedMs,300000);g.paused=true;g.tick(1000);assert.equal(g.round.remaining,1);g.paused=false;g.tick(1);assert.equal(g.profile.bank,20000);assert.deepEqual(g.profile.stats.sicbo,{rounds:1,net:10000});assert.equal(g.profile.endReason,'timeout');assert.equal(saves.length,1);assert.equal(g.settle(),false);assert.equal(saves.length,1);
});
test('empty expired tables never create a fake hand, payout or extra statistic',()=>{
 for(const kind of ['sicbo','baccarat','blackjack','poker','roulette']){const {g,saves}=setup(kind);g.tick(300000);assert.equal(g.profile.status,'finished',kind);assert.equal(g.profile.rounds,0,kind);assert.equal(g.profile.bank,10000,kind);assert.equal(saves.length,1);validateSave(g.checkpoint);}
});
test('bust is assessed after the complete loss settlement and does not restart',()=>{
 const {g,saves}=setup('sicbo');g.addBet('big',10000);g.lock();assert.equal(g.profile.status,'active');g.tick(900);assert.equal(g.profile.endReason,'bust');assert.equal(g.profile.elapsedMs,900);assert.deepEqual(g.profile.stats.sicbo,{rounds:1,net:-10000});assert.equal(saves.length,1);assert.equal(g.newRound(),false);
});
test('Sic Bo deadline accepts original reroll result and consumes the ticket once',()=>{
 const {g}=setup('sicbo');g.profile.inventory.reroll=1;g.addBet('small',100);g.lock();g.tick(900);assert.equal(g.round.phase,'reroll');const dice=[...g.round.dice];g.profile.elapsedMs=299999;g.tick(1);assert.equal(g.profile.status,'finished');assert.deepEqual(g.round.dice,dice);assert.equal(g.profile.inventory.reroll,0);assert.equal(g.profile.stats.sicbo.rounds,1);validateSave(g.checkpoint);
});
test('roulette deadline accepts the existing pocket with no extra random respin',()=>{
 const {g}=setup('roulette');g.profile.inventory.reroll=1;g.useRouletteItem('reroll');g.addBet('rou-red',100);g.lock();g.tick(4800);assert.equal(g.round.phase,'rou-reroll');const outcome=g.round.outcome;g.profile.elapsedMs=299999;g.tick(1);assert.equal(g.round.outcome,outcome);assert.equal(g.round.rerolls,0);assert.equal(g.profile.inventory.reroll,0);assert.equal(g.profile.stats.roulette.rounds,1);validateSave(g.checkpoint);
});
test('baccarat deadline keeps the original replacement choice and automatically opens squeeze cards',()=>{
 const {g}=setup('baccarat');g.profile.inventory.swap=1;g.baccaratShoe.cards=[0,13,2,15,4,5,...Array.from({length:416},(_,i)=>i).filter(i=>![0,13,2,15,4,5].includes(i))];g.baccaratShoe.cursor=0;g.newBaccaratRound();g.useItem('swap');g.addBet('bac-player',100);g.lock();toPhase(g,['swapping']);const initial=[...g.round.initial];g.profile.elapsedMs=299999;g.tick(1);close(g);assert.deepEqual(g.round.initial,initial);assert.equal(g.profile.stats.baccarat.rounds,1);assert.equal(g.round.squeeze,null);assert.equal(g.profile.inventory.swap,0);validateSave(g.checkpoint);
});
test('blackjack deadline declines insurance and stands without extra stakes',()=>{
 const {g}=setup('blackjack');prefixShoe(g,[8,0,5,9]);g.addBet('bj-main',1000);g.lock();toPhase(g,['bj-insurance']);g.tick(g.remainingMs);close(g);assert.equal(g.round.insurance,0);assert.equal(g.round.result.stake,1000);assert.equal(g.profile.stats.blackjack.rounds,1);validateSave(g.checkpoint);
});
test('blackjack deadline stands all split hands without adding another split or double',()=>{
 const {g}=setup('blackjack');prefixShoe(g,[7,4,20,9,2,3]);g.addBet('bj-main',1000);g.lock();toPhase(g,['bj-player']);assert.ok(g.blackjackAction('split'));toPhase(g,['bj-player']);assert.equal(g.round.hands.length,2);g.tick(g.remainingMs);close(g);assert.equal(g.round.hands.length,2);assert.equal(g.round.result.stake,2000);assert.equal(g.profile.stats.blackjack.rounds,1);validateSave(g.checkpoint);
});
test('poker deadline uses check or fold, completes collection and pays one six-seat hand once',()=>{
 const {g,saves}=setup('poker');g.startPoker();toPhase(g,['poker-player']);const bank=g.profile.bank;g.profile.elapsedMs=299999;g.tick(1);assert.equal(g.pokerAction('all-in'),false);close(g);assert.ok(g.profile.bank>=bank||g.round.result.returned===0);assert.equal(g.profile.stats.poker.rounds,1);assert.equal(g.profile.stats.poker.net,g.round.result.net);assert.equal(saves.length,1);const before=plain(g);g.tick(100000);assert.equal(plain(g),before);validateSave(g.checkpoint);
});
test('completed-hand save preserves remaining time and statistics in isolated v2 slots',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)},saves=new Saves(storage,{challenge:true});const {g}=setup('sicbo');g.addBet('small',100);g.lock();g.tick(900);saves.write(g.checkpoint);const saved=saves.read('free');assert.equal(saved.profile.elapsedMs,900);assert.equal(saved.profile.stats.sicbo.net,100);const h=new Game({challenge:true});h.restore(saved);assert.equal(h.remainingMs,299100);assert.equal(h.screen,'lobby');assert.deepEqual(h.profile.stats,g.profile.stats);h.tick(1000);assert.equal(h.remainingMs,298100);assert.ok(saves.key('free').includes('five-minute-v2'));
 const old=new Game();old.start('舊玩家','free');old.enterTable();old.addBet('small',100);old.lock();old.tick(900);const legacy=new Saves(storage);legacy.write(old.checkpoint);const raw=map.get(legacy.key('free'));assert.equal(saves.readLegacy('free').schema,1);assert.throws(()=>h.restore(old.checkpoint),/舊版/);assert.equal(map.get(legacy.key('free')),raw);assert.throws(()=>saves.write(old.checkpoint));
});
test('v2 validation rejects reset time, inconsistent wallet/stats and malformed precision without changing input',()=>{
 const {g}=setup();g.tick(300000);const valid=cashEncode(g.checkpoint);for(const change of [p=>p.elapsedMs=300001,p=>p.bank+=1,p=>p.stats.poker.rounds=1,p=>p.stats.sicbo.net='NaN',p=>p.endReason=null]){const bad=structuredClone(valid);change(bad.profile);const before=JSON.stringify(bad);assert.throws(()=>validateSave(bad));assert.equal(JSON.stringify(bad),before);}assert.equal(validateSave(valid).profile.elapsedMs,300000);
});
test('huge all-in winnings remain exact beyond Number precision and round-trip through JSON saves',()=>{
 const {g}=setup('sicbo'),amount=10n**25n+1n;funds(g,amount);g.round.dice=[2,2,2];assert.equal(g.addBet('triple-2',amount),true);g.lock();g.tick(900);assert.equal(g.profile.bank,amount*151n);assert.equal(g.profile.status,'active');const clean=validateSave(JSON.parse(plain(g.checkpoint)));assert.equal(clean.profile.bank,amount*151n);assert.equal(money(clean.profile.bank),'$15,100,000,000,000,000,000,000,001.51');assert.equal(parseDollars(cashDollars(amount)),amount);assert.equal(parseDollars('1e40'),null);assert.equal(g.addBet('small',Number.MAX_SAFE_INTEGER+1),false);
});
test('all five payout engines and poker odd cents conserve exact huge integer cents',()=>{
 const n=10n**23n+1n;assert.equal(settleBets({'triple-2':n},[2,2,2]).returned,n*151n);assert.equal(settleRouletteRound({'rou-number-7':n},'7').returned,n*36n);
 const bac=settleBaccaratRound({'bac-banker':n},{winner:'banker',playerTotal:2,bankerTotal:7,player:[0,1],banker:[2,3]});assert.equal(bac.returned,n+n*95n/100n);
 const bj=settleBlackjackRound({hands:[{id:'bj-main',bet:n,cards:[0,9],status:'blackjack'}],dealer:[7,8],insurance:0,originalBet:n,used:null});assert.equal(bj.returned,n+n*3n/2n);
 const players=Array.from({length:6},(_,i)=>({total:i<3?n:0,cards:[i+1,i+14],folded:i>=3}));const result=pokerPots(players,[0,9,10,11,12],0);assert.equal(result.total,n*3n);assert.equal(result.payouts.reduce((a,b)=>cashAdd(a,b),0),n*3n);
});
test('result view includes all five table counts and signed net winnings, with escaped name and no ranking upload',()=>{
 const {g}=setup('sicbo');g.profile.name='<測試>';g.addBet('small',100);g.lock();g.tick(900);g.tick(g.remainingMs);const before=plain(g),h=challengeResultView({game:g,button:(a,t)=>`<button data-action="${a}">${t}</button>`,escape:s=>s.replaceAll('<','&lt;').replaceAll('>','&gt;')});assert.equal((h.match(/data-stat-table=/g)||[]).length,5);assert.ok(h.includes('&lt;測試&gt;'));assert.ok(h.includes('+$1'));assert.ok(h.includes('道具購買支出'));assert.ok(!h.includes('上傳'));assert.equal(plain(g),before);
});

test('all five table views, chip layers and amount inputs render huge cents without Number coercion',async()=>{
 const opts=g=>({game:g,art:p=>p,button:(a,t,c='',e='')=>`<button data-action="${a}" ${e}>${t}</button>`,icon:()=>'',chip:100,allIn:true,storageWarning:'',peekIndex:0,peekSide:'player',boardZoom:false,preciseBet:'small',mobile:true});
 const n=10n**24n+1n;
 for(const [kind,file,fn] of [['sicbo','sicbo-view','sicboTableView'],['baccarat','baccarat-view','baccaratTableView'],['blackjack','blackjack-view','blackjackTableView'],['poker','poker-view','pokerTableView'],['roulette','roulette-view','rouletteTableView']]){const {g}=setup();funds(g,n);g.enterTable(kind);const module=await import('../src/'+file+'.mjs');const h=module[fn](opts(g));assert.ok(h.includes(kind==='poker'?money(n):cashDollars(n)),kind);}
 const {boardAmounts,ChipFlights}=await import('../src/board.mjs');assert.ok(boardAmounts({small:n},{},p=>p).includes(money(n)));const flights=new ChipFlights({art:p=>p,onChange:()=>{},reduced:()=>false});flights.queue('small',n,null);flights.queue('small',100,null);assert.equal(flights.pending.small,n+100n);
});
test('500 mixed five-minute sessions keep exact per-table totals, shop costs, timeout saves and one final result',()=>{
 let seed=77,completed=0;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
 for(let run=0;run<500;run++){let finals=0;const g=new Game({challenge:true,randomIndex:random,roll:()=>1+random(6),onComplete:s=>{validateSave(s);if(s.profile.status==='finished')finals++;}});g.start('模擬','race');let guard=0;
  while(g.profile.status==='active'){assert.ok(++guard<6000,`${run} ${g.round?.phase}`);if(g.closing){g.tick(g.round.remaining||1);continue;}
   if(g.screen==='lobby'){if(run%9===0&&g.profile.bank>100&&g.profile.inventory.protect===0){g.shop();g.buy('protect');g.tick(300);g.screen='lobby';if(g.profile.status!=='active')break;}g.enterTable(['sicbo','baccarat','blackjack','poker','roulette'][random(5)]);}
   const r=g.round;if(r.phase==='settled'){completed++;g.leaveTable();g.tick(300);continue;}
   if(r.phase==='betting'){const id={sicbo:'small',baccarat:'bac-player',blackjack:'bj-main',roulette:'rou-red'}[g.activeTable];g.addBet(id,cashMinTest(g.profile.bank,100));if(g.profile.inventory.protect)g.useItem('protect');g.lock();}
   else if(r.phase==='poker-ready')g.startPoker();else if(r.phase==='poker-player')g.pokerAction(pokerOptions(g).check?'check':'fold');else if(r.phase==='bj-player')g.blackjackAction('stand');else if(r.phase==='bj-insurance')g.chooseBlackjackInsurance();else if(r.phase==='squeezing')g.finishBaccaratSqueeze();else if(r.phase==='swapping')g.chooseBaccaratSwap();else if(r.phase==='reroll')g.chooseReroll();else if(r.phase==='rou-reroll')g.chooseRouletteReroll();
   g.tick(Math.min(g.round?.remaining||200,1000));
  }
  assert.equal(finals,1);assert.equal(g.profile.rounds,Object.values(g.profile.stats).reduce((n,s)=>n+s.rounds,0));assert.equal(g.profile.bank,cashSub(cashAdd(10000,...Object.values(g.profile.stats).map(s=>s.net)),g.profile.itemsSpent));assert.ok(g.profile.elapsedMs<=300000);validateSave(g.checkpoint);
 }
 assert.ok(completed>1000);
});
function cashMinTest(a,b){return a<b?a:b;}
test('huge live poker stacks, all-in pots and completed-hand saves retain every cent across reload',()=>{
 const {g}=setup(),n=10n**22n+1n;funds(g,n);g.enterTable('poker');g.startPoker();let guard=0;
 while(g.round.phase!=='settled'&&g.profile.status==='active'){assert.ok(++guard<2000);if(g.round.phase==='poker-player'){const o=pokerOptions(g);g.pokerAction(o.allIn?'all-in':o.check?'check':'call');}else g.tick(g.round.remaining||1);}
 assert.equal(g.profile.stats.poker.rounds,1);const clean=validateSave(JSON.parse(plain(g.checkpoint))),h=new Game({challenge:true});h.restore(clean);assert.equal(h.profile.bank,g.profile.bank);assert.deepEqual(h.pokerTable,g.pokerTable);assert.ok(h.pokerTable.seats.some(s=>typeof s.stack==='bigint'));
});
