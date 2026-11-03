import test from 'node:test';
import assert from 'node:assert/strict';
import {TableArtCache,TABLE_TEXTURES,TablePanels,updateGameViewport,fitLobbySurface,lobbyWideViewport,lobbySceneLayout} from '../src/table-layout.mjs';
import {Game} from '../src/game.mjs';
// Native-dialog lifecycle doubles; these checks are not browser layout evidence.
class PanelNode{
 constructor(tag,classes='',text=''){this.tagName=tag;this.classes=classes.split(' ').filter(Boolean);this.classList=this.classes;this.classList.contains=s=>this.classes.includes(s);this.textContent=text;this.children=[];this.parentNode=null;this.listeners={};this.dataset={};this.attrs={};this.open=false;this.hidden=false;}
 append(...nodes){for(const n of nodes){n.remove();n.parentNode=this;this.children.push(n);}}
 remove(){if(this.parentNode){const list=this.parentNode.children;list.splice(list.indexOf(this),1);this.parentNode=null;}}
 replaceWith(n){const parent=this.parentNode,index=parent.children.indexOf(this);n.remove();parent.children[index]=n;n.parentNode=parent;this.parentNode=null;}
 querySelector(s){const matches=n=>s.startsWith('.')?n.classList.contains(s.slice(1)):s.startsWith('[data-action=')?n.dataset.action===s.match(/"([^"]+)"/)[1]:n.tagName===s;return this.children.find(matches)||this.children.map(n=>n.querySelector(s)).find(Boolean)||null;}
 querySelectorAll(){const found=[];const walk=n=>{for(const c of n.children){if(c.tagName==='details')found.push(c);walk(c);}};walk(this);return found;}
 addEventListener(type,fn){this.listeners[type]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
 showModal(){this.open=true;}
 close(){this.open=false;this.listeners.close?.();}
 focus(){this.focused=true;}
 dispatch(type){const event={prevented:false,preventDefault(){this.prevented=true;}};this.listeners[type]?.(event);return event;}
}
function fixture(){const root=new PanelNode('main'),bar=new PanelNode('div','console-tools');root.append(bar);const details=['bet-details','inventory','shoe-details'].map((c,i)=>{const n=new PanelNode('details',c),s=new PanelNode('summary','',c+' '+i);n.append(s);bar.append(n);return n;});return {root,bar,details};}
function withDocument(fn){const old=globalThis.document;globalThis.document={createElement:t=>new PanelNode(t),createComment:()=>new PanelNode('comment')};try{fn();}finally{globalThis.document=old;}}
test('secondary tool opens as a dialog and closes back to its original place and focus',()=>withDocument(()=>{
 const {root,bar,details}=fixture(),panels=new TablePanels(root);panels.mount();const summary=details[1].querySelector('summary');assert.equal(summary.dispatch('click').prevented,true);assert.equal(panels.selection,'inventory');assert.equal(panels.dialog.open,true);assert.equal(panels.dialog.attrs['aria-labelledby'],'table-tool-title');assert.equal(details[1].parentNode,panels.dialog);assert.equal(summary.hidden,true);panels.close();assert.equal(panels.dialog,null);assert.equal(details[1].parentNode,bar);assert.equal(summary.hidden,false);assert.equal(summary.focused,true);assert.equal(details[1].open,false);
}));
test('render replaces an open tool with fresh controls and preserves selection without stale nodes',()=>withDocument(()=>{
 const old=fixture(),panels=new TablePanels(old.root);panels.mount();panels.open(old.details[0]);const previous=panels.dialog;panels.beforeRender();assert.equal(previous.open,false);assert.equal(previous.parentNode,null);assert.equal(panels.selection,'bet-details');const fresh=fixture();panels.root=fresh.root;panels.mount();assert.equal(panels.detail,fresh.details[0]);assert.notEqual(panels.dialog,previous);assert.equal(panels.dialog.open,true);panels.close();
}));
test('pause/squeeze/navigation blocks tool reopening and removes native top-layer dialog',()=>withDocument(()=>{
 const f=fixture(),panels=new TablePanels(f.root);panels.mount();panels.open(f.details[1]);const dialog=panels.dialog;panels.beforeRender();panels.mount(true);assert.equal(dialog.open,false);assert.equal(panels.selection,'');assert.equal(panels.dialog,null);panels.mount();assert.equal(panels.dialog,null);
}));
test('Escape/cancel restores the tool trigger without leaving an open details section',()=>withDocument(()=>{
 const f=fixture(),panels=new TablePanels(f.root);panels.mount();panels.open(f.details[2]);assert.equal(panels.dialog.dispatch('cancel').prevented,true);assert.equal(panels.dialog,null);assert.equal(f.details[2].open,false);assert.equal(f.details[2].querySelector('summary').focused,true);
}));
test('tool refresh tolerates a removed action after phase change',()=>withDocument(()=>{
 const f=fixture(),panels=new TablePanels(f.root);panels.mount();panels.open(f.details[1]);panels.beforeRender();f.details[1].remove();panels.mount();assert.equal(panels.dialog,null);assert.equal(panels.selection,'');
}));
test('tool use leaves the game clock and pause state under Game ownership',()=>withDocument(()=>{
 const game=new Game({roll:()=>2});game.start('畫面');game.enterTable();const f=fixture(),panels=new TablePanels(f.root);panels.mount();panels.open(f.details[0]);game.tick(1000);assert.equal(game.round.remaining,29000);assert.equal(game.profile.elapsedMs,1000);assert.equal(game.paused,false);panels.close();assert.equal(game.round.remaining,29000);
}));
test('visual viewport changes update usable height for orientation, browser chrome and keyboard',()=>{
 const writes=[],style={setProperty:(key,value)=>writes.push([key,value])};updateGameViewport({height:844},900,style);updateGameViewport({height:390},430,style);updateGameViewport(undefined,568,style);assert.deepEqual(writes,[['--game-viewport-height','844px'],['--game-viewport-height','390px'],['--game-viewport-height','568px']]);updateGameViewport({height:NaN},NaN,style);assert.equal(writes.length,3);
});

test('mobile More moves the real tool shelf and can open a detail without nested top-layer dialogs',()=>withDocument(()=>{
 const f=fixture(),p=new TablePanels(f.root);p.mount();p.openTools();const shelfDialog=p.dialog;assert.equal(p.tools,f.bar);assert.equal(f.bar.parentNode,shelfDialog);assert.equal(p.selection,'@tools');f.details[0].querySelector('summary').dispatch('click');assert.equal(shelfDialog.parentNode,null);assert.equal(p.detail,f.details[0]);assert.equal(f.bar.parentNode,f.root);assert.equal(p.dialog.open,true);p.close();assert.equal(f.details[0].parentNode,f.bar);
}));
test('mobile More refresh preserves one current shelf and pause restores all nodes before clearing selection',()=>withDocument(()=>{
 const f=fixture(),p=new TablePanels(f.root);p.mount();p.openTools();const old=p.dialog;p.beforeRender();assert.equal(old.parentNode,null);assert.equal(f.bar.parentNode,f.root);p.mount();assert.equal(p.tools,f.bar);assert.notEqual(p.dialog,old);p.beforeRender();p.mount(true);assert.equal(p.dialog,null);assert.equal(p.selection,'');assert.equal(f.bar.parentNode,f.root);
}));
test('closing More returns keyboard focus to its own trigger',()=>withDocument(()=>{
 const f=fixture(),trigger=new PanelNode('button');trigger.dataset.action='table-tools';f.root.append(trigger);const p=new TablePanels(f.root);p.mount();p.openTools();p.close();assert.equal(trigger.focused,true);assert.equal(p.tools,null);assert.equal(f.bar.parentNode,f.root);
}));

test('poker raise panel reuses native tools, continues the action clock and returns focus to Raise',()=>withDocument(()=>{
 const f=fixture(),detail=new PanelNode('details','poker-raise-panel'),summary=new PanelNode('summary','','加注至總額'),trigger=new PanelNode('button');trigger.dataset.action='pk-open-raise';detail.append(summary);f.bar.append(detail);f.root.append(trigger);const p=new TablePanels(f.root),g=new Game({randomIndex:()=>0});g.start('加注');g.enterTable('poker');g.startPoker();for(let i=0;g.round.phase!=='poker-player';i++){assert.ok(i<1000);g.tick(g.round.remaining||1);}p.mount();p.open(detail);assert.equal(p.dialog.className,'table-tool-dialog poker-raise-dialog');assert.equal(p.selection,'poker-raise-panel');const bank=g.profile.bank;g.tick(1000);assert.equal(g.round.remaining,29000);assert.equal(g.profile.bank,bank);assert.equal(g.paused,false);p.close();assert.equal(trigger.focused,true);assert.equal(detail.parentNode,f.bar);
}));
test('turn changes can clear a retained raise panel before the next player turn mounts',()=>withDocument(()=>{
 const f=fixture(),detail=new PanelNode('details','poker-raise-panel');detail.append(new PanelNode('summary','','加注至總額'));f.bar.append(detail);const p=new TablePanels(f.root);p.mount();p.open(detail);p.beforeRender();assert.equal(p.selection,'poker-raise-panel');p.release();p.mount();assert.equal(p.selection,'');assert.equal(p.dialog,null);assert.equal(detail.parentNode,f.bar);
}));

test('lobby scene and table hit targets fit the real texture ratio within both phone orientations',()=>{
 for(const [w,h] of [[304,430],[552,205],[651,260],[828,280],[1424,700]]){const values={},scene={querySelector:()=>({naturalWidth:1672,naturalHeight:941}),style:{setProperty:(k,v)=>values[k]=parseFloat(v)}},frame={clientWidth:w,clientHeight:h},root={querySelector:s=>s==='.lobby-map'?frame:scene};assert.equal(fitLobbySurface(root),true);assert.ok(values.width<=w+.001);assert.ok(values.height<=h+.001);assert.ok(Math.abs(values.width/values.height-1672/941)<.00001);}
});
test('lobby fits before image decoding with the known asset ratio and does not write when hidden',()=>{
 const values={},scene={querySelector:()=>({naturalWidth:0,naturalHeight:0}),style:{setProperty:(k,v)=>values[k]=parseFloat(v)}},frame={clientWidth:552,clientHeight:205},root={querySelector:s=>s==='.lobby-map'?frame:scene};assert.equal(fitLobbySurface(root),true);assert.ok(Math.abs(values.width/values.height-1672/941)<.00001);frame.clientHeight=0;assert.equal(fitLobbySurface(root),false);
});

const wideTargets=[{x:.33,y:.40,width:93.2,height:44},{x:.73,y:.40,width:93.2,height:44},{x:.17,y:.68,width:93.2,height:44},{x:.50,y:.68,width:93.2,height:44},{x:.85,y:.69,width:93.2,height:44}];
function assertLobbyTargetsVisible(layout,w,h,targets=wideTargets){
 for(const t of targets){const left=layout.left+t.x*layout.width-t.width/2,top=layout.top+t.y*layout.height-t.height/4;assert.ok(left>=-.01&&left+t.width<=w+.01,{left,w});assert.ok(top>=-.01&&top+t.height<=h+.01,{top,h});}
}
test('phone landscape selects width fill without a device-name or hardcoded safe-area dependency',()=>{
 for(const [w,h] of [[932,430],[844,390],[667,375],[915,412]])assert.equal(lobbyWideViewport(w,h),true);
 for(const [w,h] of [[430,932],[1024,768],[1440,1000],[932,-1],[NaN,430],[932,Infinity]])assert.equal(lobbyWideViewport(w,h),false);
});
test('approved iPhone 16 Plus example fills the inner width with the same ratio and upper-biased crop',()=>{
 const l=lobbySceneLayout(812,363.8,{fillWidth:true,targets:wideTargets});assert.equal(l.mode,'width');assert.equal(l.width,812);assert.equal(l.left,0);assert.ok(Math.abs(l.height-456.99282296650716)<.000001);assert.ok(Math.abs(l.top+13.978923444976072)<.000001);assert.ok(Math.abs(l.width/l.height-1672/941)<1e-10);assertLobbyTargetsVisible(l,812,363.8);
});
test('changing browser chrome height keeps every entry visible and moves the crop instead of stretching',()=>{
 for(const [w,h] of [[812,363.8],[812,300],[894,280],[1000,240],[650,260],[552,268]]){const l=lobbySceneLayout(w,h,{fillWidth:true,targets:wideTargets});assert.equal(l.mode,'width');assert.equal(l.width,w);assert.ok(l.top<=0&&l.top+l.height>=h);assertLobbyTargetsVisible(l,w,h);for(const t of wideTargets){const top=l.top+t.y*l.height-t.height/4;assert.ok(top>=8-.001&&top+t.height<=h-8+.001);}}
});
test('an exceptionally short map falls back to the full scene rather than hiding a table button',()=>{
 const l=lobbySceneLayout(812,180,{fillWidth:true,targets:wideTargets});assert.equal(l.mode,'contain');assert.ok(l.width<812);assert.equal(l.height,180);assertLobbyTargetsVisible(l,812,180);
});
test('real fitting reads actual target sizes and resets crop offsets when returning to contain mode',()=>{
 const values={},frame={clientWidth:812,clientHeight:270},largeTargets=wideTargets.map(t=>({...t,height:60}));
 const nodes=largeTargets.map(t=>({style:{getPropertyValue:key=>t[key==='--x'?'x':'y']*100+'%'},offsetWidth:t.width,offsetHeight:t.height}));
 const scene={dataset:{},querySelector:()=>({naturalWidth:0,naturalHeight:0}),querySelectorAll:()=>nodes,style:{setProperty:(k,v)=>values[k]=parseFloat(v)}};
 const root={querySelector:s=>s==='.lobby-map'?frame:scene};assert.equal(fitLobbySurface(root,true),true);assert.equal(scene.dataset.lobbyFit,'width');assert.equal(values.width,812);assertLobbyTargetsVisible(values,812,270,largeTargets);
 frame.clientHeight=363.8;fitLobbySurface(root,false);assert.equal(scene.dataset.lobbyFit,'contain');assert.ok(values.left>0);assert.equal(values.top,0);assert.ok(values.height<=frame.clientHeight);
});
test('invalid scene measurements do not produce crop coordinates',()=>{
 for(const [w,h,ratio] of [[0,100,1],[-1,100,1],[100,0,1],[Infinity,100,1],[100,100,0],[100,100,NaN]])assert.equal(lobbySceneLayout(w,h,{fillWidth:true,ratio}),null);
});

function imageFixture(){
 const images=[],timeouts=new Map();let next=0;
 class FakeImage{
  complete=false;naturalWidth=0;
  constructor(){images.push(this);}
  set src(value){this.url=value;}
  decode(){return this.decodingResult||Promise.resolve();}
  load(){this.complete=true;this.naturalWidth=100;return this.onload?.();}
 }
 const cache=new TableArtCache({url:ref=>'https://example.test/game/public'+ref,ImageClass:FakeImage,schedule:fn=>{const id=++next;timeouts.set(id,fn);return id;},cancel:id=>timeouts.delete(id)});
 return {cache,images,timeouts};
}
test('texture cache shares in-flight files across tables and waits for decode, not just network completion',async()=>{
 const {cache,images}=imageFixture(),one=cache.load('poker'),two=cache.load('blackjack');assert.equal(images.length,new Set([...TABLE_TEXTURES.poker,...TABLE_TEXTURES.blackjack]).size);
 let decoded;images[0].decodingResult=new Promise(r=>decoded=r);for(const img of images)void img.load();await Promise.resolve();assert.equal(cache.ready('poker'),false);decoded();assert.equal(await one,true);assert.equal(await two,true);assert.equal(cache.ready('poker'),true);const count=images.length;assert.equal(await cache.load('poker'),true);assert.equal(images.length,count);assert.ok(images.every(img=>img.url.startsWith('https://example.test/game/public/art/')));
});
test('failed image retries only its missing texture and never reports a partial table ready',async()=>{
 const {cache,images}=imageFixture(),first=cache.load('poker');images[0].onerror();for(const img of images.slice(1))await img.load();assert.equal(await first,false);assert.equal(cache.ready('poker'),false);const count=images.length,again=cache.load('poker');assert.equal(images.length,count+1);await images.at(-1).load();assert.equal(await again,true);assert.equal(cache.ready('poker'),true);
});
test('decode rejection and timeouts permit retry; a late old decode cannot mark a failed request ready',async()=>{
 const {cache,images,timeouts}=imageFixture();const first=cache.image('/decode.png');images[0].decodingResult=Promise.reject(new Error('decode failed'));await images[0].load();assert.equal(await first,false);const second=cache.image('/decode.png');let resolve;images[1].decodingResult=new Promise(r=>resolve=r);void images[1].load();[...timeouts.values()][0]();assert.equal(await second,false);const third=cache.image('/decode.png');resolve();await Promise.resolve();assert.equal(cache.entries.get('/decode.png').ready,false);await images[2].load();assert.equal(await third,true);assert.equal(timeouts.size,0);
});
test('background warmup is shared, sequential and retains the exact nine approved table textures',async()=>{
 const {cache,images}=imageFixture(),warm=cache.warm();assert.equal(cache.warm(),warm);assert.equal(images.length,1);
 const refs=[...new Set(Object.values(TABLE_TEXTURES).flat())];assert.equal(refs.length,9);
 for(let i=0;i<refs.length;i++){assert.equal(images.length,i+1);await images[i].load();await Promise.resolve();}
 await warm;assert.equal(images.length,9);assert.ok(Object.keys(TABLE_TEXTURES).every(id=>cache.ready(id)));assert.ok(images.every(img=>img.decoding==='async'));
});
test('a missing Image API or invalid table fails without throwing or leaving a pending timer',async()=>{
 const {timeouts}=imageFixture(),cache=new TableArtCache({url:r=>r,ImageClass:null,schedule:()=>{throw new Error('must not schedule');},cancel(){}});assert.equal(await cache.load('missing'),false);assert.equal(await cache.load('poker'),false);assert.equal(cache.entries.size,0);assert.equal(timeouts.size,0);
});
