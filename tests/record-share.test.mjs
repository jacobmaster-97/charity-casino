import test from 'node:test';
import assert from 'node:assert/strict';
import {Blob,File} from 'node:buffer';
import {challengeRecord,challengeResultView,recordCash} from '../src/challenge.mjs';
import {RecordShare,drawRecordCard,recordCardLayout,renderRecordPNG,downloadRecordPNG} from '../src/record-share.mjs';
const profile=(failed=false)=>({status:'finished',endReason:failed?'bust':'timeout',name:'阿豪',bank:failed?0:128050,rounds:20,elapsedMs:failed?134000:300000,stats:{sicbo:{rounds:6,net:21000},baccarat:{rounds:4,net:9550},blackjack:{rounds:5,net:-8000},poker:{rounds:3,net:76500},roulette:{rounds:2,net:21000}}});
const png=()=>new Blob([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT2sAAAAASUVORK5CYII=','base64')],{type:'image/png'});
const options=(p,share)=>({game:{profile:p},button:(a,t,c='',e='')=>`<button data-action="${a}" ${e}>${t}</button>`,escape:s=>s.replaceAll('<','&lt;').replaceAll('>','&gt;'),art:r=>r,share});
function canvasFixture(){const texts=[],images=[],ctx={font:'',measureText(s){const size=Number(this.font.match(/(\d+)px/)?.[1]||17);return {width:[...s].length*size*.62};},createLinearGradient(){return {addColorStop(){}};},fillText(s){texts.push(String(s));},drawImage(...args){images.push(args);}};for(const method of ['scale','translate','fillRect','beginPath','moveTo','lineTo','closePath','stroke','fill'])ctx[method]=()=>{};const canvas={width:0,height:0,getContext:()=>ctx,toBlob:fn=>fn(png())};return {canvas,ctx,texts,images};}
test('record snapshot is frozen, exact and detached from the completed profile',()=>{
 const p=profile();p.name='<玩家>';p.bank=10n**40n+1n;const r=challengeRecord(p);p.name='changed';p.stats.sicbo.net=999;assert.equal(r.name,'<玩家>');assert.equal(r.rows[0].net,21000);assert.equal(recordCash(r.bank),'$100,000,000,000,000,000,000,000,000,000,000,000,000.01');assert.ok(Object.isFrozen(r)&&Object.isFrozen(r.rows)&&Object.isFrozen(r.rows[0]));
});
test('approved DOM hides time on complete, shows it on failure and keeps five amounts and both actions',()=>{
 for(const failed of [false,true]){const p=profile(failed);p.name='<測試>';const h=challengeResultView(options(p,{state:'ready',message:''}));assert.ok(h.includes('&lt;測試&gt;'));assert.equal(h.includes('遊玩時間'),failed);assert.equal(h.includes('02:14'),failed);assert.ok(!h.includes('05:00'));assert.equal((h.match(/data-stat-table=/g)||[]).length,5);for(const a of ['home','share-record'])assert.ok(h.includes(`data-action="${a}"`));for(const text of ['道具','本次增減','起始','五分鐘挑戰','匯出挑戰紀錄','淨贏取＝'])assert.ok(!h.includes(text));}
});
test('PNG composition uses the same conditional time and every actual record value, with no UI buttons',()=>{
 for(const failed of [false,true]){const p=profile(failed),r=challengeRecord(p),{canvas,texts}=canvasFixture();const result=drawRecordCard(canvas,r);assert.equal(result.width,1600);assert.equal(result.height,900);assert.ok(texts.includes(recordCash(p.bank)));assert.equal(texts.includes('遊玩時間'),failed);assert.equal(texts.includes('02:14'),failed);assert.ok(texts.includes('阿豪'));assert.ok(!texts.includes('05:00'));assert.ok(!texts.includes('返回主頁')&&!texts.includes('分享挑戰紀錄'));assert.ok(texts.includes('−$80.00'));}
});
test('huge exact amounts and long names wrap without clipping cents; pathological image height is bounded',()=>{
 const p=profile();p.name='十六個中文字姓名測試完整保留';p.bank=10n**120n+3n;p.stats.poker.net=10n**90n+7n;const r=challengeRecord(p),{canvas,ctx}=canvasFixture(),l=recordCardLayout(ctx,r);assert.equal(l.bank.join(''),recordCash(p.bank));assert.equal(l.name.join(''),p.name);assert.ok(l.bank.length>1);assert.ok(drawRecordCard(canvas,r).height>900);p.bank=10n**4094n;assert.throws(()=>drawRecordCard(canvas,challengeRecord(p)),/過長/);
});
test('optional artwork failure still creates PNG with actual values; invalid canvas encoding rejects',async()=>{
 const r=challengeRecord(profile()),f=canvasFixture();const blob=await renderRecordPNG(r,x=>x,{document:{createElement:()=>f.canvas},loadImage:async()=>null});assert.equal(blob.type,'image/png');assert.ok(f.texts.includes('五分鐘賭神'));assert.ok(f.texts.includes('$1,280.50'));f.canvas.toBlob=fn=>fn(null);await assert.rejects(()=>renderRecordPNG(r,x=>x,{document:{createElement:()=>f.canvas},loadImage:async()=>null}),/PNG/);
});
test('completed snapshot prepares once, native sharing starts synchronously on tap and rejects double taps',async()=>{
 let renders=0,sent=null,resolve;const p=profile(),before=structuredClone(p),s=new RecordShare({render:async()=>{renders++;return png();},FileClass:File,secure:()=>true,navigator:{canShare:({files})=>files[0].type==='image/png',share:payload=>{sent=payload;return new Promise(r=>resolve=r);}}});
 await s.sync(p,x=>x);await s.sync(p,x=>x);assert.equal(renders,1);const request=s.share();assert.equal(sent.files[0].type,'image/png');assert.equal(sent.files[0].name,'五分鐘賭神-挑戰完成.png');assert.equal(s.state,'sharing');assert.equal(await s.share(),'not-ready');resolve();assert.equal(await request,'shared');assert.equal(s.state,'ready');assert.deepEqual(p,before);
});
test('unsupported or insecure native sharing downloads PNG, not JSON, and File failure still permits fallback',async()=>{
 let downloads=0;class MissingFile{constructor(){throw Error('unsupported');}}
 const s=new RecordShare({render:async()=>png(),FileClass:MissingFile,secure:()=>false,navigator:{share(){throw Error('must not share');}},download:(blob,name)=>{assert.equal(blob.type,'image/png');assert.equal(name,'五分鐘賭神-挑戰失敗.png');downloads++;}});await s.sync(profile(true),x=>x);assert.equal(await s.share(),'download');assert.equal(downloads,1);
});
test('native cancellation never downloads; native rejection exposes a user-selected PNG fallback',async()=>{
 let mode='AbortError',downloads=0;const s=new RecordShare({render:async()=>png(),FileClass:File,secure:()=>true,navigator:{canShare:()=>true,share:()=>Promise.reject({name:mode})},download:()=>downloads++});await s.sync(profile(),x=>x);assert.equal(await s.share(),'cancelled');assert.equal(downloads,0);assert.equal(s.fallback,false);mode='NotAllowedError';assert.equal(await s.share(),'failed');assert.equal(s.fallback,true);assert.equal(downloads,0);assert.equal(s.downloadImage(),true);assert.equal(downloads,1);
});
test('late PNG generation and old native promises cannot replace a new record or reopen results',async()=>{
 const pending=[];let finish;const s=new RecordShare({render:r=>new Promise(resolve=>pending.push({r,resolve})),FileClass:File,secure:()=>true,navigator:{canShare:()=>true,share:()=>new Promise(resolve=>finish=resolve)}}),first=s.sync(profile(),x=>x);await Promise.resolve();const second=s.sync(profile(true),x=>x);await Promise.resolve();pending[1].resolve(png());await second;pending[0].resolve(png());await first;assert.equal(s.record.failed,true);const share=s.share();s.reset();finish();assert.equal(await share,'stale');assert.equal(s.state,'idle');assert.equal(s.record,null);
});
test('image preparation failures can retry and cannot hold gameplay behind an unresolved image',async()=>{
 let fail=true;const s=new RecordShare({render:async()=>{if(fail)throw Error('encoder');return png();},FileClass:File}),p=profile();assert.equal(s.sync({...p,status:'active'},x=>x),undefined);await s.sync(p,x=>x);assert.equal(s.state,'error');fail=false;await s.sync(p,x=>x,{retry:true});assert.equal(s.state,'ready');
});
test('download is initiated from the selected PNG blob and its object URL is later revoked',()=>{
 const revoked=[],clicked=[],tasks=[],blob=png(),anchor={click(){clicked.push([this.href,this.download]);},remove(){}},doc={body:{append(){}},createElement:()=>anchor};downloadRecordPNG(blob,'紀錄.png',{document:doc,URL:{createObjectURL:b=>{assert.equal(b,blob);return 'blob:record';},revokeObjectURL:u=>revoked.push(u)},schedule:fn=>tasks.push(fn)});assert.deepEqual(clicked,[['blob:record','紀錄.png']]);assert.deepEqual(revoked,[]);tasks[0]();assert.deepEqual(revoked,['blob:record']);
});

test('an encoder that never calls back times out instead of leaving Share disabled forever',async()=>{
 const r=challengeRecord(profile()),f=canvasFixture();f.canvas.toBlob=()=>{};let expire;const pending=renderRecordPNG(r,x=>x,{document:{createElement:()=>f.canvas},loadImage:async()=>null,schedule:fn=>{expire=fn;return 1;},cancel(){}});await Promise.resolve();await Promise.resolve();expire();await assert.rejects(pending,/逾時/);
});
