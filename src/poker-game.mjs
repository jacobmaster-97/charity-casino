import {makePokerDeck,pokerBlinds,pokerDifficulty,pokerOptions,pokerAI} from './poker.mjs?v=0.6.3';
// Methods run on the existing Game; it remains the only wallet, timer and checkpoint owner.
export const pokerMethods={
 newPokerRound(){
   if(!this.pokerTable)this.pokerTable={button:5,speed:'normal',nextId:6,seats:Array.from({length:5},(_,i)=>({id:i+1,style:i,stack:this.pokerBuyIn()}))};
   for(const seat of this.pokerTable.seats)if(seat.stack===0){seat.id=this.pokerTable.nextId++;seat.style=this.randomIndex(5);seat.stack=this.pokerBuyIn();}
   this.round={kind:'poker',phase:'poker-ready',bankAtStart:this.profile.bank,bets:{},remaining:0,used:null,peek:null,result:null,players:[{id:0,stack:this.profile.bank,style:0},...this.pokerTable.seats.map(s=>({...s}))].map(p=>({...p,cards:[],total:0,street:0,folded:false,hasActed:false,lastActedBet:0,lastAction:''})),button:(this.pokerTable.button+1)%6,blinds:pokerBlinds(this.profile.bank),difficulty:pokerDifficulty(this.profile.bank),actor:-1,turnId:0,streetIndex:0,currentBet:0,lastFullRaise:0,board:[],deck:[],cursor:0,burn:[],discard:[],playerHasActed:false,showdown:false,readyToSettle:false,motions:[],motionSeq:0,chipStacks:{},log:[]};return true;
 },
 pokerBuyIn(){return Math.max(1,Math.floor(this.profile.bank*(20+this.randomIndex(101))/100));},
 setPokerSpeed(speed){if(this.paused||this.screen!=='table'||this.activeTable!=='poker'||!['normal','fast'].includes(speed))return false;this.pokerTable.speed=speed;return true;},
 pokerDuration(type='card'){return this.pokerTable.speed==='fast'?(type==='ai'?300:type==='show'?600:180):(type==='ai'?1200:type==='show'?1600:450);},
 pokerMotion(from,to,amount){if(amount>0){const r=this.round;r.motions.push({seq:++r.motionSeq,from,to,amount});r.chipStacks[to]=[...(r.chipStacks[to]||[]),amount].slice(-24);if(r.motions.length>100)r.motions.shift();}},
 pokerLog(text){this.round.log.push(text);if(this.round.log.length>40)this.round.log.shift();},
 commitPoker(seat,amount){const r=this.round,p=r.players[seat];if(!Number.isSafeInteger(amount)||amount<0||amount>p.stack)throw new Error('無效德州扣款');p.stack-=amount;p.street+=amount;p.total+=amount;if(seat===0){this.profile.bank=p.stack;r.bets['poker-player']=p.total;}this.pokerMotion('poker-stack-'+seat,'poker-bet-'+seat,amount);},
 startPoker(){
   const r=this.round;if(this.paused||this.screen!=='table'||r?.kind!=='poker'||r.phase!=='poker-ready')return false;
   r.deck=makePokerDeck(this.randomIndex);this.pokerTable.button=r.button;const small=(r.button+1)%6,big=(r.button+2)%6;r.smallSeat=small;r.bigSeat=big;
   this.commitPoker(small,Math.min(r.blinds.small,r.players[small].stack));this.commitPoker(big,Math.min(r.blinds.big,r.players[big].stack));r.players[small].lastAction='小盲';r.players[big].lastAction='大盲';r.currentBet=r.blinds.big;r.lastFullRaise=r.blinds.big;
   const events=[];for(let pass=0;pass<2;pass++)for(let n=1;n<=6;n++)events.push({type:'hole',seat:(r.button+n)%6});this.queuePokerDeal(events,'preflop');return true;
 },
 queuePokerDeal(events,after,preserve=null){const r=this.round;r.phase='poker-dealing';r.actor=-1;r.queue=events;r.afterDeal=after;r.preserveActionMs=preserve;r.remaining=this.pokerDuration();r.lastDeal=null;},
 drawPoker(){const r=this.round;if(r.cursor>=52)throw new Error('德州牌堆耗盡');return r.deck[r.cursor++];},
 advancePokerDeal(){
   const r=this.round;if(this.paused||r?.phase!=='poker-dealing')return false;
   if(r.queue.length){const e=r.queue.shift();if(e.type==='burn')r.burn.push(this.drawPoker());else if(e.type==='board'){r.board.push(this.drawPoker());r.lastDeal={side:'board',index:r.board.length-1};}else if(e.type==='swap'){const index=r.cursor+this.randomIndex(52-r.cursor);[r.deck[r.cursor],r.deck[index]]=[r.deck[index],r.deck[r.cursor]];r.discard.push(r.players[0].cards[e.index]);r.players[0].cards[e.index]=this.drawPoker();r.lastDeal={side:'player',index:e.index};}else{const p=r.players[e.seat];p.cards.push(this.drawPoker());r.lastDeal={side:e.seat===0?'player':'opponent',seat:e.seat,index:p.cards.length-1};}if(e.type!=='burn')this.cue('card');r.remaining=this.pokerDuration();return true;}
   r.lastDeal=null;if(r.afterDeal==='swap'){const remaining=r.preserveActionMs;r.preserveActionMs=null;this.enterPokerTurn(0,remaining);if(remaining<=0)this.pokerTimeout();}
   else this.continuePoker(r.afterDeal==='preflop'?r.bigSeat:r.button);return true;
 },
 enterPokerTurn(seat,remaining=30000){const r=this.round;r.actor=seat;r.turnId++;r.phase=seat===0?'poker-player':'poker-ai';r.remaining=seat===0?remaining:this.pokerDuration('ai');},
 continuePoker(after){
   const r=this.round,alive=r.players.map((p,i)=>p.folded?-1:i).filter(i=>i>=0),acting=alive.filter(i=>r.players[i].stack>0);
   if(alive.length===1){this.finishPoker(false);return;}
   if(acting.length===1){const i=acting[0],other=Math.max(...alive.filter(j=>j!==i).map(j=>r.players[j].street));if(r.players[i].street<other){r.currentBet=other;this.enterPokerTurn(i);return;}this.nextPokerStreet();return;}
   if(!acting.length){this.nextPokerStreet();return;}
   for(let n=1;n<=6;n++){const i=(after+n)%6,p=r.players[i];if(!p.folded&&p.stack>0&&(!p.hasActed||p.street<r.currentBet)){this.enterPokerTurn(i);return;}}
   this.nextPokerStreet();
 },
 collectPokerStreet(){const r=this.round;for(let i=0;i<6;i++){this.pokerMotion('poker-bet-'+i,'poker-pot',r.players[i].street);r.players[i].street=0;r.chipStacks['poker-bet-'+i]=[];}},
 queuePokerCollect(after){const r=this.round;r.afterCollect=after;r.phase='poker-collect';r.actor=-1;r.remaining=600;},
 advancePokerCollect(){const r=this.round;if(this.paused||r?.phase!=='poker-collect')return false;if(r.afterCollect==='street')this.nextPokerStreet();else this.finishPoker(r.afterCollect==='showdown');return true;},
 nextPokerStreet(){
   const r=this.round;if(r.phase!=='poker-collect'){this.queuePokerCollect('street');return;}this.collectPokerStreet();if(r.streetIndex===3){this.finishPoker(true);return;}
   r.streetIndex++;r.currentBet=0;r.lastFullRaise=r.blinds.big;for(const p of r.players){p.hasActed=false;p.lastActedBet=0;}
   const events=[{type:'burn'},...Array.from({length:r.streetIndex===1?3:1},()=>({type:'board'}))];this.queuePokerDeal(events,'street');
 },
 pokerAction(action,to=null,expectedTurn=null,seat=0){
   const r=this.round;if(this.paused||this.screen!=='table'||r?.kind!=='poker')return false;if(expectedTurn!==null&&expectedTurn!==r?.turnId||seat!==r?.actor||seat===0&&r?.phase!=='poker-player'||seat!==0&&r?.phase!=='poker-ai')return false;
   const o=pokerOptions(this,seat),p=r.players[seat];if(!o.turn||!['fold','check','call','raise','all-in'].includes(action))return false;
   if(action==='check'&&!o.check||action==='call'&&o.owed===0||action==='all-in'&&!o.allIn)return false;
   if(action==='all-in'){if(o.maxTo<=r.currentBet)action='call';else{action='raise';to=o.maxTo;}}
   if(action==='raise'&&(!o.raise||!Number.isSafeInteger(to)||to<=r.currentBet||to>o.maxTo||to<o.minTo&&to!==o.maxTo))return false;
   if(action==='fold'){p.folded=true;p.lastAction='棄牌';}else if(action==='check')p.lastAction='過牌';else if(action==='call'){this.commitPoker(seat,o.call);p.lastAction=p.stack?'跟注':'全押跟注';}else{const increment=to-r.currentBet;this.commitPoker(seat,to-p.street);r.currentBet=to;if(increment>=r.lastFullRaise)r.lastFullRaise=increment;p.lastAction=p.stack?'加注':'全押';}
   p.hasActed=true;p.lastActedBet=r.currentBet;if(seat===0)r.playerHasActed=true;
   this.pokerLog(`${seat===0?'你':'座位'+seat}：${p.lastAction}${action==='raise'?' 至 '+to/100:action==='call'?' '+o.call/100:''}`);this.continuePoker(seat);return true;
 },
 pokerTimeout(){const r=this.round;if(this.paused||r?.phase!=='poker-player')return false;return this.pokerAction(pokerOptions(this).check?'check':'fold',null,r.turnId);},
 actPokerAI(){const r=this.round;if(this.paused||r?.phase!=='poker-ai')return false;const seat=r.actor,p=r.players[seat],options=pokerOptions(this,seat),decision=pokerAI({cards:p.cards,board:r.board,options,pot:r.players.reduce((n,q)=>n+q.total,0),big:r.blinds.big,style:p.style,difficulty:r.difficulty,randomIndex:this.randomIndex});return this.pokerAction(decision.action,decision.to??null,r.turnId,seat);},
 usePokerItem(id,index=0,expectedTurn=null){
   const r=this.round;if(expectedTurn!==null&&expectedTurn!==r?.turnId)return false;const o=pokerOptions(this);if(!['protect','peek','swap'].includes(id)||!o[id])return false;
   if(id==='swap'&&(!Number.isInteger(index)||index<0||index>1)||id==='peek'&&(!Number.isInteger(index)||index<1||index>5||r.players[index].folded))return false;
   this.profile.inventory[id]--;r.used=id;if(id==='peek'){const cardIndex=this.randomIndex(2);r.peek={seat:index,index:cardIndex,card:r.players[index].cards[cardIndex]};}
   if(id==='swap')this.queuePokerDeal([{type:'swap',index}],'swap',r.remaining);return true;
 },
 finishPoker(showdown){const r=this.round;if(r.phase!=='poker-collect'&&r.players.some(p=>p.street>0)){this.queuePokerCollect(showdown?'showdown':'foldwin');return;}this.collectPokerStreet();r.showdown=showdown;r.actor=-1;r.phase='poker-showdown';r.remaining=this.pokerDuration('show');},
 completePoker(){if(this.paused||this.round?.phase!=='poker-showdown')return false;this.round.readyToSettle=true;return this.settle();},
 finalizePokerStacks(result){const r=this.round;for(let i=0;i<6;i++){const amount=result.payouts[i];this.pokerMotion('poker-pot','poker-stack-'+i,amount);if(i===0)r.players[i].stack=this.profile.bank;else{r.players[i].stack+=amount;this.pokerTable.seats[i-1].stack=r.players[i].stack;}}}
};
