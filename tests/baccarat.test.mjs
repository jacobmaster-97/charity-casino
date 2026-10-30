import test from 'node:test';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Game} from '../src/game.mjs';
import {GOAL,ITEMS} from '../src/rules.mjs';
import {validateSave,Saves} from '../src/storage.mjs';
import {BACCARAT_BETS,makeBaccaratShoe,validateBaccaratShoe,cardValue,baccaratPoints,bankerTakesCard,completeBaccaratHand,settleBaccaratBet} from '../src/baccarat.mjs';
import {baccaratTableView,baccaratCard} from '../src/baccarat-view.mjs';
import {baccaratBoardMarkup,boardAmounts} from '../src/board.mjs';
const point=(n,deck=0)=>(n===0?9:n-1)+deck*52;
function fixture(first=[0,7,1,12]){const cards=[...first,...Array.from({length:416},(_,i)=>i).filter(c=>!first.includes(c))];assert.equal(new Set(cards).size,416);return {cards,cursor:0,cycle:1};}
function setup(first,mode='race'){const checkpoints=[],game=new Game({randomIndex:max=>max-1,onComplete:s=>checkpoints.push(s)});game.start('百家樂測試',mode);game.baccaratShoe=fixture(first);game.enterTable('baccarat');return {game,checkpoints};}
function finish(game){game.lock();game.tick(3000);}
test('eight-deck shoe is a 416-card permutation and corrupt/duplicate cards are rejected',()=>{
 const shoe=makeBaccaratShoe();assert.equal(shoe.cards.length,416);assert.equal(new Set(shoe.cards).size,416);assert.deepEqual(validateBaccaratShoe(shoe),shoe);
 const ranks=Array(13).fill(0);shoe.cards.forEach(c=>ranks[c%13]++);assert.deepEqual(ranks,Array(13).fill(32));
 for(const bad of [{...shoe,cursor:-1},{...shoe,cursor:417},{...shoe,cycle:0},{...shoe,cards:Array(416).fill(0)},{...shoe,cards:shoe.cards.slice(1)}])assert.throws(()=>validateBaccaratShoe(bad));
});
test('card points distinguish A, face cards and modulo-ten totals',()=>{assert.equal(cardValue(0),1);for(const c of [9,10,11,12])assert.equal(cardValue(c),0);assert.equal(baccaratPoints([8,7]),7);});
test('all banker third-card rules match the confirmed table, including player third zero',()=>{
 const table={0:[0,1,2,3,4,5,6,7,8,9],1:[0,1,2,3,4,5,6,7,8,9],2:[0,1,2,3,4,5,6,7,8,9],3:[0,1,2,3,4,5,6,7,9],4:[2,3,4,5,6,7],5:[4,5,6,7],6:[6,7],7:[],8:[],9:[]};
 for(let b=0;b<10;b++){assert.equal(bankerTakesCard(b,null),b<=5);for(let p=0;p<10;p++)assert.equal(bankerTakesCard(b,p),table[b].includes(p),`${b}/${p}`);}
});
test('10,000 initial-total and supplemental-point combinations honor naturals and draw order',()=>{
 for(let p=0;p<10;p++)for(let b=0;b<10;b++)for(let third=0;third<10;third++)for(let fourth=0;fourth<10;fourth++){
  const values=[third,fourth];let draws=0;const hand=completeBaccaratHand([point(p),point(b,1),point(0,2),point(0,3)],()=>point(values[draws++],4));
  const natural=p>=8||b>=8,playerDraw=!natural&&p<=5;
  const bankerDraw=!natural&&(playerDraw?(b<=2||b===3&&third!==8||b===4&&third>=2&&third<=7||b===5&&third>=4&&third<=7||b===6&&(third===6||third===7)):b<=5);
  assert.equal(draws,Number(playerDraw)+Number(bankerDraw));assert.equal(hand.playerTotal,(p+(playerDraw?third:0))%10);assert.equal(hand.bankerTotal,(b+(bankerDraw?(playerDraw?fourth:third):0))%10);assert.equal(hand.natural,natural);
 }
});
test('player/banker/tie payouts, push and cent rounding conserve funds with protection',()=>{
 const hand=winner=>({winner,playerTotal:3,bankerTotal:8});
 assert.equal(settleBaccaratBet({'bac-player':100},hand('player')).net,100);assert.equal(settleBaccaratBet({'bac-banker':100},hand('banker')).net,95);
 const odd=settleBaccaratBet({'bac-banker':101},hand('banker'));assert.equal(odd.returned,196);assert.equal(odd.commission,6);
 assert.equal(settleBaccaratBet({'bac-tie':100},hand('tie')).net,800);
 for(const id of ['bac-player','bac-banker']){const result=settleBaccaratBet({[id]:101},hand('tie'),true);assert.equal(result.net,0);assert.equal(result.refund,0);assert.equal(result.returned,101);}
 const loss=settleBaccaratBet({'bac-tie':101},hand('banker'),true);assert.equal(loss.refund,50);assert.equal(loss.net,-51);
 assert.throws(()=>settleBaccaratBet({'bac-player':100,'bac-banker':100},hand('tie')));
});
test('single-target chips accumulate; changing target moves original total, even all-in',()=>{
 const {game}=setup();game.addBet('bac-player',1000);game.addBet('bac-player',9000);assert.equal(game.available,0);
 assert.equal(game.addBet('bac-banker',0),'moved');assert.deepEqual(game.round.bets,{'bac-banker':10000});assert.equal(game.stake,10000);assert.equal(game.profile.bank,10000);
 assert.equal(game.addBet('small',100),false);assert.equal(game.addBet('bac-banker',100),false);assert.equal(game.addBet('bad',100),false);
 game.clearBets();assert.equal(game.addBet('bac-player',NaN),false);assert.equal(game.addBet('bac-player',99),false);
});
test('initial cards remain hidden until alternating reveal; bank zero is not early gameover',()=>{
 const {game,checkpoints}=setup();game.addBet('bac-banker',10000);game.lock();assert.equal(game.profile.bank,0);assert.equal(game.profile.status,'active');assert.equal(game.round.revealed,0);assert.equal(game.baccaratShoe.cursor,4);
 game.tick(400);assert.equal(game.round.revealed,1);assert.equal(checkpoints.length,0);game.tick(1200);assert.equal(game.round.phase,'settled');assert.equal(game.profile.bank,19500);assert.equal(checkpoints.length,1);
 const bank=game.profile.bank;assert.equal(game.settle(),false);assert.equal(game.profile.bank,bank);
});
test('peek requires a bet, exposes only a real point, permits moving bets and never reshuffles',()=>{
 const {game}=setup();game.profile.inventory.peek=1;assert.equal(game.useItem('peek','banker'),false);assert.equal(game.profile.inventory.peek,1);
 game.addBet('bac-player',500);const initial=[...game.round.initial];game.tick(18000);assert.ok(game.useItem('peek','banker'));assert.deepEqual(game.round.peek,{side:'banker',index:1,value:0});assert.equal(game.round.remaining,12000);
 assert.equal(game.useItem('protect'),false);assert.equal(game.addBet('bac-banker',500),'moved');assert.deepEqual(game.round.initial,initial);finish(game);assert.equal(game.profile.bank,10475);assert.equal(game.round.phase,'settled');
});
test('reroll possession alone cannot trigger a baccarat item branch or consume the voucher',()=>{
 const {game}=setup();game.profile.inventory.reroll=2;game.profile.inventory.swap=1;assert.equal(game.useItem('reroll'),false);game.addBet('bac-player',100);finish(game);assert.equal(game.round.phase,'settled');assert.equal(game.profile.inventory.reroll,2);assert.equal(game.profile.inventory.swap,1);
});
test('swap is charged before lock; replaced natural is discarded and standard supplements rerun',()=>{
 const {game,checkpoints}=setup([0,7,1,12,2,3,4]);game.profile.inventory.swap=1;game.addBet('bac-banker',1000);assert.ok(game.useItem('swap'));assert.equal(game.profile.inventory.swap,0);assert.equal(game.useItem('protect'),false);game.lock();game.tick(1600);
 assert.equal(game.round.phase,'swapping');assert.equal(checkpoints.length,0);assert.equal(game.round.remaining,10000);assert.equal(game.chooseBaccaratSwap(4),false);assert.ok(game.chooseBaccaratSwap(1));assert.deepEqual(game.round.discard,[7]);assert.equal(game.baccaratShoe.cursor,7);assert.deepEqual(game.round.cards,{player:[0,1,3],banker:[2,12,4]});assert.equal(game.chooseBaccaratSwap(0),false);
 game.tick(800);assert.equal(game.round.phase,'settled');assert.equal(game.profile.bank,10950);assert.equal(checkpoints.length,1);
});
test('swap can create a natural; then neither side draws extra cards',()=>{
 const {game}=setup([0,1,2,3,4]);game.profile.inventory.swap=1;game.addBet('bac-player',1000);game.useItem('swap');game.lock();game.tick(1600);game.chooseBaccaratSwap(0);assert.ok(game.round.final.natural);assert.equal(game.baccaratShoe.cursor,5);assert.equal(game.profile.bank,11000);
});
for(const choice of ['accept','timeout'])test(`swap ${choice} keeps cards, consumes once and does not use a hidden extra card`,()=>{
 const {game}=setup();game.profile.inventory.swap=2;game.useItem('swap');game.addBet('bac-banker',1000);game.lock();game.tick(1600);if(choice==='accept')game.chooseBaccaratSwap();else game.tick(10000);
 assert.equal(game.round.phase,'settled');assert.equal(game.profile.inventory.swap,1);assert.equal(game.baccaratShoe.cursor,4);assert.deepEqual(game.round.discard,[]);
});
test('no-stake timeout burns reserved four cards but changes neither money nor checkpoint',()=>{
 const {game,checkpoints}=setup();game.profile.inventory.swap=1;game.useItem('swap');game.tick(30000);assert.equal(game.profile.bank,10000);assert.equal(game.profile.rounds,0);assert.equal(checkpoints.length,0);assert.equal(game.baccaratShoe.cursor,4);assert.equal(game.profile.inventory.swap,0);assert.equal(game.round.used,null);assert.equal(game.round.remaining,30000);
});
test('pause freezes dealing and the exact remaining swap seconds; no actions can advance',()=>{
 const {game}=setup();game.profile.inventory.swap=1;game.addBet('bac-player',100);game.useItem('swap');game.lock();game.tick(600);assert.equal(game.round.remaining,200);game.paused=true;const elapsed=game.profile.elapsedMs;game.tick(30000);assert.equal(game.round.revealed,1);assert.equal(game.revealBaccaratCard(),false);assert.equal(game.profile.elapsedMs,elapsed);
 game.paused=false;game.tick(1000);assert.equal(game.round.phase,'swapping');game.tick(4000);game.paused=true;game.tick(30000);assert.equal(game.round.remaining,6000);assert.equal(game.chooseBaccaratSwap(0),false);game.paused=false;game.tick(1000);assert.equal(game.round.remaining,5000);
});
test('low-bankroll all-in, protection and victory are decided only at final settlement',()=>{
 const {game}=setup();game.profile.bank=37;game.round=null;game.newRound();game.profile.inventory.protect=1;game.useItem('protect');assert.equal(game.addBet('bac-player',36),false);assert.ok(game.addBet('bac-player',37));finish(game);assert.equal(game.profile.bank,18);assert.equal(game.profile.status,'active');
 const winning=setup([0,1,7,6]).game;winning.profile.bank=GOAL-100;winning.addBet('bac-tie',100);finish(winning);assert.equal(winning.profile.status,'won');assert.equal(winning.profile.bank,GOAL+700);
});
test('continuous shoe survives leaving, switching tables and completed checkpoint import',()=>{
 const {game}=setup();game.addBet('bac-banker',100);finish(game);const saved=validateSave(game.checkpoint);assert.equal(saved.baccaratShoe.cursor,4);const pending=[...saved.baccaratShoe.cards.slice(4,8)];game.newRound();assert.deepEqual(game.round.initial,pending);game.addBet('bac-player',100);game.lock();
 const restored=new Game();restored.restore(saved);assert.equal(restored.screen,'lobby');assert.equal(restored.round,null);assert.equal(restored.baccaratShoe.cursor,4);restored.enterTable('sicbo');restored.addBet('small',100);restored.lock();restored.tick(900);assert.equal(restored.checkpoint.baccaratShoe.cursor,4);restored.leaveTable();restored.enterTable('baccarat');assert.deepEqual(restored.round.initial,pending);
});
test('old schema-1 saves load with no free swap voucher; bad shoe imports are rejected',()=>{
 const {game}=setup();game.addBet('bac-banker',100);finish(game);const old=structuredClone(game.checkpoint);delete old.baccaratShoe;delete old.profile.inventory.swap;const clean=validateSave(old);assert.equal(clean.profile.inventory.swap,0);assert.equal(clean.baccaratShoe,undefined);const restored=new Game();restored.restore(clean);restored.enterTable('baccarat');assert.equal(restored.profile.inventory.swap,0);assert.equal(restored.baccaratShoe.cards.length,416);
 const bad=structuredClone(game.checkpoint);bad.baccaratShoe.cards[0]=bad.baccaratShoe.cards[1];assert.throws(()=>validateSave(bad));assert.throws(()=>validateSave({...old,profile:{...old.profile,inventory:{...old.profile.inventory,swap:-1}}}));
});
test('new swap voucher purchase uses current 10% price and shared item counts round-trip',()=>{
 const {game}=setup();game.leaveTable();game.shop();assert.equal(game.buy('swap'),1000);assert.equal(game.profile.inventory.swap,1);game.screen='lobby';game.enterTable('baccarat');game.addBet('bac-banker',100);finish(game);const data=new Map(),saves=new Saves({getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)});saves.write(game.checkpoint);assert.equal(saves.read('race').profile.inventory.swap,1);assert.equal(saves.read('race').baccaratShoe.cursor,4);assert.equal(saves.read('free'),null);
});
test('cut-card reshuffle happens between hands, never after information was revealed',()=>{
 const {game}=setup();game.baccaratShoe.cursor=356;game.round=null;game.newRound();assert.equal(game.baccaratShoe.cycle,1);game.addBet('bac-player',100);game.lock();game.tick(3000);assert.equal(game.baccaratShoe.cycle,1);game.newRound();assert.equal(game.baccaratShoe.cycle,2);assert.equal(game.baccaratShoe.cursor,0);
});
test('actual baccarat view keeps hidden ranks out of markup and includes the bottom controls',()=>{
 const {game}=setup();const art=p=>p,button=(a,t,c='',e='')=>`<button data-action="${a}" class="${c}" ${e}>${t}</button>`,options={game,art,button,icon:()=>'',chip:500,allIn:false,storageWarning:'',peekSide:'player'};
 let html=baccaratTableView(options);assert.ok(!html.includes('card-corner'));assert.ok(!html.includes('<aside'));assert.equal((html.match(/data-action="chip"/g)||[]).length,5);for(const action of ['roll','clear','use'])assert.ok(html.includes(`data-action="${action}"`));assert.equal((baccaratBoardMarkup(true).match(/data-action="bet"/g)||[]).length,3);
 game.profile.inventory.swap=1;game.addBet('bac-player',100);game.useItem('swap');game.lock();game.tick(1600);html=baccaratTableView(options);assert.equal((html.match(/data-action="swap-card"/g)||[]).length,4);assert.ok(html.includes('data-action="keep-cards"'));game.chooseBaccaratSwap();html=baccaratTableView(options);assert.ok(html.includes('data-action="next"'));assert.ok(!html.includes('data-action="roll"'));assert.ok(html.includes('aria-disabled="true"'));
 const hidden=baccaratCard(0,true,art);assert.ok(!hidden.includes('card-suit'));assert.ok(hidden.includes('cards.png'));assert.ok(!baccaratCard(13,true,art).includes('red-card'));assert.ok(baccaratCard(13,false,art).includes('red-card'));const overlay=boardAmounts({'bac-player':500},{},art);assert.ok(overlay.includes('已押 $5'));
});
test('2,000 real shuffled-shoe hands preserve balances, item limits and checkpoints across cuts',()=>{
 const game=new Game();game.start('長局驗證');game.profile.bank=100000000;game.profile.inventory={protect:10000,peek:10000,swap:10000,reroll:7};game.enterTable('baccarat');
 for(let i=0;i<2000;i++){
  const before=game.profile.bank,amount=100+i%1000;assert.ok(game.addBet(BACCARAT_BETS[i%3].id,amount));const item=['protect','peek','swap',null][i%4];if(item)assert.ok(game.useItem(item,'player'));
  game.lock();game.tick(1600);if(game.round.phase==='swapping')game.chooseBaccaratSwap(i%4);game.tick(1000);
  assert.equal(game.round.phase,'settled');assert.equal(game.profile.bank,before+game.round.result.net);assert.equal(game.profile.inventory.reroll,7);assert.equal(new Set(game.baccaratShoe.cards).size,416);assert.equal(game.settle(),false);
  if(i%100===0)assert.equal(validateSave(JSON.parse(JSON.stringify(game.checkpoint))).profile.bank,game.profile.bank);
  if(i<1999)assert.ok(game.newRound());
 }
 assert.equal(game.profile.rounds,2000);assert.ok(game.baccaratShoe.cycle>20);
});

test('lobby routes two playable tables and keeps the other three unavailable',async()=>{
 const source=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8'),definition=source.slice(source.indexOf('const stations='),source.indexOf('\nfunction die('));const game=new Game();game.start('入口');
 const button=(a,t,c='',e='')=>`<button data-action="${a}" ${e}>${t}</button>`;
 const render=new Function('game','button','icon','art','money','esc','GOAL','BACCARAT_ENABLED',definition+';return lobby();');
 const html=render(game,button,()=>'',p=>p,n=>String(n),s=>s,GOAL,true);assert.equal((html.match(/data-action="table"/g)||[]).length,2);assert.equal((html.match(/data-action="coming"/g)||[]).length,3);assert.ok(html.includes('data-table="baccarat"'));
 assert.equal((render(game,button,()=>'',p=>p,n=>String(n),s=>s,GOAL,false).match(/data-action="table"/g)||[]).length,1);assert.equal(game.enterTable('roulette'),false);
});
