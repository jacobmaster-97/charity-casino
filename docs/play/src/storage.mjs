import {validateBlackjackShoe} from './blackjack.mjs?v=0.2.0';
import {validateBaccaratShoe} from './baccarat.mjs?v=0.2.0';
import {GOAL,ITEM_IDS} from './rules.mjs?v=0.2.0';
const PREFIX='charity-casino-prototype-v1';
export function validateSave(input){
  if(!input||input.schema!==1||input.game!=='charity-casino')throw new Error('不支援的存檔格式');
  const p=input.profile;
  if(!p||typeof p.name!=='string'||!p.name.trim()||[...p.name].length>16||!['race','free'].includes(p.mode))throw new Error('存檔玩家資料無效');
  if(!Number.isSafeInteger(p.bank)||p.bank<0||p.bank>1e12||!Number.isFinite(p.elapsedMs)||p.elapsedMs<0||p.elapsedMs>315576000000||!Number.isSafeInteger(p.rounds)||p.rounds<1||p.rounds>1e8)throw new Error('存檔金額或時間無效');
  if(!p.inventory||ITEM_IDS.some(id=>{const value=id==='swap'&&p.inventory[id]===undefined?0:p.inventory[id];return !Number.isSafeInteger(value)||value<0||value>100000;}))throw new Error('存檔道具資料無效');
  if(p.status!==(p.bank>=GOAL?'won':p.bank===0?'lost':'active'))throw new Error('存檔狀態不一致');
  return {schema:1,game:'charity-casino',profile:{name:p.name.trim(),mode:p.mode,bank:p.bank,elapsedMs:p.elapsedMs,inventory:Object.fromEntries(ITEM_IDS.map(id=>[id,p.inventory[id]??0])),rounds:p.rounds,status:p.status},...(input.baccaratShoe===undefined?{}:{baccaratShoe:validateBaccaratShoe(input.baccaratShoe)}),...(input.blackjackShoe===undefined?{}:{blackjackShoe:validateBlackjackShoe(input.blackjackShoe)})};
}
export class Saves{
  constructor(storage){this.storage=storage;}
  key(mode,slot='auto'){if(!['race','free'].includes(mode)||!['auto','manual'].includes(slot)||(mode==='race'&&slot==='manual'))throw new Error('無效存檔欄位');return `${PREFIX}-${mode}-${slot}`;}
  read(mode,slot='auto'){const raw=this.storage.getItem(this.key(mode,slot));return raw?validateSave(JSON.parse(raw)):null;}
  write(save,slot='auto'){
    const clean=validateSave(save),key=this.key(clean.profile.mode,slot),previous=this.storage.getItem(key);
    if(previous)this.storage.setItem(`${key}-backup`,previous);
    this.storage.setItem(key,JSON.stringify(clean));return clean;
  }
}
