import {BACCARAT_DEAL_MS,BACCARAT_UNFOLD_MS,BACCARAT_RETURN_MS,cardRank} from './baccarat.mjs?v=0.6.1';
const squeezeClamp=v=>Math.max(0,Math.min(1,v));
const squeezeEase=v=>1-Math.pow(1-squeezeClamp(v),3);
const squeezeEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Geometry and hand anchor from the approved standalone squeeze preview.
export function squeezePeel(progress){
 const p=squeezeClamp(progress),d=4+148*p,k=480-d;
 const body=`0,0 200,0 200,${280-d} ${200-d},280 0,280`,flap=`${200-d},280 200,${280-d} ${200-d-4},${280-d-8}`;
 return `<defs><clipPath id="live-peel-body"><polygon points="${body}"/></clipPath><clipPath id="live-peel-flap"><polygon points="${flap}"/></clipPath><linearGradient id="live-fold-light" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ad9670" stop-opacity=".5"/><stop offset=".45" stop-color="#fff7de" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".65"/></linearGradient></defs><path d="M0 0H200V280H0Z" fill="#061a12" fill-opacity=".25" transform="translate(4 6)"/><g clip-path="url(#live-peel-body)"><use href="#live-card-back" width="200" height="280"/></g><path d="M${200-d} 280L200 ${280-d}" stroke="#040b06" stroke-opacity=".5" stroke-width="7"/><g clip-path="url(#live-peel-flap)"><g transform="matrix(0 -1 -1 0 ${k} ${k})"><use href="#live-card-face" width="200" height="280"/></g><polygon points="${flap}" fill="url(#live-fold-light)"/></g><path d="M${200-d} 280 Q${200-d*.52} ${280-d*.52} 200 ${280-d}" fill="none" stroke="#f9e9c2" stroke-width="1.6"/>`;
}
function squeezeSymbols(id,art,faceVisible){
 const rank=['A','2','3','4','5','6','7','8','9','10','J','Q','K'][cardRank(id)-1],suit=['♠','♥','♣','♦'][Math.floor(id/13)%4],color=suit==='♥'||suit==='♦'?'#a71936':'#19251e',url=squeezeEscape(art('/art/baccarat-b/cards.png'));
 const crop=(box)=>`<svg width="200" height="280" viewBox="${box}" preserveAspectRatio="none"><image width="1499" height="1049" href="${url}"/></svg>`;
 return `<defs><symbol id="live-card-back" viewBox="0 0 200 280">${crop('775 50 655 922')}</symbol><symbol id="live-card-face" viewBox="0 0 200 280">${faceVisible?`${crop('80 50 650 922')}<g fill="${color}" font-family="serif" text-anchor="middle"><text x="34" y="47" font-size="30">${rank}</text><text x="34" y="76" font-size="28">${suit}</text><text x="100" y="172" font-size="82">${suit}</text><g transform="rotate(180 100 140)"><text x="34" y="47" font-size="30">${rank}</text><text x="34" y="76" font-size="28">${suit}</text></g></g>`:''}</symbol></defs>`;
}
export function squeezeScene(round,art,reduced=false){
 const s=round.squeeze;if(!s)return '';
 const p=s.progress,unfold=round.phase==='unfolding'?squeezeClamp(1-round.remaining/BACCARAT_UNFOLD_MS):round.phase==='returning'?1:0,returning=round.phase==='returning'?squeezeClamp(1-round.remaining/BACCARAT_RETURN_MS):0;
 const delivery=round.phase==='delivering'&&!reduced?1-squeezeEase(1-round.remaining/BACCARAT_DEAL_MS):0;
 const id=round.final.supplements[s.index].card,u=reduced?0:squeezeEase(returning),x=230+(s.side==='player'?-155:155)*u+200*delivery,y=240-160*u-190*delivery,w=230-140*u-145*delivery,scale=unfold&&!reduced?Math.max(.025,Math.abs(Math.cos(Math.PI*unfold))):1,angle=reduced?0:-5*Math.sin(Math.PI*unfold)-8*delivery;
 const face=unfold>=.5||reduced&&round.phase!=='squeezing';
 const card=squeezeSymbols(id,art,p>0)+`<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale} 1) translate(${-w/2} ${-w*.7}) scale(${w/200})">${face?'<use href="#live-card-face" width="200" height="280"/>':squeezePeel(p)}</g>`;
 return card;
}
export function squeezePanel(round){
 if(!round.squeeze||!['delivering','squeezing','unfolding','returning'].includes(round.phase))return '';
 const label=round.squeeze.side==='player'?'閒':'莊';
 return `<section class="squeeze-backdrop"><div class="squeeze-panel" role="dialog" aria-modal="true" aria-labelledby="squeeze-title"><div class="squeeze-heading"><h2 id="squeeze-title">${label}方補牌 · 咪牌</h2><button type="button" data-action="pause" class="outlined" aria-label="暫停咪牌">Ⅱ 暫停</button></div><p id="squeeze-instructions">按住牌角，向左上慢慢拖開；放手可保留進度。</p><svg id="squeeze-scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 480" role="slider" tabindex="0" aria-label="咪牌進度" aria-describedby="squeeze-instructions" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(round.squeeze.progress*100)}"><g id="squeeze-dynamic" aria-hidden="true"></g></svg><p class="squeeze-status" role="status">${round.phase==='delivering'?'補牌蓋牌送到面前…':round.phase==='squeezing'?'由你控制揭牌速度，也可按下方按鈕。':round.phase==='unfolding'?'正在攤開牌面…':'補牌歸位…'}</p><button type="button" class="primary squeeze-reveal" data-action="squeeze-reveal" ${round.phase==='squeezing'?'':'disabled'}>直接揭牌</button><p class="squeeze-help">方向鍵逐步揭開 · Enter／空白直接揭牌</p></div></section>`;
}
// Pointer capture belongs to the stable outer SVG; only its visual child repaints.
export class BaccaratSqueezeController{
 constructor({root,game,art,advance,onChange,reduced=()=>false}){Object.assign(this,{root,game,art,advance,onChange,reduced});this.down=null;this.svg=null;}
 mount(){
   this.down=null;this.svg=this.root.querySelector('#squeeze-scene');if(!this.svg)return;
   const svg=this.svg;
   svg.addEventListener('pointerdown',e=>{if(!this.ready()||e.isPrimary===false||e.button>0)return;e.preventDefault();this.advance();if(!this.ready())return;svg.focus({preventScroll:true});this.down={id:e.pointerId,x:e.clientX,y:e.clientY,p:this.game.round.squeeze.progress};svg.setPointerCapture(e.pointerId);});
   svg.addEventListener('pointermove',e=>{if(!this.down||e.pointerId!==this.down.id||!this.ready())return;e.preventDefault();this.advance();if(!this.ready())return;const scale=Math.abs(svg.getScreenCTM()?.a||1);this.game.updateBaccaratSqueeze(this.down.p+((this.down.x-e.clientX)+(this.down.y-e.clientY))/(180*scale));if(this.game.round.squeeze.progress>=.99)this.finish();else this.paint();});
   const stop=e=>{if(this.down?.id===e.pointerId)this.down=null;};for(const type of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(type,stop);
   svg.addEventListener('keydown',e=>{if(!this.ready())return;if(['Enter',' '].includes(e.key)){e.preventDefault();this.finish();}else if(['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)){e.preventDefault();this.advance();if(!this.ready())return;this.game.updateBaccaratSqueeze(this.game.round.squeeze.progress+.08);if(this.game.round.squeeze.progress>=.99)this.finish();else this.paint();}});
   this.paint();
   if(!this.game.paused&&this.game.round.phase==='squeezing')svg.focus({preventScroll:true});
 }
 ready(){return !this.game.paused&&this.game.round?.phase==='squeezing';}
 finish(){this.advance();if(this.game.finishBaccaratSqueeze()){this.down=null;this.onChange();}}
 paint(){const layer=this.svg?.querySelector('#squeeze-dynamic');if(!layer)return;const r=this.game.round;if(!r?.squeeze)return;layer.innerHTML=squeezeScene(r,this.art,this.reduced());this.svg.setAttribute('aria-valuenow',String(Math.round(r.squeeze.progress*100)));}
}
