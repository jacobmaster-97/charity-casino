export function mobileLandscapeDevice(win){
 const n=win.navigator||{},ua=n.userAgent||'';
 return /Android|iPhone|iPad|iPod/i.test(ua)||(n.platform==='MacIntel'&&n.maxTouchPoints>1)||Boolean(n.maxTouchPoints>0&&win.matchMedia?.('(pointer: coarse)').matches&&Math.min(win.screen?.width||Infinity,win.screen?.height||Infinity)<=1024);
}
export function landscapeBlocked(win){
 if(!mobileLandscapeDevice(win))return false;
 const type=win.screen?.orientation?.type;
 if(type?.startsWith('portrait'))return true;if(type?.startsWith('landscape'))return false;
 if(typeof win.orientation==='number')return Math.abs(win.orientation)%180===0;
 return win.innerHeight>win.innerWidth;
}
export function requestLandscape(win){
 if(!mobileLandscapeDevice(win))return;
 try{const request=win.screen?.orientation?.lock?.('landscape');request?.catch?.(()=>{});}catch{}
}
export function landscapeNotice(){return `<div class="landscape-cover" role="dialog" aria-modal="true" aria-labelledby="landscape-title" tabindex="-1"><div class="landscape-card"><span class="landscape-seal" aria-hidden="true">賭</span><div class="rotate-device" aria-hidden="true">↻</div><h1 id="landscape-title">請將裝置轉為橫向</h1><p>橫向開啟，盡覽五張賭桌。</p><p>如未能轉向，請先關閉裝置的直向鎖定。</p><small>遊玩中的牌局與餘秒會保留，轉回橫向後按「繼續」。</small></div></div>`;}
