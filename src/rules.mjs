export const GOAL = 2_500_000_000; // cents; $25,000,000
const CHIP_DENOMINATIONS = [1,5,10,25,100,500,1000,5000,10000,50000,100000,500000,1000000,5000000,10000000].map(dollars=>dollars*100);
export function getChipDenominations(bankCents) {
  if(!Number.isSafeInteger(bankCents)||bankCents<0)throw new Error('無效資金');
  const affordable=CHIP_DENOMINATIONS.filter(amount=>amount<=bankCents);
  return affordable.length>=5 ? affordable.slice(-5) : CHIP_DENOMINATIONS.slice(0,5);
}
export function chipLabel(cents) {
  if(cents>=1_000_000_000)return `$${cents/1_000_000_000}千萬`;
  if(cents>=1_000_000)return `$${cents/1_000_000}萬`;
  if(cents>=100_000)return `$${cents/100_000}千`;
  return money(cents);
}
export const ITEM_IDS = ['protect', 'peek', 'reroll', 'swap'];
export const ITEMS = {
  protect: { name: '保本券', icon: 'protect', description: '四桌共用。大小／百家樂／21點鎖注前，德州首次行動前使用；淨虧損退50%。' },
  peek: { name: '透視鏡', icon: 'peek', description: '大小看一骰高低；百家樂看莊或閒一張點數；21點查莊非Blackjack後看暗牌；德州行動時看一名對手一張隨機底牌。' },
  swap: { name: '換牌券', icon: 'swap', description: '百家樂鎖注前啟用；21點行動前選自己一張更換，分牌全局限一件；德州翻牌前首次行動前可換一張底牌。' },
  reroll: { name: '重擲券', icon: 'reroll', description: '持券且本局未用其他道具，開骰後有 10 秒選擇。重擲、接受或超時均扣券。' },
};
const make = (id, label, group, rate, values = []) => ({ id, label, group, rate, values });
export const BETS = [
  make('small', '小', '大小', 1), make('big', '大', '大小', 1),
  ...Array.from({length:6}, (_,i)=>make(`single-${i+1}`, `${i+1} 點`, '單點', '1–3', [i+1])),
  ...Array.from({length:6}, (_,i)=>make(`double-${i+1}`, `雙 ${i+1}`, '對子', 10, [i+1])),
  make('any-triple', '任意圍骰', '圍骰', 24),
  ...Array.from({length:6}, (_,i)=>make(`triple-${i+1}`, `圍 ${i+1}`, '圍骰', 150, [i+1])),
  ...[4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(n=>make(`total-${n}`, `${n}`, '總點數', ({4:50,5:18,6:14,7:12,8:8,9:6,10:6,11:6,12:6,13:8,14:12,15:14,16:18,17:50})[n], [n])),
  ...Array.from({length:6}, (_,i)=>Array.from({length:5-i}, (_,j)=>make(`pair-${i+1}-${i+j+2}`, `${i+1}＋${i+j+2}`, '兩骰組合', 5, [i+1,i+j+2]))).flat(),
];
export const BET_MAP = Object.fromEntries(BETS.map(b=>[b.id,b]));
export function netRate(id, dice) {
  const b = BET_MAP[id];
  if (!b || dice.length!==3 || dice.some(v=>!Number.isInteger(v)||v<1||v>6)) throw new Error('無效投注或骰子');
  const total = dice.reduce((a,b)=>a+b,0), triple=dice.every(v=>v===dice[0]);
  const count=dice.filter(v=>v===b.values[0]).length;
  if (id==='small') return !triple&&total>=4&&total<=10 ? 1 : -1;
  if (id==='big') return !triple&&total>=11&&total<=17 ? 1 : -1;
  if (id==='any-triple') return triple ? 24 : -1;
  if (b.group==='單點') return count ? count : -1;
  if (b.group==='對子') return count>=2 ? 10 : -1;
  if (b.group==='圍骰') return count===3 ? 150 : -1;
  if (b.group==='總點數') return total===b.values[0] ? b.rate : -1;
  return b.values.every(v=>dice.includes(v)) ? 5 : -1;
}
export function settleBets(bets, dice, protectedRound=false) {
  let stake=0, returned=0;
  const lines=Object.entries(bets).map(([id,amount])=>{
    if(!Number.isSafeInteger(amount)||amount<=0) throw new Error('無效下注金額');
    const rate=netRate(id,dice), payout=rate<0?0:amount*(rate+1);
    stake+=amount; returned+=payout;
    return {id,amount,rate,payout,net:payout-amount};
  });
  const refund=protectedRound&&returned<stake ? Math.floor((stake-returned)/2):0;
  return {stake,returned,refund,net:returned+refund-stake,lines};
}
export function randomDie() {
  const data=new Uint32Array(1);
  do { globalThis.crypto.getRandomValues(data); } while(data[0]>=4_294_967_292);
  return data[0]%6+1;
}
export const money=cents=>new Intl.NumberFormat('zh-HK',{style:'currency',currency:'USD',currencyDisplay:'narrowSymbol',minimumFractionDigits:cents%100?2:0,maximumFractionDigits:2}).format(cents/100);
export const duration=ms=>{const s=Math.floor(ms/1000);return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s/60%60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;};
