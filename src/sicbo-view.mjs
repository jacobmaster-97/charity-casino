import {BETS,BET_MAP,ITEMS,money,getChipDenominations,chipLabel} from './rules.mjs?v=0.6.1';
import {boardMarkup,chipFace,CHIP_COLORS} from './board.mjs?v=0.6.1';
const sicboEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function die(value,index,selectable=false){const pos=`${(value-1)%2*100}% ${Math.floor((value-1)/2)*50}%`;return `<${selectable?'button':'div'} ${selectable?`type="button" data-action="reroll" data-index="${index}"`:''} class="die-wrap" aria-label="第 ${index+1} 顆骰子：${value} 點${selectable?'，點選重擲':''}"><span class="die-face" style="background-position:${pos}" aria-hidden="true"></span><span>${selectable?'重擲此骰':`${value} 點`}</span></${selectable?'button':'div'}>`;}
export function sicboTableView({game,art,button,icon,chip,allIn,storageWarning,peekIndex,boardZoom,preciseBet,mobile=false,popup=false,popupElapsed=0}){
  const r=game.round,p=game.profile,betting=r.phase==='betting',visible=['reroll','settled'].includes(r.phase),result=r.result;
  const phaseText={betting:'請下注',revealing:'開骰中',reroll:'選擇重擲',settled:'本局完成'}[r.phase];
  const denominations=getChipDenominations(r.bankAtStart);
  const stage=`<div style="--dice-motion-delay:-${Math.max(0,900-r.remaining)}ms;--dice-motion-state:${game.paused?'paused':'running'}" class="dice-stage ${r.phase==='revealing'?'shaking':''}">
      <div class="stage-topline"><span class="stage-status">${phaseText}</span><span ${mobile?'data-countdown':'id="countdown"'} class="countdown">${r.remaining?Math.ceil(r.remaining/1000)+' 秒':''}</span></div>
      <div class="dice-display">${mobile&&visible?`<img class="mobile-lift-dome" src="${art('/art/prototype-b/dome.png')}" alt="" aria-hidden="true" style="--lift-delay:-${r.phase==='reroll'?10000-r.remaining:popupElapsed}ms;--lift-state:${game.paused?'paused':'running'}">`:''}${visible?r.dice.map((v,i)=>die(v,i,r.phase==='reroll')).join(''):`<img class="dome" src="${art('/art/prototype-b/dome.png')}" alt="等待揭曉的骰盅">`}</div>
      <div class="stage-caption">${visible?`<strong>合計 ${r.dice.reduce((a,b)=>a+b,0)} 點</strong><span>${r.dice.every(v=>v===r.dice[0])?'圍骰 · 大小皆輸':r.dice.reduce((a,b)=>a+b,0)<=10?'小 · 4–10 點':'大 · 11–17 點'}</span>`:'<strong>三骰定勝負</strong><span>小 4–10 · 大 11–17 · 圍骰大小皆輸</span>'}</div>
    </div>`;
  const decision=r.phase==='reroll'?`<div class="result-box"><h2>改運，還是接受？</h2><p>點選上方一顆骰子重擲一次，或保留目前結果。兩種選擇及超時均消耗一張重擲券。</p>${button('accept','接受原結果','outlined')}</div>`:'';

  return `<section class="table-screen sicbo-screen presentation-separated">
    <div class="table-nav">${button('leave','← 返回大廳','quiet',(!betting&&r.phase!=='settled'||game.stake>0&&r.phase!=='settled'||r.used&&r.phase!=='settled')?'disabled':'')}<div><span class="eyebrow">SIC BO</span><h1>大小</h1></div>${button('rules','玩法與賠率','quiet')}</div>
    <div class="mobile-table-background" ${mobile&&popup?'inert':''}>
    ${mobile?'':stage}
    ${r.peek?`<div class="insight">${icon('peek')}第 ${r.peek.index+1} 顆：<strong>${r.peek.range}</strong><span>本局結果已固定</span></div>`:''}
    ${!mobile?decision:''}
    ${mobile&&result?`<div class="mobile-sicbo-result" role="status" aria-live="polite">${r.dice.join(' ＋ ')} ＝ ${r.dice.reduce((a,b)=>a+b,0)} 點 · ${r.dice.every(v=>v===r.dice[0])?'圍骰':r.dice.reduce((a,b)=>a+b,0)<=10?'小':'大'}</div>`:''}
    ${result?`<div class="result-box ${result.net>=0?'win':'loss'}"><span class="eyebrow">ROUND ${p.rounds} · 已完成</span><h2>${result.net>0?'贏得':result.net===0?'本局損益':'本局虧損'} <strong>${result.net>=0?'+':'−'}${money(Math.abs(result.net))}</strong></h2><p>下注 ${money(result.stake)} · 退回及派彩 ${money(result.returned)}${result.refund?` · 保本退回 ${money(result.refund)}`:''}</p><p class="save-note">${storageWarning?sicboEscape(storageWarning):'已自動保存本局結算；重新開啟可從此處繼續。'}</p><div class="result-actions">${p.status==='active'?button('next','再玩一局','primary'):button('finish','查看挑戰結果','primary')}${button('leave','返回大廳','outlined')}${p.mode==='free'?button('manual-save','手動保存','quiet'):''}</div></div>`:''}
    <div class="table-console">
      <div class="board-toolbar"><span id="board-help"><span class="board-wide-hint">選籌碼，再點枱面下注</span><span class="board-mobile-hint">完整總覽 · 細格可放大／精準選格</span></span></div>
      <div class="board-scroll ${boardZoom?'is-zoomed':''}" tabindex="0" role="region" aria-label="大小完整投注盤面" aria-describedby="board-help">${boardMarkup(art,betting)}</div>
      <div class="console-dock">
        <div class="console-summary"><div><span>本局投注</span><strong>${money(game.stake)}</strong></div><div><span>尚可投注</span><strong>${money(game.available)}</strong></div><span class="selected-amount">每次 ${money(allIn?game.available:chip)}</span></div>
        ${betting?`<div class="console-controls">
          <div class="chip-area"><span class="control-label">選擇籌碼</span><div class="chip-picker">${denominations.map((c,i)=>button('chip',`${chipFace(i,chipLabel(c),art)}<span>${money(c)}</span>`,!allIn&&chip===c?'selected':'',`data-chip="${c}" data-color="${CHIP_COLORS[i]}" aria-pressed="${!allIn&&chip===c}" aria-label="選擇 ${money(c)} 籌碼" title="${CHIP_COLORS[i]} · ${money(c)}" ${c>game.available?'disabled':''}`)).join('')}</div></div>
          <div class="amount-area"><div class="custom-bet"><label for="custom-amount">自訂每次金額</label><input id="custom-amount" type="number" inputmode="decimal" min="0.01" step="0.01" value="${(allIn?game.available:chip)/100}" aria-label="每次下注金額，美元">${button('all-in','全押',allIn?'outlined selected':'outlined',`aria-pressed="${allIn}"`)}</div></div>
          <div class="action-area">${button('roll',mobile?'鎖注・搖骰':'開骰 ↗','primary roll-button',game.stake?'':'disabled')}${button('clear',mobile?'清除':'清除投注','outlined',game.stake?'':'disabled')}</div>${button('table-tools','更多','quiet more-table-tools','aria-label="開啟牌桌工具"')}
        </div>`:''}
        ${!betting?button('table-tools','更多工具','quiet more-table-tools phase-tools'):''}
        <div class="console-tools">${button('rules','玩法與賠率','quiet mobile-only-tool')}${button('board-zoom',boardZoom?'完整盤面':'放大盤面','quiet zoom-toggle',`aria-pressed="${boardZoom}"`)}
          <details class="bet-details"><summary>投注明細 <span>${Object.keys(r.bets).length} 項</span></summary><div class="bet-list">${Object.entries(r.bets).length?Object.entries(r.bets).map(([id,amount])=>`<div><span>${sicboEscape(BET_MAP[id].group)} · ${sicboEscape(BET_MAP[id].label)}</span><strong>${money(amount)}</strong>${betting?button('remove','×','remove',`data-bet="${id}" aria-label="移除${sicboEscape(BET_MAP[id].label)}投注"`):''}</div>`).join(''):'<div class="empty-bets">尚未下注</div>'}</div></details>
          ${betting?`<details class="inventory"><summary>本局道具 <span>${r.used?'已用 1／1':'每局限用 1 件'}</span></summary><p class="field-note">重擲券持有即在開骰後提供選擇。</p><div class="peek-picker"><label for="peek-index">透視目標</label><select id="peek-index">${[0,1,2].map(i=>`<option value="${i}" ${peekIndex===i?'selected':''}>第 ${i+1} 顆骰子</option>`).join('')}</select></div>${['protect','peek','reroll'].map(id=>`<div class="item-row">${icon(id)}<span>${ITEMS[id].name}<small>持有 ${p.inventory[id]} 件</small></span>${id==='reroll'?'<small>揭曉後選擇</small>':button('use','使用','outlined',`data-item="${id}" ${r.used||!p.inventory[id]?'disabled':''}`)}</div>`).join('')}</details>`:''}
          <details class="precise-bet"><summary>精準選格 <span>小螢幕適用</span></summary><label for="bet-target">選擇投注位置</label><select id="bet-target" ${betting?'':'disabled'}>${BETS.map(b=>`<option value="${b.id}" ${preciseBet===b.id?'selected':''}>${sicboEscape(b.group+' · '+b.label)}</option>`).join('')}</select>${button('bet',`下注所選位置`,'outlined',`data-bet="${preciseBet}" ${betting?'':'disabled'}`)}</details>
        </div>
      </div>
    </div>
    </div>
    ${mobile&&popup?`<div class="mobile-reveal-layer"><section class="mobile-reveal-dialog sicbo-reveal" role="dialog" aria-modal="true" aria-label="${r.phase==='revealing'?'搖骰中':r.phase==='reroll'?'選擇重擲':'揭盅結果'}" tabindex="-1">${stage}${decision}${r.phase==='settled'?button('close-round-popup','回到盤面','outlined'):''}</section></div>`:''}
  </section>`;
}
