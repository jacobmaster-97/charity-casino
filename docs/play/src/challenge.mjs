import {cashParse} from './cash.mjs?v=0.13.4';
import {duration} from './rules.mjs?v=0.13.4';
export const CHALLENGE_MS=300000;
export const CHALLENGE_RULESET='five-minute-v1';
export const CHALLENGE_TABLES={sicbo:'大小',baccarat:'百家樂',blackjack:'21點',poker:'德州撲克',roulette:'輪盤'};
export const challengeStats=()=>Object.fromEntries(Object.keys(CHALLENGE_TABLES).map(id=>[id,{rounds:0,net:0}]));
export function recordCash(value){const n=BigInt(cashParse(value)),a=n<0n?-n:n;return (n<0n?'−':'')+'$'+(a/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+(a%100n).toString().padStart(2,'0');}
export const recordSigned=value=>(value>0?'+':'')+recordCash(value);
export function challengeRecord(profile){
 const rows=Object.entries(CHALLENGE_TABLES).map(([id,label])=>Object.freeze({id,label:id==='blackjack'?'21 點':label,rounds:profile.stats?.[id]?.rounds??0,net:cashParse(profile.stats?.[id]?.net??0)}));
 return Object.freeze({name:String(profile.name),failed:profile.endReason==='bust'||profile.status==='lost',bank:cashParse(profile.bank),rounds:profile.rounds,elapsedMs:profile.elapsedMs,rows:Object.freeze(rows)});
}
export const recordTime=record=>duration(record.elapsedMs).slice(3);
const recordIconPaths=[
 '<rect x="4" y="4" width="20" height="20" rx="4"/><circle cx="9" cy="9" r="1.5"/><circle cx="14" cy="14" r="1.5"/><circle cx="19" cy="19" r="1.5"/>',
 '<rect x="3" y="5" width="14" height="20" rx="2"/><rect x="12" y="2" width="13" height="20" rx="2"/>',
 '<rect x="5" y="2" width="18" height="24" rx="2"/><text x="14" y="20" text-anchor="middle" font-size="17" stroke="none" fill="currentColor">A</text>',
 '<path d="M14 1C10 7 3 11 3 16 3 24 11 25 14 19 17 25 25 24 25 16 25 11 18 7 14 1ZM14 18 10 27H18Z" fill="currentColor" stroke="none"/>',
 '<circle cx="14" cy="14" r="11"/><circle cx="14" cy="14" r="4"/><path d="M14 3V10M14 18V25M3 14H10M18 14H25M6 6 11 11M17 17 22 22M22 6 17 11M11 17 6 22"/>'
];
export function challengeResultView({game,button,escape,art=p=>p,share={state:'idle',message:''},uploadContent=''}){
 const r=challengeRecord(game.profile),maximum=r.rows.reduce((n,row)=>row.net>n?row.net:n,0),waiting=['idle','preparing','sharing'].includes(share.state);
 return `<div class="challenge-result record-${r.failed?'failed':'complete'}"><header class="record-heading"><img src="${art('/art/home-b/logo.png')}" alt="五分鐘賭神" width="2172" height="724"><h2 id="record-title">挑戰記錄</h2><span class="record-status">${r.failed?'挑戰失敗':'挑戰完成'}</span></header><div class="record-body"><section class="challenge-result-summary" aria-label="最終資金及完成局數"><p class="record-name">${escape(r.name)}</p><span class="record-bank-label">最終資金</span><strong class="challenge-final-bank"><bdi>${recordCash(r.bank)}</bdi></strong><div class="record-metrics">${r.failed?`<div><span>遊玩時間</span><strong>${recordTime(r)}</strong></div>`:''}<div><span>完成局數</span><strong>${r.rounds} 局</strong></div></div></section><section class="challenge-result-breakdown"><table aria-label="各款遊戲完成局數及淨贏取金額"><caption>五桌戰績</caption><thead><tr><th scope="col"><span class="record-sr">遊戲</span></th><th scope="col">局數</th><th scope="col">淨贏取</th></tr></thead><tbody>${r.rows.map((row,i)=>`<tr data-stat-table="${row.id}" class="${maximum>0&&row.net===maximum?'record-best':''}"><th scope="row"><span class="record-game-name"><svg aria-hidden="true" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.5">${recordIconPaths[i]}</svg><span>${row.label}</span></span></th><td>${row.rounds}</td><td class="${row.net<0?'stat-loss':row.net>0?'stat-win':'record-zero'}"><bdi>${recordSigned(row.net)}</bdi></td></tr>`).join('')}</tbody></table></section></div><footer class="challenge-result-actions"><span class="record-decoration" aria-hidden="true">♠ ♦ ♣</span>${button('home','返回主頁','primary')}${button(share.state==='error'?'retry-record':'share-record',share.state==='error'?'重新準備分享圖片':'分享挑戰紀錄','outlined',waiting?'disabled aria-busy="true"':'')}<span class="record-seal" aria-hidden="true">賭</span></footer>${uploadContent}<p class="record-share-status" role="status" aria-live="polite">${escape(share.state==='preparing'?'正在準備分享圖片…':share.message||'')}${share.fallback?button('download-record','下載紀錄圖片','text-button'):''}</p></div>`;
}
