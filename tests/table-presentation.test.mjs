import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {baccaratCellsForHeight,baccaratBoardMarkup,boardAmounts,ChipFlights,boardMarkup} from '../src/board.mjs';
import {baccaratCardSize,fitBaccaratSurface} from '../src/table-layout.mjs';
import {baccaratTableView} from '../src/baccarat-view.mjs';
import {Game} from '../src/game.mjs';
test('six responsive cells fill wide and tall viewBoxes without clipping or overlapping',()=>{
 for(const height of [80,160,220,400,610,900,1200]){
  const cells=baccaratCellsForHeight(height);assert.equal(new Set(cells.map(c=>c.id)).size,6);assert.ok(cells[0].x<16);assert.ok(cells[2].x+cells[2].w>1180);
  for(const c of cells){assert.ok(c.w>0&&c.h>0);assert.ok(c.x>=0&&c.y>=0&&c.x+c.w<=1200&&c.y+c.h<=height);assert.ok(c.labelY>c.y&&c.labelY<c.rateY&&c.rateY<c.y+c.h);assert.ok(c.anchor.x-c.chipSize/2>=c.x&&c.anchor.x+c.chipSize/2<=c.x+c.w);assert.ok(c.anchor.y-c.chipSize/2>=c.y&&c.anchor.y+c.chipSize/2<=c.y+c.h);for(const d of cells)if(c!==d)assert.ok(c.x+c.w<=d.x||d.x+d.w<=c.x||c.y+c.h<=d.y||d.y+d.h<=c.y);}
  const svg=baccaratBoardMarkup(true,height);assert.ok(svg.includes(`viewBox="0 0 1200 ${height}"`));assert.equal((svg.match(/data-action="bet"/g)||[]).length,6);
 }
});
test('responsive landed chips and amount badges use the same geometry as the printed cells',()=>{
 for(const height of [160,610,1200]){const cells=baccaratCellsForHeight(height);for(const c of cells){const html=boardAmounts({[c.id]:500},{},p=>p,{},{},10000,{},height);assert.ok(html.includes(`x="${c.anchor.x-c.chipSize/2}"`));assert.ok(html.includes(`y="${c.anchor.y-c.chipSize/2}"`));assert.ok(html.includes(`width="${c.chipSize}"`));assert.ok(html.includes('已押 $5'));assert.ok(!html.includes('NaN'));}}
});
test('real chip flight resolves the current resized board geometry',()=>{
 const oldDocument=globalThis.document,oldPoint=globalThis.DOMPoint,height=180;let frames,style;
 globalThis.DOMPoint=class{constructor(x,y){this.x=x;this.y=y;}matrixTransform(){return this;}};
 globalThis.document={querySelector:()=>({dataset:{boardHeight:String(height)},getScreenCTM:()=>({a:1,d:1})}),body:{append(){}},createElement:()=>({style:(style={}),setAttribute(){},remove(){},animate(f){frames=f;return {cancel(){}};}})};
 try{const c=baccaratCellsForHeight(height).find(c=>c.id==='bac-lucky-six'),fx=new ChipFlights({art:p=>p});fx.queue(c.id,500,{x:0,y:0});fx.mount();assert.equal(style.width,c.chipSize+'px');const xy=frames[20].transform.match(/translate\(([-\d.e]+)px,([-\d.e]+)px\)/);assert.ok(Math.abs(Number(xy[1])-(c.anchor.x-c.chipSize/2))<1e-8);assert.ok(Math.abs(Number(xy[2])-(c.anchor.y-c.chipSize/2))<1e-8);}finally{globalThis.document=oldDocument;globalThis.DOMPoint=oldPoint;}
});
test('cards grow with the show area; compact and portrait layouts reserve space for third cards',()=>{
 const wide=baccaratCardSize(1466,175),tall=baccaratCardSize(1256,240),phone=baccaratCardSize(366,240),compact=baccaratCardSize(820,100);
 assert.ok(wide.width>80&&tall.width>=wide.width);assert.equal(wide.stacked,false);assert.equal(phone.stacked,true);assert.ok(phone.width*3+90<=366);assert.ok(phone.width*1.4*2+48<=240+1e-7);assert.equal(compact.compact,true);assert.ok(compact.width*1.4<=82+1e-7);
});
function surfaceFixture(){
 const stage={clientWidth:1466,clientHeight:175,dataset:{},style:{setProperty(k,v){this[k]=v;}}};let svg={dataset:{boardHeight:'610',enabled:'true'}},writes=0;
 const board={clientWidth:1200,clientHeight:220,querySelector:()=>svg,set innerHTML(value){this.html=value;svg={dataset:{boardHeight:value.match(/data-board-height="([^"]+)"/)[1],enabled:value.match(/data-enabled="([^"]+)"/)[1]}};writes++;}};
 return {stage,board,root:{querySelector:s=>s==='.baccarat-stage'?stage:board},get svg(){return svg;},get writes(){return writes;}};
}
test('surface fitting handles resize and preserves betting/readonly state without repeated markup churn',()=>{
 const f=surfaceFixture();assert.ok(fitBaccaratSurface(f.root));assert.equal(f.svg.dataset.boardHeight,'220');assert.equal(f.svg.dataset.enabled,'true');assert.equal(f.writes,1);assert.ok(fitBaccaratSurface(f.root));assert.equal(f.writes,1);f.svg.dataset.enabled='false';f.board.clientWidth=400;f.board.clientHeight=300;f.stage.clientWidth=366;f.stage.clientHeight=240;fitBaccaratSurface(f.root);assert.equal(f.stage.dataset.stacked,'true');assert.equal(f.svg.dataset.boardHeight,'900');assert.equal(f.svg.dataset.enabled,'false');assert.equal((f.board.html.match(/aria-disabled="true"/g)||[]).length,6);f.board.clientWidth=0;assert.equal(fitBaccaratSurface(f.root),false);
});
test('actual Baccarat view places show and lower areas under one felt; contexts stay in lower area',()=>{
 const game=new Game();game.start('一體賭枱');game.enterTable('baccarat');const options={game,art:p=>p,button:(a,t,c='',e='')=>`<button data-action="${a}" ${e}>${t}</button>`,icon:()=>'',chip:500};
 const inspect=html=>{const stack=[],nodes=[];for(const m of html.matchAll(/<(\/?)(div|section)\b([^>]*)>/g)){if(m[1]){const node=stack.pop();assert.equal(node.tag,m[2]);}else{const node={tag:m[2],classes:m[3].match(/class="([^"]*)"/)?.[1]||'',parent:stack.at(-1)};nodes.push(node);stack.push(node);}}assert.equal(stack.length,0);const felt=nodes.find(n=>n.classes==='baccarat-felt'),stage=nodes.find(n=>n.classes==='baccarat-stage'),lower=nodes.find(n=>n.classes==='baccarat-lower'),console=nodes.find(n=>n.classes==='table-console');assert.equal(stage.parent,felt);assert.equal(lower.parent,felt);assert.equal(console.parent,lower);assert.ok(html.includes('presentation-unified'));};
 inspect(baccaratTableView(options));game.round.peek={side:'player',index:0,value:1};inspect(baccaratTableView(options));
});
test('Sic Bo keeps the separate-stage structure and all fifty approved betting regions',async()=>{
 const app=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8'),table=app.slice(app.indexOf('function table()'),app.indexOf('function shop()'));assert.ok(table.includes('sicbo-screen presentation-separated'));assert.ok(!table.includes('baccarat-felt'));assert.equal((boardMarkup(p=>p,true).match(/data-action="bet"/g)||[]).length,50);
});
test('responsive board changes do not touch locked wagers, shoe progress or coupons',()=>{
 const game=new Game();game.start('保持原局');game.enterTable('baccarat');game.addBet('bac-banker',500);game.addBet('bac-lucky-six',100);game.lock();const before=structuredClone({profile:game.profile,round:game.round,shoe:game.baccaratShoe});const f=surfaceFixture();f.svg.dataset.enabled='false';for(const height of [100,200,300]){f.board.clientHeight=height;fitBaccaratSurface(f.root);boardAmounts(game.round.bets,{},p=>p,{},{},game.round.bankAtStart,{},1200*height/f.board.clientWidth);}assert.deepEqual({profile:game.profile,round:game.round,shoe:game.baccaratShoe},before);
});
