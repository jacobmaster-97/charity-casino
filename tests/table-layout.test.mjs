import test from 'node:test';
import assert from 'node:assert/strict';
import {TablePanels,updateGameViewport} from '../src/table-layout.mjs';
import {Game} from '../src/game.mjs';
// Native-dialog lifecycle doubles; these checks are not browser layout evidence.
class PanelNode{
 constructor(tag,classes='',text=''){this.tagName=tag;this.classes=classes.split(' ').filter(Boolean);this.classList=this.classes;this.classList.contains=s=>this.classes.includes(s);this.textContent=text;this.children=[];this.parentNode=null;this.listeners={};this.dataset={};this.attrs={};this.open=false;this.hidden=false;}
 append(...nodes){for(const n of nodes){n.remove();n.parentNode=this;this.children.push(n);}}
 remove(){if(this.parentNode){const list=this.parentNode.children;list.splice(list.indexOf(this),1);this.parentNode=null;}}
 replaceWith(n){const parent=this.parentNode,index=parent.children.indexOf(this);n.remove();parent.children[index]=n;n.parentNode=parent;this.parentNode=null;}
 querySelector(s){const matches=n=>s.startsWith('.')?n.classList.contains(s.slice(1)):s==='[data-action="table-tools"]'?n.dataset.action==='table-tools':n.tagName===s;return this.children.find(matches)||this.children.map(n=>n.querySelector(s)).find(Boolean)||null;}
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
