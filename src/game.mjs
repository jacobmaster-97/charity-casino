import {CHALLENGE_MS,CHALLENGE_RULESET,challengeStats} from './challenge.mjs?v=0.9.1';
import {cashAdd,cashSub,cashRatio,cashMax,isCash} from './cash.mjs?v=0.9.1';
import {ROULETTE_ENABLED,settleRouletteRound} from './roulette.mjs?v=0.9.1';
import {rouletteMethods} from './roulette-game.mjs?v=0.9.1';
import {POKER_ENABLED,settlePokerRound} from './poker.mjs?v=0.9.1';
import {pokerMethods} from './poker-game.mjs?v=0.9.1';
import {BLACKJACK_ENABLED,settleBlackjackRound} from './blackjack.mjs?v=0.9.1';
import {blackjackMethods} from './blackjack-game.mjs?v=0.9.1';
import {BACCARAT_ENABLED,BACCARAT_DEAL_MS,BACCARAT_UNFOLD_MS,BACCARAT_RETURN_MS,BACCARAT_BETS,BACCARAT_BET_MAP,randomBelow,makeBaccaratShoe,baccaratInitial,completeBaccaratHand,settleBaccaratRound,cardValue} from './baccarat.mjs?v=0.9.1';
import {GOAL, BET_MAP, ITEM_IDS, settleBets, randomDie} from './rules.mjs?v=0.9.1';
// The web entry opts into the new rules; the default also supports schema-1 legacy regression fixtures.
export class Game {
  constructor({roll=randomDie,onComplete=()=>{},onCue=()=>{},randomIndex=randomBelow,challenge=false}={}) { this.challenge=challenge;this.closing=false;this._resolving=false;this.roll=roll;this.onComplete=onComplete;this.onCue=onCue;this.screen='home';this.profile=null;this.round=null;this.paused=false;this.checkpoint=null;this.activeTable='sicbo';this.baccaratShoe=null;this.blackjackShoe=null;this.pokerTable=null;this.randomIndex=randomIndex; }
  cue(name){try{this.onCue(name);}catch{}}
  start(name,mode='race') {
    if(!name.trim()||[...name.trim()].length>16||!['race','free'].includes(mode))throw new Error('請輸入 1–16 字姓名');
    this.profile={name:name.trim(),mode,bank:10000,elapsedMs:0,inventory:{protect:0,peek:0,reroll:0,swap:0},rounds:0,status:'active'};
    if(this.challenge)Object.assign(this.profile,{ruleset:CHALLENGE_RULESET,stats:challengeStats(),itemsSpent:0,endReason:null});
    this.closing=false;this.screen='lobby';this.round=null;this.paused=false;this.checkpoint=null;this.activeTable='sicbo';this.baccaratShoe=null;this.blackjackShoe=null;this.pokerTable=null;
  }
  restore(save) {if(this.challenge&&save.schema!==2)throw new Error('舊版存檔已保留，但不能帶入五分鐘挑戰。');this.closing=false;this.challenge=save.schema===2;this.pokerTable=save.pokerTable?structuredClone(save.pokerTable):null;this.blackjackShoe=save.blackjackShoe?structuredClone(save.blackjackShoe):null;this.baccaratShoe=save.baccaratShoe?structuredClone(save.baccaratShoe):null;this.activeTable='sicbo';this.profile=structuredClone(save.profile);this.checkpoint=structuredClone(save);this.round=null;this.screen='lobby';this.paused=false;}
  get acceptsActions(){return !this.paused&&this.profile?.status==='active'&&(!this.closing||this._resolving);}
  get remainingMs(){return this.challenge?Math.max(0,CHALLENGE_MS-(this.profile?.elapsedMs||0)):null;}
  get stake(){return this.round?Object.values(this.round.bets).reduce((a,b)=>cashAdd(a,b),0):0;}
  get available(){return cashSub(this.profile.bank,this.round?.phase==='betting'?this.stake:0);}
  get canBet(){return this.screen==='table'&&this.round?.phase==='betting'&&this.acceptsActions;}
  enterTable(kind='sicbo'){if(!this.acceptsActions||this.paused||this.screen!=='lobby'||this.profile.status!=='active'||!['sicbo','baccarat','blackjack','poker','roulette'].includes(kind)||kind==='baccarat'&&!BACCARAT_ENABLED||kind==='blackjack'&&!BLACKJACK_ENABLED||kind==='poker'&&!POKER_ENABLED||kind==='roulette'&&!ROULETTE_ENABLED)return false;this.activeTable=kind;this.screen='table';return this.newRound();}
  newRound(){
    if(this.closing||this.paused||this.profile?.status!=='active'||(this.round&&this.round.phase!=='settled'))return false;
    if(this.activeTable==='roulette')return this.newRouletteRound();
    if(this.activeTable==='poker')return this.newPokerRound();
    if(this.activeTable==='baccarat')return this.newBaccaratRound();
    if(this.activeTable==='blackjack')return this.newBlackjackRound();
    this.round={kind:'sicbo',phase:'betting',bankAtStart:this.profile.bank,dice:[this.roll(),this.roll(),this.roll()],bets:{},remaining:30000,used:null,peek:null,result:null};return true;
  }
  addBet(id,amount){
    if(this.activeTable==='roulette')return this.addRouletteBet(id,amount);
    if(this.activeTable==='poker')return false;
    if(this.activeTable==='baccarat')return this.addBaccaratBet(id,amount);
    if(this.activeTable==='blackjack')return this.addBlackjackBet(id,amount);
    if(!this.canBet||!BET_MAP[id]||!isCash(amount)||amount<=0||amount>this.available)return false;
    if(amount<100&&!(this.profile.bank<100&&this.stake===0&&amount===this.profile.bank))return false;
    this.round.bets[id]=cashAdd(this.round.bets[id]||0,amount);return true;
  }
  clearBets(){if(!this.canBet)return false;this.round.bets={};return true;}
  undoBet(id){if(!this.canBet||!this.round.bets[id])return false;delete this.round.bets[id];return true;}
  useItem(id,index=0,expectedHandId=null){
    if(this.activeTable==='roulette')return this.useRouletteItem(id);
    if(this.activeTable==='poker')return this.usePokerItem(id,index,expectedHandId);
    if(this.activeTable==='baccarat')return this.useBaccaratItem(id,index);
    if(this.activeTable==='blackjack')return this.useBlackjackItem(id,index,expectedHandId);
    if(!this.canBet||this.round.used||!['protect','peek'].includes(id)||this.profile.inventory[id]<1||!Number.isInteger(index)||index<0||index>2)return false;
    this.profile.inventory[id]--;this.round.used=id;
    if(id==='peek')this.round.peek={index,range:this.round.dice[index]<=3?'低點 1–3':'高點 4–6'};
    return true;
  }
  lock(){
    if(this.activeTable==='roulette')return this.lockRoulette();
    if(this.activeTable==='poker')return this.startPoker();
    if(this.activeTable==='baccarat')return this.lockBaccarat();
    if(this.activeTable==='blackjack')return this.lockBlackjack();
    if(!this.canBet)return false;
    if(!this.stake){this.round={...this.round,dice:[this.roll(),this.roll(),this.roll()],remaining:30000,used:null,peek:null};return 'skipped';}
    this.profile.bank=cashSub(this.profile.bank,this.stake);this.round.phase='revealing';this.round.remaining=900;return true;
  }
  reveal(){
    if(this.round.phase!=='revealing')return false;
    this.cue('dice-open');
    if(!this.round.used&&this.profile.inventory.reroll>0){this.round.phase='reroll';this.round.remaining=10000;}else this.settle();
    return true;
  }
  chooseReroll(index=null){
    if(!this.acceptsActions||this.paused||this.round?.phase!=='reroll'||(index!==null&&(!Number.isInteger(index)||index<0||index>2)))return false;
    this.profile.inventory.reroll--;this.round.used='reroll';
    if(index!==null)this.round.dice[index]=this.roll();
    this.settle();return true;
  }
  settle(){
    const roulette=this.activeTable==='roulette',poker=this.activeTable==='poker',baccarat=this.activeTable==='baccarat',blackjack=this.activeTable==='blackjack';
    if((roulette||poker||baccarat||blackjack)?!this.round?.readyToSettle:!['revealing','reroll'].includes(this.round?.phase))return false;
    if(this.round.phase==='settled')return false;
    const result=roulette?settleRouletteRound(this.round.bets,this.round.outcome,this.round.used==='protect'):poker?settlePokerRound(this.round):blackjack?settleBlackjackRound(this.round):baccarat?settleBaccaratRound(this.round.bets,this.round.final,this.round.used==='protect'):settleBets(this.round.bets,this.round.dice,this.round.used==='protect');
    this.profile.bank=cashAdd(this.profile.bank,result.returned,result.refund);if(poker)this.finalizePokerStacks(result);this.profile.rounds++;
    if(!this.challenge)this.profile.status=this.profile.bank>=GOAL?'won':this.profile.bank===0?'lost':'active';
    else{const stat=this.profile.stats[this.activeTable];stat.rounds++;stat.net=cashAdd(stat.net,result.net);}
    this.round.phase='settled';this.round.remaining=0;this.round.result=result;
    if(this.challenge&&(this.closing||this.profile.bank===0)){this.finishChallenge(this.profile.bank===0?'bust':'timeout');}else this.saveCheckpoint();return true;
  }
  saveCheckpoint(){
    this.checkpoint={schema:this.challenge?2:1,game:'charity-casino',profile:structuredClone(this.profile),...(this.baccaratShoe?{baccaratShoe:structuredClone(this.baccaratShoe)}:{}),...(this.blackjackShoe?{blackjackShoe:structuredClone(this.blackjackShoe)}:{}),...(this.pokerTable?{pokerTable:structuredClone(this.pokerTable)}:{})};
    this.onComplete(structuredClone(this.checkpoint));
  }
  finishChallenge(reason='timeout'){
    if(!this.challenge||this.profile.status!=='active')return false;
    this.profile.status='finished';this.profile.endReason=reason;this.closing=false;this.saveCheckpoint();return true;
  }
  expireChallenge(){
    if(!this.challenge||this.profile.status!=='active'||this.closing)return false;
    this.profile.elapsedMs=CHALLENGE_MS;
    if(this.screen!=='table'||!this.round||this.round.phase==='settled'||this.round.phase==='poker-ready'||this.round.phase==='betting'&&!this.stake){this.finishChallenge();return true;}
    this.closing=true;this.closeChoices();return true;
  }
  closeChoices(){
    if(!this.closing||this.paused||this.profile.status!=='active')return;
    this._resolving=true;
    try{for(let i=0;i<24&&this.closing;i++){
      const phase=this.round.phase,hand=this.round.activeHand,turn=this.round.turnId;
      if(phase==='betting')this.lock();
      else if(phase==='reroll')this.chooseReroll();
      else if(phase==='rou-reroll')this.chooseRouletteReroll();
      else if(phase==='swapping')this.chooseBaccaratSwap();
      else if(phase==='squeezing')this.finishBaccaratSqueeze();
      else if(phase==='bj-insurance')this.chooseBlackjackInsurance();
      else if(phase==='bj-player')this.blackjackAction('stand');
      else if(phase==='poker-player')this.pokerTimeout();
      else break;
      if(this.round.phase===phase&&this.round.activeHand===hand&&this.round.turnId===turn)throw new Error('自動收尾未能前進');
    }}finally{this._resolving=false;}
  }

  leaveTable(){
    if(this.closing)return false;
    if(this.activeTable==='poker'){if(this.paused||this.screen!=='table'||!(this.round?.phase==='settled'||this.round?.phase==='poker-ready'&&!this.round.used))return false;this.round=null;this.screen='lobby';return true;}
    if(this.paused||this.screen!=='table'||(this.round?.phase!=='settled'&&(this.stake>0||this.round?.used||this.round?.phase!=='betting')))return false;
    this.round=null;this.screen='lobby';return true;
  }
  shop(){if(!this.acceptsActions||this.paused||this.screen!=='lobby'||this.profile.status!=='active')return false;this.screen='shop';return true;}
  buy(id){
    if(!this.acceptsActions||this.paused||this.screen!=='shop'||!ITEM_IDS.includes(id)||this.profile.status!=='active')return false;
    const cost=cashMax(1,cashRatio(this.profile.bank,1,10,'round'));if(cost>this.profile.bank)return false;
    this.profile.bank=cashSub(this.profile.bank,cost);this.profile.inventory[id]++;
    if(this.challenge)this.profile.itemsSpent=cashAdd(this.profile.itemsSpent,cost);
    if(this.profile.bank===0){if(this.challenge)this.finishChallenge('bust');else this.profile.status='lost';}return cost;
  }
  newBaccaratRound(){
    if(!this.baccaratShoe||this.baccaratShoe.cards.length-this.baccaratShoe.cursor<60)this.baccaratShoe=makeBaccaratShoe(this.randomIndex,(this.baccaratShoe?.cycle||0)+1);
    const initial=this.baccaratShoe.cards.slice(this.baccaratShoe.cursor,this.baccaratShoe.cursor+4);
    this.round={kind:'baccarat',phase:'betting',bankAtStart:this.profile.bank,bets:{},remaining:30000,used:null,peek:null,result:null,initial,cards:baccaratInitial(initial),revealed:0,drawShown:0,discard:[],readyToSettle:false};return true;
  }
  addBaccaratBet(id,amount){
    if(!this.canBet||!BACCARAT_BET_MAP[id])return false;
    const main=BACCARAT_BETS.find(b=>this.round.bets[b.id]);
    if(BACCARAT_BETS.some(b=>b.id===id)&&main&&main.id!==id){const original=this.round.bets[main.id];delete this.round.bets[main.id];this.round.bets[id]=original;return 'moved';}
    if(!isCash(amount)||amount<=0||amount>this.available||amount<100&&!(this.profile.bank<100&&this.stake===0&&amount===this.profile.bank))return false;
    this.round.bets[id]=cashAdd(this.round.bets[id]||0,amount);return true;
  }
  useBaccaratItem(id,side){
    if(!this.canBet||this.round.used||!['protect','peek','swap'].includes(id)||!(this.profile.inventory[id]>0))return false;
    if(id==='peek'&&(!this.stake||!['player','banker'].includes(side)))return false;
    this.profile.inventory[id]--;this.round.used=id;
    if(id==='peek'){const index=this.randomIndex(2);this.round.peek={side,index,value:cardValue(this.round.cards[side][index])};}
    return true;
  }
  lockBaccarat(){
    if(!this.canBet)return false;
    if(!this.stake){this.baccaratShoe.cursor+=4;this.newBaccaratRound();return 'skipped';}
    this.profile.bank=cashSub(this.profile.bank,this.stake);this.baccaratShoe.cursor+=4;this.round.phase='dealing';this.round.remaining=BACCARAT_DEAL_MS;return true;
  }
  revealBaccaratCard(){
    if(this.paused||this.round?.phase!=='dealing')return false;
    this.round.revealed++;this.cue('card');
    if(this.round.revealed<4){this.round.remaining=BACCARAT_DEAL_MS;return true;}
    if(this.round.used==='swap'){this.round.phase='swapping';this.round.remaining=10000;return true;}
    return this.prepareBaccaratDraw();
  }
  chooseBaccaratSwap(index=null){
    if(!this.acceptsActions||this.paused||this.round?.phase!=='swapping'||index!==null&&(!Number.isInteger(index)||index<0||index>3))return false;
    if(index!==null){this.round.discard.push(this.round.initial[index]);this.round.initial[index]=this.baccaratShoe.cards[this.baccaratShoe.cursor++];}
    this.round.cards=baccaratInitial(this.round.initial);return this.prepareBaccaratDraw();
  }
  prepareBaccaratDraw(){
    this.round.final=completeBaccaratHand(this.round.initial,()=>this.baccaratShoe.cards[this.baccaratShoe.cursor++]);
    this.round.cards={player:[...this.round.final.player],banker:[...this.round.final.banker]};
    if(this.round.final.supplements.length)this.startBaccaratDraw();else{this.round.readyToSettle=true;this.settle();}return true;
  }
  startBaccaratDraw(){
    this.cue('card');
    const r=this.round,side=r.final.supplements[r.drawShown].side;
    r.remaining=BACCARAT_DEAL_MS;
    if(r.bets['bac-'+side]||side==='banker'&&r.bets['bac-lucky-six']){r.squeeze={index:r.drawShown,side,progress:0};r.phase='delivering';}else r.phase='drawing';
  }
  revealBaccaratDraw(){
    if(this.paused||this.round?.phase!=='drawing')return false;
    return this.commitBaccaratDraw();
  }
  updateBaccaratSqueeze(progress){
    if(!this.acceptsActions||this.paused||this.round?.phase!=='squeezing'||!Number.isFinite(progress))return false;
    this.round.squeeze.progress=Math.max(this.round.squeeze.progress,Math.min(1,Math.max(0,progress)));return true;
  }
  finishBaccaratSqueeze(){
    if(!this.acceptsActions||this.paused||this.round?.phase!=='squeezing')return false;
    this.round.squeeze.progress=1;this.round.phase='unfolding';this.round.remaining=BACCARAT_UNFOLD_MS;return true;
  }
  advanceBaccaratSqueeze(){
    if(this.paused)return false;
    if(this.round?.phase==='delivering'){this.round.phase='squeezing';this.round.remaining=0;return true;}
    if(this.round?.phase==='unfolding'){this.round.phase='returning';this.round.remaining=BACCARAT_RETURN_MS;return true;}
    if(this.round?.phase==='returning')return this.commitBaccaratDraw();
    return false;
  }
  commitBaccaratDraw(){
    if(this.paused||!['drawing','returning'].includes(this.round?.phase))return false;
    this.round.drawShown++;
    this.round.squeeze=null;
    if(this.round.drawShown<this.round.final.supplements.length)this.startBaccaratDraw();else{this.round.readyToSettle=true;this.settle();}return true;
  }
  tick(ms){
    if(!this.profile||this.paused||!(this.challenge?['lobby','table','shop']:['lobby','table']).includes(this.screen)||this.profile.status!=='active')return false;
    if(!Number.isFinite(ms)||ms<=0)return false;
    let left=ms,changed=false;
    if(this.challenge&&this.remainingMs===0&&!this.closing){this.expireChallenge();changed=true;}
    if(this.profile.status!=='active')return changed;
    while(left>0){
      const timed=this.screen==='table'&&['betting','revealing','reroll','dealing','swapping','drawing','delivering','unfolding','returning','bj-dealing','bj-animating','bj-insurance','bj-player','poker-player','poker-ai','poker-dealing','poker-collect','poker-showdown','rou-spinning','rou-reroll'].includes(this.round?.phase);
      const step=Math.min(timed?Math.min(left,this.round.remaining):left,this.challenge&&!this.closing?this.remainingMs:Infinity);
      if(['blackjack','poker'].includes(this.activeTable)&&this.round?.preserveActionMs!==null&&this.round?.preserveActionMs!==undefined)this.round.preserveActionMs=Math.max(0,this.round.preserveActionMs-step);
      if(!this.closing)this.profile.elapsedMs+=step;left-=step;if(timed)this.round.remaining-=step;
      if(this.challenge&&!this.closing&&this.remainingMs===0){this.expireChallenge();changed=true;if(this.profile.status!=='active')break;}
      if(!timed){if(this.closing)this.closeChoices();break;}
      if(this.round.remaining<1e-7){
        const phase=this.round.phase;
        this._resolving=true;try{if(phase==='rou-spinning')this.finishRouletteSpin();else if(phase==='rou-reroll')this.chooseRouletteReroll();else if(phase==='poker-player')this.pokerTimeout();else if(phase==='poker-ai')this.actPokerAI();else if(phase==='poker-dealing')this.advancePokerDeal();else if(phase==='poker-collect')this.advancePokerCollect();else if(phase==='poker-showdown')this.completePoker();else if(phase==='bj-player')this.blackjackAction('stand');else if(phase==='bj-insurance')this.chooseBlackjackInsurance();else if(phase==='bj-dealing'||phase==='bj-animating')this.advanceBlackjackAnimation();else if(phase==='betting')this.lock();else if(phase==='revealing')this.reveal();else if(phase==='dealing')this.revealBaccaratCard();else if(phase==='swapping')this.chooseBaccaratSwap();else if(phase==='drawing')this.revealBaccaratDraw();else if(['delivering','unfolding','returning'].includes(phase))this.advanceBaccaratSqueeze();else this.chooseReroll();}finally{this._resolving=false;}
        this.closeChoices();changed=true;
        if(this.profile.status!=='active')break;
      }
    }
    return changed;
  }
}

Object.assign(Game.prototype,blackjackMethods);

Object.assign(Game.prototype,pokerMethods);

Object.assign(Game.prototype,rouletteMethods);
