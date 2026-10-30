import {Game} from './game.mjs?v=0.1.4';
import {BETS,BET_MAP,GOAL,ITEMS,money,duration,getChipDenominations,chipLabel} from './rules.mjs?v=0.1.4';
import {boardMarkup,boardAmounts,ChipFlights,CHIP_COLORS,chipFace,chipColorIndex} from './board.mjs?v=0.1.4';
import {Saves,validateSave} from './storage.mjs?v=0.1.4';

const app=document.querySelector('#app'),toastNode=document.querySelector('#toast');
let storage;try{storage=window.localStorage;}catch{storage=null;}
const saves=new Saves(storage||{getItem(){throw new Error('無法使用瀏覽器儲存空間');},setItem(){throw new Error('無法使用瀏覽器儲存空間');}});
let storageWarning='',mode='race',name='',story=false,group='大小',chip=500,allIn=false,peekIndex=0,overlay=null,toastTimer,last=performance.now();
const game=new Game({onComplete:save=>{try{saves.write(save);storageWarning='';}catch{storageWarning='自動保存失敗，請匯出完成局存檔。';}}});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art=path=>globalThis.__CASINO_ART?.[path]||new URL('../public'+path,import.meta.url).href;
const icon=id=>`<span class="prop prop-${id}" aria-hidden="true"></span>`;
const button=(action,text,cls='',extra='')=>`<button type="button" data-action="${action}" class="${cls}" ${extra}>${text}</button>`;
let boardRound=null,boardCounts={},boardLast={},boardChips={},boardZoom=false,preciseBet='small';
const flights=new ChipFlights({art,onChange:paintBoard,reduced:()=>matchMedia('(prefers-reduced-motion: reduce)').matches});
function paintBoard(){const landed={};for(const [id,values] of Object.entries(boardChips)){const pendingCount=flights.flights.filter(f=>f.id===id).length;landed[id]=values.slice(0,Math.max(0,values.length-pendingCount)).slice(-3);}const node=document.querySelector('.board-amounts');if(!node||!game.round)return;node.innerHTML=boardAmounts(game.round.bets,flights.pending,art,boardCounts,boardLast,game.round.bankAtStart,landed);for(const cell of document.querySelectorAll('.printed-cell'))cell.classList.toggle('has-bet',Boolean(game.round.bets[cell.dataset.bet]));}
const formatMode=m=>m==='race'?'競速模式':'自由模式';
function notify(text){toastNode.textContent=text;toastNode.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.classList.remove('visible'),4200);}
function readSave(which=mode,slot='auto'){try{return saves.read(which,slot);}catch{storageWarning='存檔無法讀取，原檔已保留；可嘗試匯入備份。';return null;}}
function advance(){const now=performance.now();const changed=game.tick(now-last);last=now;return changed;}
function hud(){const p=game.profile;return `<header class="hud"><a class="brand" href="#" data-action="brand"><span class="seal">賭</span><span>賭王慈善大賽<small>CHARITY CASINO</small></span></a><div class="hud-stat bank"><span>可用資金</span><strong id="bank-value">${money(game.available)}</strong></div><div class="hud-stat"><span>${esc(p.name)} · ${formatMode(p.mode)}</span><strong id="elapsed">${duration(p.elapsedMs)}</strong></div>${button('pause','Ⅱ <span>暫停</span>','quiet pause-button','aria-label="暫停遊戲"')}</header>`;}
function home(){const save=readSave();return `<main class="home"><div class="home-art"></div><header class="home-header"><span class="brand"><span class="seal">賭</span><span>慈善之夜<small>THE CHARITY NIGHT</small></span></span><span class="edition">港式賭片 · 可玩原型 01</span></header><section class="home-content"><p class="eyebrow">一百元入場・二千五百萬的挑戰</p><h1>賭王<br><span>慈善大賽</span></h1><p class="intro">今晚，讓每一次抉擇改寫牌局。<br>帶著 $100 入場，挑戰你的最快通關紀錄。</p><form id="start-form"><label for="player-name">參賽者姓名</label><input id="player-name" name="playerName" autocomplete="nickname" maxlength="32" placeholder="怎樣稱呼你？" value="${esc(name)}" required><div class="mode-picker" aria-label="選擇模式">${button('mode','競速模式',mode==='race'?'selected':'','data-mode="race" aria-pressed="'+(mode==='race')+'"')}${button('mode','自由模式',mode==='free'?'selected':'','data-mode="free" aria-pressed="'+(mode==='free')+'"')}</div><p class="field-note">${mode==='race'?'單一自動存檔，挑戰最快時間。':'自動保存，另可手動保存及讀取完成局。'}</p><button class="primary start-button" type="submit">踏入賭場 <span>↗</span></button></form><div class="home-links">${save?button('continue',`繼續挑戰 · ${money(save.profile.bank)}`,'text-button'):''}${button('import','匯入存檔','text-button')}</div>${storageWarning?`<p class="warning">${esc(storageWarning)}</p>`:''}</section><footer class="home-footer"><span>目前開放：大小完整玩法</span><span>純遊戲籌碼 · 本機存檔</span></footer></main>`;}
function storyCard(){return `<main class="story-page"><div class="story-card"><span class="eyebrow">序章 · 慈善之夜</span><span class="story-symbol">♠</span><h1>今夜，由你入局。</h1><p>賭場為慈善大賽亮起燈火。<br>你的起始資金只有 <strong>$100</strong>。</p><p>在不同賭桌作出選擇，將手上總資金<br>推向 <strong>$25,000,000</strong>，並留下通關時間。<br>資金歸零，這次挑戰便告結束。</p>${button('enter','以 $100 開始挑戰','primary')}<small>本輪先開放大小；其他賭桌將陸續加入。</small></div></main>`;}
const stations=[['sicbo','大小','SIC BO',33,40],['baccarat','百家樂','BACCARAT',73,40],['poker','德州撲克','TEXAS HOLD’EM',17,68],['blackjack','21 點','BLACKJACK',50,71],['roulette','輪盤','ROULETTE',85,69]];
function lobby(){const p=game.profile;return `<section class="lobby"><div class="section-heading"><div><p class="eyebrow">THE GRAND LOBBY</p><h1>選一張桌，開始今晚的挑戰。</h1></div>${button('shop',`${icon('chips')}道具商店`,'outlined')}</div><div class="lobby-map"><img src="${art('/art/styles/b/lobby-populated-v4.png')}" alt="港式卡通賭場，中央為豪華樓梯，五張賭桌各有荷官及賭客" draggable="false">${stations.map(([id,label,en,x,y])=>button(id==='sicbo'?'table':'coming',`<span>${label}</span><small>${id==='sicbo'?'入座遊玩 ↗':'開發中'}</small>`,'station '+(id==='sicbo'?'available':''),`style="--x:${x}%;--y:${y}%" data-label="${label}" aria-label="${label}，${id==='sicbo'?'入座遊玩':'開發中'}"`)).join('')}</div><div class="lobby-bottom"><div class="goal-copy"><span class="gold">目標 ${money(GOAL)}</span><span>累計完成 ${p.rounds} 局 · 點選賭桌入座</span></div><div class="lobby-actions">${button('saves','存檔／讀檔','quiet')}${button('home','返回主頁','quiet')}</div></div><div class="goal-bar" role="progressbar" aria-label="目標資金進度" aria-valuemin="0" aria-valuemax="${GOAL}" aria-valuenow="${Math.min(p.bank,GOAL)}"><span style="width:${Math.min(100,p.bank/GOAL*100)}%"></span></div><p class="save-note">只在完成一局後保存。購物及未完成牌局會隨下次完成局一起記錄；關閉後回到上次完成存檔。</p></section>`;}
function die(value,index,selectable=false){const pos=`${(value-1)%2*100}% ${Math.floor((value-1)/2)*50}%`;return `<${selectable?'button':'div'} ${selectable?`type="button" data-action="reroll" data-index="${index}"`:''} class="die-wrap" aria-label="第 ${index+1} 顆骰子：${value} 點${selectable?'，點選重擲':''}"><span class="die-face" style="background-position:${pos}" aria-hidden="true"></span><span>${selectable?'重擲此骰':`${value} 點`}</span></${selectable?'button':'div'}>`;}
function table(){
  const r=game.round,p=game.profile,betting=r.phase==='betting',visible=['reroll','settled'].includes(r.phase),result=r.result;
  const phaseText={betting:'請下注',revealing:'開骰中',reroll:'選擇重擲',settled:'本局完成'}[r.phase];
  const denominations=getChipDenominations(r.bankAtStart);
  return `<section class="table-screen">
    <div class="table-nav">${button('leave','← 返回大廳','quiet',(!betting&&r.phase!=='settled'||game.stake>0&&r.phase!=='settled'||r.used&&r.phase!=='settled')?'disabled':'')}<div><span class="eyebrow">SIC BO</span><h1>大小</h1></div>${button('rules','玩法與賠率','quiet')}</div>
    <div class="dice-stage ${r.phase==='revealing'?'shaking':''}">
      <div class="stage-topline"><span class="stage-status">${phaseText}</span><span id="countdown" class="countdown">${r.remaining?Math.ceil(r.remaining/1000)+' 秒':''}</span></div>
      <div class="dice-display">${visible?r.dice.map((v,i)=>die(v,i,r.phase==='reroll')).join(''):`<img class="dome" src="${art('/art/prototype-b/dome.png')}" alt="等待揭曉的骰盅">`}</div>
      <div class="stage-caption">${visible?`<strong>合計 ${r.dice.reduce((a,b)=>a+b,0)} 點</strong><span>${r.dice.every(v=>v===r.dice[0])?'圍骰 · 大小皆輸':r.dice.reduce((a,b)=>a+b,0)<=10?'小 · 4–10 點':'大 · 11–17 點'}</span>`:'<strong>三骰定勝負</strong><span>小 4–10 · 大 11–17 · 圍骰大小皆輸</span>'}</div>
    </div>
    ${r.peek?`<div class="insight">${icon('peek')}第 ${r.peek.index+1} 顆：<strong>${r.peek.range}</strong><span>本局結果已固定</span></div>`:''}
    ${r.phase==='reroll'?`<div class="result-box"><h2>改運，還是接受？</h2><p>點選上方一顆骰子重擲一次，或保留目前結果。兩種選擇及超時均消耗一張重擲券。</p>${button('accept','接受原結果','outlined')}</div>`:''}
    ${result?`<div class="result-box ${result.net>=0?'win':'loss'}"><span class="eyebrow">ROUND ${p.rounds} · 已完成</span><h2>${result.net>0?'贏得':result.net===0?'本局損益':'本局虧損'} <strong>${result.net>=0?'+':'−'}${money(Math.abs(result.net))}</strong></h2><p>下注 ${money(result.stake)} · 退回及派彩 ${money(result.returned)}${result.refund?` · 保本退回 ${money(result.refund)}`:''}</p><p class="save-note">${storageWarning?esc(storageWarning):'已自動保存本局結算；重新開啟可從此處繼續。'}</p><div class="result-actions">${p.status==='active'?button('next','再玩一局','primary'):button('finish','查看挑戰結果','primary')}${button('leave','返回大廳','outlined')}${p.mode==='free'?button('manual-save','手動保存','quiet'):''}</div></div>`:''}
    <div class="table-console">
      <div class="board-toolbar"><span id="board-help"><span class="board-wide-hint">選籌碼，再點枱面下注</span><span class="board-mobile-hint">完整總覽 · 細格可放大／精準選格</span></span>${button('board-zoom',boardZoom?'顯示完整盤面':'放大盤面','quiet',`aria-pressed="${boardZoom}"`)}</div>
      <div class="board-scroll ${boardZoom?'is-zoomed':''}" tabindex="0" role="region" aria-label="大小完整投注盤面" aria-describedby="board-help">${boardMarkup(art,betting)}</div>
      <div class="console-dock">
        <div class="console-summary"><div><span>本局投注</span><strong>${money(game.stake)}</strong></div><div><span>尚可投注</span><strong>${money(game.available)}</strong></div><span class="selected-amount">每次 ${money(allIn?game.available:chip)}</span></div>
        ${betting?`<div class="console-controls">
          <div class="chip-area"><span class="control-label">選擇籌碼</span><div class="chip-picker">${denominations.map((c,i)=>button('chip',`${chipFace(i,chipLabel(c),art)}<span>${money(c)}</span>`,!allIn&&chip===c?'selected':'',`data-chip="${c}" data-color="${CHIP_COLORS[i]}" aria-pressed="${!allIn&&chip===c}" aria-label="選擇 ${money(c)} 籌碼" title="${CHIP_COLORS[i]} · ${money(c)}" ${c>game.available?'disabled':''}`)).join('')}</div></div>
          <div class="amount-area"><div class="custom-bet"><label for="custom-amount">自訂每次金額</label><input id="custom-amount" type="number" inputmode="decimal" min="0.01" step="0.01" value="${(allIn?game.available:chip)/100}" aria-label="每次下注金額，美元">${button('all-in','全押',allIn?'outlined selected':'outlined',`aria-pressed="${allIn}"`)}</div></div>
          <div class="action-area">${button('roll','鎖注開骰 ↗','primary roll-button',game.stake?'':'disabled')}${button('clear','清除全部投注','outlined',game.stake?'':'disabled')}</div>
        </div>`:''}
        <div class="console-tools">
          <details class="bet-details"><summary>投注明細／移除單項 <span>${Object.keys(r.bets).length} 項</span></summary><div class="bet-list">${Object.entries(r.bets).length?Object.entries(r.bets).map(([id,amount])=>`<div><span>${esc(BET_MAP[id].group)} · ${esc(BET_MAP[id].label)}</span><strong>${money(amount)}</strong>${betting?button('remove','×','remove',`data-bet="${id}" aria-label="移除${esc(BET_MAP[id].label)}投注"`):''}</div>`).join(''):'<div class="empty-bets">尚未下注</div>'}</div></details>
          ${betting?`<details class="inventory"><summary>本局道具 <span>${r.used?'已用 1／1':'每局限用 1 件'}</span></summary><p class="field-note">重擲券持有即在開骰後提供選擇。</p><div class="peek-picker"><label for="peek-index">透視目標</label><select id="peek-index">${[0,1,2].map(i=>`<option value="${i}" ${peekIndex===i?'selected':''}>第 ${i+1} 顆骰子</option>`).join('')}</select></div>${['protect','peek','reroll'].map(id=>`<div class="item-row">${icon(id)}<span>${ITEMS[id].name}<small>持有 ${p.inventory[id]} 件</small></span>${id==='reroll'?'<small>揭曉後選擇</small>':button('use','使用','outlined',`data-item="${id}" ${r.used||!p.inventory[id]?'disabled':''}`)}</div>`).join('')}</details>`:''}
          <details class="precise-bet"><summary>精準選格 <span>小螢幕適用</span></summary><label for="bet-target">選擇投注位置</label><select id="bet-target" ${betting?'':'disabled'}>${BETS.map(b=>`<option value="${b.id}" ${preciseBet===b.id?'selected':''}>${esc(b.group+' · '+b.label)}</option>`).join('')}</select>${button('bet',`下注所選位置`,'outlined',`data-bet="${preciseBet}" ${betting?'':'disabled'}`)}</details>
        </div>
      </div>
    </div>
  </section>`;
}
function shop(){const cost=Math.max(1,Math.round(game.profile.bank/10));return `<section class="shop-page"><div class="section-heading"><div><p class="eyebrow">A LITTLE HELP FROM LUCK</p><h1>道具商店</h1><p>每件為購買前資金的 10%。每局最多使用一件。</p></div>${button('close-shop','← 返回大廳','outlined')}</div><div class="shop-notice"><span class="gold">Ⅱ 計時已暫停</span><span>本次價格 ${money(cost)} · 買下一件時重新計價</span></div><div class="shop-grid">${Object.entries(ITEMS).map(([id,item])=>`<article class="shop-card">${icon(id)}<span class="eyebrow">${id==='protect'?'PROTECT':id==='peek'?'INSIGHT':'SECOND CHANCE'}</span><h2>${item.name}</h2><p>${item.description}</p><div class="shop-card-bottom"><span>已持有 ${game.profile.inventory[id]} 件</span>${button('buy',`${money(cost)} 購買`,'primary',`data-item="${id}"`)}</div></article>`).join('')}</div><p class="save-note">購買紀錄將於下一局完成時保存。此原型道具只用於大小，其他遊戲的共用存量仍待細化。</p></section>`;}
function modal(){if(!overlay)return '';const isPause=overlay==='pause',isRules=overlay==='rules';let content;
  if(isPause)content=`<span class="eyebrow">TAKE YOUR TIME</span><h2>牌桌已遮住，稍歇一會。</h2><p>通關計時與行動倒數已停止。<br>按「繼續」恢復原本的牌局與剩餘秒數。</p>${button('resume','繼續','primary')}`;
  else if(isRules)content=`<span class="eyebrow">SIC BO · 計時已暫停</span><h2>大小玩法與賠率</h2><p>三顆六面骰。小為 4–10，大為 11–17；圍骰令大小皆輸。命中會另退本金。</p><ul class="rules-list"><li>大小：1:1；單點：出現 1／2／3 顆賠 1／2／3:1。</li><li>兩骰組合 5:1；指定對子 10:1；指定圍骰 150:1；任意圍骰 24:1。</li><li>總點數 4／17：50:1；5／16：18:1；6／15：14:1；7／14：12:1；8／13：8:1；9–12：6:1。</li><li>圍骰不影響其他合資格投注。下注限時 30 秒，可提早開骰；未下注超時跳過，不扣籌碼，已用道具不退。</li><li>一般每次最低 $1。總資金低於 $1 時，可用「全押」押全部餘額。</li><li>道具每局一件。保本計所有投注合計淨虧損；透視不重抽結果；持重擲券且未用其他道具時，開骰後重擲／接受／超時都扣券。</li></ul>${button('close-overlay','回到牌桌','primary')}`;
  else if(overlay==='finish')content=`<span class="eyebrow">${game.profile.status==='won'?'CHALLENGE COMPLETE':'END OF THE NIGHT'}</span><h2>${game.profile.status==='won'?'今夜，你是賭王。':'這次挑戰，到此落幕。'}</h2><p>${esc(game.profile.name)} · ${formatMode(game.profile.mode)}<br>最終資金 ${money(game.profile.bank)}<br>通關用時 ${duration(game.profile.elapsedMs)} · 完成 ${game.profile.rounds} 局</p>${button('home','返回主頁','primary')}${game.checkpoint?button('export','匯出上次完成存檔','text-button'):''}`;
  else content=`<span class="eyebrow">CHECKPOINT · 計時已暫停</span><h2>完成一局，再留下紀錄。</h2><p>只保存已完成局的狀態；未完成牌局不會寫入存檔。關閉後回到最後完成局。</p><div class="save-actions">${button('export','匯出上次完成存檔','primary',game.checkpoint?'':'disabled')}${button('load-auto','讀取上次自動存檔','outlined')}${game.profile.mode==='free'?button('load-manual','讀取手動存檔','outlined'):''}${button('import','匯入完成局存檔','outlined')}${button('close-overlay','繼續遊戲','quiet')}</div>${storageWarning?`<p class="warning">${esc(storageWarning)}</p>`:''}`;
  return `<div class="modal-backdrop ${isPause?'pause-cover':''}"><section class="modal" role="dialog" aria-modal="true" aria-label="${isPause?'遊戲已暫停':isRules?'玩法與賠率':overlay==='finish'?'挑戰結果':'存檔與讀檔'}" tabindex="-1">${content}</section></div>`;
}
function render(){const oldScroll=document.querySelector('.board-scroll')?.scrollLeft||0;const inventoryOpen=Boolean(document.querySelector('.inventory')?.open);const detailsOpen=['bet-details','precise-bet'].filter(c=>document.querySelector('.'+c)?.open);const boardTop=document.querySelector('.board-scroll')?.scrollTop||0;if(game.screen!=='table'||boardRound!==game.round){flights.cancel();boardRound=game.round;boardCounts={};boardLast={};boardChips={};}const active=document.activeElement,action=active?.dataset?.action,bet=active?.dataset?.bet,selectedChip=active?.dataset?.chip,oldModal=Boolean(document.querySelector('.modal'));const ended=game.screen!=='home'&&game.profile&&game.profile.status!=='active';if(ended&&!overlay)overlay='finish';
  app.innerHTML=`<div class="${overlay?'under-overlay':''}" ${overlay?'inert':''}>${game.screen==='home'?(story?storyCard():home()):`<div class="game-shell">${hud()}${game.screen==='lobby'?lobby():game.screen==='shop'?shop():table()}${storageWarning?`<p class="storage-warning">${esc(storageWarning)}</p>`:''}</div>`}</div>${modal()}<input id="import-file" type="file" accept="application/json,.json" hidden>`;
  const boardScroll=document.querySelector('.board-scroll');if(boardScroll){boardScroll.scrollLeft=oldScroll;boardScroll.scrollTop=boardTop;}for(const c of detailsOpen){const d=document.querySelector('.'+c);if(d)d.open=true;}const inventory=document.querySelector('.inventory');if(inventory)inventory.open=inventoryOpen;paintBoard();flights.mount();flights.pause(game.paused);document.querySelectorAll('.flying-chip').forEach(n=>n.hidden=Boolean(overlay));
  if(overlay){const d=document.querySelector('.modal');if(!oldModal)d.querySelector('button:not(:disabled)')?.focus();else d.focus();}
  else if(action){const options=[...app.querySelectorAll('[data-action]')];options.find(b=>b.tagName===active.tagName&&b.dataset.action===action&&(!bet||b.dataset.bet===bet)&&(!selectedChip||b.dataset.chip===selectedChip))?.focus({preventScroll:true});}
}
function openOverlay(type){advance();game.paused=true;overlay=type;render();}
function closeOverlay(){overlay=null;game.paused=false;last=performance.now();render();}
function showRestored(save){game.restore(validateSave(save));chip=500;allIn=false;mode=game.profile.mode;overlay=null;story=false;last=performance.now();render();notify('已恢復最後完成局；未完成的牌局不會保留。');}
function exportSave(){if(!game.checkpoint)return notify('完成第一局後，才有可匯出的存檔。');const blob=new Blob([JSON.stringify(game.checkpoint,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`charity-casino-${game.checkpoint.profile.mode}-round-${game.checkpoint.profile.rounds}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
app.addEventListener('submit',event=>{if(event.target.id!=='start-form')return;event.preventDefault();name=document.querySelector('#player-name').value.trim();if(!name||[...name].length>16){notify('請輸入 1–16 字參賽者姓名。');return;}story=true;render();});
app.addEventListener('input',event=>{if(event.target.id==='player-name')name=event.target.value;if(event.target.id==='custom-amount'){const value=Number(event.target.value);chip=Number.isFinite(value)?Math.round(value*100):0;allIn=false;const selectedAmount=document.querySelector('.selected-amount');if(selectedAmount)selectedAmount.textContent='每次 '+money(chip);document.querySelector('[data-action="all-in"]')?.setAttribute('aria-pressed','false');document.querySelector('[data-action="all-in"]')?.classList.remove('selected');document.querySelectorAll('.chip-picker button').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});}});
app.addEventListener('change',async event=>{
  if(event.target.id==='bet-target'){preciseBet=event.target.value;const b=document.querySelector('.precise-bet [data-action=bet]');if(b)b.dataset.bet=preciseBet;}
  if(event.target.id==='peek-index')peekIndex=Number(event.target.value);
  if(event.target.id!=='import-file')return;
  const file=event.target.files[0];if(!file)return;
  try{if(file.size>100000)throw new Error('存檔檔案過大');const clean=validateSave(JSON.parse(await file.text()));const expected=game.screen==='home'?mode:game.profile.mode;if(clean.profile.mode!==expected)throw new Error(`這是${formatMode(clean.profile.mode)}存檔，請先切換相同模式。`);showRestored(clean);}catch(e){notify(`匯入失敗：${e.message}。目前進度未更改。`);}
});
app.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target||target.disabled||target.getAttribute('aria-disabled')==='true')return;event.preventDefault();advance();const a=target.dataset.action;
  if(game.paused&&!target.closest('.modal'))return;
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
  if(a==='table'){game.enterTable();group='大小';}
  if(a==='coming'){notify(`${target.dataset.label}正在製作中；本輪可體驗大小完整循環。`);return;}
  if(a==='shop')game.shop();
  if(a==='close-shop')game.screen='lobby';
  if(a==='buy'){const cost=game.buy(target.dataset.item);if(cost!==false)notify(`已購買${ITEMS[target.dataset.item].name}，花費 ${money(cost)}。下一局完成後保存。`);}
  if(a==='leave'&&!game.leaveTable())notify('請先完成本局，才可離桌。');
  if(a==='next'){if(game.newRound())group='大小';}
  if(a==='group')group=target.dataset.group;
  if(a==='board-zoom'){boardZoom=!boardZoom;flights.cancel();}
  if(a==='chip'){chip=Number(target.dataset.chip);allIn=false;}
  if(a==='all-in')allIn=!allIn;
  if(a==='bet'){
    const amount=allIn?game.available:chip;const source=document.querySelector('.chip-picker .selected')||document.querySelector('#custom-amount');const bounds=source?.getBoundingClientRect();
    if(game.addBet(target.dataset.bet,amount)){boardCounts[target.dataset.bet]=(boardCounts[target.dataset.bet]||0)+1;boardLast[target.dataset.bet]=amount;boardChips[target.dataset.bet]=[...(boardChips[target.dataset.bet]||[]),amount].slice(-27);flights.queue(target.dataset.bet,amount,bounds?{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2}:null,chipColorIndex(amount,game.round.bankAtStart));}
    else notify(game.profile.bank<100?'資金低於 $1，請選「全押」押全部餘額。':'請檢查金額：每次至少 $1，總下注不能超過資金。');
  }
  if(a==='remove'){game.undoBet(target.dataset.bet);delete boardCounts[target.dataset.bet];delete boardLast[target.dataset.bet];delete boardChips[target.dataset.bet];flights.cancel(target.dataset.bet);}
  if(a==='clear'){game.clearBets();boardCounts={};boardLast={};boardChips={};flights.cancel();}
  if(a==='roll'){flights.cancel();game.lock();}
  if(a==='use'){if(game.useItem(target.dataset.item,peekIndex))notify(target.dataset.item==='protect'?'保本券已啟用，本局淨虧損退回 50%。':`透視：第 ${peekIndex+1} 顆為${game.round.peek.range}。`);}
  if(a==='reroll')game.chooseReroll(Number(target.dataset.index));
  if(a==='accept')game.chooseReroll();
  render();
});
window.addEventListener('resize',()=>flights.cancel());
window.addEventListener('scroll',()=>flights.cancel(),true);
document.addEventListener('keydown',event=>{
  if(!overlay&&['Enter',' '].includes(event.key)&&event.target.matches('.printed-cell')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));return;}
  if(overlay){if(event.key==='Tab'){const nodes=[...document.querySelectorAll('.modal button:not(:disabled),.modal input,.modal select')];const first=nodes[0],end=nodes.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement.classList.contains('modal'))){end?.focus();event.preventDefault();}else if(!event.shiftKey&&document.activeElement===end){first?.focus();event.preventDefault();}}return;}
  if(event.key==='Escape'&&game.screen!=='home'){event.preventDefault();openOverlay('pause');}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.profile&&game.screen!=='home'&&!overlay)openOverlay('pause');});
window.addEventListener('blur',()=>{if(game.profile&&game.screen!=='home'&&!overlay)openOverlay('pause');});
window.addEventListener('pagehide',()=>{advance();game.paused=true;});
window.addEventListener('pageshow',event=>{if(event.persisted&&game.profile&&game.screen!=='home'&&!overlay)openOverlay('pause');});
setInterval(()=>{if(advance()){flights.cancel();render();}const elapsed=document.querySelector('#elapsed'),countdown=document.querySelector('#countdown');if(elapsed)elapsed.textContent=duration(game.profile.elapsedMs);if(countdown)countdown.textContent=game.round.remaining?Math.ceil(game.round.remaining/1000)+' 秒':'';},100);
render();
