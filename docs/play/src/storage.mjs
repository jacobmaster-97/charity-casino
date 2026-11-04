import {CHALLENGE_MS,CHALLENGE_RULESET,CHALLENGE_TABLES} from './challenge.mjs?v=0.10.0';
import {cashParse,cashEncode,cashAdd,cashSub} from './cash.mjs?v=0.10.0';
import {validatePokerTable} from './poker.mjs?v=0.10.0';
import {validateBlackjackShoe} from './blackjack.mjs?v=0.10.0';
import {validateBaccaratShoe} from './baccarat.mjs?v=0.10.0';
import {GOAL,ITEM_IDS} from './rules.mjs?v=0.10.0';
const PREFIX='charity-casino-prototype-v1';
export function validateSave(input){
  if(input?.schema===2)return validateChallengeSave(input);
  if(!input||input.schema!==1||input.game!=='charity-casino')throw new Error('不支援的存檔格式');
  const p=input.profile;
  if(!p||typeof p.name!=='string'||!p.name.trim()||[...p.name].length>16||!['race','free'].includes(p.mode))throw new Error('存檔玩家資料無效');
  if(!Number.isSafeInteger(p.bank)||p.bank<0||p.bank>1e12||!Number.isFinite(p.elapsedMs)||p.elapsedMs<0||p.elapsedMs>315576000000||!Number.isSafeInteger(p.rounds)||p.rounds<1||p.rounds>1e8)throw new Error('存檔金額或時間無效');
  if(!p.inventory||ITEM_IDS.some(id=>{const value=id==='swap'&&p.inventory[id]===undefined?0:p.inventory[id];return !Number.isSafeInteger(value)||value<0||value>100000;}))throw new Error('存檔道具資料無效');
  if(p.status!==(p.bank>=GOAL?'won':p.bank===0?'lost':'active'))throw new Error('存檔狀態不一致');
  return {schema:1,game:'charity-casino',profile:{name:p.name.trim(),mode:p.mode,bank:p.bank,elapsedMs:p.elapsedMs,inventory:Object.fromEntries(ITEM_IDS.map(id=>[id,p.inventory[id]??0])),rounds:p.rounds,status:p.status},...(input.baccaratShoe===undefined?{}:{baccaratShoe:validateBaccaratShoe(input.baccaratShoe)}),...(input.blackjackShoe===undefined?{}:{blackjackShoe:validateBlackjackShoe(input.blackjackShoe)}),...(input.pokerTable===undefined?{}:{pokerTable:validatePokerTable(input.pokerTable)})};
}
export class Saves{
  constructor(storage,{challenge=false}={}){this.storage=storage;this.challenge=challenge;}
  key(mode,slot='auto'){if(!['race','free'].includes(mode)||!['auto','manual'].includes(slot)||(mode==='race'&&slot==='manual'))throw new Error('無效存檔欄位');return `${this.challenge?'charity-casino-five-minute-v2':PREFIX}-${mode}-${slot}`;}
  read(mode,slot='auto'){const raw=this.storage.getItem(this.key(mode,slot));const clean=raw?validateSave(JSON.parse(raw)):null;if(clean&&this.challenge&&clean.schema!==2)throw new Error('這是舊版存檔');return clean;}
  readLegacy(mode,slot='auto'){return new Saves(this.storage).read(mode,slot);}
  write(save,slot='auto'){
    const clean=validateSave(save);if(this.challenge!==(clean.schema===2))throw new Error('新舊版存檔必須分開保存');const key=this.key(clean.profile.mode,slot),previous=this.storage.getItem(key);
    if(previous)this.storage.setItem(`${key}-backup`,previous);
    this.storage.setItem(key,JSON.stringify(cashEncode(clean)));return clean;
  }
}

export function validateChallengeSave(input){
 if(input.game!=='charity-casino'||!input.profile)throw new Error('不支援的挑戰存檔');
 const p=input.profile;
 if(p.ruleset!==CHALLENGE_RULESET||typeof p.name!=='string'||!p.name.trim()||[...p.name.trim()].length>16||!['race','free'].includes(p.mode))throw new Error('挑戰玩家資料無效');
 if(!Number.isFinite(p.elapsedMs)||p.elapsedMs<0||p.elapsedMs>CHALLENGE_MS||!Number.isSafeInteger(p.rounds)||p.rounds<0||p.rounds>1e8)throw new Error('挑戰時間或局數無效');
 const bank=cashParse(p.bank),itemsSpent=cashParse(p.itemsSpent);if(bank<0||itemsSpent<0)throw new Error('挑戰資金無效');
 if(!['active','finished'].includes(p.status)||p.status==='active'&&(p.endReason!==null||p.elapsedMs>=CHALLENGE_MS||bank===0)||p.status==='finished'&&!(p.endReason==='bust'&&bank===0||p.endReason==='timeout'&&p.elapsedMs===CHALLENGE_MS))throw new Error('挑戰狀態不一致');
 const stats={};let rounds=0,net=0;
 for(const id of Object.keys(CHALLENGE_TABLES)){const stat=p.stats?.[id];if(!stat||!Number.isSafeInteger(stat.rounds)||stat.rounds<0||stat.rounds>1e8)throw new Error('各桌統計無效');const amount=cashParse(stat.net);if(stat.rounds===0&&amount!==0)throw new Error('未遊玩桌不能有損益');stats[id]={rounds:stat.rounds,net:amount};rounds+=stat.rounds;net=cashAdd(net,amount);}
 if(rounds!==p.rounds||cashSub(cashAdd(10000,net),itemsSpent)!==bank)throw new Error('挑戰資金與統計不一致');
 if(!p.inventory||ITEM_IDS.some(id=>!Number.isSafeInteger(p.inventory[id])||p.inventory[id]<0||p.inventory[id]>100000))throw new Error('道具資料無效');
 let pokerTable;if(input.pokerTable!==undefined){const t=input.pokerTable;if(!Array.isArray(t?.seats))throw new Error('德州桌資料無效');pokerTable=validatePokerTable({...t,seats:t.seats.map(seat=>({...seat,stack:cashParse(seat.stack)}))},{extended:true});}
 return {schema:2,game:'charity-casino',profile:{name:p.name.trim(),mode:p.mode,ruleset:p.ruleset,bank,elapsedMs:p.elapsedMs,rounds:p.rounds,status:p.status,endReason:p.endReason,itemsSpent,stats,inventory:Object.fromEntries(ITEM_IDS.map(id=>[id,p.inventory[id]]))},...(input.baccaratShoe===undefined?{}:{baccaratShoe:validateBaccaratShoe(input.baccaratShoe)}),...(input.blackjackShoe===undefined?{}:{blackjackShoe:validateBlackjackShoe(input.blackjackShoe)}),...(pokerTable?{pokerTable}:{})};
}
