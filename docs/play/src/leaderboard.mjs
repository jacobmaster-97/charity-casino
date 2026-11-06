import {cashParse} from './cash.mjs?v=0.14.0';
const scoreIdPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const newScoreId=()=>{try{return globalThis.crypto?.randomUUID?.();}catch{return undefined;}};
export function scorePayload(profile){
 if(profile?.status!=='finished'||profile.mode!=='race')throw new Error('只有已結束的五分鐘挑戰可以上傳。');
 const name=profile.name.trim().normalize('NFC'),cents=BigInt(cashParse(profile.bank)).toString();
 if(cents.startsWith('-')||cents.length>128)throw new Error('金額超出排行榜支援範圍，本機紀錄仍會保留。');
 if(!name||[...name].length>16||/[\u0000-\u001f\u007f-\u009f\u061c\u200e-\u200f\u202a-\u202e\u2066-\u2069\ud800-\udfff]/u.test(name))throw new Error('名稱不符合排行榜格式，本機紀錄仍會保留。');
 const s=cents.padStart(3,'0');return {name,finalAmount:s.slice(0,-2)+'.'+s.slice(-2)};
}
const apiErrors={rate_limited:'操作太頻繁，請稍後再試。',submission_conflict:'提交編號與原成績不符，請保留本機紀錄。',invalid_amount:'金額格式不符，本機紀錄仍會保留。',invalid_name:'名稱格式不符，本機紀錄仍會保留。'};
export class Leaderboard {
 constructor({apiBase='',storage=null,fetcher=(...args)=>fetch(...args),onChange=()=>{},uuid=newScoreId,timeoutMs=10000}={}){
  this.api='';try{const u=new URL(apiBase);if(u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/')this.api=u.origin;}catch{}
  Object.assign(this,{storage,fetcher,onChange,uuid,timeoutMs,source:null,entry:null,uploadState:'idle',uploadMessage:'',items:[],topThree:[],hasSnapshot:false,listRevision:0,nextCursor:null,cursor:null,history:[],listState:'idle',listMessage:'',listToken:0});
  this.key='five-minute-god-score-outbox-v1';this.saved=null;try{const e=JSON.parse(storage?.getItem(this.key)||'null');if(e&&scoreIdPattern.test(e.id)&&typeof e.source==='string'&&e.source.length<20000&&typeof e.name==='string'&&typeof e.finalAmount==='string'&&/^(0|[1-9][0-9]{0,125})\.[0-9]{2}$/.test(e.finalAmount))this.saved=e;}catch{}
 }
 get configured(){return Boolean(this.api);}
 sync(profile){
  if(this.source===profile)return;this.source=profile;this.uploadMessage='';this.uploadState='idle';this.entry=null;if(!profile)return;
  try{
   const payload=scorePayload(profile),source=profile.submissionId||JSON.stringify(profile,(_,value)=>typeof value==='bigint'?value.toString():value);let entry=this.saved?.source===source?this.saved:null;
   if(!entry){const id=profile.submissionId||this.uuid();if(!id||!scoreIdPattern.test(id))throw new Error('此瀏覽器未能建立安全提交編號，本機紀錄仍會保留。');entry={id,source,...payload,sent:false};}
   // A changed/edited checkpoint must not silently reuse a pending payload.
   if(entry.name!==payload.name||entry.finalAmount!==payload.finalAmount)throw new Error('本機成績與提交紀錄不符，請保留原紀錄。');
   this.entry=entry;this.uploadState=entry.sent?'sent':'idle';
   if(entry.sent)this.uploadMessage='已上傳。新成績可能需約 15 秒才顯示。';
  }catch(error){this.uploadState='invalid';this.uploadMessage=error.message;}
 }
 persist(entry){if(!this.storage)throw new Error('無法保存提交編號，請啟用瀏覽器儲存空間後重試。');try{this.storage.setItem(this.key,JSON.stringify(entry));this.saved=entry;}catch{throw new Error('無法保存提交編號，尚未上傳；本機紀錄仍會保留。');}}
 async request(path,options={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),this.timeoutMs);
  try{const response=await this.fetcher(this.api+path,{...options,signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});const body=await response.json();if(!response.ok)throw new Error(apiErrors[body.error]||'排行榜暫時無法連線，請稍後重試。');return body;}
  finally{clearTimeout(timer);}
 }
 async upload(){
  if(!this.configured||!this.entry||['sending','sent','invalid'].includes(this.uploadState))return;
  const entry=this.entry;try{this.persist(entry);}catch(error){this.uploadState='error';this.uploadMessage=error.message;this.onChange();return;}
  this.uploadState='sending';this.uploadMessage='正在上傳…';this.onChange();
  try{const result=await this.request('/v1/scores',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':entry.id},body:JSON.stringify({name:entry.name,finalAmount:entry.finalAmount})});if(result.ok!==true||!/^\d+$/.test(result.entryId))throw new Error('伺服器回應無效，請重試。');entry.sent=true;this.persist(entry);if(this.entry===entry){this.uploadState='sent';this.uploadMessage='已上傳。新成績可能需約 15 秒才顯示。';}}
  catch(error){if(this.entry===entry){this.uploadState='error';this.uploadMessage=error.name==='AbortError'?'連線逾時，可重試；本機結算仍會保留。':error.message||'連線失敗，可重試。';}}
  if(this.entry===entry)this.onChange();
 }
 async load(direction='refresh'){
  if(!this.configured)return;let cursor=null,history=[];
  if(direction==='next'){if(!this.nextCursor||this.listState==='loading')return;cursor=this.nextCursor;history=[...this.history,this.cursor];}
  if(direction==='back'){if(!this.history.length||this.listState==='loading')return;history=this.history.slice(0,-1);cursor=this.history.at(-1);}
  const token=++this.listToken;this.listState='loading';this.listMessage='正在讀取排行榜…';this.onChange();
  try{const data=await this.request('/v1/leaderboard?limit=20'+(cursor?'&cursor='+encodeURIComponent(cursor):''));
   if(!Array.isArray(data.items)||data.items.length>20||!(data.nextCursor===null||typeof data.nextCursor==='string'&&data.nextCursor.length<=512)||data.items.some(r=>!r||typeof r.name!=='string'||[...r.name].length>16||typeof r.finalAmount!=='string'||!/^(0|[1-9][0-9]{0,125})\.[0-9]{2}$/.test(r.finalAmount)||!Number.isSafeInteger(r.rank)||r.rank<1))throw new Error('排行榜回應無效，請重試。');
   if(token!==this.listToken)return;Object.assign(this,{items:data.items,topThree:cursor?this.topThree:data.items.filter(row=>row.rank<=3),hasSnapshot:true,listRevision:this.listRevision+1,nextCursor:data.nextCursor,cursor,history,listState:'ready',listMessage:data.items.length?'':'尚未有人上榜，來留下你的成績。'});
  }catch(error){if(token!==this.listToken)return;this.listState='error';this.listMessage=error.name==='AbortError'?'連線逾時，請重試。':error.message||'排行榜暫時無法連線。';}this.onChange();
 }
}
export function leaderboardUploadView({leaderboard:l,button,escape}){
 if(!l)return '';
 if(!l.configured)return '<p class="leaderboard-status">網絡排行榜尚未連接，本機紀錄已保留。</p>';
 return `<div class="leaderboard-upload">${button('upload-score',l.uploadState==='sent'?'已上傳排行榜':l.uploadState==='error'?'重試上傳排行榜':l.uploadState==='sending'?'正在上傳…':'上傳排行榜','outlined',['sending','sent','invalid'].includes(l.uploadState)?'disabled':'')}<p class="leaderboard-status" role="status" aria-live="polite">${escape(l.uploadMessage||'按上傳後，名稱及最終金額將公開顯示。每次挑戰各留一筆。')}</p></div>`;
}
// Compatibility for an entry module still cached from 0.13.0. New UI uses leaderboardDialogView.
export function leaderboardListView({leaderboard:l,button,escape}){
 if(!l?.configured)return '<p class="home-info-status">排行榜尚未連接</p><p>你仍可完成本機挑戰及分享紀錄圖片。</p>';
 const busy=l.listState==='loading';
 return `<p class="field-note">每次挑戰各留一筆 · 依最終金額排序 · 成績由玩家裝置提交</p><div class="leaderboard-scroll"><table class="leaderboard-table"><thead><tr><th>名次</th><th>名稱</th><th>最終金額</th></tr></thead><tbody>${l.items.map(r=>`<tr><td>${r.rank}</td><th scope="row">${escape(r.name)}</th><td><bdi>$${escape(r.finalAmount)}</bdi></td></tr>`).join('')}</tbody></table></div><p class="leaderboard-status" role="status" aria-live="polite">${escape(l.listMessage)}</p><div class="leaderboard-pages">${button('rank-back','上一頁','outlined',busy||!l.history.length?'disabled':'')}${button('rank-refresh','重新整理','outlined',busy?'disabled':'')}${button('rank-next','下一頁','outlined',busy||!l.nextCursor?'disabled':'')}</div>`;
}
