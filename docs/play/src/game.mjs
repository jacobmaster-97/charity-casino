import {GOAL, BET_MAP, ITEM_IDS, settleBets, randomDie} from './rules.mjs';
export class Game {
  constructor({roll=randomDie,onComplete=()=>{}}={}) { this.roll=roll;this.onComplete=onComplete;this.screen='home';this.profile=null;this.round=null;this.paused=false;this.checkpoint=null; }
  start(name,mode='race') {
    if(!name.trim()||[...name.trim()].length>16||!['race','free'].includes(mode))throw new Error('請輸入 1–16 字姓名');
    this.profile={name:name.trim(),mode,bank:10000,elapsedMs:0,inventory:{protect:0,peek:0,reroll:0},rounds:0,status:'active'};
    this.screen='lobby';this.round=null;this.paused=false;this.checkpoint=null;
  }
  restore(save) {this.profile=structuredClone(save.profile);this.checkpoint=structuredClone(save);this.round=null;this.screen='lobby';this.paused=false;}
  get stake(){return this.round?Object.values(this.round.bets).reduce((a,b)=>a+b,0):0;}
  get available(){return this.profile.bank-(this.round?.phase==='betting'?this.stake:0);}
  get canBet(){return this.screen==='table'&&this.round?.phase==='betting'&&!this.paused;}
  enterTable(){if(this.paused||this.screen!=='lobby'||this.profile.status!=='active')return false;this.screen='table';return this.newRound();}
  newRound(){
    if(this.paused||this.profile?.status!=='active'||(this.round&&this.round.phase!=='settled'))return false;
    this.round={phase:'betting',dice:[this.roll(),this.roll(),this.roll()],bets:{},remaining:30000,used:null,peek:null,result:null};return true;
  }
  addBet(id,amount){
    if(!this.canBet||!BET_MAP[id]||!Number.isSafeInteger(amount)||amount<=0||amount>this.available)return false;
    if(amount<100&&!(this.profile.bank<100&&this.stake===0&&amount===this.profile.bank))return false;
    this.round.bets[id]=(this.round.bets[id]||0)+amount;return true;
  }
  clearBets(){if(!this.canBet)return false;this.round.bets={};return true;}
  undoBet(id){if(!this.canBet||!this.round.bets[id])return false;delete this.round.bets[id];return true;}
  useItem(id,index=0){
    if(!this.canBet||this.round.used||!['protect','peek'].includes(id)||this.profile.inventory[id]<1||!Number.isInteger(index)||index<0||index>2)return false;
    this.profile.inventory[id]--;this.round.used=id;
    if(id==='peek')this.round.peek={index,range:this.round.dice[index]<=3?'低點 1–3':'高點 4–6'};
    return true;
  }
  lock(){
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
    if(!['revealing','reroll'].includes(this.round?.phase))return false;
    const result=settleBets(this.round.bets,this.round.dice,this.round.used==='protect');
    this.profile.bank+=result.returned+result.refund;this.profile.rounds++;
    this.profile.status=this.profile.bank>=GOAL?'won':this.profile.bank===0?'lost':'active';
    this.round.phase='settled';this.round.remaining=0;this.round.result=result;
    this.checkpoint={schema:1,game:'charity-casino',profile:structuredClone(this.profile)};
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
  tick(ms){
    if(!this.profile||this.paused||!['lobby','table'].includes(this.screen)||this.profile.status!=='active')return false;
    if(!Number.isFinite(ms)||ms<=0)return false;
    let left=ms,changed=false;
    while(left>0){
      const timed=this.screen==='table'&&['betting','revealing','reroll'].includes(this.round?.phase);
      const step=timed?Math.min(left,this.round.remaining):left;
      this.profile.elapsedMs+=step;left-=step;
      if(!timed)break;
      this.round.remaining-=step;
      if(this.round.remaining<=0){
        const phase=this.round.phase;
        if(phase==='betting')this.lock();else if(phase==='revealing')this.reveal();else this.chooseReroll();
        changed=true;
        if(this.profile.status!=='active')break;
      }
    }
    return changed;
  }
}
