import {baccaratBoardMarkup} from './board.mjs?v=0.6.1';
// Move existing secondary controls into a native dialog; gameplay keeps its clock.
export class TablePanels{
 constructor(root){this.root=root;this.selection='';this.dialog=null;this.detail=null;this.marker=null;this.tools=null;this.toolsMarker=null;}
 beforeRender(){this.release(false);}
 release(clear=true){
   const dialog=this.dialog,detail=this.detail,marker=this.marker,tools=this.tools,toolsMarker=this.toolsMarker;this.dialog=this.detail=this.marker=this.tools=this.toolsMarker=null;
   if(clear)this.selection='';
   if(detail){detail.open=false;detail.querySelector('summary').hidden=false;if(marker?.parentNode)marker.replaceWith(detail);}
   if(tools&&toolsMarker?.parentNode)toolsMarker.replaceWith(tools);
   if(dialog){dialog.close();dialog.remove();}
 }
 mount(blocked=false){
   if(blocked){this.selection='';return;}
   const details=[...this.root.querySelectorAll('.console-tools details')];
   for(const detail of details){
     detail.open=false;
     detail.querySelector('summary').addEventListener('click',event=>{event.preventDefault();this.open(detail);});
   }
   if(this.selection==='@tools'){this.openTools();return;}
   const selected=this.selection&&details.find(d=>d.classList.contains(this.selection));
   if(selected)this.open(selected);else this.selection='';
 }
 open(detail){
   this.release();this.selection=detail.classList[0];this.detail=detail;
   const summary=detail.querySelector('summary');this.marker=document.createComment('table tool');detail.replaceWith(this.marker);
   const dialog=document.createElement('dialog');this.dialog=dialog;dialog.className='table-tool-dialog';dialog.setAttribute('aria-labelledby','table-tool-title');
   const heading=document.createElement('div');heading.className='table-tool-heading';
   const title=document.createElement('h2');title.id='table-tool-title';title.textContent=summary.textContent.trim();
   const close=document.createElement('button');close.type='button';close.dataset.action='close-table-tool';close.className='outlined';close.textContent='返回牌桌';
   heading.append(title,close);detail.open=true;summary.hidden=true;dialog.append(heading,detail);this.root.append(dialog);
   dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
   dialog.addEventListener('close',()=>{if(this.dialog===dialog)this.close();});
   dialog.showModal();
 }
 openTools(){
   this.release();const tools=this.root.querySelector('.console-tools');if(!tools)return;
   this.selection='@tools';this.tools=tools;this.toolsMarker=document.createComment('table tools');tools.replaceWith(this.toolsMarker);
   const dialog=document.createElement('dialog');this.dialog=dialog;dialog.className='table-tool-dialog mobile-tools-dialog';dialog.setAttribute('aria-label','牌桌工具');
   const heading=document.createElement('div');heading.className='table-tool-heading';const title=document.createElement('h2');title.textContent='牌桌工具';
   const close=document.createElement('button');close.type='button';close.dataset.action='close-table-tool';close.textContent='返回牌桌';heading.append(title,close);dialog.append(heading,tools);this.root.append(dialog);
   dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});dialog.addEventListener('close',()=>{if(this.dialog===dialog)this.close();});dialog.showModal();
 }
 close(){const trigger=this.detail?.querySelector('summary')||this.root.querySelector('[data-action="table-tools"]');this.release();trigger?.focus({preventScroll:true});}
}
export const MOBILE_TABLES_ENABLED=true;
// Width/height of the layout viewport, not the software keyboard's visual viewport.
export function mobileTableViewport(width=globalThis.innerWidth,height=globalThis.innerHeight){return MOBILE_TABLES_ENABLED&&Number.isFinite(width)&&Number.isFinite(height)&&(width<=679||width<=1100&&height<=600);}
// Presentation-only result dwell. Never changes Game, outcomes, clocks or checkpoints.
export class MobileRoundReveal{
 constructor(){this.round=null;this.phase=null;this.remaining=0;this.visible=false;this.seen=false;}
 sync(game,enabled){
   const r=enabled&&game.screen==='table'&&['sicbo','roulette'].includes(game.activeTable)?game.round:null;
   if(r!==this.round){this.round=r;this.phase=null;this.remaining=0;this.seen=false;}
   if(!r){this.visible=false;return false;}
   const previous=this.visible,active=['revealing','reroll','rou-spinning','rou-reroll'].includes(r.phase);
   if(active){this.seen=true;this.remaining=0;}
   if(r.phase==='settled'&&this.phase!=='settled'&&this.seen)this.remaining=1400;
   this.phase=r.phase;this.visible=active||r.phase==='settled'&&this.remaining>0;return previous!==this.visible;
 }
 tick(ms,game,enabled){const wasSettled=this.phase==='settled';let changed=this.sync(game,enabled);if(!game.paused&&wasSettled&&this.phase==='settled'&&Number.isFinite(ms)&&ms>0&&this.remaining>0){this.remaining=Math.max(0,this.remaining-ms);changed=this.sync(game,enabled)||changed;}return changed;}
 close(game){if(this.round===game.round&&this.phase==='settled'){this.remaining=0;this.visible=false;return true;}return false;}
}
export function updateGameViewport(viewport=globalThis.visualViewport,fallback=globalThis.innerHeight,style=document.documentElement.style){
 const height=viewport?.height||fallback;
 if(Number.isFinite(height)&&height>0)style.setProperty('--game-viewport-height',height+'px');
}
export function baccaratCardSize(width,height){
 const stacked=width<600&&height>=180||width<420&&height>=140,compact=!stacked&&height<150&&width>=420;
 const byHeight=stacked?(height-48)/2*5/7:(height-(compact?18:54))*5/7;
 const byWidth=stacked?(width-90)/3:(width-(compact?250:96))/6;
 return {stacked,compact,width:Math.max(24,Math.min(stacked?76:96,byHeight,byWidth))};
}
export function fitBaccaratSurface(root){
 const stage=root.querySelector('.baccarat-stage'),board=root.querySelector('.baccarat-screen .board-scroll');
 if(!stage||!board||stage.clientWidth<=0||stage.clientHeight<=0||board.clientWidth<=0||board.clientHeight<=0)return false;
 const card=baccaratCardSize(stage.clientWidth,stage.clientHeight);
 stage.dataset.stacked=String(card.stacked);stage.dataset.compact=String(card.compact);stage.style.setProperty('--baccarat-card-width',card.width+'px');
 const height=Number((1200*board.clientHeight/board.clientWidth).toFixed(3)),svg=board.querySelector('.baccarat-board');
 if(!svg||height<=0)return false;
 if(Number(svg.dataset.boardHeight)!==height)board.innerHTML=baccaratBoardMarkup(svg.dataset.enabled==='true',height);
 return true;
}
