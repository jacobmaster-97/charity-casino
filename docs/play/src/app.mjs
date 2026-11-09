import {CasinoMusic,MUSIC_ASSET} from './music.mjs?v=0.15.1';
import {landscapeBlocked,requestLandscape,landscapeNotice} from './landscape.mjs?v=0.15.1';
import {settingsDialogView,importConfirmView,SETTINGS_TABS} from './settings-view.mjs?v=0.15.1';
import {tableRulesView} from './instructions.mjs?v=0.15.1';
import {leaderboardDialogView,captureLeaderboardSurface,restoreLeaderboardSurface} from './leaderboard-view.mjs?v=0.15.1';
import {LEADERBOARD_API} from './leaderboard-config.mjs?v=0.15.1';
import {Leaderboard,newScoreId,leaderboardUploadView} from './leaderboard.mjs?v=0.15.1';
import {homeView,homeDialogView,fitHomeSurface,homeInstallInfo} from './home-view.mjs?v=0.15.1';
import {cashAbs,cashAdd,cashRatio,cashMin,cashMax,cashParse,cashEncode,parseDollars} from './cash.mjs?v=0.15.1';
import {challengeResultView} from './challenge.mjs?v=0.15.1';
import {RecordShare} from './record-share.mjs?v=0.15.1';
import {sicboTableView} from './sicbo-view.mjs?v=0.15.1';
import {CasinoSound} from './sound.mjs?v=0.15.1';
import {ROULETTE_ENABLED} from './roulette.mjs?v=0.15.1';
import {rouletteTableView,fitRouletteSurface,paintRouletteChips} from './roulette-view.mjs?v=0.15.1';
import {POKER_ENABLED} from './poker.mjs?v=0.15.1';
import {pokerTableView,paintPokerChips,queuePokerMotions,fitPokerSurface} from './poker-view.mjs?v=0.15.1';
import {BLACKJACK_ENABLED,blackjackOptions} from './blackjack.mjs?v=0.15.1';
import {blackjackTableView,paintBlackjackChips,fitBlackjackSurface} from './blackjack-view.mjs?v=0.15.1';
import {TableArtCache,TABLE_TEXTURES,TablePanels,updateGameViewport,fitBaccaratSurface,fitLobbySurface,mobileTableViewport,mobilePokerViewport,mobileBlackjackViewport,MobileRoundReveal} from './table-layout.mjs?v=0.15.1';
import {BaccaratSqueezeController} from './baccarat-squeeze.mjs?v=0.15.1';
import {BACCARAT_ENABLED,BACCARAT_BETS} from './baccarat.mjs?v=0.15.1';
import {baccaratTableView} from './baccarat-view.mjs?v=0.15.1';
import {Game} from './game.mjs?v=0.15.1';
import {GAME_FEATURES,ITEMS,money,duration,chipLabel} from './rules.mjs?v=0.15.1';
import {boardAmounts,ChipFlights,chipColorIndex} from './board.mjs?v=0.15.1';
import {Saves,validateSave} from './storage.mjs?v=0.15.1';

const app=document.querySelector('#app'),toastNode=document.querySelector('#toast');
const tablePanels=new TablePanels(app),roundReveal=new MobileRoundReveal();updateGameViewport();
let mobileViewport=mobileTableViewport(),mobilePoker=mobilePokerViewport(),mobileBlackjack=mobileBlackjackViewport();
const mobileActive=()=>game.screen==='table'&&(game.activeTable==='poker'?mobilePoker:game.activeTable==='blackjack'?mobileBlackjack:mobileViewport&&['sicbo','baccarat','roulette'].includes(game.activeTable));
window.addEventListener('resize',relayoutTables);
window.visualViewport?.addEventListener('resize',relayoutTables);
let storage;try{storage=window.localStorage;}catch{storage=null;}
const sounds=new CasinoSound({storage});
const saves=new Saves(storage||{getItem(){throw new Error('無法使用瀏覽器儲存空間');},setItem(){throw new Error('無法使用瀏覽器儲存空間');}},{challenge:true});
let homeReturnFocus=null,lobbyReturnFocus=false,homeInstallBrowser=null,rankNavAction=null;
const CHALLENGE_MODE='race';
let settingsTab='sound',settingsParent=null,settingsSoundMessage='',settingsDataMessage='',settingsScroll={},pendingImport=null,importReturnOverlay=null,importWarning='',importReadToken=0;
let storageWarning='',name='',story=false,group='大小',chip=500,allIn=false,peekIndex=0,peekSide='player',overlay=null,toastTimer,last=performance.now();
const game=new Game({challenge:true,features:GAME_FEATURES,onCue:name=>sounds.play(name),onComplete:save=>{try{saves.write(save);storageWarning='';}catch{storageWarning='自動保存失敗，請匯出完成局存檔。';}}});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art=path=>globalThis.__CASINO_ART?.[path]||new URL('../public'+path,import.meta.url).href;
const tableArt=new TableArtCache({url:art});
const music=new CasinoMusic({storage,url:globalThis.__CASINO_MUSIC||art(MUSIC_ASSET)});
let orientationBlocked=landscapeBlocked(window),pageInactive=false;
const leaderboard=new Leaderboard({apiBase:window.location?.protocol==='file:'?'':LEADERBOARD_API,storage,onChange:()=>{if(overlay==='finish'||overlay==='rank')render();}});
const recordShare=new RecordShare({onChange:()=>{if(overlay==='finish')render();}});
let payoutRound=null,payoutShown=false;
const tableName=id=>({sicbo:'大小',baccarat:'百家樂',blackjack:'21 點',poker:'德州撲克',roulette:'輪盤'}[id]||'牌桌');
function enterSelectedTable(id){if(!Object.hasOwn(TABLE_TEXTURES,id)||game.screen!=='lobby'||game.profile?.status!=='active')return false;game.enterTable(id);group='大小';boardZoom=false;return true;}
function hintTableArt(event){if(game.screen!=='lobby'||game.paused||overlay)return;const station=event.target.closest?.('[data-action="table"]');if(station&&!station.disabled)void tableArt.prefetch(station.dataset.table);}
for(const type of ['pointerover','focusin','pointerdown'])app.addEventListener(type,hintTableArt,{passive:true});
const icon=id=>`<span class="prop prop-${id}" aria-hidden="true"></span>`;
const button=(action,text,cls='',extra='')=>`<button type="button" data-action="${action}" class="${cls}" ${extra}>${text}</button>`;
let blackjackSwapHandId=null;
let roulettePrecise='rou-number-0';
let pokerUI={turn:null,raiseTo:null,selection:null,motionSeen:0};
let boardRound=null,boardCounts={},boardLast={},boardChips={},boardZoom=false,preciseBet='small';
const flights=new ChipFlights({art,onChange:paintBoard,onLand:()=>sounds.play('chip'),reduced:()=>matchMedia('(prefers-reduced-motion: reduce)').matches});
const squeeze=new BaccaratSqueezeController({root:app,game,art,advance,onChange:render,reduced:()=>matchMedia('(prefers-reduced-motion: reduce)').matches});
function relayoutTables(){updateOrientation();updateGameViewport();const next=mobileTableViewport(),nextPoker=mobilePokerViewport(),nextBlackjack=mobileBlackjackViewport();if(next!==mobileViewport||nextPoker!==mobilePoker||nextBlackjack!==mobileBlackjack){mobileViewport=next;mobilePoker=nextPoker;mobileBlackjack=nextBlackjack;render();}requestAnimationFrame(()=>{flights.cancel();fitHomeSurface(app);fitLobbySurface(app);fitBaccaratSurface(app);fitBlackjackSurface(app);fitPokerSurface(app);fitRouletteSurface(app);paintBoard();});}
function paintBoard(){if(game.activeTable==='poker'&&game.round){const pendingCounts={};for(const f of flights.flights)pendingCounts[f.id]=(pendingCounts[f.id]||0)+1;paintPokerChips({root:app,game,art,pending:flights.pending,pendingCounts});return;}const landed={};for(const [id,values] of Object.entries(boardChips)){const pendingCount=flights.flights.filter(f=>f.id===id).length;landed[id]=values.slice(0,Math.max(0,values.length-pendingCount)).slice(-3);}if(game.activeTable==='roulette'&&game.round){paintRouletteChips({root:app,game,art,pending:flights.pending,stacks:landed});return;}if(game.activeTable==='blackjack'&&game.round){paintBlackjackChips({root:app,game,art,pending:flights.pending,stacks:landed});return;}const node=document.querySelector('.board-amounts');if(!node||!game.round)return;node.innerHTML=boardAmounts(game.round.bets,flights.pending,art,boardCounts,boardLast,game.round.bankAtStart,landed,Number(document.querySelector('.baccarat-board')?.dataset.boardHeight)||610);for(const cell of document.querySelectorAll('.printed-cell')){cell.classList.toggle('has-bet',Boolean(game.round.bets[cell.dataset.bet]));cell.classList.toggle('mobile-paid',mobileActive()&&game.activeTable==='sicbo'&&game.round.phase==='settled'&&Boolean(game.round.result.lines.find(l=>l.id===cell.dataset.bet)?.payout));}}
const challengeClock=()=>game.closing?'收尾中':duration(Math.ceil((game.remainingMs??0)/1000)*1000);
function readLegacySave(){try{return saves.readLegacy(CHALLENGE_MODE);}catch{return null;}}
function notify(text){toastNode.textContent=text;toastNode.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.classList.remove('visible'),4200);}
function readSave(){try{return saves.read(CHALLENGE_MODE);}catch{storageWarning='存檔無法讀取，原檔已保留；可嘗試匯入備份。';return null;}}
function advance(){updateOrientation();const now=performance.now();const ms=now-last;roundReveal.sync(game,mobileActive());const changed=game.tick(ms);last=now;sounds.sync(game);syncMusic();return roundReveal.tick(ms,game,mobileActive())||changed;}
function hud(){const p=game.profile;if(game.screen==='lobby')return `<header class="hud lobby-hud"><a class="brand" href="#" data-action="brand" aria-label="五分鐘賭神，賭場大廳"><span class="seal" aria-hidden="true">賭</span><span class="lobby-brand-name">五分鐘賭神</span></a><div class="lobby-hud-bank"><span class="lobby-hud-caption">資金</span><strong id="bank-value" title="${money(game.available)}" aria-label="賭本 ${money(game.available)}">${money(game.available)}</strong></div><div class="lobby-hud-time" role="group" aria-label="剩餘時間"><span class="lobby-hud-caption" aria-hidden="true">餘時</span><strong id="elapsed">${challengeClock()}</strong></div><div class="lobby-hud-actions">${game.features.shop&&game.features.items?button('shop','商店','quiet','aria-label="道具商店"'):''}${button('lobby-more','更多','quiet lobby-more-button',`aria-haspopup="dialog" aria-controls="lobby-menu-dialog" aria-expanded="${overlay==='lobby-menu'}"`)}${button('pause','Ⅱ <span class="lobby-pause-label">暫停</span>','quiet pause-button','aria-label="暫停"')}</div></header>`;if(mobileActive()&&game.activeTable==='poker'){const r=game.round,canLeave=r.phase==='poker-ready'&&!r.used||r.phase==='settled';return `<header class="hud mobile-hud mobile-poker-hud">${button('leave','← 大廳','quiet',canLeave?'':'disabled')}<strong class="mobile-table-title">德州撲克</strong><strong id="bank-value">${money(game.available)}</strong><span id="elapsed" aria-label="剩餘時間">${challengeClock()}</span><span class="pk-hud-blinds">盲注 ${money(r.blinds.small)}／${money(r.blinds.big)}</span>${button('pause','Ⅱ 暫停','quiet pause-button')}</header>`;}if(mobileActive()&&game.activeTable==='blackjack'){const r=game.round,canLeave=r.phase==='settled'||r.phase==='betting'&&!game.stake&&!r.used;return `<header class="hud mobile-hud mobile-blackjack-hud">${button('leave','← 大廳','quiet',canLeave?'':'disabled')}<strong class="mobile-table-title">21點</strong><strong id="bank-value" title="${money(game.available)}">${money(game.available)}</strong><span id="elapsed" aria-label="剩餘時間">${challengeClock()}</span>${button('table-tools','更多','quiet','aria-haspopup="dialog" aria-label="21點玩法與投注明細"')}${button('pause','Ⅱ 暫停','quiet pause-button','aria-label="暫停"')}</header>`;}if(mobileActive()){const r=game.round,betting=r.phase==='betting',settled=r.phase==='settled',canLeave=settled||betting&&!game.stake&&!r.used,title={sicbo:'大小',baccarat:'百家樂',roulette:'輪盤'}[game.activeTable];return `<header class="hud mobile-hud">${button('leave','← 大廳','quiet',canLeave&&!roundReveal.visible?'':'disabled')}<strong class="mobile-table-title">${title}</strong><strong id="bank-value">${money(game.available)}</strong><span id="elapsed" aria-label="剩餘時間">${challengeClock()}</span><span class="mobile-round-stake">本局 ${money(game.stake)}</span><strong id="countdown">${betting||['reroll','rou-reroll','swapping'].includes(r.phase)?Math.ceil(r.remaining/1000)+' 秒':settled?'已結算':'開牌中'}</strong>${button('pause','Ⅱ 暫停','quiet pause-button')}</header>`;}return `<header class="hud"><a class="brand" href="#" data-action="brand"><span class="seal">賭</span><span>五分鐘賭神</span></a><div class="hud-stat bank"><span>可用資金</span><strong id="bank-value">${money(game.available)}</strong></div><div class="hud-stat"><span>${esc(p.name)} · 剩餘時間</span><strong id="elapsed" aria-label="剩餘時間">${challengeClock()}</strong></div>${button('pause','Ⅱ <span>暫停</span>','quiet pause-button','aria-label="暫停"')}</header>`;}
function home(){return homeView({art});}
function storyCard(){return `<main class="story-page"><div class="story-card"><h1>今夜，由你入局。</h1><p>賭局已準備就緒<br>你的賭本只有 <strong>$100</strong>。</p><p>在不同賭桌間遊走，將手上賭本<br>在 <strong>五分鐘</strong>內推至最高。<br>賭本歸零，遊戲就會結束。</p>${button('enter','以 $100 開始挑戰','primary')}<small>大小、百家樂、21點、德州撲克及輪盤，五張賭桌現已開放。</small></div></main>`;}
const stations=[['sicbo','大小','SIC BO',33,40],['baccarat','百家樂','BACCARAT',73,40],['poker','德州撲克','TEXAS HOLD’EM',17,68],['blackjack','21 點','BLACKJACK',50,71],['roulette','輪盤','ROULETTE',85,69]];
function lobby(){return `<section class="lobby" aria-label="點選賭桌入座"><div class="lobby-map"><div class="lobby-map-scene"><img src="${art('/art/styles/b/lobby-populated-v4.png')}" alt="" draggable="false">${stations.map(([id,label,en,x,y])=>button((id==='sicbo'||id==='baccarat'&&BACCARAT_ENABLED||id==='blackjack'&&BLACKJACK_ENABLED||id==='poker'&&POKER_ENABLED||id==='roulette'&&ROULETTE_ENABLED)?'table':'coming',`<span>${label}</span><small>${(id==='sicbo'||id==='baccarat'&&BACCARAT_ENABLED||id==='blackjack'&&BLACKJACK_ENABLED||id==='poker'&&POKER_ENABLED||id==='roulette'&&ROULETTE_ENABLED)?'入座遊玩 ↗':'開發中'}</small>`,'station '+((id==='sicbo'||id==='baccarat'&&BACCARAT_ENABLED||id==='blackjack'&&BLACKJACK_ENABLED||id==='poker'&&POKER_ENABLED||id==='roulette'&&ROULETTE_ENABLED)?'available':''),`style="--x:${x}%;--y:${y}%" data-table="${id}" data-label="${label}" aria-label="${label}，${(id==='sicbo'||id==='baccarat'&&BACCARAT_ENABLED||id==='blackjack'&&BLACKJACK_ENABLED||id==='poker'&&POKER_ENABLED||id==='roulette'&&ROULETTE_ENABLED)?'入座遊玩':'開發中'}"`)).join('')}</div></div></section>`;}
function table(){return sicboTableView({game,art,button,icon,chip,allIn,storageWarning,peekIndex,boardZoom,preciseBet,mobile:mobileActive(),popup:roundReveal.visible,popupElapsed:1400-roundReveal.remaining,confirmationPending:roundReveal.awaitingConfirmation});}
function shop(){const cost=cashMax(1,cashRatio(game.profile.bank,1,10,'round'));return `<section class="shop-page"><div class="section-heading"><div><p class="eyebrow">A LITTLE HELP FROM LUCK</p><h1>道具商店</h1><p>每件為購買前資金的 10%。每局最多使用一件。</p></div><details class="shop-details"><summary>說明</summary><p class="save-note">本次每件價格 ${money(cost)}。購買紀錄將於下一局完成時保存。保本券與透視鏡供五桌共用；重擲／重轉券供大小及輪盤按各桌規則使用；換牌券供百家樂、21點及德州撲克使用。</p></details>${button('close-shop','← 返回大廳','outlined')}</div><div class="shop-notice"><span class="gold">計時繼續</span><span>本次價格 ${typeof cost==='bigint'?chipLabel(cost):money(cost)} · 買下一件時重新計價</span></div><div class="shop-grid">${Object.entries(ITEMS).map(([id,item])=>`<article class="shop-card">${icon(id)}<span class="eyebrow">${id==='protect'?'PROTECT':id==='peek'?'INSIGHT':id==='swap'?'SWAP A CARD':'SECOND CHANCE'}</span><h2>${item.name}</h2><p>${item.description}</p><div class="shop-card-bottom"><span>已持有 ${game.profile.inventory[id]} 件</span>${button('buy',`${typeof cost==='bigint'?chipLabel(cost):money(cost)} 購買`,'primary',`data-item="${id}" aria-label="花費 ${money(cost)} 購買${item.name}"`)}</div></article>`).join('')}</div></section>`;}
function payoutContent(){
 const r=game.round,result=r.result,p=game.profile;
 return `<span class="eyebrow">${tableName(game.activeTable)} · 第 ${p.rounds} 局</span><h2 id="round-result-title">本局損益 <strong class="${result.net>=0?'payout-win':'payout-loss'}">${result.net>=0?'+':'−'}${money(cashAbs(result.net))}</strong></h2><dl class="payout-values"><div><dt>本局投注</dt><dd>${money(result.stake)}</dd></div><div><dt>退回及派彩</dt><dd>${money(result.returned)}</dd></div>${result.commission?`<div><dt>莊佣金</dt><dd>${money(result.commission)}</dd></div>`:''}${result.refund?`<div><dt>保本退回</dt><dd>${money(result.refund)}</dd></div>`:''}</dl><p class="payout-save-note">${storageWarning?esc(storageWarning):'已保存完成局'}</p><div class="payout-actions">${p.status==='active'?button('next',game.activeTable==='poker'?'再玩一手':'再玩一局','primary'):button('finish','查看挑戰結果','primary')}${button('leave','返回大廳','outlined')}${button('close-overlay','查看盤面','quiet')}</div><small>${p.status==='active'?'挑戰計時繼續':'遊戲結束'}</small>`;
}
function modal(){if(!overlay)return '';if(overlay==='settings'){const saved=readSave();return settingsDialogView({tab:settingsTab,sound:sounds,music,save:saved,warning:storageWarning,canExport:Boolean(backupSource(saved)),button,escape:esc,parent:settingsParent,paused:game.paused,soundMessage:settingsSoundMessage,dataMessage:settingsDataMessage});}if(overlay==='import-confirm'&&pendingImport)return importConfirmView({save:pendingImport,button,escape:esc,warning:importWarning,paused:game.paused});if(game.screen==='home'&&overlay==='rank')return leaderboardDialogView({leaderboard,button,escape:esc,art});if(game.screen==='home'&&['start','settings','install','support'].includes(overlay))return homeDialogView({kind:overlay,name,save:readSave(),legacy:readLegacySave(),warning:storageWarning,button,escape:esc,money,soundControls,installBrowser:homeInstallBrowser,installInfo:homeInstallInfo({userAgent:window.navigator?.userAgent,platform:window.navigator?.platform,maxTouchPoints:window.navigator?.maxTouchPoints,standalone:window.navigator?.standalone,displayStandalone:window.matchMedia?.('(display-mode: standalone)').matches,protocol:window.location?.protocol})});const isPause=overlay==='pause',isRules=overlay==='rules';let content;
  if(overlay==='round-result')return `<div class="modal-backdrop payout-backdrop"><section class="modal payout-modal" role="dialog" aria-modal="true" aria-labelledby="round-result-title" tabindex="-1">${payoutContent()}</section></div>`;
  if(isPause)content=`<h2>賭局已暫停</h2>${button('resume','繼續','primary')}${button('settings','設定','outlined')}${soundControls()}`;
  else if(isRules)content=tableRulesView({table:game.activeTable,button,itemsEnabled:game.features.items});
  else if(overlay==='lobby-menu')content=`<span class="eyebrow">大廳 · 計時繼續</span><h2>更多</h2><p class="lobby-menu-summary">${esc(game.profile.name)} · 五分鐘最高資金挑戰<br>已完成 ${game.profile.rounds} 局</p><div class="lobby-menu-actions">${button('saves','存檔／讀檔','outlined')}${button('settings','設定','outlined')}${button('home','返回主頁','outlined')}</div><details class="lobby-menu-info"><summary>遊玩及存檔說明</summary><p>點選賭桌入座。只在完成一局後保存；${game.features.shop?'購物及未完成牌局':'未完成牌局'}會隨下次完成局一起記錄，關閉後回到上次完成存檔。</p><p>大廳${game.features.shop?'、商店':''}及本選單繼續計時。手動暫停或切到背景才停錶。</p></details>${button('close-overlay','返回大廳','primary')}`;
  else if(overlay==='finish')content=challengeResultView({game,button,escape:esc,art,share:recordShare,uploadContent:leaderboardUploadView({leaderboard,button,escape:esc})});
  else content=`<span class="eyebrow">CHECKPOINT · 計時繼續</span><h2>每完成一局皆會保存</h2><p>只保存已完成局的狀態；未完成牌局不會寫入存檔。關閉後回到最後完成局。</p><div class="save-actions">${button('export','匯出存檔','primary',game.checkpoint?'':'disabled')}${button('load-auto','讀取存檔','outlined')}${button('import','匯入完成局存檔','outlined')}${button('close-overlay','繼續遊戲','quiet')}</div>${storageWarning?`<p class="warning">${esc(storageWarning)}</p>`:''}`;
  return `<div class="modal-backdrop ${isPause?'pause-cover':overlay==='finish'?'record-backdrop':''}"><section class="modal ${overlay==='finish'?'challenge-result-modal':overlay==='lobby-menu'?'lobby-menu-modal':''}" role="dialog" aria-modal="true" id="${overlay==='lobby-menu'?'lobby-menu-dialog':'game-dialog'}" aria-label="${isPause?'遊戲已暫停':isRules?'玩法與賠率':overlay==='finish'?'挑戰結果':overlay==='lobby-menu'?'更多':'存檔與讀檔'}" tabindex="-1">${content}</section></div>`;
}
function render(){
 const oldSettings=app.querySelector('.settings-scroll');if(oldSettings)settingsScroll[oldSettings.dataset.section]=oldSettings.scrollTop;const openGuides=[...app.querySelectorAll('.settings-guides details[open]')].map(n=>n.dataset.guide);
 roundReveal.sync(game,mobileActive());
 if(payoutRound!==game.round){payoutRound=game.round;payoutShown=false;}
 if(game.screen==='table'&&game.round?.phase==='settled'&&game.round.result&&!roundReveal.awaitingConfirmation&&!roundReveal.visible&&!overlay&&!payoutShown){overlay='round-result';payoutShown=true;}
 sounds.sync(game);syncMusic();tablePanels.beforeRender();const oldBlackjackHands=app.querySelector('.blackjack-mobile .bj-hands'),oldBlackjackScroll=oldBlackjackHands?{left:oldBlackjackHands.scrollLeft,handId:oldBlackjackHands.querySelector('.bj-featured')?.dataset.hand}:null;const oldScroll=document.querySelector('.board-scroll')?.scrollLeft||0;const inventoryOpen=Boolean(document.querySelector('.inventory')?.open);const homeOptionsOpen=Boolean(document.querySelector('.home-options')?.open);const detailsOpen=['bet-details','precise-bet','shoe-details'].filter(c=>document.querySelector('.'+c)?.open);const boardTop=document.querySelector('.board-scroll')?.scrollTop||0;if(game.screen!=='table'||boardRound!==game.round){flights.cancel();boardRound=game.round;boardCounts={};boardLast={};boardChips={};blackjackSwapHandId=null;pokerUI={turn:null,raiseTo:null,selection:null,motionSeen:0};}const active=document.activeElement,rankSurface=captureLeaderboardSurface(app,document.activeElement),action=active?.dataset?.action,bet=active?.dataset?.bet,selectedChip=active?.dataset?.chip,selectedBrowser=active?.dataset?.browser,oldModal=Boolean(document.querySelector('.modal')),oldPopup=Boolean(document.querySelector('.mobile-reveal-dialog'));const ended=game.screen!=='home'&&game.profile&&game.profile.status!=='active';if(ended&&(!overlay||['rules','saves','lobby-menu','settings','import-confirm'].includes(overlay))&&!roundReveal.visible&&!roundReveal.awaitingConfirmation){overlay='finish';pendingImport=null;importReadToken++;}
  leaderboard.sync(overlay==='finish'?(game.checkpoint?.profile||game.profile):null);
  if(overlay==='finish')recordShare.sync(game.checkpoint?.profile||game.profile,art);else if(game.screen==='home'&&recordShare.source)recordShare.reset();
  if(game.activeTable==='poker'&&pokerUI.turn!==game.round?.turnId){pokerUI.turn=game.round?.turnId;pokerUI.raiseTo=null;pokerUI.selection=null;tablePanels.release();}
  app.innerHTML=`<div class="${overlay?'under-overlay'+(overlay==='round-result'?' payout-background':''):''}" ${overlay?'inert':''}>${game.screen==='home'?(story?storyCard():home()):`<div class="game-shell ${game.screen==='table'?'table-shell'+(mobileActive()?' mobile-table':''):game.screen==='lobby'?'lobby-shell':game.screen==='shop'?'shop-shell':''}">${hud()}${game.screen==='lobby'?lobby():game.screen==='shop'?shop():game.activeTable==='roulette'?rouletteTableView({game,art,button,icon,chip,allIn,boardZoom,preciseBet:roulettePrecise,storageWarning,mobile:mobileActive(),popup:roundReveal.visible,confirmationPending:roundReveal.awaitingConfirmation}):game.activeTable==='poker'?pokerTableView({game,art,button,icon,ui:pokerUI,storageWarning,mobile:mobileActive()}):game.activeTable==='blackjack'?blackjackTableView({game,art,button,icon,chip,allIn,storageWarning,swapHandId:blackjackSwapHandId,mobile:mobileActive()}):game.activeTable==='baccarat'?baccaratTableView({game,art,button,icon,chip,allIn,storageWarning,peekSide}):table()}${storageWarning?`<p class="storage-warning">${esc(storageWarning)}</p>`:''}</div>`}</div>${modal()}<input id="import-file" type="file" accept="application/json,.json" hidden>`;
  if(orientationBlocked)app.innerHTML=`<div inert aria-hidden="true">${app.innerHTML}</div>${landscapeNotice()}`;
  const settingsSurface=app.querySelector('.settings-scroll');if(settingsSurface)settingsSurface.scrollTop=settingsScroll[settingsTab]||0;for(const guide of app.querySelectorAll('.settings-guides details'))if(openGuides.includes(guide.dataset.guide))guide.open=true;
  fitHomeSurface(app);fitLobbySurface(app);fitBaccaratSurface(app);fitBlackjackSurface(app,oldBlackjackScroll);fitPokerSurface(app);fitRouletteSurface(app);
  const homeOptions=document.querySelector('.home-options');if(homeOptions)homeOptions.open=homeOptionsOpen;const boardScroll=document.querySelector('.board-scroll');if(boardScroll){boardScroll.scrollLeft=oldScroll;boardScroll.scrollTop=boardTop;}for(const c of detailsOpen){const d=document.querySelector('.'+c);if(d)d.open=true;}const inventory=document.querySelector('.inventory');if(inventory)inventory.open=inventoryOpen;if(game.screen==='table'&&game.activeTable==='poker')pokerUI.motionSeen=queuePokerMotions({root:app,game,flights,seen:pokerUI.motionSeen});paintBoard();flights.mount();flights.pause(game.paused);document.querySelectorAll('.flying-chip').forEach(n=>n.hidden=Boolean(overlay));
  const restoredRankFocus=overlay==='rank'&&restoreLeaderboardSurface(app,rankSurface);
  if(orientationBlocked){app.querySelector('.landscape-cover')?.focus({preventScroll:true});}
  else if(overlay){const d=document.querySelector('.modal');if(overlay==='settings'){const id=['sound-volume','music-volume'].includes(active?.id)?active.id:null;const target=id?d.querySelector('#'+id):action==='settings-tab'?d.querySelector(`[data-action="settings-tab"][data-tab="${settingsTab}"]`):action?d.querySelector(`[data-action="${action}"]`):null;(target||(!oldModal?d.querySelector('button:not(:disabled)'):d)).focus({preventScroll:true});}else if(overlay==='rank'){if(!restoredRankFocus){const wanted=rankSurface?.action||rankNavAction;const target=wanted?[...d.querySelectorAll('button:not(:disabled)')].find(n=>n.dataset.action===wanted):null;(target||(!oldModal?d.querySelector('button:not(:disabled)'):d.querySelector('.rank-list-scroll'))||d).focus({preventScroll:true});}}else if(overlay==='start'&&active?.id==='player-name'){const input=d.querySelector('#player-name');input?.focus({preventScroll:true});if(input?.setSelectionRange&&Number.isInteger(active.selectionStart))input.setSelectionRange(active.selectionStart,active.selectionEnd);}else if(action==='sound'||action==='sound-test')d.querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true});else if(overlay==='finish'&&action&&d.querySelector(`[data-action="${action}"]:not(:disabled)`))d.querySelector(`[data-action="${action}"]:not(:disabled)`).focus({preventScroll:true});else if(!oldModal)(d.querySelector(overlay==='start'?'#player-name':'button:not(:disabled)')||d).focus({preventScroll:true});else d.focus();}
  else if(action){const options=[...app.querySelectorAll('[data-action]')];options.find(b=>b.tagName===active.tagName&&b.dataset.action===action&&(!bet||b.dataset.bet===bet)&&(!selectedChip||b.dataset.chip===selectedChip)&&(!selectedBrowser||b.dataset.browser===selectedBrowser))?.focus({preventScroll:true});}
  tablePanels.mount(Boolean(overlay)||roundReveal.visible||Boolean(game.round?.squeeze)||game.screen!=='table');
  const popupNode=app.querySelector('.mobile-reveal-dialog');if(!popupNode&&oldPopup&&!overlay)app.querySelector('.result-actions button:not(:disabled),.mobile-hud [data-action=pause]')?.focus({preventScroll:true});if(popupNode&&!overlay&&!popupNode.contains(document.activeElement)&&document.activeElement?.dataset?.action!=='pause')(popupNode.querySelector('button:not(:disabled)')||popupNode).focus({preventScroll:true});
  squeeze.mount();
}
function soundButton(){return button('sound',sounds.enabled?'音效：開':'音效：關','outlined sound-toggle',`aria-pressed="${sounds.enabled}" aria-label="${sounds.enabled?'關閉聲效':'開啟聲效'}"`);}
function soundControls(){return `<div class="sound-controls">${soundButton()}${button('sound-test','試聽','outlined sound-toggle')}</div>`;}
function openSettings(){settingsParent=game.screen==='home'?null:overlay||'lobby-menu';if(game.screen==='home')homeReturnFocus='home-settings';settingsTab='sound';settingsSoundMessage='';settingsDataMessage='';advance();overlay='settings';render();}
function openOverlay(type){if(type==='settings')return openSettings();if(type==='rank')rankNavAction=null;if(type==='install')homeInstallBrowser=null;if(game.screen==='home'&&['start','settings','rank','install','support'].includes(type))homeReturnFocus='home-'+type;if(type==='lobby-menu')lobbyReturnFocus=true;advance();if(type==='pause')game.paused=true;overlay=type;render();if(type==='rank')void leaderboard.load();}
function closeOverlay(){if(overlay==='import-confirm'){pendingImport=null;importWarning='';importReadToken++;overlay=importReturnOverlay||'settings';render();return;}if(overlay==='settings'){sounds.stopAll();importReadToken++;overlay=settingsParent;render();if(!overlay)app.querySelector('[data-action="home-settings"]')?.focus({preventScroll:true});return;}const wasPayout=overlay==='round-result';overlay=null;game.paused=false;last=performance.now();render();if(game.screen==='home'&&homeReturnFocus)app.querySelector(`[data-action="${homeReturnFocus}"]`)?.focus({preventScroll:true});homeReturnFocus=null;if(game.screen==='lobby'&&lobbyReturnFocus)app.querySelector('[data-action="lobby-more"]')?.focus({preventScroll:true});lobbyReturnFocus=false;if(wasPayout&&game.screen==='table'&&game.round?.phase==='settled')app.querySelector('[data-action="round-result"]')?.focus({preventScroll:true});}
function showRestored(save,{paused=false}={}){const clean=validateSave(save);if(clean.profile.mode!==CHALLENGE_MODE){notify('目前只支援五分鐘挑戰存檔，原存檔已保留。');return false;}game.restore(clean);chip=500;allIn=false;overlay=paused?'pause':null;game.paused=paused;story=false;last=performance.now();render();notify('已恢復最後完成局；未完成的牌局不會保留。');}
function downloadBackupFile(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body?.append(a);a.click();a.remove?.();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportSave(save=game.checkpoint){if(!save){notify('完成第一局後，才有可匯出的存檔。');return false;}try{downloadBackupFile(new Blob([JSON.stringify(cashEncode(save),null,2)],{type:'application/json'}),`charity-casino-${save.profile.mode}-round-${save.profile.rounds}.json`);return true;}catch{notify('未能開啟備份下載，請重試。');return false;}}
function backupSource(saved=readSave()){return storageWarning&&game.checkpoint?game.checkpoint:saved||game.checkpoint;}
function chooseBackup(){importReturnOverlay=overlay;importWarning='';importReadToken++;document.querySelector('#import-file').click();}
app.addEventListener('submit',event=>{if(orientationBlocked){event.preventDefault();return;}if(event.target.id!=='start-form')return;event.preventDefault();name=document.querySelector('#player-name').value.trim();if(!name||[...name].length>16){notify('請輸入 1–16 字參賽者姓名。');return;}overlay=null;homeReturnFocus=null;story=true;render();});
app.addEventListener('input',event=>{if(orientationBlocked)return;if(event.target.id==='music-volume'){const v=music.setVolume(Number(event.target.value));event.target.setAttribute?.('aria-valuetext',v+'%');for(const n of document.querySelectorAll('[data-music-volume-value]'))n.textContent=v+'%';}if(event.target.id==='sound-volume'){const volume=sounds.setVolume(Number(event.target.value));event.target.setAttribute?.('aria-valuetext',volume+'%');for(const n of document.querySelectorAll('[data-sound-volume-value]'))n.textContent=volume+'%';}if(event.target.id==='player-name')name=event.target.value;if(event.target.id==='pk-raise-to'){pokerUI.raiseTo=parseDollars(event.target.value)??-1;document.querySelectorAll('[data-action=pk-chip]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});}if(event.target.id==='custom-amount'){chip=parseDollars(event.target.value)??0;allIn=false;const selectedAmount=document.querySelector('.selected-amount');if(selectedAmount)selectedAmount.textContent='每次 '+money(chip);document.querySelector('[data-action="all-in"]')?.setAttribute('aria-pressed','false');document.querySelector('[data-action="all-in"]')?.classList.remove('selected');document.querySelectorAll('.chip-picker button').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});}});
app.addEventListener('change',async event=>{
  if(orientationBlocked)return;
  if(['sound-volume','music-volume'].includes(event.target.id)){render();return;}
  if(event.target.id==='bet-target'){preciseBet=event.target.value;const b=document.querySelector('.precise-bet [data-action=bet]');if(b)b.dataset.bet=preciseBet;}
  if(event.target.id==='roulette-target'){roulettePrecise=event.target.value;const b=document.querySelector('.roulette-screen .precise-bet [data-action=bet]');if(b)b.dataset.bet=roulettePrecise;}
  if(event.target.id==='peek-side')peekSide=event.target.value;
  if(event.target.id==='peek-index')peekIndex=Number(event.target.value);
  if(event.target.id!=='import-file')return;
  const file=event.target.files[0];if(!file)return;
  const token=++importReadToken;
  try{if(file.size>100000)throw new Error('存檔檔案過大');const clean=validateSave(JSON.parse(await file.text()));if(clean.schema!==2||clean.profile.mode!==CHALLENGE_MODE)throw new Error('目前只支援五分鐘挑戰存檔');if(token!==importReadToken)return;pendingImport=clean;importWarning='';importReturnOverlay=importReturnOverlay||overlay||'settings';overlay='import-confirm';render();}catch(e){if(token===importReadToken)notify(`匯入失敗：${e.message}。目前進度未更改。`);}
});
app.addEventListener('click',event=>{
  if(landscapeBlocked(window)){updateOrientation();event.preventDefault();return;}
  const target=event.target.closest('[data-action]');if(!target||target.disabled||target.getAttribute('aria-disabled')==='true')return;event.preventDefault();advance();const a=target.dataset.action;
  if(overlay==='round-result'&&!target.closest('.modal'))return;
  if(game.paused&&!target.closest('.modal')){render();return;}
  if(game.activeTable==='roulette'&&target.dataset.rouletteRound!==undefined&&Number(target.dataset.rouletteRound)!==game.round?.id){render();notify('上一局下注時間已結束，請重新選擇。');return;}
  if(game.activeTable==='poker'&&target.dataset.pokerTurn!==undefined&&Number(target.dataset.pokerTurn)!==game.round.turnId){render();notify('本次行動已結束，請重新選擇。');return;}
  if(game.activeTable==='blackjack'&&target.dataset.bjHand&&game.round.hands[game.round.activeHand]?.id!==target.dataset.bjHand){render();notify('上一手已超時或結束，請重新選擇本手操作。');return;}
  if(a==='pk-open-raise'){const detail=app.querySelector('.poker-raise-panel');if(detail&&game.round.phase==='poker-player')tablePanels.open(detail);else render();return;}
  if(a==='table-tools'&&!roundReveal.visible){tablePanels.openTools();return;}
  if(a==='close-round-popup'){if(roundReveal.close(game)){payoutShown=true;overlay='round-result';}render();return;}
  if(roundReveal.visible&&!target.closest('.mobile-reveal-dialog')&&a!=='pause'&&a!=='resume'&&a!=='close-overlay'&&a!=='sound'&&a!=='sound-test'&&!target.closest('.modal')){render();return;}
  if((!game.features.shop&&['shop','buy'].includes(a))||(!game.features.items&&['use','rou-item','pk-item','pk-swap-card','pk-peek-seat','bj-swap-card'].includes(a)))return;
  if(a==='close-table-tool'){tablePanels.close();return;}
  if(a==='settings'){openSettings();return;}
  if(a==='settings-tab'&&overlay==='settings'&&Object.hasOwn(SETTINGS_TABS,target.dataset.tab)){settingsTab=target.dataset.tab;sounds.stopAll();render();return;}
  if(a==='settings-export'&&overlay==='settings'){settingsDataMessage=exportSave(backupSource())?'已開啟完成局備份下載。':'未能匯出備份。';render();return;}
  if(a==='settings-import'&&overlay==='settings'){chooseBackup();return;}
  if(a==='cancel-import'&&overlay==='import-confirm'){closeOverlay();return;}
  if(a==='confirm-import'&&overlay==='import-confirm'&&pendingImport){const paused=game.paused;let stored;try{stored=saves.write(pendingImport);}catch{importWarning='備份未能保存，原挑戰未更改。請檢查瀏覽器儲存空間後再試。';render();return;}pendingImport=null;importReadToken++;storageWarning='';showRestored(stored,{paused});return;}
  if(a==='sound-test'){const allowed=()=>!document.hidden&&(game.screen==='home'||overlay==='pause'||overlay==='settings');const attempt=sounds.test(allowed);render();void attempt.then(played=>{if(allowed()){settingsSoundMessage=played?'正在試播籌碼聲。':'未能播放，請檢查瀏覽器聲音設定後再試。';notify(settingsSoundMessage);render();}});return;}
  if(a==='music'){music.setEnabled(!music.enabled);music.gesture();render();return;}
  if(a==='sound'){sounds.setMuted(sounds.enabled);void sounds.unlock();render();return;}
  if(game.screen==='home'&&['home-start','home-settings','home-rank','home-install','home-support'].includes(a)){openOverlay(a.slice(5));return;}
  if(a==='install-browser'&&game.screen==='home'&&overlay==='install'&&['safari','chrome'].includes(target.dataset.browser)){homeInstallBrowser=target.dataset.browser;render();app.querySelector(`[data-action="install-browser"][data-browser="${homeInstallBrowser}"]`)?.focus({preventScroll:true});return;}
  if(['mode','load-manual','manual-save'].includes(a)){render();return;}
  if(a==='enter'){pendingImport=null;importReadToken++;game.start(name,CHALLENGE_MODE);const scoreId=newScoreId();if(scoreId)game.profile.submissionId=scoreId;chip=500;allIn=false;story=false;last=performance.now();render();return;}
  if(a==='continue'){const save=readSave();if(save)showRestored(save);return;}
  if(a==='import'){chooseBackup();return;}
  if(a==='export'){exportSave();return;}
  if(a==='export-legacy'){const legacy=readLegacySave();if(legacy)exportSave(legacy);return;}
  if(a==='home'){pendingImport=null;importReadToken++;overlay=null;story=false;game.screen='home';game.paused=false;render();return;}
  if(a==='brand'){if(game.screen==='lobby')notify(game.features.shop&&game.features.items?'選擇賭桌入座，或到道具商店準備。':'選擇賭桌入座，開始挑戰。');return;}
  if(a==='lobby-more'&&game.screen==='lobby'){openOverlay('lobby-menu');return;}
  if(a==='pause'){openOverlay('pause');return;}
  if(a==='rules'){openOverlay('rules');return;}
  if(a==='saves'){openOverlay('saves');return;}
  if(a==='resume'||a==='close-overlay'){closeOverlay();return;}
  if(a==='load-auto'){const save=readSave();if(save)showRestored(save);else {notify(storageWarning||'此欄位尚未有存檔。');}return;}
  if(a==='round-result'&&game.round?.phase==='settled'){roundReveal.close(game);payoutShown=true;openOverlay('round-result');return;}
  if(a==='finish'){openOverlay('finish');return;}
  if(a==='upload-score'&&overlay==='finish'){void leaderboard.upload();return;}
  if(overlay==='rank'&&['rank-refresh','rank-next','rank-back'].includes(a)){rankNavAction=a;void leaderboard.load(a.slice(5));return;}
  if(a==='share-record'&&overlay==='finish'){void recordShare.share().then(result=>{if(overlay==='finish'&&result!=='stale')app.querySelector('[data-action="share-record"]')?.focus({preventScroll:true});});return;}
  if(a==='download-record'&&overlay==='finish'){recordShare.downloadImage();return;}
  if(a==='retry-record'&&overlay==='finish'){recordShare.sync(game.checkpoint?.profile||game.profile,art,{retry:true});render();return;}
  if(a==='table')enterSelectedTable(target.dataset.table||'sicbo');
  if(overlay==='round-result'&&['next','leave'].includes(a))overlay=null;
  if(a==='coming'){notify(`${target.dataset.label}正在製作中；目前可體驗大小、百家樂、21點、德州撲克及輪盤。`);return;}
  if(a==='shop')game.shop();
  if(a==='close-shop')game.screen='lobby';
  if(a==='buy'){const cost=game.buy(target.dataset.item);if(cost!==false)notify(`已購買${ITEMS[target.dataset.item].name}，花費 ${money(cost)}。下一局完成後保存。`);}
  if(a==='leave'&&!game.leaveTable())notify('請先完成本局，才可離桌。');
  if(a==='next'){if(game.newRound())group='大小';}
  if(a==='group')group=target.dataset.group;
  if(a==='board-zoom'){boardZoom=!boardZoom;flights.cancel();tablePanels.close();}
  if(a==='chip'){chip=cashParse(target.dataset.chip);allIn=false;}
  if(a==='all-in')allIn=!allIn;
  if(a==='bet'){
    const id=target.dataset.bet,oldId=game.activeTable==='baccarat'?BACCARAT_BETS.find(b=>game.round.bets[b.id])?.id:Object.keys(game.round.bets)[0],oldStake=oldId?game.round.bets[oldId]:0;
    const source=document.querySelector('.chip-picker .selected')||document.querySelector('#custom-amount');let bounds=source?.getBoundingClientRect(),amount=allIn?game.available:chip;
    const movedFrom=oldId&&document.querySelector(`.printed-cell[data-bet="${oldId}"]`)?.getBoundingClientRect();
    const accepted=game.addBet(id,amount);
    if(accepted){
      if(accepted==='moved'){
        flights.cancel(oldId);const values=boardChips[oldId]||[oldStake],lastAmount=boardLast[oldId]||oldStake,count=boardCounts[oldId]||1;
        delete boardCounts[oldId];delete boardLast[oldId];delete boardChips[oldId];boardCounts[id]=count;boardLast[id]=lastAmount;boardChips[id]=values;amount=oldStake;bounds=movedFrom;notify('已改押原主注金額，旁注保留，沒有額外加碼。');
      }else{boardCounts[id]=(boardCounts[id]||0)+1;boardLast[id]=amount;boardChips[id]=[...(boardChips[id]||[]),amount].slice(-27);}
      flights.queue(id,amount,bounds?{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2}:null,chipColorIndex(boardLast[id],game.round.bankAtStart));
    }else notify(game.profile.bank<100?'資金低於 $1，請選「全押」押全部餘額。':'請檢查金額：每次至少 $1，總下注不能超過資金。');
  }
  if(a==='remove'){game.undoBet(target.dataset.bet);delete boardCounts[target.dataset.bet];delete boardLast[target.dataset.bet];delete boardChips[target.dataset.bet];flights.cancel(target.dataset.bet);}
  if(a==='clear'){game.clearBets();boardCounts={};boardLast={};boardChips={};flights.cancel();}
  if(a==='roll'){flights.landAll();game.lock();}
  if(a==='rou-item'){if(game.useRouletteItem(target.dataset.item,Number(target.dataset.rouletteRound)))notify(target.dataset.item==='peek'?'已排除五個號碼，可在原倒數內調整投注。':target.dataset.item==='reroll'?'重轉券已啟用；開獎後有10秒接受或重轉。':'保本券已啟用，按本局合計淨虧損退50%。');}
  if(a==='rou-respin'||a==='rou-keep')game.chooseRouletteReroll(a==='rou-respin',Number(target.dataset.rouletteRound));
  if(a==='pk-start')game.startPoker();
  if(a==='pk-speed')game.setPokerSpeed(target.dataset.speed);
  if(a==='pk-chip')pokerUI.raiseTo=cashParse(target.dataset.pokerAmount);
  if(a==='pk-action'){const accepted=game.pokerAction(target.dataset.pokerAction,pokerUI.raiseTo??cashMin(cashAdd(game.round.currentBet,game.round.lastFullRaise),cashAdd(game.profile.bank,game.round.players[0].street)),Number(target.dataset.pokerTurn));if(!accepted)notify('請檢查加注總額、最小加注及剩餘資金。');pokerUI.selection=null;}
  if(a==='pk-item'){if(target.dataset.item==='protect'){if(!game.usePokerItem('protect',0,Number(target.dataset.pokerTurn)))notify('保本券須首次行動前使用。');}else{pokerUI.selection={kind:target.dataset.item,turn:game.round.turnId};tablePanels.close();}}
  if(a==='pk-cancel-item')pokerUI.selection=null;
  if(a==='pk-swap-card'||a==='pk-peek-seat'){const id=a==='pk-swap-card'?'swap':'peek',index=Number(a==='pk-swap-card'?target.dataset.index:target.dataset.seat);if(game.usePokerItem(id,index,Number(target.dataset.pokerTurn)))notify(id==='swap'?'已換牌；原行動倒數繼續。':'已透視一張底牌；原行動倒數繼續。');else notify('此道具目前不可用。');pokerUI.selection=null;}
  if(a==='bj-action'||a==='bj-insure'||a==='bj-no-insurance'){
    let accepted;if(a==='bj-action')accepted=game.blackjackAction(target.dataset.bjAction,target.dataset.bjHand);else{const amount=a==='bj-no-insurance'?0:parseDollars(document.querySelector('#bj-insurance-amount')?.value)??-1;accepted=a==='bj-insure'&&amount<=0?false:game.chooseBlackjackInsurance(amount);}
    if(accepted?.betAdded){const {id,amount}=accepted.betAdded,bounds=target.getBoundingClientRect();boardCounts[id]=(boardCounts[id]||0)+1;boardLast[id]=amount;boardChips[id]=[...(boardChips[id]||[]),amount].slice(-27);flights.queue(id,amount,{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2},chipColorIndex(amount,game.round.bankAtStart));}
    if(!accepted)notify('此操作目前不可用，請檢查牌型、倒數及可用資金。');blackjackSwapHandId=null;
  }
  if(a==='bj-swap-card'){if(game.useItem('swap',Number(target.dataset.index),target.dataset.bjHand))notify('已換牌；原行動倒數繼續，換後21點按普通21點。');blackjackSwapHandId=null;}
  if(a==='bj-cancel-swap')blackjackSwapHandId=null;
  if(a==='use'&&game.activeTable==='blackjack'&&target.dataset.item==='swap'){if(blackjackOptions(game).swap){blackjackSwapHandId=game.round.hands[game.round.activeHand].id;tablePanels.close();}render();return;}
  if(a==='use'){
    if(game.useItem(target.dataset.item,game.activeTable==='baccarat'?peekSide:peekIndex,target.dataset.bjHand)){
      if(target.dataset.item==='protect')notify('保本券已啟用，本局淨虧損退回 50%。');
      else if(target.dataset.item==='swap')notify('換牌券已啟用，首四張揭示後可換一張或保留。');
      else notify(game.activeTable==='blackjack'?'已透視莊家暗牌，原行動倒數保持。':game.activeTable==='baccarat'?`已透視${peekSide==='banker'?'莊':'閒'}第 ${game.round.peek.index+1} 張：${game.round.peek.value} 點。`:`透視：第 ${peekIndex+1} 顆為${game.round.peek.range}。`);
    }
  }
  if(a==='squeeze-reveal')game.finishBaccaratSqueeze();
  if(a==='swap-card')game.chooseBaccaratSwap(Number(target.dataset.index));
  if(a==='keep-cards')game.chooseBaccaratSwap();
  if(a==='reroll')game.chooseReroll(Number(target.dataset.index));
  if(a==='accept')game.chooseReroll();
  render();
});
window.addEventListener('resize',()=>flights.cancel());
window.addEventListener('scroll',()=>flights.cancel(),true);
function unlockAudio(event){if(event.isTrusted===false||orientationBlocked)return;pageInactive=false;syncMusic();void sounds.unlock();music.gesture();requestLandscape(window);}
document.addEventListener('click',unlockAudio,{capture:true});
document.addEventListener('touchend',unlockAudio,{capture:true,passive:true});
document.addEventListener('pointerdown',unlockAudio,{capture:true,passive:true});
document.addEventListener('keydown',unlockAudio,{capture:true});
window.addEventListener('orientationchange',relayoutTables);
window.screen?.orientation?.addEventListener?.('change',relayoutTables);
document.addEventListener('keydown',event=>{
  if(orientationBlocked){if(['Tab','Escape','Enter',' '].includes(event.key))event.preventDefault();return;}
  if(event.defaultPrevented)return;
  if(tablePanels.dialog&&event.key==='Escape'){event.preventDefault();tablePanels.close();return;}
  if(!overlay&&['Enter',' '].includes(event.key)&&event.target.matches('.printed-cell')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
  if(overlay){if(event.key==='Escape'&&(game.screen==='home'||['lobby-menu','round-result','settings','import-confirm'].includes(overlay))){event.preventDefault();advance();closeOverlay();return;}if(event.key==='Tab'){const nodes=[...document.querySelectorAll(overlay==='rank'?'.modal button:not(:disabled),.modal [tabindex="0"]':'.modal button:not(:disabled),.modal input:not(:disabled),.modal select,.modal textarea,.modal a[href],.modal summary,.modal [tabindex="0"]')];const first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement.classList.contains('modal'))){end?.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===end){first?.focus();event.preventDefault();}}return;}
  const popupNode=document.querySelector('.mobile-reveal-dialog');if(popupNode&&event.key==='Tab'){const nodes=[...popupNode.querySelectorAll('button:not(:disabled),[tabindex="0"]'),...document.querySelectorAll('.mobile-hud [data-action=pause]')],first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===popupNode)){end?.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===end){first?.focus();event.preventDefault();}return;}
  const panel=document.querySelector('.squeeze-panel');if(panel&&event.key==='Tab'){const nodes=[...panel.querySelectorAll('button:not(:disabled),[tabindex="0"]')],first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){end?.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===end){first?.focus();event.preventDefault();}return;}
  if(event.key==='Escape'&&game.screen!=='home'){event.preventDefault();openOverlay('pause');}
});
function syncMusic(){music.sync(!document.hidden&&!pageInactive&&!orientationBlocked&&!game.paused);}
function updateOrientation(){const next=landscapeBlocked(window);if(next===orientationBlocked)return;orientationBlocked=next;if(next)backgroundPause();last=performance.now();render();}
function backgroundPause(){pageInactive=true;music.sync(false);sounds.stopAll();if(game.profile&&game.profile.status==='active'&&game.screen!=='home'&&['settings','import-confirm'].includes(overlay)){advance();game.paused=true;if(settingsParent!==null)settingsParent='pause';render();return;}if(game.profile&&game.profile.status==='active'&&game.screen!=='home'&&overlay!=='pause')openOverlay('pause');}
document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundPause();});
window.addEventListener('blur',backgroundPause);
window.addEventListener('pagehide',()=>{pageInactive=true;music.sync(false);advance();game.paused=true;sounds.stopAll();sounds.sync(game);});
window.addEventListener('pageshow',event=>{if(event.persisted&&game.profile&&game.screen!=='home'&&!overlay)openOverlay('pause');});
setInterval(()=>{if(advance()){if(game.activeTable!=='poker')flights.landAll();render();}const elapsed=document.querySelector('#elapsed'),countdowns=document.querySelectorAll('#countdown,[data-countdown]');if(elapsed)elapsed.textContent=challengeClock();for(const countdown of countdowns)countdown.textContent=game.round.remaining?Math.ceil(game.round.remaining/1000)+' 秒':game.round.phase==='settled'?'已結算':'';},100);
render();

function animateBaccarat(){if(game.round?.squeeze&&!game.paused){if(advance())render();squeeze.paint();}requestAnimationFrame(animateBaccarat);}
requestAnimationFrame(animateBaccarat);
