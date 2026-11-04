// Approved home artwork remains separate from real, accessible DOM controls.
export const HOME_ART={background:'/art/home-b/background.png',logo:'/art/home-b/logo.png'};
const homeIcons={
 start:'<path d="M-13-23 24 0-13 23Z" fill="currentColor" stroke="none"/>',
 rank:'<path d="M-21-23H21V-5C21 13 10 22 0 22S-21 13-21-5Z M-21-16H-34V-3C-34 11-22 13-16 13 M21-16H34V-3C34 11 22 13 16 13 M0 22V34 M-18 35H18"/>',
 settings:'<path d="M-8-35 8-35 12-25 20-21 31-23 39-9 31-1 31 8 39 17 31 31 20 28 12 33 8 43-8 43-12 33-20 28-31 31-39 17-31 8-31-1-39-9-31-23-20-21-12-25Z" transform="translate(0 -4) scale(.85)"/><circle r="12"/>',
 install:'<path d="M-31-4 0-30 31-4 M-23-10V30H23V-10 M-8 30V8H8V30 M24-30V-12 M15-21H33"/>',
 support:'<path d="M0 26C-7 18-32 4-32-13-32-34-8-38 0-19 8-38 32-34 32-13 32 4 7 18 0 26Z"/>'
};
export function homeView({art}){
 const menu=[['start','開始遊戲'],['rank','賭神龍虎榜'],['settings','設定'],['install','加到主頁面'],['support','支持作者']];
 return `<main class="home home-title-screen" aria-label="五分鐘賭神主頁"><div class="home-safe-area"><div class="home-scene"><img class="title-art" src="${art(HOME_ART.background)}" alt="" width="1672" height="941" draggable="false"><div class="title-top-shade" aria-hidden="true"></div><div class="title-menu-shade" aria-hidden="true"></div><div class="title-frame" aria-hidden="true"></div><h1 class="title-logo"><img src="${art(HOME_ART.logo)}" alt="五分鐘賭神" width="2172" height="724" draggable="false"></h1><p class="title-orientation">橫向遊玩，體驗更佳</p><nav class="title-menu" aria-label="主選單"><p class="title-menu-lead">傳奇，由你開局</p>${menu.map(([id,label])=>`<button type="button" class="title-menu-button title-menu-${id}" data-action="home-${id}"><span class="title-menu-icon" aria-hidden="true"><svg viewBox="-44 -44 88 88" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${homeIcons[id]}</svg></span><span class="title-menu-label">${label}</span><span class="title-menu-arrow" aria-hidden="true">›</span></button>`).join('')}</nav></div></div></main>`;
}
export function homeLayout(width,height){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return null;
 const viewWidth=Math.max(1920,1080*width/height),unit=Math.min(width/viewWidth,height/1080);
 return {unit,viewWidth,width:viewWidth*unit,height:1080*unit,left:(width-viewWidth*unit)/2,top:(height-1080*unit)/2};
}
export function fitHomeSurface(root=globalThis.document){
 const safe=root?.querySelector?.('.home-safe-area'),scene=root?.querySelector?.('.home-scene');
 if(!safe||!scene)return false;
 const layout=homeLayout(safe.clientWidth,safe.clientHeight);if(!layout)return false;
 for(const [key,value] of Object.entries(layout))scene.style.setProperty('--home-'+key,String(value)+(key==='viewWidth'?'':'px'));
 const gap=Math.max(4,Math.min(12,20*layout.unit)),buttonHeight=Math.max(44,128*layout.unit),menuHeight=5*buttonHeight+4*gap;
 const menuTop=Math.max(8,Math.min(240*layout.unit,layout.height-menuHeight-12));
 for(const [key,value] of Object.entries({'menu-top':menuTop,'menu-button-height':buttonHeight,'menu-gap':gap}))scene.style.setProperty('--home-'+key,value+'px');
 if(scene.dataset)scene.dataset.menuCompact=String(menuTop<45||layout.height<300);
 return true;
}
export function homeInstallInfo({userAgent='',platform='',maxTouchPoints=0,standalone=false,displayStandalone=false,protocol=''}={}){
 const ios=/iPhone|iPad|iPod/i.test(userAgent)||platform==='MacIntel'&&maxTouchPoints>1,android=/Android/i.test(userAgent),embedded=/FBAN|FBAV|MicroMessenger|Instagram|\bLine\/|; wv\)/i.test(userAgent);
 const chrome=!embedded&&!/Edg|OPR|SamsungBrowser|FxiOS/i.test(userAgent)&&/CriOS|Chrome|Chromium/i.test(userAgent);
 const safari=!embedded&&!chrome&&!/Edg|OPR|FxiOS|Android/i.test(userAgent)&&/Safari/i.test(userAgent);
 return {browser:chrome?'chrome':safari?'safari':null,device:ios?'ios':android?'android':'other',installed:standalone===true||displayStandalone===true,local:protocol==='file:'};
}
export function homeDialogView({kind,name,mode,save,legacy,warning,button,escape,money,soundControls,installInfo={},installBrowser=null}){
 const close=button('close-overlay','返回主頁','outlined home-dialog-close');let title,content;
 const modes=`<div class="mode-picker" aria-label="選擇挑戰模式">${button('mode','五分鐘挑戰',mode==='race'?'selected':'',`data-mode="race" aria-pressed="${mode==='race'}"`)}${button('mode','自由挑戰',mode==='free'?'selected':'',`data-mode="free" aria-pressed="${mode==='free'}"`)}</div>`;
 if(kind==='start'){
  title='開始遊戲';content=`<h2 id="home-dialog-title">${title}</h2><form id="start-form"><label for="player-name">參賽者姓名</label><input id="player-name" name="playerName" autocomplete="nickname" maxlength="32" placeholder="怎樣稱呼你？" value="${escape(name)}" required>${modes}<p class="field-note">${mode==='race'?'完成局自動保存。':'完成局自動保存，亦可手動保存。'}新挑戰由 $100 開始，限時五分鐘。</p><button type="submit" class="primary start-button">開始新挑戰 <span aria-hidden="true">↗</span></button></form>${save?button('continue',`繼續上次挑戰 · ${money(save.profile.bank)}`,'outlined home-continue'):''}${close}`;
 }else if(kind==='settings'){
  title='設定';content=`<h2 id="home-dialog-title">${title}</h2><section class="home-settings-section" aria-label="聲效設定"><h3>音效</h3>${soundControls()}</section><section class="home-settings-section" aria-label="存檔管理"><h3>存檔與備份</h3>${modes}<p class="field-note">選擇與存檔相同的模式，再匯入或繼續。只保存完成局；載入保留存檔餘秒。</p><div class="home-save-actions">${save?button('continue',`繼續上次挑戰 · ${money(save.profile.bank)}`,'outlined'):''}${button('import','匯入挑戰存檔','outlined')}${legacy?button('export-legacy','匯出保留的舊版存檔','outlined'):''}</div></section>${close}`;
 }else if(kind==='rank'){
  title='賭神龍虎榜';content=`<h2 id="home-dialog-title">${title}</h2><p class="home-info-status">排行榜尚未開放</p><p>網絡排行榜正在規劃中，目前不會上傳任何成績。</p><p>完成挑戰後，仍可查看本機結果及匯出挑戰紀錄。</p>${close}`;
 }else if(kind==='install'){
  title='加到主頁面';const browser=['safari','chrome'].includes(installBrowser)?installBrowser:installInfo.browser||'safari';
  const steps=browser==='safari'?['點選「分享」按鈕。','選擇「加入主畫面」。','點「加入」，之後便可從主畫面的圖示全螢幕開啟遊戲。']:installInfo.device==='android'?['點選右上角「⋮」選單。','選擇「加至主畫面」或「安裝應用程式」。','依瀏覽器提示點「新增」或「安裝」。','之後便可從主畫面的圖示全螢幕開啟遊戲。']:['點選右上角「分享」按鈕。','向下拉，選擇「加至主畫面」。','點右下角「新增」。','之後便可從主畫面的圖示全螢幕開啟遊戲。'];
  const caption=installInfo.device==='ios'?'iPhone／iPad':installInfo.device==='android'?'Android':'手機瀏覽器';
  content=`<h2 id="home-dialog-title">${title}</h2>${installInfo.installed?'<p class="home-info-status">你已從主畫面開啟遊戲，無需再次加入。</p>':`<p>將《五分鐘賭神》放到手機主畫面，下次一按即可開啟。</p>${installInfo.local?'<p class="install-note">請先用手機瀏覽器開啟網頁版，再依以下步驟加入。<a href="https://jacobmaster-97.github.io/charity-casino/" target="_blank" rel="noopener">開啟網頁版</a></p>':''}<div class="install-browser-picker" role="group" aria-label="選擇瀏覽器">${button('install-browser','SAFARI','outlined',`data-browser="safari" aria-pressed="${browser==='safari'}"`)}${button('install-browser','CHROME','outlined',`data-browser="chrome" aria-pressed="${browser==='chrome'}"`)}</div><p class="install-platform">${caption} · ${browser==='safari'?'SAFARI':'CHROME'}${installInfo.browser?'':'（可自行選擇）'}</p><ol class="install-steps">${steps.map(step=>'<li>'+step+'</li>').join('')}</ol>${installInfo.device==='ios'?'<p class="install-note">如出現「開啟為網頁 App」，請保持開啟。</p>':installInfo.device==='other'?'<p class="install-note">請用手機開啟本網站，再依所用瀏覽器的步驟操作。</p>':''}`}${close}`;
 }else if(kind==='support'){
  title='支持作者';content=`<h2 id="home-dialog-title">${title}</h2><p class="home-info-status">感謝你遊玩《五分鐘賭神》。</p><p>你的試玩與意見，就是對這款遊戲的支持。</p><p>支持連結尚未開放。</p>${close}`;
 }else return '';
 return `<div class="modal-backdrop home-modal-backdrop"><section class="modal home-menu-dialog home-dialog-${kind}" role="dialog" aria-modal="true" aria-labelledby="home-dialog-title" tabindex="-1">${content}${warning?`<p class="warning" role="status">${escape(warning)}</p>`:''}</section></div>`;
}
