import {challengeRecord,recordCash,recordSigned,recordTime} from './challenge.mjs?v=0.13.4';

export function wrapRecordText(ctx,text,width){
 const lines=[];let line='';for(const char of String(text)){if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=char;}else line+=char;}if(line)lines.push(line);return lines;
}
export function recordCardLayout(ctx,record){
 ctx.font='700 20px system-ui,sans-serif';const name=wrapRecordText(ctx,record.name,285);
 ctx.font='800 52px system-ui,sans-serif';const bank=wrapRecordText(ctx,recordCash(record.bank),292);
 const labelY=125+(name.length-1)*24,bankY=labelY+65,metricsY=Math.max(232,bankY+(bank.length-1)*58+38);
 let y=112;ctx.font='700 17px system-ui,sans-serif';
 const rows=record.rows.map(row=>{const lines=wrapRecordText(ctx,recordSigned(row.net),157),height=Math.max(34,12+lines.length*22),layout={...row,lines,y,height};y+=height;return layout;});
 return {name,bank,labelY,bankY,metricsY,rows,height:Math.max(322,metricsY+86,y+26)};
}
function recordPlaque(ctx,x,y,w,h,fill,stroke='#9b8048',cut=8){
 ctx.beginPath();ctx.moveTo(x+cut,y);ctx.lineTo(x+w-cut,y);ctx.lineTo(x+w,y+cut);ctx.lineTo(x+w,y+h-cut);ctx.lineTo(x+w-cut,y+h);ctx.lineTo(x+cut,y+h);ctx.lineTo(x,y+h-cut);ctx.lineTo(x,y+cut);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
}
function recordGradient(ctx,y1,y2,colors){const g=ctx.createLinearGradient(0,y1,0,y2);colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c));return g;}
function recordText(ctx,text,x,y,size=17,color='#eee6cb',weight=600,align='left'){ctx.font=`${weight} ${size}px system-ui,"PingFang TC",sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(String(text),x,y);}
export function drawRecordCard(canvas,record,images={}){
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('此瀏覽器未能建立分享圖片。');
 const layout=recordCardLayout(ctx,record),height=Math.max(900,Math.ceil((layout.height+128)*2));
 if(height>8192)throw new Error('紀錄內容過長，未能產生分享圖片。');
 canvas.width=1600;canvas.height=height;ctx.scale(2,2);ctx.direction='ltr';
 ctx.fillStyle='#06170f';ctx.fillRect(0,0,800,height/2);
 if(images.background){const iw=images.background.naturalWidth||1672,ih=images.background.naturalHeight||941,factor=Math.max(800/iw,height/2/ih),w=iw*factor,h=ih*factor;ctx.globalAlpha=.16;ctx.drawImage(images.background,(800-w)/2,(height/2-h)/2,w,h);ctx.globalAlpha=1;}
 ctx.translate(8,(height/2-layout.height*.98)/2);ctx.scale(.98,.98);
 recordPlaque(ctx,-3,5,806,layout.height+4,'#010d08','#372614',18);
 recordPlaque(ctx,0,0,800,layout.height,recordGradient(ctx,0,layout.height,['#173f2e','#0a291f','#092018']),'#edcf88',18);
 recordPlaque(ctx,6,6,788,layout.height-12,null,'#9b8048',15);
 if(images.logo)ctx.drawImage(images.logo,18,10,148,49.34);else recordText(ctx,'五分鐘賭神',20,44,23,'#f8d47e',800);
 recordText(ctx,'挑戰記錄',400,42,30,recordGradient(ctx,12,46,['#fff9dd','#ffe5a0','#c59648']),800,'center');
 recordPlaque(ctx,662,21,112,28,record.failed?'#5e2830':'#263c27','#ad8a4a',5);
 recordText(ctx,record.failed?'挑戰失敗':'挑戰完成',718,41,15,record.failed?'#ffd0c3':'#f3d69a',700,'center');
 ctx.strokeStyle='#aa8548';ctx.beginPath();ctx.moveTo(24,64);ctx.lineTo(383,64);ctx.moveTo(417,64);ctx.lineTo(776,64);ctx.stroke();recordPlaque(ctx,396,60,8,8,'#d0aa60',null,4);
 ctx.fillStyle='#183c2c';ctx.fillRect(16,76,306,layout.height-94);
 ctx.strokeStyle='#45613b';ctx.beginPath();ctx.moveTo(317,82);ctx.lineTo(317,layout.height-28);ctx.stroke();
 layout.name.forEach((line,i)=>recordText(ctx,line,26,95+i*24,20,'#d6ddc4',600));
 recordText(ctx,'最終資金',26,layout.labelY,16,'#cfba86');
 layout.bank.forEach((line,i)=>recordText(ctx,line,24,layout.bankY+i*58,52,record.failed?'#ffceb8':recordGradient(ctx,layout.bankY-45,layout.bankY+10,['#fff9dd','#ffe5a0','#c59648']),800));
 const metrics=record.failed?[['遊玩時間',recordTime(record)],['完成局數',record.rounds+' 局']]:[['完成局數',record.rounds+' 局']];
 metrics.forEach(([label,value],i)=>{const x=26+i*148,w=record.failed?137:285;recordPlaque(ctx,x,layout.metricsY,w,58,'#102d22','#486344',5);if(record.failed){recordText(ctx,label,x+12,layout.metricsY+19,14,'#b8c6ac');recordText(ctx,value,x+12,layout.metricsY+47,23,'#f6e7bf',700);}else{recordText(ctx,label,x+14,layout.metricsY+36,15,'#b8c6ac');recordText(ctx,value,x+w-12,layout.metricsY+40,27,'#f6e7bf',700,'right');}});
 recordText(ctx,'五桌戰績',343,95,18,'#f1d18c',800);recordText(ctx,'局數',616,95,14,'#b9c8ae',600,'center');recordText(ctx,'淨贏取',764,95,14,'#b9c8ae',600,'right');
 const maximum=record.rows.reduce((n,r)=>r.net>n?r.net:n,0),symbols=['⚂','♧','A','♠','◎'];
 layout.rows.forEach((row,i)=>{const best=maximum>0&&row.net===maximum;recordPlaque(ctx,338,row.y,438,row.height-3,best?'#2c4931':i%2?'#123327':'#0b271d',best?'#c8a462':'#2b4c35',4);recordText(ctx,symbols[i],359,row.y+23,23,'#c7ba88',700,'center');recordText(ctx,row.label,381,row.y+23,17,best?'#ffe4a5':'#eee6cb');recordText(ctx,row.rounds,616,row.y+23,17,'#d8dfca',500,'center');row.lines.forEach((line,j)=>recordText(ctx,line,764,row.y+23+j*22,17,row.net<0?'#ffb1a3':row.net>0?'#e7d79f':'#9da993',700,'right'));});
 return {width:canvas.width,height:canvas.height,layout};
}
function loadRecordArt(url,{ImageClass=globalThis.Image,schedule=setTimeout,cancel=clearTimeout}={}){
 return new Promise(resolve=>{let timer,done=false;const finish=image=>{if(done)return;done=true;cancel(timer);resolve(image);};try{const image=new ImageClass();image.decoding='async';image.onload=()=>finish(image);image.onerror=()=>finish(null);timer=schedule(()=>finish(null),2500);image.src=url;if(image.complete&&image.naturalWidth>0)finish(image);}catch{finish(null);}});
}
export async function renderRecordPNG(record,art,{document=globalThis.document,loadImage=loadRecordArt,schedule=setTimeout,cancel=clearTimeout}={}){
 const [logo,background]=await Promise.all([loadImage(art('/art/home-b/logo.png')),loadImage(art('/art/styles/b/lobby-populated-v4.png'))]);
 const canvas=document.createElement('canvas');drawRecordCard(canvas,record,{logo,background});
 return new Promise((resolve,reject)=>{let done=false;const finish=(blob,error)=>{if(done)return;done=true;cancel(timer);if(blob?.type==='image/png')resolve(blob);else reject(error||new Error('未能建立PNG分享圖片。'));};const timer=schedule(()=>finish(null,new Error('分享圖片準備逾時。')),10000);try{canvas.toBlob(blob=>finish(blob),'image/png');}catch(e){finish(null,e);}});
}
export function downloadRecordPNG(blob,filename,{document=globalThis.document,URL=globalThis.URL,schedule=setTimeout}={}){
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();schedule(()=>URL.revokeObjectURL(url),30000);
}
export class RecordShare{
 constructor({render=renderRecordPNG,navigator=globalThis.navigator,secure=()=>globalThis.isSecureContext,FileClass=globalThis.File,download=downloadRecordPNG,onChange=()=>{}}={}){Object.assign(this,{render,navigator,secure,FileClass,download,onChange});this.sequence=0;this.reset();}
 reset(){this.sequence++;this.source=null;this.record=null;this.file=this.blob=null;this.state='idle';this.message='';this.fallback=false;this.promise=null;}
 sync(profile,art,{retry=false}={}){
  if(profile?.status!=='finished')return;
  if(this.source===profile&&!retry)return this.promise;
  this.reset();this.source=profile;this.record=challengeRecord(profile);this.state='preparing';const token=this.sequence,record=this.record;
  this.promise=Promise.resolve().then(()=>this.render(record,art)).then(blob=>{
   if(token!==this.sequence)return;if(blob?.type!=='image/png')throw new Error('未能建立PNG分享圖片。');
   this.blob=blob;this.filename=`五分鐘賭神-${record.failed?'挑戰失敗':'挑戰完成'}.png`;try{this.file=this.FileClass?new this.FileClass([blob],this.filename,{type:'image/png'}):null;}catch{this.file=null;}this.state='ready';this.onChange();
  }).catch(()=>{if(token!==this.sequence)return;this.state='error';this.message='分享圖片準備失敗，請重新準備。';this.onChange();});
  return this.promise;
 }
 downloadImage(){if(!this.blob||this.state==='sharing')return false;try{this.download(this.blob,this.filename);this.message='已開啟PNG下載。';this.onChange();return true;}catch{this.message='未能開啟圖片下載，請重試。';this.fallback=true;this.onChange();return false;}}
 share(){
  if(this.state!=='ready'||!this.blob)return Promise.resolve('not-ready');
  let native=false;try{native=Boolean(this.file&&this.secure()&&this.navigator?.share&&this.navigator?.canShare?.({files:[this.file]}));}catch{}
  if(!native)return Promise.resolve(this.downloadImage()?'download':'failed');
  const token=this.sequence;let request;
  try{request=this.navigator.share({files:[this.file],title:'五分鐘賭神 · 挑戰紀錄'});}catch(e){request=Promise.reject(e);}
  this.state='sharing';this.message='已開啟系統分享選單。';this.fallback=false;this.onChange();
  return Promise.resolve(request).then(()=>{if(token!==this.sequence)return 'stale';this.state='ready';this.message='已交給系統分享。';this.onChange();return 'shared';},e=>{if(token!==this.sequence)return 'stale';this.state='ready';const cancelled=e?.name==='AbortError';this.message=cancelled?'已取消分享。':'未能開啟系統分享，可下載紀錄圖片。';this.fallback=!cancelled;this.onChange();return cancelled?'cancelled':'failed';});
 }
}
