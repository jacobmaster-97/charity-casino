import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.mjs';
import {GAME_FEATURES} from '../src/rules.mjs';
import {validateSave} from '../src/storage.mjs';

function setup(features=GAME_FEATURES){const g=new Game({challenge:true,features,roll:()=>2,randomIndex:()=>0});g.start('保留庫存');g.profile.inventory={protect:2,peek:2,reroll:2,swap:2};return g;}
test('temporary switches reject purchases and all five direct item APIs without spending assets',()=>{
 const g=setup(),inventory={...g.profile.inventory},bank=g.profile.bank;assert.equal(g.shop(),false);assert.equal(g.buy('protect'),false);assert.equal(g.screen,'lobby');
 const methods={sicbo:g=>g.useItem('protect'),baccarat:g=>g.useBaccaratItem('protect'),blackjack:g=>g.useBlackjackItem('protect'),poker:g=>g.usePokerItem('protect'),roulette:g=>g.useRouletteItem('protect')};
 for(const [table,use] of Object.entries(methods)){
  const round=setup();round.enterTable(table);const before=JSON.stringify(round);assert.equal(round.useItem('protect'),false,table);assert.equal(use(round),false,table);assert.equal(JSON.stringify(round),before,table);
 }
 assert.deepEqual(g.profile.inventory,inventory);assert.equal(g.profile.bank,bank);
});
test('stored reroll coupons stay dormant, settle once and survive schema-2 restore intact',()=>{
 const g=setup();g.enterTable('sicbo');g.addBet('small',500);g.lock();g.tick(900);assert.equal(g.round.phase,'settled');assert.equal(g.round.used,null);assert.equal(g.profile.inventory.reroll,2);assert.equal(g.profile.rounds,1);
 const saved=validateSave(g.checkpoint),before=JSON.stringify(saved);assert.ok(!before.includes('features'));
 const restored=setup();restored.restore(saved);assert.equal(restored.features.items,false);assert.deepEqual(restored.profile.inventory,{protect:2,peek:2,reroll:2,swap:2});assert.equal(JSON.stringify(saved),before);
 restored.enterTable('sicbo');assert.equal(restored.useItem('peek',0),false);assert.equal(restored.profile.inventory.peek,2);
});
test('future explicit re-enable restores existing shop and coupon behavior without a save migration',()=>{
 const g=setup({shop:true,items:true});assert.equal(g.shop(),true);assert.equal(g.buy('protect'),1000);assert.equal(g.profile.inventory.protect,3);g.screen='lobby';g.enterTable('sicbo');g.addBet('small',500);assert.equal(g.useItem('protect'),true);assert.equal(g.profile.inventory.protect,2);g.lock();g.tick(900);assert.equal(g.profile.rounds,1);assert.equal(g.round.used,'protect');
});
