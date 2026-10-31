import {randomBelow} from './baccarat.mjs?v=0.5.0';
export const POKER_ENABLED=true;
export const POKER_NAMES=['阿豪','嘉欣','龍哥','小曼','阿傑','秀姐','阿森','樂怡','志強','美玲'];
export const POKER_STYLES=['穩健','進取','鬆手','善變','謹慎'];
export const pokerRank=id=>id%13===0?14:id%13+1;
export function makePokerDeck(randomIndex=randomBelow){const cards=Array.from({length:52},(_,i)=>i);for(let i=51;i>0;i--){const j=randomIndex(i+1);if(!Number.isInteger(j)||j<0||j>i)throw new Error('無效撲克洗牌來源');[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
const pokerHandNames=['高牌','一對','兩對','三條','順子','同花','葫蘆','四條','同花順'];
function pokerFive(cards){
 const ranks=cards.map(pokerRank).sort((a,b)=>b-a),counts=new Map();for(const v of ranks)counts.set(v,(counts.get(v)||0)+1);
 const groups=[...counts].sort((a,b)=>b[1]-a[1]||b[0]-a[0]),flush=cards.every(c=>Math.floor(c/13)===Math.floor(cards[0]/13));
 const unique=[...new Set(ranks)],straight=unique.length===5&&(unique[0]-unique[4]===4?unique[0]:unique.join(',')==='14,5,4,3,2'?5:0);let category=0,tie=ranks;
 if(flush&&straight){category=8;tie=[straight];}else if(groups[0][1]===4){category=7;tie=groups.map(g=>g[0]);}else if(groups[0][1]===3&&groups[1][1]===2){category=6;tie=groups.map(g=>g[0]);}else if(flush)category=5;
 else if(straight){category=4;tie=[straight];}else if(groups[0][1]===3){category=3;tie=groups.map(g=>g[0]);}else if(groups[0][1]===2&&groups[1][1]===2){category=2;tie=groups.map(g=>g[0]);}else if(groups[0][1]===2){category=1;tie=groups.map(g=>g[0]);}
 let score=category;for(let i=0;i<5;i++)score=score*15+(tie[i]||0);return {category,tie,score,name:category===8&&tie[0]===14?'皇家同花順':pokerHandNames[category],cards:[...cards]};
}
export function pokerBest(cards){
 if(!Array.isArray(cards)||cards.length<5||cards.length>7||new Set(cards).size!==cards.length||cards.some(c=>!Number.isInteger(c)||c<0||c>51))throw new Error('無效撲克手牌');
 let best=null;for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){const h=pokerFive([cards[a],cards[b],cards[c],cards[d],cards[e]]);if(!best||h.score>best.score)best=h;}return best;
}
export function pokerBlinds(bank){const big=bank<100?Math.max(1,bank):bank<100000?100:bank<1000000?1000:bank<10000000?10000:bank<100000000?100000:1000000;return {small:Math.max(1,Math.floor(big/2)),big};}
export const pokerDifficulty=bank=>bank<100000?0:bank<10000000?1:2;
export function validatePokerTable(t){
 if(!t||!Number.isInteger(t.button)||t.button<0||t.button>5||!['normal','fast'].includes(t.speed)||!Number.isSafeInteger(t.nextId)||t.nextId<6||t.nextId>1e8||!Array.isArray(t.seats)||t.seats.length!==5)throw new Error('德州桌資料無效');
 const seats=t.seats.map(s=>{if(!s||!Number.isSafeInteger(s.id)||s.id<1||s.id>=t.nextId||!Number.isSafeInteger(s.stack)||s.stack<0||s.stack>1e12||!Number.isInteger(s.style)||s.style<0||s.style>=5)throw new Error('德州對手資料無效');return {id:s.id,stack:s.stack,style:s.style};});
 if(new Set(seats.map(s=>s.id)).size!==5)throw new Error('德州對手重複');return {button:t.button,speed:t.speed,nextId:t.nextId,seats};
}
export function pokerOptions(game,seat=0){
 const r=game.round,p=r?.players?.[seat],live=game.screen==='table'&&!game.paused&&r?.kind==='poker',turn=live&&r.actor===seat&&['poker-player','poker-ai'].includes(r.phase)&&!p.folded&&p.stack>0;
 if(!p)return {turn:false};const call=Math.max(0,r.currentBet-p.street),maxTo=p.street+p.stack,minTo=r.currentBet+(r.currentBet?r.lastFullRaise:r.blinds.big),opponent=r.players.some((q,i)=>i!==seat&&!q.folded&&q.stack>0);
 const reopen=!p.hasActed||r.currentBet-p.lastActedBet>=r.lastFullRaise,raise=!!(turn&&opponent&&reopen&&maxTo>r.currentBet);
 return {turn:!!turn,call:Math.min(call,p.stack),owed:call,check:!!(turn&&!call),fold:!!turn,raise,minTo,maxTo,allIn:!!(turn&&(maxTo<=r.currentBet||raise)),protect:!!(live&&!r.used&&game.profile.inventory.protect>0&&(r.phase==='poker-ready'||turn&&seat===0&&!r.playerHasActed)),peek:!!(live&&turn&&seat===0&&!r.used&&game.profile.inventory.peek>0&&r.players.some((q,i)=>i>0&&!q.folded)),swap:!!(live&&turn&&seat===0&&!r.used&&game.profile.inventory.swap>0&&!r.playerHasActed&&r.streetIndex===0)};
}
export function pokerPotLayers(players){
 if(!Array.isArray(players)||players.length!==6||players.some(p=>!Number.isSafeInteger(p.total)||p.total<0))throw new Error('無效彩池投入');
 const levels=[...new Set(players.map(p=>p.total).filter(v=>v>0))].sort((a,b)=>a-b);let previous=0;
 return levels.map(level=>{const contributors=players.map((p,i)=>p.total>=level?i:-1).filter(i=>i>=0),amount=(level-previous)*contributors.length;previous=level;return {amount,contributors,eligible:contributors.filter(i=>!players[i].folded),uncalled:contributors.length===1};});
}
export function pokerPots(players,board,button){
 if(!Array.isArray(players)||players.length!==6||players.some(p=>!Number.isSafeInteger(p.total)||p.total<0))throw new Error('無效彩池投入');
 const alive=players.map((p,i)=>p.folded?-1:i).filter(i=>i>=0);if(!alive.length)throw new Error('沒有有效玩家');
 const scores=alive.length===1?null:players.map(p=>p.folded?null:pokerBest([...p.cards,...board]));
 const payouts=Array(6).fill(0),pots=[];
 for(const layer of pokerPotLayers(players)){const {contributors,amount,eligible,uncalled}=layer;let winners;
   if(uncalled)winners=contributors;else if(alive.length===1)winners=alive;else{if(!eligible.length)throw new Error('邊池無合資格玩家');const high=Math.max(...eligible.map(i=>scores[i].score));winners=eligible.filter(i=>scores[i].score===high);}
   winners.sort((a,b)=>((a-button+5)%6)-((b-button+5)%6));const share=Math.floor(amount/winners.length),remainder=amount%winners.length;const shares=winners.map((seat,j)=>({seat,amount:share+(j<remainder?1:0)}));for(const s of shares)payouts[s.seat]+=s.amount;pots.push({amount,eligible,winners:[...winners],shares,uncalled});
 }
 return {pots,payouts,scores,total:players.reduce((n,p)=>n+p.total,0)};
}
export function settlePokerRound(r){const distribution=pokerPots(r.players,r.board,r.button),stake=r.players[0].total,returned=distribution.payouts[0],refund=r.used==='protect'&&returned<stake?Math.floor((stake-returned)/2):0;return {...distribution,stake,returned,refund,net:returned+refund-stake,lines:distribution.pots.map((p,i)=>({id:'pot-'+i,amount:p.amount,payout:p.shares.find(s=>s.seat===0)?.amount||0}))};}
// Only receives the actor's cards and public information. No opponent hole cards or future deck.
export function pokerAI({cards,board,options,pot,big,style,difficulty,randomIndex=randomBelow}){
 const roll=randomIndex(1000)/1000,ranks=cards.map(pokerRank).sort((a,b)=>b-a),pair=ranks[0]===ranks[1];
 let strength=board.length>=3?Math.min(.98,.20+pokerBest([...cards,...board]).category*.14+ranks[0]/140):pair?.48+ranks[0]/35:(ranks[0]+ranks[1])/45+(Math.floor(cards[0]/13)===Math.floor(cards[1]/13)?.08:0)-(ranks[0]-ranks[1]>4?.08:0);
 strength=Math.max(.02,Math.min(.98,strength+(randomIndex(1000)/1000-.5)*[.5,.24,.08][difficulty]));const loose=[0,.08,.17,.04,-.06][style],bluff=difficulty===0?.025:difficulty===1?.07:.12,price=options.call/Math.max(1,pot+options.call),tolerance=.24+strength*.55+loose+difficulty*.02;
 if(options.call&&roll>tolerance&&strength<price+.48-difficulty*.04)return {action:'fold'};
 if(options.raise&&(strength>.62&&roll<.18+strength*.25+loose||roll<bluff)){const to=Math.min(options.maxTo,options.minTo+Math.floor(pot*.5/big)*big);return {action:'raise',to};}
 return {action:options.check?'check':'call'};
}
