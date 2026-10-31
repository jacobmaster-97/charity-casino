import {cardRank,randomBelow} from './baccarat.mjs?v=0.4.0';
export const BLACKJACK_ENABLED=true;
export const BLACKJACK_DEAL_MS=400/.7;
export const BLACKJACK_CUT=104; // Enough cards for four hands, dealer and one replacement.
export const blackjackCardValue=id=>Math.min(10,cardRank(id));
export function blackjackValue(cards){let total=0,aces=0;for(const id of cards){const value=blackjackCardValue(id);total+=value;if(value===1)aces++;}const soft=aces>0&&total+10<=21;return {total:total+(soft?10:0),soft,bust:total>21};}
export const blackjackNatural=cards=>cards.length===2&&blackjackValue(cards).total===21;
export const blackjackHandNatural=h=>!h.fromSplit&&!h.swapped&&blackjackNatural(h.cards);
export function makeBlackjackShoe(randomIndex=randomBelow,cycle=1){const cards=Array.from({length:312},(_,i)=>i);for(let i=311;i>0;i--){const j=randomIndex(i+1);if(!Number.isInteger(j)||j<0||j>i)throw new Error('無效21點洗牌來源');[cards[i],cards[j]]=[cards[j],cards[i]];}return {cards,cursor:0,cycle};}
export function validateBlackjackShoe(shoe){if(!shoe||!Array.isArray(shoe.cards)||shoe.cards.length!==312||new Set(shoe.cards).size!==312||shoe.cards.some(c=>!Number.isInteger(c)||c<0||c>=312)||!Number.isInteger(shoe.cursor)||shoe.cursor<0||shoe.cursor>312||!Number.isSafeInteger(shoe.cycle)||shoe.cycle<1||shoe.cycle>1e8)throw new Error('21點牌靴資料無效');return {cards:[...shoe.cards],cursor:shoe.cursor,cycle:shoe.cycle};}
export function blackjackOptions(game){
 const r=game.round,h=r?.hands?.[r.activeHand],live=game.screen==='table'&&!game.paused&&r?.kind==='blackjack',playing=live&&r.phase==='bj-player'&&h?.status==='playing';
 const two=playing&&h.cards.length===2&&h.actions===0&&!h.splitA,unused=live&&!r.used;
 return {hit:playing,stand:playing,double:!!(two&&game.profile.bank>=h.bet),split:!!(two&&r.hands.length<4&&blackjackCardValue(h.cards[0])===blackjackCardValue(h.cards[1])&&game.profile.bank>=h.bet&&!(blackjackCardValue(h.cards[0])===1&&r.acesSplit)),surrender:!!(two&&!h.fromSplit&&r.dealerChecked),protect:!!(unused&&r.phase==='betting'&&game.profile.inventory.protect>0),peek:!!(unused&&playing&&r.dealerChecked&&game.profile.inventory.peek>0),swap:!!(unused&&two&&game.profile.inventory.swap>0)};
}
export function settleBlackjackRound(round){
 if(!round.hands?.length||round.hands.length>4||round.dealer?.length<2)throw new Error('21點牌局尚未完成');
 const dealer=blackjackValue(round.dealer),dealerBlackjack=blackjackNatural(round.dealer);
 const lines=round.hands.map(h=>{if(!Number.isSafeInteger(h.bet)||h.bet<=0)throw new Error('無效21點下注');const player=blackjackValue(h.cards),natural=blackjackHandNatural(h);let payout=0,outcome='loss';
   if(player.bust)outcome='bust';
   else if(dealerBlackjack){if(natural){payout=h.bet;outcome='push';}}
   else if(h.status==='surrendered'){payout=Math.floor(h.bet/2);outcome='surrender';}
   else if(natural){payout=h.bet+Math.floor(h.bet*3/2);outcome='blackjack';}
   else if(dealer.bust||player.total>dealer.total){payout=h.bet*2;outcome='win';}
   else if(player.total===dealer.total){payout=h.bet;outcome='push';}
   return {id:h.id,amount:h.bet,payout,net:payout-h.bet,total:player.total,outcome};});
 const insurance=round.insurance||0;if(!Number.isSafeInteger(insurance)||insurance<0||insurance>Math.floor(round.originalBet/2))throw new Error('無效21點保險');
 if(insurance)lines.push({id:'bj-insurance',amount:insurance,payout:dealerBlackjack?insurance*3:0,net:dealerBlackjack?insurance*2:-insurance,outcome:dealerBlackjack?'win':'loss'});
 const stake=lines.reduce((n,l)=>n+l.amount,0),returned=lines.reduce((n,l)=>n+l.payout,0),refund=round.used==='protect'&&returned<stake?Math.floor((stake-returned)/2):0;
 return {stake,returned,refund,net:returned+refund-stake,lines,dealerTotal:dealer.total,dealerBlackjack};
}
