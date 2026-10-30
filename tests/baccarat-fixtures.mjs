import assert from 'node:assert/strict';
// Drive explicit player decisions in rules simulations; never auto-reveal in production.
export function runBaccaratToSettlement(game){
 for(let i=0;i<20&&game.round.phase!=='settled';i++){
   if(game.round.phase==='squeezing')game.finishBaccaratSqueeze();
   else if(game.round.phase==='swapping')game.chooseBaccaratSwap();
   else game.tick(game.round.remaining);
 }
 assert.equal(game.round.phase,'settled');
}
