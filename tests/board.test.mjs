import test from 'node:test';
import assert from 'node:assert/strict';
import {BETS} from '../src/rules.mjs';
import {Game} from '../src/game.mjs';
import {BOARD_CELLS,boardMarkup,boardAmounts,ChipFlights} from '../src/board.mjs';
const art=p=>p;
test('approved board exposes exactly 50 uniquely operable bets and retains rule rates',()=>{
 const markup=boardMarkup(art,true);assert.equal((markup.match(/data-action="bet"/g)||[]).length,50);
 assert.deepEqual(BOARD_CELLS.map(c=>c.id).sort(),BETS.map(b=>b.id).sort());
 for(const c of BOARD_CELLS){assert.equal(c.rate,BETS.find(b=>b.id===c.id).rate);assert.match(markup,new RegExp(`data-bet="${c.id}"`));}
 assert.equal((boardMarkup(art,false).match(/tabindex="-1" aria-disabled="true"/g)||[]).length,50);
 assert.ok(!markup.includes('data:image'));assert.ok(markup.includes('/art/sicbo-board-b/felt.png'));
});
test('flight amounts use integer cents, accumulate correctly and never alter accepted bets',()=>{
 const game=new Game({roll:()=>2});game.start('測試');game.enterTable();
 const effects=new ChipFlights({art,onChange(){}});
 assert.ok(game.addBet('small',100));effects.queue('small',100);
 assert.ok(game.addBet('small',500));effects.queue('small',500);
 assert.equal(game.stake,600);assert.deepEqual(effects.pending,{small:600});assert.equal(boardAmounts(game.round.bets,effects.pending,art),'');
 effects.finish(effects.flights[0]);assert.ok(boardAmounts(game.round.bets,effects.pending,art).includes('已押 $1'));
 effects.cancel();assert.ok(boardAmounts(game.round.bets,effects.pending,art).includes('已押 $6'));assert.equal(game.stake,600);assert.equal(game.available,9400);
 assert.equal(game.addBet('small',999999),false);assert.equal(effects.flights.length,0);
});
test('cancelled/removed bets cannot leave phantom flight balances or change saves',()=>{
 const effects=new ChipFlights({art,onChange(){}});effects.queue('small',500);effects.queue('big',100);
 effects.cancel('small');assert.deepEqual(effects.pending,{big:100});assert.equal(boardAmounts({},effects.pending,art),'');effects.cancel();assert.deepEqual(effects.pending,{});
});
test('flight pause/resume freezes presentation and reduced motion bypasses effects',()=>{
 const effects=new ChipFlights({art,onChange(){}});effects.queue('small',100);let paused=0,played=0;
 effects.flights[0].animation={pause(){paused++;},play(){played++;},cancel(){}};
 effects.pause(true);assert.equal(paused,1);assert.equal(played,0);effects.pause(false);assert.equal(played,1);
 const reduced=new ChipFlights({art,onChange(){},reduced:()=>true});reduced.queue('big',100);assert.deepEqual(reduced.pending,{});
});
test('mounted flight uses 420ms arc + 180ms landing; finishing only changes presentation',()=>{
 const priorDocument=globalThis.document,priorPoint=globalThis.DOMPoint;let appended=0,removed=0,updates=0,animation;
 globalThis.DOMPoint=class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}};
 globalThis.document={querySelector:()=>({getScreenCTM:()=>({a:1})}),body:{append(){appended++;}},createElement:()=>({style:{},setAttribute(){},remove(){removed++;},animate(frames,options){assert.equal(options.duration,600);assert.equal(frames[20].offset,.7);animation={cancel(){},pause(){},play(){}};return animation;}})};
 try{const effects=new ChipFlights({art,onChange(){updates++;}});effects.queue('small',500,{x:600,y:900});effects.mount();assert.equal(appended,1);effects.mount();assert.equal(appended,1);animation.onfinish();assert.deepEqual(effects.pending,{});assert.equal(removed,1);assert.equal(updates,1);}finally{globalThis.document=priorDocument;globalThis.DOMPoint=priorPoint;}
});
