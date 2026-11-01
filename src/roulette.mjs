import {randomBelow} from './baccarat.mjs?v=0.6.1';
export const ROULETTE_ENABLED=true;
export const ROULETTE_SPIN_MS=4800;
export const ROULETTE_POCKETS=['0','00',...Array.from({length:36},(_,i)=>String(i+1))];
export const ROULETTE_WHEEL=['0','28','9','26','30','11','7','20','32','17','5','22','34','15','3','24','36','13','1','00','27','10','25','29','12','8','19','31','18','6','21','33','16','4','23','35','14','2'];
export const ROULETTE_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
export function rouletteColor(pocket){if(!ROULETTE_POCKETS.includes(pocket))throw new Error('無效輪盤號碼');return pocket==='0'||pocket==='00'?'green':ROULETTE_RED.has(Number(pocket))?'red':'black';}
const rouletteBet=(id,label,group,rate,pockets)=>({id,label,group,rate,pockets});
export const ROULETTE_BETS=[
 ...ROULETTE_POCKETS.map(n=>rouletteBet('rou-number-'+n,n,'單號',35,[n])),
 ...Array.from({length:3},(_,i)=>rouletteBet('rou-dozen-'+(i+1),['1–12','13–24','25–36'][i],'十二數組',2,Array.from({length:12},(_,j)=>String(i*12+j+1)))),
 ...Array.from({length:3},(_,i)=>rouletteBet('rou-column-'+(i+1),'第'+(i+1)+'列','直列',2,Array.from({length:12},(_,j)=>String(j*3+i+1)))),
 ...[['red','紅',n=>ROULETTE_RED.has(n)],['black','黑',n=>!ROULETTE_RED.has(n)],['odd','單',n=>n%2===1],['even','雙',n=>n%2===0],['low','1–18',n=>n<=18],['high','19–36',n=>n>=19]].map(([id,label,accept])=>rouletteBet('rou-'+id,label,'外圍',1,Array.from({length:36},(_,i)=>i+1).filter(accept).map(String)))
];
export const ROULETTE_BET_MAP=Object.fromEntries(ROULETTE_BETS.map(b=>[b.id,b]));
export function drawRoulette(randomIndex=randomBelow){const i=randomIndex(38);if(!Number.isInteger(i)||i<0||i>=38)throw new Error('無效輪盤亂數來源');return ROULETTE_POCKETS[i];}
export function rouletteExclusions(outcome,randomIndex=randomBelow){
 if(!ROULETTE_POCKETS.includes(outcome))throw new Error('無效輪盤號碼');const remaining=ROULETTE_POCKETS.filter(n=>n!==outcome);
 for(let i=0;i<5;i++){const pick=randomIndex(remaining.length-i);if(!Number.isInteger(pick)||pick<0||pick>=remaining.length-i)throw new Error('無效透視亂數來源');const j=i+pick;[remaining[i],remaining[j]]=[remaining[j],remaining[i]];}return remaining.slice(0,5);
}
export function settleRouletteRound(bets,outcome,protectedRound=false){
 if(!ROULETTE_POCKETS.includes(outcome))throw new Error('無效輪盤號碼');let stake=0,returned=0;
 const lines=Object.entries(bets).map(([id,amount])=>{const b=ROULETTE_BET_MAP[id];if(!b||!Number.isSafeInteger(amount)||amount<=0)throw new Error('無效輪盤投注');const win=b.pockets.includes(outcome),rate=win?b.rate:-1,payout=win?amount*(b.rate+1):0;stake+=amount;returned+=payout;return {id,amount,rate,payout,net:payout-amount};});
 const refund=protectedRound&&returned<stake?Math.floor((stake-returned)/2):0;return {stake,returned,refund,net:returned+refund-stake,lines,outcome};
}
const rouletteModulo=n=>(n%360+360)%360;
export function rouletteSpin(outcome,previous=null){
 const index=ROULETTE_WHEEL.indexOf(outcome);if(index<0)throw new Error('無效輪盤號碼');const wheelFrom=previous?.wheelTo||0,ballFrom=previous?.ballTo||0,wheelTo=wheelFrom+1440+37,target=rouletteModulo(wheelTo+index*360/38),ballTo=ballFrom-2160-rouletteModulo(ballFrom-target);return {wheelFrom,wheelTo,ballFrom,ballTo,duration:ROULETTE_SPIN_MS};
}
export function rouletteCells(portrait=false){
 const cells=[],put=(id,x,y,w,h)=>cells.push({id,x,y,w,h,anchor:{x:x+w*.75,y:y+h*.42},chipSize:Math.min(w*.37,h*.60)});
 if(portrait){
   put('rou-number-0',100,20,159,56);put('rou-number-00',259,20,159,56);
   for(let n=1;n<=36;n++)put('rou-number-'+n,100+(n-1)%3*106,76+Math.floor((n-1)/3)*48,106,48);
   for(let i=0;i<3;i++){put('rou-dozen-'+(i+1),20,76+i*192,80,192);put('rou-column-'+(i+1),100+i*106,652,106,56);}
   ['low','even','red','black','odd','high'].forEach((id,i)=>put('rou-'+id,418,76+i*96,122,96));
 }else{
   put('rou-number-00',20,20,70,129);put('rou-number-0',20,149,70,129);
   for(let n=1;n<=36;n++)put('rou-number-'+n,90+Math.floor((n-1)/3)*85,20+(2-(n-1)%3)*86,85,86);
   for(let i=0;i<3;i++){put('rou-dozen-'+(i+1),90+i*340,278,340,66);put('rou-column-'+(i+1),1110,20+(2-i)*86,70,86);}
   ['low','even','red','black','odd','high'].forEach((id,i)=>put('rou-'+id,90+i*170,344,170,66));
 }
 return {width:portrait?560:1200,height:portrait?728:430,cells};
}
