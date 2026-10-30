// Move existing secondary controls into a native dialog; gameplay keeps its clock.
export class TablePanels{
 constructor(root){this.root=root;this.selection='';this.dialog=null;this.detail=null;this.marker=null;}
 beforeRender(){this.release(false);}
 release(clear=true){
   const dialog=this.dialog,detail=this.detail,marker=this.marker;this.dialog=this.detail=this.marker=null;
   if(clear)this.selection='';
   if(detail){detail.open=false;detail.querySelector('summary').hidden=false;if(marker?.parentNode)marker.replaceWith(detail);}
   if(dialog){dialog.close();dialog.remove();}
 }
 mount(blocked=false){
   if(blocked){this.selection='';return;}
   const details=[...this.root.querySelectorAll('.console-tools details')];
   for(const detail of details){
     detail.open=false;
     detail.querySelector('summary').addEventListener('click',event=>{event.preventDefault();this.open(detail);});
   }
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
 close(){const detail=this.detail;this.release();detail?.querySelector('summary')?.focus({preventScroll:true});}
}
export function updateGameViewport(viewport=globalThis.visualViewport,fallback=globalThis.innerHeight,style=document.documentElement.style){
 const height=viewport?.height||fallback;
 if(Number.isFinite(height)&&height>0)style.setProperty('--game-viewport-height',height+'px');
}
