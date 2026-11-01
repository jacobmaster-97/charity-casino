import {sicboTableView} from './sicbo-view.mjs?v=0.6.1';
import {CasinoSound} from './sound.mjs?v=0.6.1';
import {ROULETTE_ENABLED} from './roulette.mjs?v=0.6.1';
import {rouletteTableView,fitRouletteSurface,paintRouletteChips} from './roulette-view.mjs?v=0.6.1';
import {POKER_ENABLED} from './poker.mjs?v=0.6.1';
import {pokerTableView,paintPokerChips,queuePokerMotions,fitPokerSurface} from './poker-view.mjs?v=0.6.1';
import {BLACKJACK_ENABLED,blackjackOptions} from './blackjack.mjs?v=0.6.1';
import {blackjackTableView,paintBlackjackChips,fitBlackjackSurface} from './blackjack-view.mjs?v=0.6.1';
import {TablePanels,updateGameViewport,fitBaccaratSurface,mobileTableViewport,MobileRoundReveal} from './table-layout.mjs?v=0.6.1';
import {BaccaratSqueezeController} from './baccarat-squeeze.mjs?v=0.6.1';
import {BACCARAT_ENABLED,BACCARAT_BETS} from './baccarat.mjs?v=0.6.1';
import {baccaratTableView} from './baccarat-view.mjs?v=0.6.1';
import {Game} from './game.mjs?v=0.6.1';
import {GOAL,ITEMS,money,duration} from './rules.mjs?v=0.6.1';
import {boardAmounts,ChipFlights,chipColorIndex} from './board.mjs?v=0.6.1';
import {Saves,validateSave} from './storage.mjs?v=0.6.1';

const app=document.querySelector('#app'),toastNode=document.querySelector('#toast');
const tablePanels=new TablePanels(app),roundReveal=new MobileRoundReveal();updateGameViewport();
let mobileViewport=mobileTableViewport();
const mobileActive=()=>mobileViewport&&game.screen==='table'&&['sicbo','baccarat','roulette'].includes(game.activeTable);
window.addEventListener('resize',relayoutTables);
window.visualViewport?.addEventListener('resize',relayoutTables);
let storage;try{storage=window.localStorage;}catch{storage=null;}
const sounds=new CasinoSound({storage});
const saves=new Saves(storage||{getItem(){throw new Error('無法使用瀏覽器儲存空間');},setItem(){throw new Error('無法使用瀏覽器儲存空間');}});
let storageWarning='',mode='race',name='',story=false,group='大小',chip=500,allIn=false,peekIndex=0,peekSide='player',overlay=null,toastTimer,last=performance.now();
const game=new Game({onCue:name=>sounds.play(name),onComplete:save=>{try{saves.write(save);storageWarning='';}catch{storageWarning='自動保存失敗，請匯出完成局存檔。';}}});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art=path=>globalThis.__CASINO_ART?.[path]||new URL('../public'+path,import.meta.url).href;
const icon=id=>`<span class="prop prop-${id}" aria-hidden="true"></span>`;
const button=(action,text,cls='',extra='')=>`<button type="button" data-action="${action}" class="${cls}" ${extra}>${text}</button>`;
let blackjackSwapHandId=null;
let roulettePrecise='rou-number-0';
let pokerUI={turn:null,raiseTo:null,selection:null,motionSeen:0};
let boardRound=null,boardCounts={},boardLast={},boardChips={},boardZoom=false,preciseBet='small';
const flights=new ChipFlights({art,onChange:paintBoard,onLand:()=>sounds.play('chip'),reduced:()=>matchMedia('(prefers-reduced-motion: reduce)').matches});
const squeeze=new BaccaratSqueezeController({root:app,game,art,advance,onChange:render,reduced:()=>matchMedia('(prefers-reduced-motion: reduce)').matches});
function relayoutTables(){updateGameViewport();const next=mobileTableViewport();if(next!==mobileViewport){mobileViewport=next;render();}requestAnimationFrame(()=>{flights.cancel();fitBaccaratSurface(app);fitBlackjackSurface(app);fitPokerSurface(app);fitRouletteSurface(app);paintBoard();});}
function paintBoard(){if(game.activeTable==='poker'&&game.round){const pendingCounts={};for(const f of flights.flights)pendingCounts[f.id]=(pendingCounts[f.id]||0)+1;paintPokerChips({root:app,game,art,pending:flights.pending,pendingCounts});return;}const landed={};for(const [id,values] of Object.entries(boardChips)){const pendingCount=flights.flights.filter(f=>f.id===id).length;landed[id]=values.slice(0,Math.max(0,values.length-pendingCount)).slice(-3);}if(game.activeTable==='roulette'&&game.round){paintRouletteChips({root:app,game,art,pending:flights.pending,stacks:landed});return;}if(game.activeTable==='blackjack'&&game.round){paintBlackjackChips({root:app,game,art,pending:flights.pending,stacks:landed});return;}const node=document.querySelector('.board-amounts');if(!node||!game.round)return;node.innerHTML=boardAmounts(game.round.bets,flights.pending,art,boardCounts,boardLast,game.round.bankAtStart,landed,Number(document.querySelector('.baccarat-board')?.dataset.boardHeight)||610);for(const cell of document.querySelectorAll('.printed-cell')){cell.classList.toggle('has-bet',Boolean(game.round.bets[cell.dataset.bet]));cell.classList.toggle('mobile-paid',mobileActive()&&game.activeTable==='sicbo'&&game.round.phase==='settled'&&Boolean(game.round.result.lines.find(l=>l.id===cell.dataset.bet)?.payout));}}
const formatMode=m=>m==='race'?'競速模式':'自由模式';
function notify(text){toastNode.textContent=text;toastNode.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.classList.remove('visible'),4200);}
function readSave(which=mode,slot='auto'){try{return saves.read(which,slot);}catch{storageWarning='存檔無法讀取，原檔已保留；可嘗試匯入備份。';return null;}}
function advance(){const now=performance.now();const ms=now-last;roundReveal.sync(game,mobileActive());const changed=game.tick(ms);last=now;sounds.sync(game);return roundReveal.tick(ms,game,mobileActive())||changed;}
function hud(){const p=game.profile;if(mobileActive()){const r=game.round,betting=r.phase==='betting',settled=r.phase==='settled',canLeave=settled||betting&&!game.stake&&!r.used,title={sicbo:'大小',baccarat:'百家樂',roulette:'輪盤'}[game.activeTable];return `<header class="hud mobile-hud">${button('leave','← 大廳','quiet',canLeave&&!roundReveal.visible?'':'disabled')}<strong class="mobile-table-title">${title}</strong><strong id="bank-value">${money(game.available)}</strong><span id="elapsed">${duration(p.elapsedMs)}</span><span class="mobile-round-stake">本局 ${money(game.stake)}</span><strong id="countdown">${betting||['reroll','rou-reroll','swapping'].includes(r.phase)?Math.ceil(r.remaining/1000)+' 秒':settled?'已結算':'開牌中'}</strong>${button('pause','Ⅱ 暫停','quiet pause-button')}</header>`;}return `<header class="hud"><a class="brand" href="#" data-action="brand"><span class="seal">賭</span><span>賭王慈善大賽<small>CHARITY CASINO</small></span></a><div class="hud-stat bank"><span>可用資金</span><strong id="bank-value">${money(game.available)}</strong></div><div class="hud-stat"><span>${esc(p.name)} · ${formatMode(p.mode)}</span><strong id="elapsed">${duration(p.elapsedMs)}</strong></div>${button('pause','Ⅱ <span>暫停</span>','quiet pause-button','aria-label="暫停遊戲"')}</header>`;}
function home(){const save=readSave();return `<main class="home"><div class="home-art"></div><header class="home-header"><span class="brand"><span class="seal">賭</span><span>慈善之夜<small>THE CHARITY NIGHT</small></span></span><span class="edition">港式賭片 · 可玩原型 01</span></header><section class="home-content"><p class="eyebrow">一百元入場・二千五百萬的挑戰</p><h1>賭王<br><span>慈善大賽</span></h1><p class="intro">今晚，讓每一次抉擇改寫牌局。<br>帶著 $100 入場，挑戰你的最快通關紀錄。</p><form id="start-form"><label for="player-name">參賽者姓名</label><input id="player-name" name="playerName" autocomplete="nickname" maxlength="32" placeholder="怎樣稱呼你？" value="${esc(name)}" required><div class="mode-picker" aria-label="選擇模式">${button('mode','競速模式',mode==='race'?'selected':'','data-mode="race" aria-pressed="'+(mode==='race')+'"')}${button('mode','自由模式',mode==='free'?'selected':'','data-mode="free" aria-pressed="'+(mode==='free')+'"')}</div><p class="field-note">${mode==='race'?'單一自動存檔，挑戰最快時間。':'自動保存，另可手動保存及讀取完成局。'}</p><button class="primary start-button" type="submit">踏入賭場 <span>↗</span></button></form><div class="home-links">${save?button('continue',`繼續挑戰 · ${money(save.profile.bank)}`,'text-button'):''}${button('import','匯入存檔','text-button')}${soundControls()}</div>${storageWarning?`<p class="warning">${esc(storageWarning)}</p>`:''}</section><footer class="home-footer"><span>五桌開放：大小・百家樂・21點・德州撲克・輪盤</span><span>純遊戲籌碼 · 本機存檔</span></footer></main>`;}
function storyCard(){return `<main class="story-page"><div class="story-card"><span class="eyebrow">序章 · 慈善之夜</span><span class="story-symbol">♠</span><h1>今夜，由你入局。</h1><p>賭場為慈善大賽亮起燈火。<br>你的起始資金只有 <strong>$100</strong>。</p><p>在不同賭桌作出選擇，將手上總資金<br>推向 <strong>$25,000,000</strong>，並留下通關時間。<br>資金歸零，這次挑戰便告結束。</p>${button('enter','以 $100 開始挑戰','primary')}<small>大小、百家樂、21點、德州撲克及輪盤，五張賭桌現已開放。</small></div></main>`;}
const stations=[['sicbo','大小','SIC BO',33,40],['baccarat','百家樂','BACCARAT',73,40],['poker','德州撲克','TEXAS HOLD’EM',17,68],['blackjack','21 點','BLACKJACK',50,71],['roulette','輪盤','ROULETTE',85,69]];
function lobby(){const p=game.profile;return `<section class="lobby"><div class="section-heading"><div><p class="eyebrow">THE GRAND LOBBY</p><h1>選一張桌，開始今晚的挑戰。</h1></div>${button('shop',`${icon('chips')}道具商店`,'outlined')}</div><div class="lobby-map"><img src="${art('/art/styles/b/lobby-populated-v4.png')}" alt="港式卡通賭場，中央為豪華樓梯，五張賭桌各有荷官及賭客" draggable="false">${stations.map(([id,label,en,x,y])=>button((id==='sicbo'||id==='baccarat'&&BACCARAT_ENABLED||id==='blackjack'&&BLACKJACK_ENABLED||id==='poker'&&POKER_ENABLED||id==='roulette'&&ROULETTE_ENABLED)?'table':'coming',`<span>${label}</span><small>${(id==='sicbo'||id==='baccarat'&&BACCARAT_ENABLED||id==='blackjack'&&BLACKJACK_ENABLED||id==='poker'&&POKER_ENABLED||id==='roulette'&&ROULETTE_ENABLED)?'入座遊玩 ↗':'開發中'}</small>`,'station '+((id==='sicbo'||id==='baccarat'&&BACCARAT_ENABLED||id==='blackjack'&&BLACKJACK_ENABLED||id==='poker'&&POKER_ENABLED||id==='roulette'&&ROULETTE_ENABLED)?'available':''),`style="--x:${x}%;--y:${y}%" data-table="${id}" data-label="${label}" aria-label="${label}，${(id==='sicbo'||id==='baccarat'&&BACCARAT_ENABLED||id==='blackjack'&&BLACKJACK_ENABLED||id==='poker'&&POKER_ENABLED||id==='roulette'&&ROULETTE_ENABLED)?'入座遊玩':'開發中'}"`)).join('')}</div><div class="lobby-bottom"><div class="goal-copy"><span class="gold">目標 ${money(GOAL)}</span><span>累計完成 ${p.rounds} 局 · 點選賭桌入座</span></div><div class="lobby-actions">${button('saves','存檔／讀檔','quiet')}${button('home','返回主頁','quiet')}</div></div><div class="goal-bar" role="progressbar" aria-label="目標資金進度" aria-valuemin="0" aria-valuemax="${GOAL}" aria-valuenow="${Math.min(p.bank,GOAL)}"><span style="width:${Math.min(100,p.bank/GOAL*100)}%"></span></div><p class="save-note">只在完成一局後保存。購物及未完成牌局會隨下次完成局一起記錄；關閉後回到上次完成存檔。</p></section>`;}
function table(){return sicboTableView({game,art,button,icon,chip,allIn,storageWarning,peekIndex,boardZoom,preciseBet,mobile:mobileActive(),popup:roundReveal.visible,popupElapsed:1400-roundReveal.remaining});}
function shop(){const cost=Math.max(1,Math.round(game.profile.bank/10));return `<section class="shop-page"><div class="section-heading"><div><p class="eyebrow">A LITTLE HELP FROM LUCK</p><h1>道具商店</h1><p>每件為購買前資金的 10%。每局最多使用一件。</p></div>${button('close-shop','← 返回大廳','outlined')}</div><div class="shop-notice"><span class="gold">Ⅱ 計時已暫停</span><span>本次價格 ${money(cost)} · 買下一件時重新計價</span></div><div class="shop-grid">${Object.entries(ITEMS).map(([id,item])=>`<article class="shop-card">${icon(id)}<span class="eyebrow">${id==='protect'?'PROTECT':id==='peek'?'INSIGHT':id==='swap'?'SWAP A CARD':'SECOND CHANCE'}</span><h2>${item.name}</h2><p>${item.description}</p><div class="shop-card-bottom"><span>已持有 ${game.profile.inventory[id]} 件</span>${button('buy',`${money(cost)} 購買`,'primary',`data-item="${id}"`)}</div></article>`).join('')}</div><p class="save-note">購買紀錄將於下一局完成時保存。保本券與透視鏡供五桌共用；重擲／重轉券供大小及輪盤按各桌規則使用；換牌券供百家樂、21點及德州撲克使用。</p></section>`;}
function modal(){if(!overlay)return '';const isPause=overlay==='pause',isRules=overlay==='rules';let content;
  if(isPause)content=`<span class="eyebrow">TAKE YOUR TIME</span><h2>牌桌已遮住，稍歇一會。</h2><p>通關計時與行動倒數已停止。<br>按「繼續」恢復原本的牌局與剩餘秒數。</p>${button('resume','繼續','primary')}${soundControls()}`;
  else if(isRules&&game.activeTable==='roulette')content=`<span class="eyebrow">AMERICAN ROULETTE · 計時已暫停</span><h2>美式輪盤</h2><ul class="rules-list"><li>0、00、1–36共38格。只接受獨立單號、三個十二數組、三個直列及紅／黑、單／雙、1–18／19–36六種外圍注；沒有邊線／交點投注。</li><li>淨賠：單號35:1；十二數組／直列2:1；六種外圍1:1，命中另退本金。0及00皆不屬紅黑、單雙或大小，這些等額注遇零全輸。</li><li>可多項同押，合計不超資金。一般每次至少$1，資金不足$1時可全押。下注30秒，可提早啟動；未下注超時跳過，已用道具不退。</li><li>鎖注後不能改注。每次轉動4.8秒，輪盤與小球減速至最終號碼；實際時間計入通關時間，暫停與背景停表並遮桌。</li><li>每局最多一件，啟用即扣，無免費配給。保本在鎖注前使用，按全部投注合計淨虧損退50%；透視在鎖注前排除五個確定不會開出的單號，可調整投注但不重抽結果或延長倒數。</li><li>輪盤的重轉券使用商店「重擲／重轉券」共用庫存，必須鎖注前先啟用。首次開獎後有10秒選擇接受或重轉一次；超時接受，不退券。重轉從完整38格抽取，可以同號；全部原投注按最後結果結算。</li><li>小格可用放大或精準下注選單。只有最終結果結算後保存，再判達標或歸零；重整回上次完成局。</li></ul>${button('close-overlay','回到牌桌','primary')}`;
  else if(isRules&&game.activeTable==='poker')content=`<span class="eyebrow">TEXAS HOLD’EM · 計時已暫停</span><h2>德州撲克</h2><ul class="rules-list"><li>六人無限注，入座全部資金。每人兩張底牌，翻牌三張、轉牌及河牌各一張，任取最佳五張。A可作順子低張；無抽水。</li><li>按D莊位順時針發牌，左側小盲、再左大盲；翻牌前大盲左側先行，其後莊位左側先行。每手輪換莊位，盲注只在手與手之間隨資金級距調整。</li><li>過牌、跟注、棄牌、加注及全押。加注輸入為本輪總額，完整加注幅度至少上一完整加注幅度；短碼全押未達足額不重開已行動者加注權，累計達足額才重開。</li><li>主池／邊池按每人實際投入分開，只能贏自己有資格的彩池；未被跟注的多餘投入退回。同牌力平分，零頭美分由莊位左側起分。全手完成才派彩及判達標／破產。</li><li>玩家每次行動30秒；超時可過牌則過牌，否則棄牌。正常／快速只改動畫及電腦等待；實際時間照計，暫停及背景一起停。</li><li>五名電腦入座或輸光補位時帶玩家當時資金20%–120%；仍有籌碼者保留輸贏，難度隨玩家資金提高。電腦只用自身底牌與公共資料判斷，不讀對手暗牌。</li><li>共用背包，無免費道具，本手最多一件。保本須首次行動前，合計淨虧損退50%；透視在自己行動時選未棄牌對手隨機一張；換牌限翻牌前首次行動前，選一張底牌隨機更換，舊牌棄置。本手一旦開始不能離桌購物。</li><li>只保存完整結算，包含對手籌碼／莊位；重整回最後完成局，頁面存活的暫停則保留牌局及剩餘秒數。</li></ul>${button('close-overlay','回到牌桌','primary')}`;
  else if(isRules&&game.activeTable==='blackjack')content=`<span class="eyebrow">BLACKJACK · 計時已暫停</span><h2>21點玩法與賠率</h2><ul class="rules-list"><li>連續六副牌；A自動按1或11計，J／Q／K為10。莊家軟17及以上停牌，16以下補牌。</li><li>未分牌且未換牌的初始Blackjack淨贏3:2；普通勝1:1，和局退本金；分牌或換牌後21點按普通21點。</li><li>下注及每次行動20秒；未下注超時跳過，行動超時停牌，保險超時不買。動畫計通關時間，暫停及背景一起停表。</li><li>任意兩張起手可加倍：追加該手同額，只補一張即停牌。相同點值可分牌，最多四手；分牌後可再加倍。A只分一次，各補一張即停牌，不加倍或再分。</li><li>莊家明牌A時先選保險，最多原主注一半及可用資金；莊家Blackjack時保險淨2:1。明牌10點牌直接查Blackjack，之後才輪玩家。</li><li>晚投降：確認莊家非Blackjack後，原始手未要牌／加倍／分牌前可退半注。保險、加倍及分牌均不能超出資金，分牌完成前不提前派彩。</li><li>全局分牌共限一件道具：保本發牌前啟用，按全部手牌及保險合計淨虧損退50%；透視在確認莊家非Blackjack後看暗牌；換牌在當前手尚未要牌／加倍／停牌時選一張，分A手不可用。道具不重置倒數。</li><li>所有金額以美分計；3:2及半注不足一美分向下取整。只保存全局完成的牌靴、籌碼及庫存；重整回最後完成局。</li></ul>${button('close-overlay','回到牌桌','primary')}`;
  else if(isRules&&game.activeTable==='baccarat')content=`<span class="eyebrow">BACCARAT · 計時已暫停</span><h2>百家樂玩法與賠率</h2><p>八副連續牌靴，主注最多選莊、閒、和其中一項。同主注區加碼，點另一主注區把原主注改押；旁注可獨立複選或單押。</p><ul class="rules-list"><li>閒淨賠1:1；莊0.95:1（扣贏款5%佣金）；和8:1。中獎另退本金；和局莊／閒退本金。</li><li>A為1、2–9按牌面、10／J／Q／K為0，合計取個位。天牌8／9先結算，否則依標準規則補牌。</li><li>下注30秒；每次至少$1，總資金不足$1可全押。超時未下注跳過不扣錢，已用道具不退。</li><li>莊對／閒對按首兩張同牌階，淨賠11:1，花色及該方勝負不影響；J＋Q不算對子。幸運六須莊以6點勝，兩牌12:1、三牌20:1；和或輸不派。所有投注鎖注後均不可加碼。</li><li>換牌後以最後起手牌判對子。每局最多一件：保本按主注與旁注合計淨虧損退50%；透視須已下注，可選莊／閒看其中一張的點數，不延長倒數。</li><li>換牌券必須鎖注前啟用。首四張後有10秒換一張或保留；換後重新按天牌及標準補牌，超時不退券。</li><li>發牌速度已減慢30%；所押莊／閒需補牌時可拖動牌角咪牌，幸運六關聯莊方。可直接揭牌，等待及動作照計通關時間，暫停時一起停止。</li><li>完成局才保存，包含牌靴進度。關閉後回最後完成局，未完成局作廢。</li></ul>${button('close-overlay','回到牌桌','primary')}`;
  else if(isRules)content=`<span class="eyebrow">SIC BO · 計時已暫停</span><h2>大小玩法與賠率</h2><p>三顆六面骰。小為 4–10，大為 11–17；圍骰令大小皆輸。命中會另退本金。</p><ul class="rules-list"><li>大小：1:1；單點：出現 1／2／3 顆賠 1／2／3:1。</li><li>兩骰組合 5:1；指定對子 10:1；指定圍骰 150:1；任意圍骰 24:1。</li><li>總點數 4／17：50:1；5／16：18:1；6／15：14:1；7／14：12:1；8／13：8:1；9–12：6:1。</li><li>圍骰不影響其他合資格投注。下注限時 30 秒，可提早開骰；未下注超時跳過，不扣籌碼，已用道具不退。</li><li>一般每次最低 $1。總資金低於 $1 時，可用「全押」押全部餘額。</li><li>道具每局一件。保本計所有投注合計淨虧損；透視不重抽結果；持重擲券且未用其他道具時，開骰後重擲／接受／超時都扣券。</li></ul>${button('close-overlay','回到牌桌','primary')}`;
  else if(overlay==='finish')content=`<span class="eyebrow">${game.profile.status==='won'?'CHALLENGE COMPLETE':'END OF THE NIGHT'}</span><h2>${game.profile.status==='won'?'今夜，你是賭王。':'這次挑戰，到此落幕。'}</h2><p>${esc(game.profile.name)} · ${formatMode(game.profile.mode)}<br>最終資金 ${money(game.profile.bank)}<br>通關用時 ${duration(game.profile.elapsedMs)} · 完成 ${game.profile.rounds} 局</p>${button('home','返回主頁','primary')}${game.checkpoint?button('export','匯出上次完成存檔','text-button'):''}`;
  else content=`<span class="eyebrow">CHECKPOINT · 計時已暫停</span><h2>完成一局，再留下紀錄。</h2><p>只保存已完成局的狀態；未完成牌局不會寫入存檔。關閉後回到最後完成局。</p><div class="save-actions">${button('export','匯出上次完成存檔','primary',game.checkpoint?'':'disabled')}${button('load-auto','讀取上次自動存檔','outlined')}${game.profile.mode==='free'?button('load-manual','讀取手動存檔','outlined'):''}${button('import','匯入完成局存檔','outlined')}${button('close-overlay','繼續遊戲','quiet')}</div>${storageWarning?`<p class="warning">${esc(storageWarning)}</p>`:''}`;
  return `<div class="modal-backdrop ${isPause?'pause-cover':''}"><section class="modal" role="dialog" aria-modal="true" aria-label="${isPause?'遊戲已暫停':isRules?'玩法與賠率':overlay==='finish'?'挑戰結果':'存檔與讀檔'}" tabindex="-1">${content}</section></div>`;
}
function render(){roundReveal.sync(game,mobileActive());sounds.sync(game);tablePanels.beforeRender();const oldScroll=document.querySelector('.board-scroll')?.scrollLeft||0;const inventoryOpen=Boolean(document.querySelector('.inventory')?.open);const detailsOpen=['bet-details','precise-bet','shoe-details'].filter(c=>document.querySelector('.'+c)?.open);const boardTop=document.querySelector('.board-scroll')?.scrollTop||0;if(game.screen!=='table'||boardRound!==game.round){flights.cancel();boardRound=game.round;boardCounts={};boardLast={};boardChips={};blackjackSwapHandId=null;pokerUI={turn:null,raiseTo:null,selection:null,motionSeen:0};}const active=document.activeElement,action=active?.dataset?.action,bet=active?.dataset?.bet,selectedChip=active?.dataset?.chip,oldModal=Boolean(document.querySelector('.modal')),oldPopup=Boolean(document.querySelector('.mobile-reveal-dialog'));const ended=game.screen!=='home'&&game.profile&&game.profile.status!=='active';if(ended&&!overlay&&!roundReveal.visible)overlay='finish';
  if(game.activeTable==='poker'&&pokerUI.turn!==game.round?.turnId){pokerUI.turn=game.round?.turnId;pokerUI.raiseTo=null;pokerUI.selection=null;}
  app.innerHTML=`<div class="${overlay?'under-overlay':''}" ${overlay?'inert':''}>${game.screen==='home'?(story?storyCard():home()):`<div class="game-shell ${game.screen==='table'?'table-shell'+(mobileActive()?' mobile-table':''):''}">${hud()}${game.screen==='lobby'?lobby():game.screen==='shop'?shop():game.activeTable==='roulette'?rouletteTableView({game,art,button,icon,chip,allIn,boardZoom,preciseBet:roulettePrecise,storageWarning,mobile:mobileActive(),popup:roundReveal.visible}):game.activeTable==='poker'?pokerTableView({game,art,button,icon,ui:pokerUI,storageWarning}):game.activeTable==='blackjack'?blackjackTableView({game,art,button,icon,chip,allIn,storageWarning,swapHandId:blackjackSwapHandId}):game.activeTable==='baccarat'?baccaratTableView({game,art,button,icon,chip,allIn,storageWarning,peekSide}):table()}${storageWarning?`<p class="storage-warning">${esc(storageWarning)}</p>`:''}</div>`}</div>${modal()}<input id="import-file" type="file" accept="application/json,.json" hidden>`;
  fitBaccaratSurface(app);fitBlackjackSurface(app);fitPokerSurface(app);fitRouletteSurface(app);
  const boardScroll=document.querySelector('.board-scroll');if(boardScroll){boardScroll.scrollLeft=oldScroll;boardScroll.scrollTop=boardTop;}for(const c of detailsOpen){const d=document.querySelector('.'+c);if(d)d.open=true;}const inventory=document.querySelector('.inventory');if(inventory)inventory.open=inventoryOpen;if(game.screen==='table'&&game.activeTable==='poker')pokerUI.motionSeen=queuePokerMotions({root:app,game,flights,seen:pokerUI.motionSeen});paintBoard();flights.mount();flights.pause(game.paused);document.querySelectorAll('.flying-chip').forEach(n=>n.hidden=Boolean(overlay));
  if(overlay){const d=document.querySelector('.modal');if(action==='sound'||action==='sound-test')d.querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true});else if(!oldModal)d.querySelector('button:not(:disabled)')?.focus();else d.focus();}
  else if(action){const options=[...app.querySelectorAll('[data-action]')];options.find(b=>b.tagName===active.tagName&&b.dataset.action===action&&(!bet||b.dataset.bet===bet)&&(!selectedChip||b.dataset.chip===selectedChip))?.focus({preventScroll:true});}
  tablePanels.mount(Boolean(overlay)||roundReveal.visible||Boolean(game.round?.squeeze)||game.screen!=='table');
  const popupNode=app.querySelector('.mobile-reveal-dialog');if(!popupNode&&oldPopup&&!overlay)app.querySelector('.result-actions button:not(:disabled),.mobile-hud [data-action=pause]')?.focus({preventScroll:true});if(popupNode&&!overlay&&!popupNode.contains(document.activeElement)&&document.activeElement?.dataset?.action!=='pause')(popupNode.querySelector('button:not(:disabled)')||popupNode).focus({preventScroll:true});
  squeeze.mount();
}
function soundButton(){return button('sound',sounds.enabled?'音效：開':'音效：關','outlined sound-toggle',`aria-pressed="${sounds.enabled}" aria-label="${sounds.enabled?'關閉聲效':'開啟聲效'}"`);}
function soundControls(){return `<div class="sound-controls">${soundButton()}${button('sound-test','啟動並試聽','outlined sound-toggle')}<p>如未聽到，可再按一次試聽。</p></div>`;}
function openOverlay(type){advance();game.paused=true;overlay=type;render();}
function closeOverlay(){overlay=null;game.paused=false;last=performance.now();render();}
function showRestored(save){game.restore(validateSave(save));chip=500;allIn=false;mode=game.profile.mode;overlay=null;story=false;last=performance.now();render();notify('已恢復最後完成局；未完成的牌局不會保留。');}
function exportSave(){if(!game.checkpoint)return notify('完成第一局後，才有可匯出的存檔。');const blob=new Blob([JSON.stringify(game.checkpoint,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`charity-casino-${game.checkpoint.profile.mode}-round-${game.checkpoint.profile.rounds}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
app.addEventListener('submit',event=>{if(event.target.id!=='start-form')return;event.preventDefault();name=document.querySelector('#player-name').value.trim();if(!name||[...name].length>16){notify('請輸入 1–16 字參賽者姓名。');return;}story=true;render();});
app.addEventListener('input',event=>{if(event.target.id==='player-name')name=event.target.value;if(event.target.id==='pk-raise-to'){pokerUI.raiseTo=Math.round(Number(event.target.value)*100);document.querySelectorAll('[data-action=pk-chip]').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});}if(event.target.id==='custom-amount'){const value=Number(event.target.value);chip=Number.isFinite(value)?Math.round(value*100):0;allIn=false;const selectedAmount=document.querySelector('.selected-amount');if(selectedAmount)selectedAmount.textContent='每次 '+money(chip);document.querySelector('[data-action="all-in"]')?.setAttribute('aria-pressed','false');document.querySelector('[data-action="all-in"]')?.classList.remove('selected');document.querySelectorAll('.chip-picker button').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});}});
app.addEventListener('change',async event=>{
  if(event.target.id==='bet-target'){preciseBet=event.target.value;const b=document.querySelector('.precise-bet [data-action=bet]');if(b)b.dataset.bet=preciseBet;}
  if(event.target.id==='roulette-target'){roulettePrecise=event.target.value;const b=document.querySelector('.roulette-screen .precise-bet [data-action=bet]');if(b)b.dataset.bet=roulettePrecise;}
  if(event.target.id==='peek-side')peekSide=event.target.value;
  if(event.target.id==='peek-index')peekIndex=Number(event.target.value);
  if(event.target.id!=='import-file')return;
  const file=event.target.files[0];if(!file)return;
  try{if(file.size>100000)throw new Error('存檔檔案過大');const clean=validateSave(JSON.parse(await file.text()));const expected=game.screen==='home'?mode:game.profile.mode;if(clean.profile.mode!==expected)throw new Error(`這是${formatMode(clean.profile.mode)}存檔，請先切換相同模式。`);showRestored(clean);}catch(e){notify(`匯入失敗：${e.message}。目前進度未更改。`);}
});
app.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target||target.disabled||target.getAttribute('aria-disabled')==='true')return;event.preventDefault();advance();const a=target.dataset.action;
  if(game.paused&&!target.closest('.modal')){render();return;}
  if(game.activeTable==='roulette'&&target.dataset.rouletteRound!==undefined&&Number(target.dataset.rouletteRound)!==game.round?.id){render();notify('上一局下注時間已結束，請重新選擇。');return;}
  if(game.activeTable==='poker'&&target.dataset.pokerTurn!==undefined&&Number(target.dataset.pokerTurn)!==game.round.turnId){render();notify('本次行動已結束，請重新選擇。');return;}
  if(game.activeTable==='blackjack'&&target.dataset.bjHand&&game.round.hands[game.round.activeHand]?.id!==target.dataset.bjHand){render();notify('上一手已超時或結束，請重新選擇本手操作。');return;}
  if(a==='table-tools'&&!roundReveal.visible){tablePanels.openTools();return;}
  if(a==='close-round-popup'){roundReveal.close(game);render();return;}
  if(roundReveal.visible&&!target.closest('.mobile-reveal-dialog')&&a!=='pause'&&a!=='resume'&&a!=='close-overlay'&&a!=='sound'&&a!=='sound-test'&&!target.closest('.modal')){render();return;}
  if(a==='close-table-tool'){tablePanels.close();return;}
  if(a==='sound-test'){const allowed=()=>!document.hidden&&(game.screen==='home'||overlay==='pause');const attempt=sounds.test(allowed);render();void attempt.then(played=>{if(played&&allowed()){notify('正在試播籌碼聲。');render();}});return;}
  if(a==='sound'){sounds.setMuted(sounds.enabled);void sounds.unlock();render();return;}
  if(a==='mode'){mode=target.dataset.mode;render();return;}
  if(a==='enter'){game.start(name,mode);chip=500;allIn=false;story=false;last=performance.now();render();return;}
  if(a==='continue'){const save=readSave();if(save)showRestored(save);return;}
  if(a==='import'){document.querySelector('#import-file').click();return;}
  if(a==='export'){exportSave();return;}
  if(a==='home'){overlay=null;story=false;game.screen='home';game.paused=false;render();return;}
  if(a==='brand'){if(game.screen==='lobby')notify('選擇賭桌入座，或到道具商店準備。');return;}
  if(a==='pause'){openOverlay('pause');return;}
  if(a==='rules'){openOverlay('rules');return;}
  if(a==='saves'){openOverlay('saves');return;}
  if(a==='resume'||a==='close-overlay'){closeOverlay();return;}
  if(a==='load-auto'||a==='load-manual'){const save=readSave(game.profile.mode,a==='load-manual'?'manual':'auto');if(save)showRestored(save);else {notify(storageWarning||'此欄位尚未有存檔。');}return;}
  if(a==='manual-save'){if(game.round?.phase!=='settled'||game.profile.mode!=='free')return;try{saves.write(game.checkpoint,'manual');notify('已手動保存完成局。');}catch{notify('保存失敗，請嘗試匯出存檔。');}return;}
  if(a==='finish'){openOverlay('finish');return;}
  if(a==='table'){game.enterTable(target.dataset.table||'sicbo');group='大小';boardZoom=false;}
  if(a==='coming'){notify(`${target.dataset.label}正在製作中；目前可體驗大小、百家樂、21點、德州撲克及輪盤。`);return;}
  if(a==='shop')game.shop();
  if(a==='close-shop')game.screen='lobby';
  if(a==='buy'){const cost=game.buy(target.dataset.item);if(cost!==false)notify(`已購買${ITEMS[target.dataset.item].name}，花費 ${money(cost)}。下一局完成後保存。`);}
  if(a==='leave'&&!game.leaveTable())notify('請先完成本局，才可離桌。');
  if(a==='next'){if(game.newRound())group='大小';}
  if(a==='group')group=target.dataset.group;
  if(a==='board-zoom'){boardZoom=!boardZoom;flights.cancel();tablePanels.close();}
  if(a==='chip'){chip=Number(target.dataset.chip);allIn=false;}
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
  if(a==='pk-chip')pokerUI.raiseTo=Number(target.dataset.pokerAmount);
  if(a==='pk-action'){const accepted=game.pokerAction(target.dataset.pokerAction,pokerUI.raiseTo??Math.min(game.round.currentBet+game.round.lastFullRaise,game.profile.bank+game.round.players[0].street),Number(target.dataset.pokerTurn));if(!accepted)notify('請檢查加注總額、最小加注及剩餘資金。');pokerUI.selection=null;}
  if(a==='pk-item'){if(target.dataset.item==='protect'){if(!game.usePokerItem('protect',0,Number(target.dataset.pokerTurn)))notify('保本券須首次行動前使用。');}else{pokerUI.selection={kind:target.dataset.item,turn:game.round.turnId};tablePanels.close();}}
  if(a==='pk-cancel-item')pokerUI.selection=null;
  if(a==='pk-swap-card'||a==='pk-peek-seat'){const id=a==='pk-swap-card'?'swap':'peek',index=Number(a==='pk-swap-card'?target.dataset.index:target.dataset.seat);if(game.usePokerItem(id,index,Number(target.dataset.pokerTurn)))notify(id==='swap'?'已換牌；原行動倒數繼續。':'已透視一張底牌；原行動倒數繼續。');else notify('此道具目前不可用。');pokerUI.selection=null;}
  if(a==='bj-action'||a==='bj-insure'||a==='bj-no-insurance'){
    let accepted;if(a==='bj-action')accepted=game.blackjackAction(target.dataset.bjAction,target.dataset.bjHand);else{const amount=a==='bj-no-insurance'?0:Math.round(Number(document.querySelector('#bj-insurance-amount')?.value)*100);accepted=a==='bj-insure'&&amount<=0?false:game.chooseBlackjackInsurance(amount);}
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
document.addEventListener('click',()=>{void sounds.unlock();},{capture:true});
document.addEventListener('touchend',()=>{void sounds.unlock();},{capture:true,passive:true});
document.addEventListener('pointerdown',()=>{void sounds.unlock();},{capture:true,passive:true});
document.addEventListener('keydown',()=>{void sounds.unlock();},{capture:true});
document.addEventListener('keydown',event=>{
  if(event.defaultPrevented)return;
  if(tablePanels.dialog&&event.key==='Escape'){event.preventDefault();tablePanels.close();return;}
  if(!overlay&&['Enter',' '].includes(event.key)&&event.target.matches('.printed-cell')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
  if(overlay){if(event.key==='Tab'){const nodes=[...document.querySelectorAll('.modal button:not(:disabled),.modal input,.modal select')];const first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement.classList.contains('modal'))){end?.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===end){first?.focus();event.preventDefault();}}return;}
  const popupNode=document.querySelector('.mobile-reveal-dialog');if(popupNode&&event.key==='Tab'){const nodes=[...popupNode.querySelectorAll('button:not(:disabled)'),...document.querySelectorAll('.mobile-hud [data-action=pause]')],first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===popupNode)){end?.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===end){first?.focus();event.preventDefault();}return;}
  const panel=document.querySelector('.squeeze-panel');if(panel&&event.key==='Tab'){const nodes=[...panel.querySelectorAll('button:not(:disabled),[tabindex="0"]')],first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){end?.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===end){first?.focus();event.preventDefault();}return;}
  if(event.key==='Escape'&&game.screen!=='home'){event.preventDefault();openOverlay('pause');}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)sounds.stopAll();if(document.hidden&&game.profile&&game.screen!=='home'&&!overlay)openOverlay('pause');});
window.addEventListener('blur',()=>{sounds.stopAll();if(game.profile&&game.screen!=='home'&&!overlay)openOverlay('pause');});
window.addEventListener('pagehide',()=>{advance();game.paused=true;sounds.stopAll();sounds.sync(game);});
window.addEventListener('pageshow',event=>{if(event.persisted&&game.profile&&game.screen!=='home'&&!overlay)openOverlay('pause');});
setInterval(()=>{if(advance()){if(game.activeTable!=='poker')flights.landAll();render();}const elapsed=document.querySelector('#elapsed'),countdowns=document.querySelectorAll('#countdown,[data-countdown]');if(elapsed)elapsed.textContent=duration(game.profile.elapsedMs);for(const countdown of countdowns)countdown.textContent=game.round.remaining?Math.ceil(game.round.remaining/1000)+' 秒':game.round.phase==='settled'?'已結算':'';},100);
render();

function animateBaccarat(){if(game.round?.squeeze&&!game.paused){if(advance())render();squeeze.paint();}requestAnimationFrame(animateBaccarat);}
requestAnimationFrame(animateBaccarat);
