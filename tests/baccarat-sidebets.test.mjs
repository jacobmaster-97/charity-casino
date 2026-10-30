import {BACCARAT_DEAL_MS} from '../src/baccarat.mjs';
import {runBaccaratToSettlement} from './baccarat-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.mjs';
import {validateSave} from '../src/storage.mjs';
import {baccaratSideRate,settleBaccaratRound,completeBaccaratHand,BACCARAT_ALL_BETS} from '../src/baccarat.mjs';
import {baccaratBoardMarkup,boardAmounts,BACCARAT_CELLS} from '../src/board.mjs';
import {baccaratTableView} from '../src/baccarat-view.mjs';
function setup(first=[0,2,13,15,28],bank=100000){const game=new Game();game.start('旁注');game.profile.bank=bank;game.baccaratShoe={cards:[...first,...Array.from({length:416},(_,i)=>i).filter(c=>!first.includes(c))],cursor:0,cycle:1};game.enterTable('baccarat');return game;}
function finish(game){game.lock();runBaccaratToSettlement(game);}
test('six bets have unique geometry; every new side cell is operable and inside fitted view',()=>{
 assert.equal(new Set(BACCARAT_ALL_BETS.map(b=>b.id)).size,6);assert.equal(BACCARAT_CELLS.length,6);const markup=baccaratBoardMarkup(true);assert.equal((markup.match(/data-action="bet"/g)||[]).length,6);assert.ok(markup.includes('viewBox="0 0 1200 610"'));
 for(const c of BACCARAT_CELLS){assert.ok(c.x>=0&&c.y>=0&&c.x+c.w<=1200&&c.y+c.h<=610);for(const d of BACCARAT_CELLS)if(c!==d)assert.ok(c.x+c.w<=d.x||d.x+d.w<=c.x||c.y+c.h<=d.y||d.y+d.h<=c.y);}
});
test('sides accumulate independently; moving main preserves side wagers and side-first order',()=>{
 const game=setup();game.addBet('bac-lucky-six',500);game.addBet('bac-player-pair',500);game.addBet('bac-player',1000);game.addBet('bac-banker-pair',500);
 assert.equal(game.addBet('bac-banker',0),'moved');assert.deepEqual(game.round.bets,{'bac-lucky-six':500,'bac-player-pair':500,'bac-banker':1000,'bac-banker-pair':500});assert.equal(game.stake,2500);assert.equal(game.available,97500);
 assert.equal(game.addBet('bac-lucky-six',600),true);assert.equal(game.stake,3100);assert.equal(game.addBet('bac-player-pair',100000),false);assert.equal(game.undoBet('bac-lucky-six'),true);assert.equal(game.stake,2000);
});
test('all-in main can move with other side wagers and no additional funds',()=>{
 const game=setup(undefined,10000);game.addBet('bac-lucky-six',500);game.addBet('bac-player',9500);assert.equal(game.available,0);assert.equal(game.addBet('bac-banker',NaN),'moved');assert.equal(game.round.bets['bac-banker'],9500);assert.equal(game.round.bets['bac-lucky-six'],500);assert.equal(game.addBet('bac-banker-pair',100),false);
});
test('first two ranks alone define pairs; zero-point faces and third-card matches do not',()=>{
 assert.equal(baccaratSideRate('bac-player-pair',{player:[10,11,12]}),-1);assert.equal(baccaratSideRate('bac-player-pair',{player:[12,64]}),11);assert.equal(baccaratSideRate('bac-player-pair',{player:[0,1,13]}),-1);assert.equal(baccaratSideRate('bac-banker-pair',{banker:[0,13,1]}),11);
});
test('banker two-card winning six pays 12; commission applies only to main and pairs can both win',()=>{
 const game=setup();for(const [id,amount] of Object.entries({'bac-player-pair':500,'bac-banker':10000,'bac-banker-pair':500,'bac-lucky-six':500}))assert.ok(game.addBet(id,amount));finish(game);
 assert.equal(game.round.final.winner,'banker');assert.equal(game.round.final.bankerTotal,6);assert.equal(game.round.final.banker.length,2);assert.equal(game.round.result.returned,38000);assert.equal(game.round.result.commission,500);assert.equal(game.round.result.net,26500);assert.equal(game.profile.bank,126500);assert.equal(game.round.result.lines.length,4);assert.equal(game.settle(),false);
});
test('side-only winning three-card six pays 20 and does not charge main commission',()=>{
 const game=setup([12,1,11,2,3,0]);game.addBet('bac-lucky-six',100);finish(game);assert.equal(game.round.final.banker.length,3);assert.equal(game.round.final.bankerTotal,6);assert.equal(game.round.result.lines[0].rate,20);assert.equal(game.round.result.returned,2100);assert.equal(game.round.result.net,2000);assert.equal(game.round.result.commission,0);
});
test('six must win; six tie/loss fail, with main push and a single combined protection refund',()=>{
 const game=setup([2,1,15,16]);game.profile.inventory.protect=1;game.useItem('protect');game.addBet('bac-banker',100);game.addBet('bac-lucky-six',100);finish(game);assert.equal(game.round.final.winner,'tie');assert.equal(game.round.result.returned,100);assert.equal(game.round.result.refund,50);assert.equal(game.round.result.net,-50);
 const loss=completeBaccaratHand([2,1,3,16],()=>{throw Error('No draws');});assert.equal(loss.bankerTotal,6);assert.equal(baccaratSideRate('bac-lucky-six',loss),-1);
});
test('swap uses the final initial cards for pairs and six, without double payout or extra item use',()=>{
 const game=setup([0,1,2,3,15]);game.profile.inventory.swap=1;game.useItem('swap');game.addBet('bac-player',100);game.addBet('bac-player-pair',100);game.addBet('bac-lucky-six',100);game.lock();game.tick(BACCARAT_DEAL_MS*4);assert.equal(game.round.phase,'swapping');game.chooseBaccaratSwap(0);assert.equal(game.round.phase,'settled');assert.equal(game.round.final.winner,'tie');assert.equal(game.round.result.returned,1300);assert.equal(game.round.result.net,1000);assert.equal(game.profile.inventory.swap,0);assert.deepEqual(game.round.discard,[0]);
});
test('side-only low-bankroll all-in remains valid; paused and locked wagers reject additions',()=>{
 const game=setup(undefined,37);assert.equal(game.addBet('bac-player-pair',36),false);assert.ok(game.addBet('bac-player-pair',37));game.paused=true;assert.equal(game.addBet('bac-banker-pair',37),false);game.paused=false;game.lock();assert.equal(game.addBet('bac-lucky-six',100),false);game.tick(3000);assert.equal(game.profile.bank,444);assert.equal(game.profile.status,'active');
});
test('completed-round saves preserve side returns and shoe; pending side stakes are not restored',()=>{
 const game=setup();game.addBet('bac-banker-pair',100);finish(game);const save=validateSave(game.checkpoint),bank=game.profile.bank,cursor=game.baccaratShoe.cursor;game.newRound();game.addBet('bac-lucky-six',5000);const restored=new Game();restored.restore(save);assert.equal(restored.profile.bank,bank);assert.equal(restored.round,null);assert.equal(restored.baccaratShoe.cursor,cursor);
});
test('actual view shows all wager rows, remove buttons, chip labels and correct readonly state',()=>{
 const game=setup();game.addBet('bac-player-pair',500);game.addBet('bac-banker',1000);game.addBet('bac-lucky-six',500);const options={game,art:p=>p,button:(a,t,c='',e='')=>`<button data-action="${a}" ${e}>${t}</button>`,icon:()=>'',chip:500,allIn:false,storageWarning:'',peekSide:'player'};
 let html=baccaratTableView(options);assert.ok(html.includes('主注最多一項'));assert.ok(html.includes('閒對'));assert.ok(html.includes('幸運六'));assert.equal((html.match(/data-action="remove"/g)||[]).length,3);assert.ok(boardAmounts(game.round.bets,{},p=>p).includes('data-amount-bet="bac-lucky-six"'));finish(game);html=baccaratTableView(options);assert.ok(!html.includes('data-action="remove"'));assert.equal((html.match(/aria-disabled="true"/g)||[]).length,6);
});
test('2,000 mixed-bet shuffled-shoe hands conserve cash across swaps, protection and cuts',()=>{
 const game=new Game();game.start('混合旁注');game.profile.bank=100000000;game.profile.inventory.protect=game.profile.inventory.swap=2000;game.enterTable('baccarat');
 for(let i=0;i<2000;i++){const before=game.profile.bank;game.addBet(['bac-player','bac-banker','bac-tie'][i%3],101);for(const side of ['bac-player-pair','bac-banker-pair','bac-lucky-six'])game.addBet(side,101+i%100);game.useItem(i%2?'swap':'protect');game.lock();game.tick(BACCARAT_DEAL_MS*4);if(game.round.phase==='swapping')game.chooseBaccaratSwap(i%4);runBaccaratToSettlement(game);assert.equal(game.round.phase,'settled');const r=game.round.result;assert.equal(game.profile.bank,before+r.net);assert.equal(r.returned,r.lines.reduce((sum,l)=>sum+l.payout,0));assert.equal(r.refund,r.returned<r.stake&&game.round.used==='protect'?Math.floor((r.stake-r.returned)/2):0);if(i%100===0)assert.equal(validateSave(game.checkpoint).profile.bank,game.profile.bank);if(i<1999)game.newRound();}
 assert.equal(game.profile.rounds,2000);
});
