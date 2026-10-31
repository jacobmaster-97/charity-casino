import {BLACKJACK_CUT,BLACKJACK_DEAL_MS,makeBlackjackShoe,blackjackCardValue,blackjackValue,blackjackNatural,blackjackHandNatural,blackjackOptions} from './blackjack.mjs?v=0.5.1';
const blackjackHand=(id,bet,cards=[],fromSplit=false,splitA=false)=>({id,bet,cards,fromSplit,splitA,swapped:false,actions:0,doubled:false,status:'playing'});
// These methods run on Game: one owner for funds, timers, items and checkpoints.
export const blackjackMethods={
 newBlackjackRound(){
   if(!this.blackjackShoe||312-this.blackjackShoe.cursor<BLACKJACK_CUT)this.blackjackShoe=makeBlackjackShoe(this.randomIndex,(this.blackjackShoe?.cycle||0)+1);
   this.round={kind:'blackjack',phase:'betting',bankAtStart:this.profile.bank,bets:{},remaining:20000,used:null,peek:null,result:null,hands:[],dealer:[],dealerShown:false,dealerChecked:false,activeHand:0,insurance:0,originalBet:0,acesSplit:false,nextHandId:1,discard:[],readyToSettle:false,preserveActionMs:null,lastDeal:null};return true;
 },
 addBlackjackBet(id,amount){if(!this.canBet||id!=='bj-main'||!Number.isSafeInteger(amount)||amount<=0||amount>this.available||amount<100&&!(this.profile.bank<100&&this.stake===0&&amount===this.profile.bank))return false;this.round.bets[id]=(this.round.bets[id]||0)+amount;return true;},
 drawBlackjackCard(){if(this.blackjackShoe.cursor>=312)throw new Error('21點牌靴已耗盡');return this.blackjackShoe.cards[this.blackjackShoe.cursor++];},
 lockBlackjack(){
   if(!this.canBet)return false;if(!this.stake){this.newBlackjackRound();return 'skipped';}
   const r=this.round;r.originalBet=this.stake;this.profile.bank-=r.originalBet;r.hands=[blackjackHand('bj-main',r.originalBet)];
   this.queueBlackjackAnimation([{side:'player',handId:'bj-main'},{side:'dealer'},{side:'player',handId:'bj-main'},{side:'dealer'}],'initial',null,'bj-dealing');return true;
 },
 queueBlackjackAnimation(events,after,preserve=null,phase='bj-animating'){
   const r=this.round;r.animationQueue=events;r.afterAnimation=after;r.preserveActionMs=preserve;r.phase=phase;r.remaining=BLACKJACK_DEAL_MS;r.lastDeal=null;
 },
 advanceBlackjackAnimation(){
   const r=this.round;if(this.paused||!['bj-dealing','bj-animating'].includes(r?.phase))return false;
   if(r.animationQueue.length){const event=r.animationQueue.shift();if(event.kind==='reveal'){r.dealerShown=true;r.lastDeal={side:'dealer',index:1};}
     else{const cards=event.side==='dealer'?r.dealer:r.hands.find(h=>h.id===event.handId).cards,card=this.drawBlackjackCard();let index=cards.length;if(event.replace!==undefined){index=event.replace;r.discard.push(cards[index]);cards[index]=card;}else cards.push(card);r.lastDeal={side:event.side,handId:event.handId,index};}
     this.cue('card');r.remaining=BLACKJACK_DEAL_MS;return true;
   }
   const after=r.afterAnimation,preserve=r.preserveActionMs;r.lastDeal=null;r.preserveActionMs=null;
   if(after==='initial'){if(blackjackCardValue(r.dealer[0])===1){r.phase='bj-insurance';r.remaining=20000;}else this.checkBlackjackOpening();}
   else if(after==='split'){for(const h of r.hands)if(h.status==='playing'&&(h.splitA||blackjackValue(h.cards).total===21))h.status='stood';this.enterBlackjackPlayer();}
   else if(after==='player')this.completeBlackjackPlayerAction(preserve);
   else if(after==='dealer')this.continueBlackjackDealer();return true;
 },
 chooseBlackjackInsurance(amount=0){
   const r=this.round;if(this.paused||r?.phase!=='bj-insurance'||!Number.isSafeInteger(amount)||amount<0||amount>Math.floor(r.originalBet/2)||amount>this.profile.bank)return false;
   r.insurance=amount;if(amount){this.profile.bank-=amount;r.bets['bj-insurance']=amount;}this.checkBlackjackOpening();return amount?{betAdded:{id:'bj-insurance',amount}}:true;
 },
 checkBlackjackOpening(){
   const r=this.round;r.dealerChecked=true;r.dealerBlackjack=blackjackNatural(r.dealer);for(const h of r.hands)if(blackjackHandNatural(h))h.status='blackjack';
   if(r.dealerBlackjack)this.startBlackjackDealer();else this.enterBlackjackPlayer();
 },
 enterBlackjackPlayer(remaining=20000){
   const r=this.round;while(r.activeHand<r.hands.length&&r.hands[r.activeHand].status!=='playing')r.activeHand++;
   if(r.activeHand>=r.hands.length){this.startBlackjackDealer();return;}
   r.phase='bj-player';r.remaining=remaining;if(remaining<=0)this.blackjackAction('stand');
 },
 completeBlackjackPlayerAction(preserve=null){
   const r=this.round,h=r.hands[r.activeHand],value=blackjackValue(h.cards);
   if(value.bust)h.status='bust';else if(value.total===21||h.doubled)h.status='stood';
   if(h.status!=='playing'){r.activeHand++;this.enterBlackjackPlayer();}else this.enterBlackjackPlayer(preserve===null?20000:preserve);
 },
 blackjackAction(action,expectedHandId=null){
   if(expectedHandId!==null&&this.round?.hands?.[this.round.activeHand]?.id!==expectedHandId)return false;
   if(!['hit','stand','double','split','surrender'].includes(action)||!blackjackOptions(this)[action])return false;
   const r=this.round,h=r.hands[r.activeHand];
   if(action==='stand'||action==='surrender'){h.status=action==='stand'?'stood':'surrendered';h.actions++;r.activeHand++;this.enterBlackjackPlayer();return true;}
   if(action==='hit'){h.actions++;this.queueBlackjackAnimation([{side:'player',handId:h.id}],'player');return true;}
   if(action==='double'){const amount=h.bet;this.profile.bank-=amount;h.bet+=amount;r.bets[h.id]=h.bet;h.actions++;h.doubled=true;this.queueBlackjackAnimation([{side:'player',handId:h.id}],'player');return {betAdded:{id:h.id,amount}};}
   const splitA=blackjackCardValue(h.cards[0])===1,id='bj-hand-'+r.nextHandId++,amount=h.bet;
   this.profile.bank-=amount;r.bets[id]=amount;if(splitA)r.acesSplit=true;
   const left=blackjackHand(h.id,amount,[h.cards[0]],true,splitA),right=blackjackHand(id,amount,[h.cards[1]],true,splitA);r.hands.splice(r.activeHand,1,left,right);
   this.queueBlackjackAnimation([{side:'player',handId:left.id},{side:'player',handId:right.id}],'split');return {betAdded:{id,amount}};
 },
 useBlackjackItem(id,index=0,expectedHandId=null){
   if(expectedHandId!==null&&this.round?.hands?.[this.round.activeHand]?.id!==expectedHandId)return false;
   const options=blackjackOptions(this),r=this.round;if(!['protect','peek','swap'].includes(id)||!options[id])return false;
   const h=r.hands[r.activeHand];if(id==='swap'&&(!Number.isInteger(index)||index<0||index>=h.cards.length))return false;
   this.profile.inventory[id]--;r.used=id;
   if(id==='peek')r.peek={card:r.dealer[1]};
   if(id==='swap'){h.swapped=true;this.queueBlackjackAnimation([{side:'player',handId:h.id,replace:index}],'player',r.remaining);}
   return true;
 },
 startBlackjackDealer(){this.queueBlackjackAnimation([{kind:'reveal'}],'dealer');},
 continueBlackjackDealer(){
   const r=this.round,compare=r.hands.some(h=>!['bust','surrendered','blackjack'].includes(h.status));
   if(r.dealerBlackjack||!compare||blackjackValue(r.dealer).total>=17){r.readyToSettle=true;this.settle();}
   else this.queueBlackjackAnimation([{side:'dealer'}],'dealer');
 }
};
