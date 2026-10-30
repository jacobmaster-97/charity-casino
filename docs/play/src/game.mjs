import {BACCARAT_ENABLED,BACCARAT_DEAL_MS,BACCARAT_UNFOLD_MS,BACCARAT_RETURN_MS,BACCARAT_BETS,BACCARAT_BET_MAP,randomBelow,makeBaccaratShoe,baccaratInitial,completeBaccaratHand,settleBaccaratRound,cardValue} from './baccarat.mjs?v=0.1.8';
import {GOAL, BET_MAP, ITEM_IDS, settleBets, randomDie} from './rules.mjs?v=0.1.8';
export class Game {
  constructor({roll=randomDie,onComplete=()=>{},randomIndex=randomBelow}={}) { this.roll=roll;this.onComplete=onComplete;this.screen='home';this.profile=null;this.round=null;this.paused=false;this.checkpoint=null;this.activeTable='sicbo';this.baccaratShoe=null;this.randomIndex=randomIndex; }
  start(name,mode='race') {
    if(!name.trim()||[...name.trim()].length>16||!['race','free'].includes(mode))throw new Error('請輸入 1–16 字姓名');
    this.profile={name:name.trim(),mode,bank:10000,elapsedMs:0,inventory:{protect:0,peek:0,reroll:0,swap:0},rounds:0,status:'active'};
    this.screen='lobby';this.round=null;this.paused=false;this.checkpoint=null;this.activeTable='sicbo';this.baccaratShoe=null;
  }
  restore(save) {this.baccaratShoe=save.baccaratShoe?structuredClone(save.baccaratShoe):null;this.activeTable='sicbo';this.profile=structuredClone(save.profile);this.checkpoint=structuredClone(save);this.round=null;this.screen='lobby';this.paused=false;}
  get stake(){return this.round?Object.values(this.round.bets).reduce((a,b)=>a+b,0):0;}
  get available(){return this.profile.bank-(this.round?.phase==='betting'?this.stake:0);}
  get canBet(){return this.screen==='table'&&this.round?.phase==='betting'&&!this.paused;}
  enterTable(kind='sicbo'){if(this.paused||this.screen!=='lobby'||this.profile.status!=='active'||!['sicbo','baccarat'].includes(kind)||kind==='baccarat'&&!BACCARAT_ENABLED)return false;this.activeTable=kind;this.screen='table';return this.newRound();}
  newRound(){
    if(this.paused||this.profile?.status!=='active'||(this.round&&this.round.phase!=='settled'))return false;
    if(this.activeTable==='baccarat')return this.newBaccaratRound();
    this.round={kind:'sicbo',phase:'betting',bankAtStart:this.profile.bank,dice:[this.roll(),this.roll(),this.roll()],bets:{},remaining:30000,used:null,peek:null,result:null};return true;
  }
  addBet(id,amount){
    if(this.activeTable==='baccarat')return this.addBaccaratBet(id,amount);
    if(!this.canBet||!BET_MAP[id]||!Number.isSafeInteger(amount)||amount<=0||amount>this.available)return false;
    if(amount<100&&!(this.profile.bank<100&&this.stake===0&&amount===this.profile.bank))return false;
    this.round.bets[id]=(this.round.bets[id]||0)+amount;return true;
  }
  clearBets(){if(!this.canBet)return false;this.round.bets={};return true;}
  undoBet(id){if(!this.canBet||!this.round.bets[id])return false;delete this.round.bets[id];return true;}
  useItem(id,index=0){
    if(this.activeTable==='baccarat')return this.useBaccaratItem(id,index);
    if(!this.canBet||this.round.used||!['protect','peek'].includes(id)||this.profile.inventory[id]<1||!Number.isInteger(index)||index<0||index>2)return false;
    this.profile.inventory[id]--;this.round.used=id;
    if(id==='peek')this.round.peek={index,range:this.round.dice[index]<=3?'低點 1–3':'高點 4–6'};
    return true;
  }
  lock(){
    if(this.activeTable==='baccarat')return this.lockBaccarat();
    if(!this.canBet)return false;
    if(!this.stake){this.round={...this.round,dice:[this.roll(),this.roll(),this.roll()],remaining:30000,used:null,peek:null};return 'skipped';}
    this.profile.bank-=this.stake;this.round.phase='revealing';this.round.remaining=900;return true;
  }
  reveal(){
    if(this.round.phase!=='revealing')return false;
    if(!this.round.used&&this.profile.inventory.reroll>0){this.round.phase='reroll';this.round.remaining=10000;}else this.settle();
    return true;
  }
  chooseReroll(index=null){
    if(this.paused||this.round?.phase!=='reroll'||(index!==null&&(!Number.isInteger(index)||index<0||index>2)))return false;
    this.profile.inventory.reroll--;this.round.used='reroll';
    if(index!==null)this.round.dice[index]=this.roll();
    this.settle();return true;
  }
  settle(){
    const baccarat=this.activeTable==='baccarat';
    if(baccarat?!this.round?.readyToSettle:!['revealing','reroll'].includes(this.round?.phase))return false;
    if(this.round.phase==='settled')return false;
    const result=baccarat?settleBaccaratRound(this.round.bets,this.round.final,this.round.used==='protect'):settleBets(this.round.bets,this.round.dice,this.round.used==='protect');
    this.profile.bank+=result.returned+result.refund;this.profile.rounds++;
    this.profile.status=this.profile.bank>=GOAL?'won':this.profile.bank===0?'lost':'active';
    this.round.phase='settled';this.round.remaining=0;this.round.result=result;
    this.checkpoint={schema:1,game:'charity-casino',profile:structuredClone(this.profile),...(this.baccaratShoe?{baccaratShoe:structuredClone(this.baccaratShoe)}:{})};
    this.onComplete(structuredClone(this.checkpoint));return true;
  }
  leaveTable(){
    if(this.paused||this.screen!=='table'||(this.round?.phase!=='settled'&&(this.stake>0||this.round?.used||this.round?.phase!=='betting')))return false;
    this.round=null;this.screen='lobby';return true;
  }
  shop(){if(this.paused||this.screen!=='lobby'||this.profile.status!=='active')return false;this.screen='shop';return true;}
  buy(id){
    if(this.paused||this.screen!=='shop'||!ITEM_IDS.includes(id)||this.profile.status!=='active')return false;
    const cost=Math.max(1,Math.round(this.profile.bank/10));if(cost>this.profile.bank)return false;
    this.profile.bank-=cost;this.profile.inventory[id]++;
    if(this.profile.bank===0)this.profile.status='lost';return cost;
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
    if(!Number.isSafeInteger(amount)||amount<=0||amount>this.available||amount<100&&!(this.profile.bank<100&&this.stake===0&&amount===this.profile.bank))return false;
    this.round.bets[id]=(this.round.bets[id]||0)+amount;return true;
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
    this.profile.bank-=this.stake;this.baccaratShoe.cursor+=4;this.round.phase='dealing';this.round.remaining=BACCARAT_DEAL_MS;return true;
  }
  revealBaccaratCard(){
    if(this.paused||this.round?.phase!=='dealing')return false;
    this.round.revealed++;
    if(this.round.revealed<4){this.round.remaining=BACCARAT_DEAL_MS;return true;}
    if(this.round.used==='swap'){this.round.phase='swapping';this.round.remaining=10000;return true;}
    return this.prepareBaccaratDraw();
  }
  chooseBaccaratSwap(index=null){
    if(this.paused||this.round?.phase!=='swapping'||index!==null&&(!Number.isInteger(index)||index<0||index>3))return false;
    if(index!==null){this.round.discard.push(this.round.initial[index]);this.round.initial[index]=this.baccaratShoe.cards[this.baccaratShoe.cursor++];}
    this.round.cards=baccaratInitial(this.round.initial);return this.prepareBaccaratDraw();
  }
  prepareBaccaratDraw(){
    this.round.final=completeBaccaratHand(this.round.initial,()=>this.baccaratShoe.cards[this.baccaratShoe.cursor++]);
    this.round.cards={player:[...this.round.final.player],banker:[...this.round.final.banker]};
    if(this.round.final.supplements.length)this.startBaccaratDraw();else{this.round.readyToSettle=true;this.settle();}return true;
  }
  startBaccaratDraw(){
    const r=this.round,side=r.final.supplements[r.drawShown].side;
    r.remaining=BACCARAT_DEAL_MS;
    if(r.bets['bac-'+side]||side==='banker'&&r.bets['bac-lucky-six']){r.squeeze={index:r.drawShown,side,progress:0};r.phase='delivering';}else r.phase='drawing';
  }
  revealBaccaratDraw(){
    if(this.paused||this.round?.phase!=='drawing')return false;
    return this.commitBaccaratDraw();
  }
  updateBaccaratSqueeze(progress){
    if(this.paused||this.round?.phase!=='squeezing'||!Number.isFinite(progress))return false;
    this.round.squeeze.progress=Math.max(this.round.squeeze.progress,Math.min(1,Math.max(0,progress)));return true;
  }
  finishBaccaratSqueeze(){
    if(this.paused||this.round?.phase!=='squeezing')return false;
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
    if(!this.profile||this.paused||!['lobby','table'].includes(this.screen)||this.profile.status!=='active')return false;
    if(!Number.isFinite(ms)||ms<=0)return false;
    let left=ms,changed=false;
    while(left>0){
      const timed=this.screen==='table'&&['betting','revealing','reroll','dealing','swapping','drawing','delivering','unfolding','returning'].includes(this.round?.phase);
      const step=timed?Math.min(left,this.round.remaining):left;
      this.profile.elapsedMs+=step;left-=step;
      if(!timed)break;
      this.round.remaining-=step;
      if(this.round.remaining<1e-7){
        const phase=this.round.phase;
        if(phase==='betting')this.lock();else if(phase==='revealing')this.reveal();else if(phase==='dealing')this.revealBaccaratCard();else if(phase==='swapping')this.chooseBaccaratSwap();else if(phase==='drawing')this.revealBaccaratDraw();else if(['delivering','unfolding','returning'].includes(phase))this.advanceBaccaratSqueeze();else this.chooseReroll();
        changed=true;
        if(this.profile.status!=='active')break;
      }
    }
    return changed;
  }
}
