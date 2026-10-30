import test from 'node:test';
import assert from 'node:assert/strict';
import {BETS,netRate,settleBets,GOAL,getChipDenominations,chipLabel} from '../src/rules.mjs';
import {Game} from '../src/game.mjs';
import {Saves,validateSave} from '../src/storage.mjs';

function setup(dice=[2,3,4],mode='race'){
  let i=0;const checkpoints=[];
  const game=new Game({roll:()=>dice[i++%dice.length],onComplete:s=>checkpoints.push(s)});
  game.start('試玩者',mode);game.enterTable();return {game,checkpoints};
}
function finish(game){game.lock();game.tick(900);}

test('all 50 betting options have valid payouts for all 216 outcomes',()=>{
  assert.equal(BETS.length,50);
  const ids=new Set(BETS.map(b=>b.id));assert.equal(ids.size,50);
  for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++){
    const dice=[a,b,c];
    for(const bet of BETS){const rate=netRate(bet.id,dice);assert.ok(rate===-1||rate>=1);assert.ok(Number.isInteger(rate));}
    const result=settleBets({small:100,big:100,'single-2':100},dice,true);
    assert.equal(result.net,result.returned+result.refund-result.stake);
  }
});
test('triples lose big and small, but total, pair, single and triple bets still win',()=>{
  const d=[2,2,2];
  assert.equal(netRate('small',d),-1);assert.equal(netRate('big',d),-1);
  assert.equal(netRate('single-2',d),3);assert.equal(netRate('double-2',d),10);
  assert.equal(netRate('triple-2',d),150);assert.equal(netRate('any-triple',d),24);
  assert.equal(netRate('total-6',d),14);assert.equal(netRate('pair-1-2',d),-1);
});
test('total odds and two-number combinations agree with confirmed table',()=>{
  for(const [n,rate] of Object.entries({4:50,5:18,6:14,7:12,8:8,9:6,10:6,11:6,12:6,13:8,14:12,15:14,16:18,17:50})){
    const candidate=[];outer:for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)for(let c=1;c<=6;c++)if(a+b+c===Number(n)){candidate.push(a,b,c);break outer;}
    assert.equal(netRate(`total-${n}`,candidate),rate);
  }
  assert.equal(netRate('pair-2-6',[2,6,6]),5);
});
test('multi-bet limits, undo, all-in under $1 and bankroll conservation',()=>{
  const {game}=setup();assert.equal(game.addBet('small',5000),true);
  assert.equal(game.available,5000);assert.equal(game.addBet('big',5001),false);
  assert.equal(game.addBet('big',50),false);assert.equal(game.undoBet('small'),true);
  game.profile.bank=37;assert.equal(game.addBet('small',36),false);assert.equal(game.addBet('small',37),true);
  finish(game);assert.equal(game.profile.bank,74);assert.equal(game.profile.status,'active');
});
test('no-stake expiry does not charge or checkpoint; spent item remains consumed',()=>{
  const {game,checkpoints}=setup();game.profile.inventory.protect=1;
  assert.equal(game.useItem('protect'),true);game.tick(30000);
  assert.equal(game.profile.bank,10000);assert.equal(game.profile.rounds,0);
  assert.equal(game.profile.inventory.protect,0);assert.equal(game.round.used,null);
  assert.equal(game.round.phase,'betting');assert.equal(game.round.remaining,30000);
  assert.equal(checkpoints.length,0);
});
test('pause freezes both timers and exact remainder resumes; shop is not timed',()=>{
  const {game}=setup();game.tick(18000);assert.equal(game.round.remaining,12000);
  game.paused=true;game.tick(90000);assert.equal(game.round.remaining,12000);assert.equal(game.profile.elapsedMs,18000);
  game.paused=false;game.tick(1000);assert.equal(game.round.remaining,11000);
  game.clearBets();game.leaveTable();game.shop();game.tick(20000);assert.equal(game.profile.elapsedMs,19000);
});
test('peek uses fixed die, permits changes and prevents other items or reroll branch',()=>{
  const {game}=setup([6,2,3]);game.profile.inventory={peek:1,protect:1,reroll:1};
  assert.equal(game.useItem('peek',0),true);assert.equal(game.round.peek.range,'高點 4–6');
  assert.equal(game.useItem('protect'),false);assert.equal(game.addBet('single-6',100),true);
  finish(game);assert.equal(game.round.phase,'settled');assert.deepEqual(game.round.dice,[6,2,3]);
  assert.equal(game.profile.inventory.reroll,1);assert.equal(game.profile.bank,10100);
});
test('protection refunds 50% of combined net loss, with cents rounded down',()=>{
  const {game}=setup([6,6,6]);game.profile.inventory.protect=1;game.useItem('protect');
  game.addBet('small',301);game.addBet('big',200);finish(game);
  assert.equal(game.round.result.refund,250);assert.equal(game.profile.bank,9749);
});
for(const choice of ['reroll','accept','timeout'])test(`reroll voucher consumption: ${choice}`,()=>{
  const {game,checkpoints}=setup([2,3,4,6]);game.profile.inventory.reroll=2;game.addBet('small',1000);finish(game);
  assert.equal(game.round.phase,'reroll');assert.equal(checkpoints.length,0);
  assert.equal(game.profile.inventory.reroll,2);
  if(choice==='reroll'){assert.equal(game.chooseReroll(0),true);assert.deepEqual(game.round.dice,[6,3,4]);}
  if(choice==='accept')game.chooseReroll();
  if(choice==='timeout')game.tick(10000);
  assert.equal(game.profile.inventory.reroll,1);assert.equal(checkpoints.length,1);
  const bank=game.profile.bank;assert.equal(game.chooseReroll(),false);assert.equal(game.settle(),false);assert.equal(game.profile.bank,bank);
});
test('full stake is not gameover until final result and protection apply',()=>{
  const {game}=setup([2,3,4]);game.addBet('small',10000);game.lock();assert.equal(game.profile.bank,0);assert.equal(game.profile.status,'active');game.tick(900);assert.equal(game.profile.bank,20000);
  const losing=setup([6,6,6]).game;losing.addBet('small',10000);finish(losing);assert.equal(losing.profile.status,'lost');assert.equal(losing.newRound(),false);
  const winning=setup([2,2,2]).game;winning.profile.bank=GOAL-100;winning.addBet('triple-2',100);finish(winning);assert.equal(winning.profile.status,'won');
});
test('buy recalculates 10%; checkpoints remain at the last completed round',()=>{
  const {game}=setup();game.leaveTable();game.shop();assert.equal(game.buy('peek'),1000);assert.equal(game.buy('protect'),900);
  assert.equal(game.profile.bank,8100);assert.equal(game.checkpoint,null);
  game.screen='lobby';game.enterTable();game.addBet('small',100);finish(game);
  const last=structuredClone(game.checkpoint);game.leaveTable();game.shop();game.buy('reroll');
  assert.deepEqual(game.checkpoint,last);assert.equal(game.checkpoint.profile.inventory.reroll,0);
});
test('reloading restores completed checkpoint, never unfinished stake, dice or item use',()=>{
  const {game}=setup();game.addBet('small',1000);finish(game);const snapshot=structuredClone(game.checkpoint);
  game.newRound();game.addBet('big',5000);game.lock();
  const fresh=new Game();fresh.restore(validateSave(snapshot));assert.equal(fresh.screen,'lobby');assert.equal(fresh.round,null);assert.equal(fresh.profile.bank,11000);
});
test('validated storage separates race/free, backs up writes and rejects corrupt data',()=>{
  const data=new Map(),store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},saves=new Saves(store);
  const {game}=setup();game.addBet('small',100);finish(game);const clean=game.checkpoint;
  saves.write(clean);assert.equal(saves.read('race').profile.bank,10100);assert.equal(saves.read('free'),null);
  saves.write(clean);assert.ok(data.get(saves.key('race')+'-backup'));
  assert.throws(()=>saves.write(clean,'manual'));
  for(const bad of [null,{}, {...clean,schema:99}, {...clean,profile:{...clean.profile,bank:NaN}}, {...clean,profile:{...clean.profile,bank:-1}}, {...clean,profile:{...clean.profile,inventory:{}}}, {...clean,profile:{...clean.profile,status:'won'}}, {...clean,profile:{...clean.profile,rounds:0}}])assert.throws(()=>validateSave(bad));
  const extra=validateSave({...clean,round:{dice:[1,1,1]},profile:{...clean.profile,html:'<script>'}});assert.equal(extra.round,undefined);assert.equal(extra.profile.html,undefined);
  data.set(saves.key('free'),'broken json');assert.throws(()=>saves.read('free'));assert.equal(data.get(saves.key('free')),'broken json');
});
test('storage failure is surfaced and preserves in-memory checkpoint',()=>{
  const {game}=setup();game.addBet('small',100);finish(game);
  const saves=new Saves({getItem:()=>null,setItem:()=>{throw new Error('quota');}});
  assert.throws(()=>saves.write(game.checkpoint));assert.ok(game.checkpoint);
});
test('chip choices retain the opening $100 denominations and scale up with wealth',()=>{
  const dollars=amount=>getChipDenominations(amount*100).map(c=>c/100);
  assert.deepEqual(dollars(100),[1,5,10,25,100]);
  assert.deepEqual(dollars(1000),[10,25,100,500,1000]);
  assert.deepEqual(dollars(10000),[100,500,1000,5000,10000]);
  assert.deepEqual(dollars(1000000),[10000,50000,100000,500000,1000000]);
  assert.deepEqual(dollars(20000000),[100000,500000,1000000,5000000,10000000]);
});
test('every active bankroll tier has five ordered chips and a useful affordable large amount',()=>{
  for(let bank=10000;bank<GOAL;bank=Math.ceil(bank*1.23)){
    const choices=getChipDenominations(bank);
    assert.equal(choices.length,5);assert.equal(new Set(choices).size,5);
    assert.ok(choices.every((c,i)=>Number.isSafeInteger(c)&&c>0&&c<=bank&&(!i||c>choices[i-1])));
    assert.ok(choices.at(-1)>=bank/5);
  }
  assert.deepEqual(getChipDenominations(37),[100,500,1000,2500,10000]);
  assert.throws(()=>getChipDenominations(NaN));assert.throws(()=>getChipDenominations(-1));
});
test('chip shelf stays stable during a round and updates from the next round bankroll',()=>{
  const {game}=setup();game.profile.bank=100000;game.round=null;game.newRound();
  const before=getChipDenominations(game.round.bankAtStart);
  game.addBet('small',50000);assert.deepEqual(getChipDenominations(game.round.bankAtStart),before);
  finish(game);assert.equal(game.profile.bank,150000);
  assert.deepEqual(getChipDenominations(game.round.bankAtStart),before);
  game.newRound();assert.equal(game.round.bankAtStart,150000);
  game.addBet('big',100000);finish(game);assert.equal(game.profile.bank,50000);
  game.newRound();assert.equal(game.round.bankAtStart,50000);
  assert.deepEqual(getChipDenominations(game.round.bankAtStart),[500,1000,2500,10000,50000]);
});
test('one large-chip click places and settles $100,000 without stacking or overspending',()=>{
  const {game}=setup();game.profile.bank=100000000;game.round=null;game.newRound();
  const large=10000000;assert.ok(getChipDenominations(game.round.bankAtStart).includes(large));
  assert.equal(game.addBet('small',large),true);assert.equal(game.stake,large);
  assert.equal(game.available,90000000);
  assert.equal(game.addBet('big',100000000),false);
  finish(game);assert.equal(game.profile.bank,110000000);
});
test('large chip labels stay compact while exact money remains available for input and accessibility',()=>{
  for(const [cents,label] of [[100,'$1'],[10000,'$100'],[100000,'$1千'],[500000,'$5千'],[1000000,'$1萬'],[5000000,'$5萬'],[100000000,'$100萬'],[500000000,'$500萬'],[1000000000,'$1千萬']])assert.equal(chipLabel(cents),label);
  for(const bank of [10000,1000000,100000000,GOAL-1])assert.ok(getChipDenominations(bank).every(c=>[...chipLabel(c)].length<=5));
});
test('custom bets and below-$1 all-in remain valid alongside chip suggestions',()=>{
  const {game}=setup();assert.equal(game.addBet('small',1234),true);assert.equal(game.stake,1234);
  game.clearBets();game.profile.bank=17;
  assert.equal(game.addBet('small',getChipDenominations(17)[0]),false);
  assert.equal(game.addBet('small',17),true);finish(game);assert.equal(game.profile.bank,34);
});
