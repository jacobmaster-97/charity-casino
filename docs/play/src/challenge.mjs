import {money,duration} from './rules.mjs?v=0.9.0';
export const CHALLENGE_MS=300000;
export const CHALLENGE_RULESET='five-minute-v1';
export const CHALLENGE_TABLES={sicbo:'大小',baccarat:'百家樂',blackjack:'21點',poker:'德州撲克',roulette:'輪盤'};
export const challengeStats=()=>Object.fromEntries(Object.keys(CHALLENGE_TABLES).map(id=>[id,{rounds:0,net:0}]));
export function challengeResultView({game,button,escape,modeLabel=''}){
 const p=game.profile;
 return `<div class="challenge-result"><div class="challenge-result-summary"><span class="eyebrow">FIVE MINUTE CHALLENGE</span><h2>${p.endReason==='bust'?'資金歸零，挑戰結束。':'五分鐘挑戰完成。'}</h2><p>${escape(p.name)} · ${escape(modeLabel)}</p><span>最終資金</span><strong class="challenge-final-bank">${money(p.bank)}</strong><p>有效遊玩 ${duration(p.elapsedMs)} · 共 ${p.rounds} 局<br>道具購買支出 ${money(p.itemsSpent)}</p></div><div class="challenge-result-breakdown"><table aria-label="各款遊戲完成局數及淨贏取金額"><caption>本次五款遊戲統計</caption><thead><tr><th scope="col">遊戲</th><th scope="col">局數</th><th scope="col">淨贏取</th></tr></thead><tbody>${Object.entries(CHALLENGE_TABLES).map(([id,label])=>{const stat=p.stats[id];return `<tr data-stat-table="${id}"><th scope="row">${label}</th><td>${stat.rounds}</td><td class="${stat.net<0?'stat-loss':'stat-win'}">${stat.net>=0?'+':''}${money(stat.net)}</td></tr>`;}).join('')}</tbody></table><p class="challenge-stat-note">淨贏取＝派彩及保本退款－投注。<br>道具購買支出另計。</p></div><div class="challenge-result-actions">${button('home','返回主頁','primary')}${game.checkpoint?button('export','匯出挑戰紀錄','outlined'):''}</div></div>`;
}
