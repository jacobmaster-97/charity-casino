// Approved leaderboard-v1 composition. Real DOM, real API data; no baked scores.
export const LEADERBOARD_ART={ornament:'/art/leaderboard-b/dragon-tiger-v1.webp'};
export function rankCash(value){
 const [whole,fraction]=value.split('.');return '$'+whole.replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+fraction;
}
function rankMoney(row,escape){
 const value=rankCash(row.finalAmount),long=value.length>12;
 return `<span class="rank-money${long?' rank-money-long':''}" data-rank-focus="money-${row.rank}" title="${escape(value)}"${long?` tabindex="0" role="group" aria-label="最終金額 ${escape(value)}，可左右捲動查看完整金額"`:''}><bdi>${escape(value)}</bdi></span>`;
}
function rankBeast(art,escape,tiger=false){
 return `<svg class="rank-beast ${tiger?'rank-tiger':'rank-dragon'}" viewBox="${tiger?'828 32 336 312':'36 32 348 312'}" aria-hidden="true" focusable="false"><image href="${escape(art(LEADERBOARD_ART.ornament))}" width="1200" height="400"/></svg>`;
}
function rankPodium(rows,escape){
 return `<aside class="rank-podium rank-podium-${rows.length}" aria-label="同一榜單快照的前三名">${rows.map(row=>row.rank===1?`<article class="rank-champion${[...row.name].length>8?' rank-champion-long-name':''}" data-rank-focus="champion" tabindex="0" aria-label="第1名 ${escape(row.name)}"><span class="rank-champion-label">龍虎榜首</span><svg class="rank-crown" viewBox="0 0 60 50" aria-hidden="true"><path d="M8 34 4 10 20 20 30 3 40 20 56 10 52 34Z" fill="currentColor"/><path d="M9 43H51" stroke="currentColor" stroke-width="5"/></svg><h3 class="rank-name">${escape(row.name)}</h3>${rankMoney(row,escape)}</article>`:`<article class="rank-medallist rank-medallist-${row.rank}" aria-label="第${row.rank}名 ${escape(row.name)}"><span class="rank-medal-number" aria-hidden="true">${String(row.rank).padStart(2,'0')}</span><h3 class="rank-name">${escape(row.name)}</h3>${rankMoney(row,escape)}</article>`).join('')}</aside>`;
}
export function leaderboardRecordsView({leaderboard:l,escape}){
 const rows=l.items.filter(row=>row.rank>3),busy=l.listState==='loading';
 const empty=rows.length===0;
 return `<section class="rank-list" aria-label="排行榜其他名次" aria-busy="${busy}"><div class="rank-list-heading" aria-hidden="true"><span>名次</span><span>參賽者</span><span>最終金額</span></div><div class="rank-list-scroll" data-rank-focus="list" data-revision="${l.listRevision||0}" tabindex="0" role="region" aria-label="排行榜清單，可上下捲動查看更多名次"><table class="rank-table"><caption class="record-sr">排行榜，依最終金額由高至低</caption><thead class="record-sr"><tr><th scope="col">名次</th><th scope="col">參賽者</th><th scope="col">最終金額</th></tr></thead><tbody>${rows.map(row=>`<tr><td class="rank-number">${String(row.rank).padStart(2,'0')}</td><th scope="row" class="rank-name">${escape(row.name)}</th><td>${rankMoney(row,escape)}</td></tr>`).join('')}</tbody></table>${empty?'<p class="rank-no-more">目前只有這些登榜紀錄</p>':''}</div></section>`;
}
export function leaderboardDialogView({leaderboard:l,button,escape,art=p=>p}){
 const busy=l.listState==='loading',snapshot=l.hasSnapshot===true,hasRows=snapshot&&(l.topThree.length>0||l.items.length>0),failed=l.listState==='error';
 let content;
 if(hasRows)content=rankPodium(l.topThree,escape)+leaderboardRecordsView({leaderboard:l,escape});
 else{
  const title=!l.configured?'排行榜尚未連接':busy?'正在讀取龍虎榜':failed?'暫時未能讀取龍虎榜':snapshot?'龍虎榜尚未有人留名':'準備讀取龍虎榜';
  const note=!l.configured?'你仍可遊玩本機挑戰及分享紀錄圖片。':busy?'請稍候，正在取得登榜成績。':failed?'本機挑戰紀錄仍會保留，請稍後再試。':snapshot?'完成挑戰後，上傳成績即可登榜。':'每次挑戰各留一筆，依最終金額排序。';
  content=`<section class="rank-empty${failed?' rank-load-error':''}" aria-label="${title}"><span class="rank-empty-seal" aria-hidden="true">${failed?'！':'賭'}</span><h3>${title}</h3><p>${note}</p>${snapshot&&!busy&&!failed?button('home-start','開始挑戰','primary rank-button rank-start'):''}</section>`;
 }
 const status=hasRows?(busy?'正在更新榜單…':failed?'更新失敗，保留上次榜單。請重新整理。':''):'';
 return `<div class="modal-backdrop rank-backdrop"><section class="modal rank-dialog${status?' rank-has-status':''}" role="dialog" aria-modal="true" aria-labelledby="rank-title" tabindex="-1"><header class="rank-header"><img class="rank-wordmark" src="${escape(art('/art/home-b/logo.png'))}" alt="五分鐘賭神" width="2172" height="724"><div class="rank-title-group">${rankBeast(art,escape)}<h2 id="rank-title">賭神龍虎榜</h2>${rankBeast(art,escape,true)}</div>${button('close-overlay','返回主頁','outlined rank-button rank-close')}</header><p class="rank-read-status${failed?' rank-read-error':''}" role="status" aria-live="polite">${escape(status||'')}</p><main class="rank-content${hasRows?'':' rank-content-empty'}" data-revision="${l.listRevision||0}">${content}</main><footer class="rank-footer">${button('rank-refresh',busy?'更新中…':'↻ 重新整理','primary rank-button rank-refresh',busy||!l.configured?'disabled':'')}<p class="rank-sort-note"><span>每次挑戰各留一筆 · </span>依最終金額排序</p><nav class="rank-pagination" aria-label="排行榜分頁"><span class="rank-page-number">第 ${l.history.length+1} 頁</span>${button('rank-back','‹ 上一頁','outlined rank-button',busy||!l.history.length?'disabled':'')}${button('rank-next','下一頁 ›','outlined rank-button',busy||!l.nextCursor?'disabled':'')}</nav></footer></section></div>`;
}
export function captureLeaderboardSurface(root,active){
 const body=root?.querySelector?.('.rank-content');if(!body)return null;
 const list=root.querySelector('.rank-list-scroll');
 return {revision:body.dataset.revision,bodyTop:body.scrollTop||0,listTop:list?.scrollTop||0,focusKey:active?.dataset?.rankFocus||null,action:active?.dataset?.action||null,money:[...root.querySelectorAll('.rank-money')].map(n=>({key:n.dataset.rankFocus,left:n.scrollLeft||0}))};
}
export function restoreLeaderboardSurface(root,state){
 const body=root?.querySelector?.('.rank-content');if(!body||!state)return false;
 if(body.dataset.revision===state.revision){
  body.scrollTop=state.bodyTop;const list=root.querySelector('.rank-list-scroll');if(list)list.scrollTop=state.listTop;
  for(const node of root.querySelectorAll('.rank-money')){const saved=state.money.find(x=>x.key===node.dataset.rankFocus);if(saved)node.scrollLeft=saved.left;}
 }
 if(state.focusKey){const target=[...root.querySelectorAll('[data-rank-focus]')].find(n=>n.dataset.rankFocus===state.focusKey);if(target){target.focus({preventScroll:true});return true;}}
 return false;
}
