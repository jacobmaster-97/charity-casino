// Cards are unique IDs 0..415 (eight decks); a round never reshuffles revealed information.
export const BACCARAT_ENABLED=true;
export const BACCARAT_DEAL_MS=400/.7;
export const BACCARAT_UNFOLD_MS=700;
export const BACCARAT_RETURN_MS=700;
export const BACCARAT_BETS=[{id:'bac-player',label:'閒',group:'百家樂',rate:1},{id:'bac-tie',label:'和',group:'百家樂',rate:8},{id:'bac-banker',label:'莊',group:'百家樂',rate:.95}];
export const BACCARAT_SIDEBETS=[{id:'bac-player-pair',label:'閒對',group:'百家樂旁注',rate:11,rateLabel:'11:1',detail:'閒方首兩張同牌階',sideBet:true},{id:'bac-lucky-six',label:'幸運六',group:'百家樂旁注',rate:'12 / 20',rateLabel:'12:1 / 20:1',detail:'莊6點勝：兩張12、三張20',sideBet:true},{id:'bac-banker-pair',label:'莊對',group:'百家樂旁注',rate:11,rateLabel:'11:1',detail:'莊方首兩張同牌階',sideBet:true}];
export const BACCARAT_ALL_BETS=[...BACCARAT_BETS,...BACCARAT_SIDEBETS];
export const BACCARAT_BET_MAP=Object.fromEntries(BACCARAT_ALL_BETS.map(b=>[b.id,b]));
export function randomBelow(max){const a=new Uint32Array(1),limit=Math.floor(4294967296/max)*max;do{globalThis.crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}
export const cardRank=id=>id%13+1;
export const cardValue=id=>Math.min(cardRank(id),10)%10;
export const baccaratPoints=cards=>cards.reduce((n,id)=>n+cardValue(id),0)%10;
export function makeBaccaratShoe(randomIndex=randomBelow,cycle=1){const cards=Array.from({length:416},(_,i)=>i);for(let i=415;i>0;i--){const j=randomIndex(i+1);if(!Number.isInteger(j)||j<0||j>i)throw new Error('無效洗牌來源');[cards[i],cards[j]]=[cards[j],cards[i]];}return {cards,cursor:0,cycle};}
export function validateBaccaratShoe(shoe){
 if(!shoe||!Array.isArray(shoe.cards)||shoe.cards.length!==416||new Set(shoe.cards).size!==416||shoe.cards.some(c=>!Number.isInteger(c)||c<0||c>=416)||!Number.isInteger(shoe.cursor)||shoe.cursor<0||shoe.cursor>416||!Number.isSafeInteger(shoe.cycle)||shoe.cycle<1||shoe.cycle>1e8)throw new Error('百家樂牌靴資料無效');
 return {cards:[...shoe.cards],cursor:shoe.cursor,cycle:shoe.cycle};
}
export function bankerTakesCard(total,playerThird=null){if(playerThird===null)return total<=5;return total<=2||(total===3&&playerThird!==8)||(total===4&&playerThird>=2&&playerThird<=7)||(total===5&&playerThird>=4&&playerThird<=7)||(total===6&&(playerThird===6||playerThird===7));}
export function baccaratInitial(cards){return {player:[cards[0],cards[2]],banker:[cards[1],cards[3]]};}
export function completeBaccaratHand(initial,draw){
 const {player,banker}=baccaratInitial(initial),p=baccaratPoints(player),b=baccaratPoints(banker),supplements=[];
 const natural=p>=8||b>=8;let third=null;
 if(!natural){if(p<=5){const card=draw();player.push(card);third=cardValue(card);supplements.push({side:'player',card});}if(bankerTakesCard(b,third)){const card=draw();banker.push(card);supplements.push({side:'banker',card});}}
 const playerTotal=baccaratPoints(player),bankerTotal=baccaratPoints(banker),winner=playerTotal===bankerTotal?'tie':playerTotal>bankerTotal?'player':'banker';return {player,banker,playerTotal,bankerTotal,winner,natural,supplements};
}
export function settleBaccaratBet(bets,hand,protectedRound=false){
 const entries=Object.entries(bets);if(entries.length!==1)throw new Error('百家樂每局只押一項');const [id,amount]=entries[0];if(!BACCARAT_BETS.some(b=>b.id===id)||!Number.isSafeInteger(amount)||amount<=0)throw new Error('無效百家樂投注');
 const win=id==='bac-'+hand.winner,push=hand.winner==='tie'&&id!=='bac-tie';
 // Win credit is rounded down to the cent; no accumulated commission debt.
 const profit=win?(id==='bac-banker'?Math.floor(amount*95/100):id==='bac-tie'?amount*8:amount):0;
 const returned=win?amount+profit:push?amount:0,refund=protectedRound&&returned<amount?Math.floor((amount-returned)/2):0;
 return {stake:amount,returned,refund,commission:win&&id==='bac-banker'?amount-profit:0,net:returned+refund-amount,winner:hand.winner,playerTotal:hand.playerTotal,bankerTotal:hand.bankerTotal,lines:[{id,amount,rate:win?BACCARAT_BET_MAP[id].rate:push?0:-1,payout:returned,net:returned-amount}]};
}

export function baccaratSideRate(id,hand){
 if(id==='bac-player-pair')return cardRank(hand.player[0])===cardRank(hand.player[1])?11:-1;
 if(id==='bac-banker-pair')return cardRank(hand.banker[0])===cardRank(hand.banker[1])?11:-1;
 if(id==='bac-lucky-six')return hand.winner==='banker'&&hand.bankerTotal===6?(hand.banker.length===2?12:20):-1;
 throw new Error('無效百家樂旁注');
}
export function settleBaccaratRound(bets,hand,protectedRound=false){
 const entries=Object.entries(bets);if(!entries.length)throw new Error('尚未下注');
 const mains=Object.fromEntries(entries.filter(([id])=>BACCARAT_BETS.some(b=>b.id===id)));
 const main=Object.keys(mains).length?settleBaccaratBet(mains,hand):{stake:0,returned:0,commission:0,lines:[]};
 let stake=main.stake,returned=main.returned;const lines=[...main.lines];
 for(const [id,amount] of entries){if(Object.hasOwn(mains,id))continue;if(!BACCARAT_SIDEBETS.some(b=>b.id===id)||!Number.isSafeInteger(amount)||amount<=0)throw new Error('無效旁注金額');const rate=baccaratSideRate(id,hand),payout=rate<0?0:amount*(rate+1);stake+=amount;returned+=payout;lines.push({id,amount,rate,payout,net:payout-amount});}
 const refund=protectedRound&&returned<stake?Math.floor((stake-returned)/2):0;
 return {stake,returned,refund,commission:main.commission,net:returned+refund-stake,winner:hand.winner,playerTotal:hand.playerTotal,bankerTotal:hand.bankerTotal,lines};
}
