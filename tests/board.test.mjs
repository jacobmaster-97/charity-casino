import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BETS,money,getChipDenominations,chipLabel,ITEMS} from '../src/rules.mjs';
import {Game} from '../src/game.mjs';
import {BOARD_CELLS,boardMarkup,boardAmounts,ChipFlights,CHIP_COLORS,chipFace,chipColorIndex} from '../src/board.mjs';
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
 const priorDocument=globalThis.document,priorPoint=globalThis.DOMPoint;let appended=0,removed=0,updates=0,animation,lastStyle;
 globalThis.DOMPoint=class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}};
 globalThis.document={querySelector:()=>({getScreenCTM:()=>({a:1})}),body:{append(){appended++;}},createElement:()=>({style:(lastStyle={}),setAttribute(){},remove(){removed++;},animate(frames,options){assert.equal(options.duration,600);assert.equal(frames[20].offset,.7);animation={cancel(){},pause(){},play(){}};return animation;}})};
 try{const effects=new ChipFlights({art,onChange(){updates++;}});effects.queue('small',500,{x:600,y:900});effects.mount();assert.equal(appended,1);effects.mount();assert.equal(appended,1);animation.onfinish();assert.deepEqual(effects.pending,{});assert.equal(removed,1);assert.equal(updates,1);effects.queue('bac-player',100,{x:500,y:800});effects.mount();assert.equal(lastStyle.width,'140px');animation.onfinish();}finally{globalThis.document=priorDocument;globalThis.DOMPoint=priorPoint;}
});

test('five chip slots have distinct atlas regions and stable colors across wealth tiers',()=>{
 assert.equal(new Set(CHIP_COLORS).size,5);
 const regions=CHIP_COLORS.map((_,i)=>chipFace(i,'100',art).match(/viewBox="([^"]+)"/)[1]);assert.equal(new Set(regions).size,5);
 for(const bank of [10000,100000000,2500000000])getChipDenominations(bank).forEach((value,i)=>assert.equal(chipColorIndex(value,bank),i));
 const chip=chipFace(1,'100',art);assert.ok(chip.includes('chips-five.png'));assert.ok(chip.includes('<clipPath'));assert.ok(chip.includes('clip-path="url(#chip-crop-'));
});
test('fitted board preserves every betting region without the old fixed-width viewport',()=>{
 const markup=boardMarkup(art,true);assert.ok(markup.includes('viewBox="110 245 1380 555"'));
 for(const c of BOARD_CELLS){assert.ok(c.x>=110&&c.y>=245);assert.ok(c.x+c.w<=1490&&c.y+c.h<=800);}
});
test('real table template contains the entire lower console and all former sidebar functions',async()=>{
 const source=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8');
 const definition=source.slice(source.indexOf('function die('),source.indexOf('\nfunction shop()'));
 const deps={game:new Game({roll:()=>2}),button:(a,t,c='',e='')=>`<button data-action="${a}" class="${c}" ${e}>${t}</button>`,esc:s=>String(s),icon:()=>'',art,boardMarkup,chipFace,CHIP_COLORS,BETS,BET_MAP:Object.fromEntries(BETS.map(b=>[b.id,b])),ITEMS,money,getChipDenominations,chipLabel,boardZoom:false,preciseBet:'small',chip:500,allIn:false,peekIndex:0,storageWarning:''};
 deps.game.start('版面');deps.game.enterTable();
 const render=new Function(...Object.keys(deps),definition+';return table();');
 const html=render(...Object.values(deps));assert.ok(!html.includes('<aside'));assert.ok(!html.includes('table-layout'));
 assert.ok(html.indexOf('dice-stage')<html.indexOf('table-console'));assert.ok(html.indexOf('board-scroll')<html.indexOf('console-dock'));
 for(const action of ['chip','all-in','roll','clear','use','board-zoom'])assert.ok(html.includes(`data-action="${action}"`),action);
 for(const cls of ['custom-bet','bet-details','bet-list','inventory','peek-picker','precise-bet'])assert.ok(html.includes(cls),cls);
 assert.equal((html.match(/data-action="chip"/g)||[]).length,5);
 deps.game.addBet('small',500);const placed=render(...Object.values(deps));assert.ok(placed.includes('data-action="remove"'));
 deps.game.lock();deps.game.tick(900);const settled=render(...Object.values(deps));assert.ok(settled.includes('data-action="next"'));assert.ok(!settled.includes('data-action="roll"'));assert.ok(settled.includes('aria-disabled="true"'));
});
test('mixed-denomination stacks retain each original chip color',()=>{
 const markup=boardAmounts({small:600},{},art,{small:2},{small:500},10000,{small:[100,500]});
 assert.ok(markup.includes('viewBox="20 155 394.4 394"'));assert.ok(markup.includes('viewBox="454.4 155 394.4 394"'));assert.ok(markup.includes('已押 $6'));
});
