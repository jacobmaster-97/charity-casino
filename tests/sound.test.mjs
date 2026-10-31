import test from 'node:test';
import assert from 'node:assert/strict';
import {CasinoSound,SOUND_SPECS,SOUND_PREF_KEY,makeSoundSamples} from '../src/sound.mjs';
import {Game} from '../src/game.mjs';
import {baccaratInitial} from '../src/baccarat.mjs';
import {BLACKJACK_DEAL_MS} from '../src/blackjack.mjs';
import {ChipFlights} from '../src/board.mjs';
class FakeContext{
 constructor(){this.sampleRate=8000;this.currentTime=10;this.state='suspended';this.destination={};this.sources=[];this.primers=[];this.resumes=0;this.listener=null;}
 createGain(){const gain={value:1,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}};return {gain,connect(){},disconnect(){}};}
 createBuffer(channels,length,rate){const pcm=new Float32Array(length);return {duration:length/rate,getChannelData:()=>pcm};}
 createBufferSource(){const source={connect(){},disconnect(){this.disconnected=true;},start:(when,offset)=>{source.started={when,offset};if(source.buffer.duration<=1/this.sampleRate){this.sources.splice(this.sources.indexOf(source),1);this.primers.push(source);}},stop(when){this.stopped=when;}};this.sources.push(source);return source;}
 resume(){this.resumes++;if(this.rejectOnce){this.rejectOnce=false;return Promise.reject(new Error('blocked'));}this.state='running';return Promise.resolve();}
 addEventListener(name,fn){this.listener=fn;}
}
const visualGame=(kind='roulette',phase='rou-spinning',remaining=3600)=>({screen:'table',paused:false,round:{kind,phase,remaining,spin:{}}});
async function player(game=visualGame()){const c=new FakeContext(),sound=new CasinoSound({createContext:()=>c});sound.sync(game);await sound.unlock();return {sound,c,game};}
test('five original PCM sounds have exact lengths, nonzero content, soft endpoints and bounded finite peaks',()=>{
 assert.equal(Object.keys(SOUND_SPECS).length,5);for(const [name,spec] of Object.entries(SOUND_SPECS)){for(const rate of [8000,44100]){const pcm=makeSoundSamples(name,rate);assert.equal(pcm.length,Math.ceil(spec.seconds*rate));assert.ok(pcm[0]===0&&pcm.at(-1)===0);let peak=0,energy=0;for(const n of pcm){assert.ok(Number.isFinite(n));peak=Math.max(peak,Math.abs(n));energy+=n*n;}assert.ok(peak<=.340001&&peak>=.33999);assert.ok(energy>1);}}
});
test('sound generation is reproducible and does not consume gameplay or global random state',()=>{
 const old=Math.random;Math.random=()=>{throw new Error('global RNG used');};try{assert.deepEqual(makeSoundSamples('chip',8000),makeSoundSamples('chip',8000));assert.throws(()=>makeSoundSamples('unknown'));assert.throws(()=>makeSoundSamples('card',100));}finally{Math.random=old;}
});
test('context is lazy and early blocked one-shots are dropped rather than queued for later',async()=>{
 let created=0;const c=new FakeContext(),s=new CasinoSound({createContext:()=>{created++;return c;}});s.sync(visualGame('baccarat','betting',30000));assert.equal(created,0);assert.equal(s.play('card'),false);assert.equal(c.sources.length,0);await s.unlock();assert.equal(created,1);assert.equal(c.sources.length,0);assert.equal(s.play('card'),true);assert.equal(c.sources.length,1);assert.equal(s.context,c);await s.unlock();assert.equal(created,1);
});
test('mute preference has a separate key, stops all voices, survives reload and never writes game saves',async()=>{
 const data=new Map(),writes=[],storage={getItem:k=>data.get(k),setItem:(k,v)=>{writes.push(k);data.set(k,v);}},c=new FakeContext(),s=new CasinoSound({storage,createContext:()=>c}),g=visualGame();const before=JSON.stringify(g);s.sync(g);await s.unlock();assert.equal(s.voices.size,1);s.setMuted(true);assert.equal(s.enabled,false);assert.equal(s.master.gain.value,0);assert.equal(s.voices.size,0);assert.ok(c.sources[0].stopped);assert.deepEqual(writes,[SOUND_PREF_KEY]);const restored=new CasinoSound({storage,createContext:()=>{throw new Error('should remain lazy');}});assert.equal(restored.enabled,false);assert.equal(await restored.unlock(),false);assert.equal(JSON.stringify(g),before);s.setMuted(false);assert.equal(s.enabled,true);assert.equal(s.voices.size,1);assert.ok(Math.abs(c.sources.at(-1).started.offset-1.2)<1e-8);
});
test('rapid identical cues are coalesced and concurrent voices stay bounded without stopping the wheel',async()=>{
 const {sound:s,c}=await player();assert.ok(s.play('chip'));assert.equal(s.play('chip'),false);for(let i=0;i<15;i++){c.currentTime+=.04;s.play(i%2?'card':'chip');assert.ok(s.voices.size<=4);}assert.ok(s.loop);assert.equal(s.loop.voice.stopped,false);assert.equal(s.play('unknown'),false);
});
test('repeated renders and board reflows do not restart a running wheel sound',async()=>{
 const {sound:s,c,game:g}=await player();assert.equal(c.sources.length,1);for(let i=0;i<20;i++){g.round.remaining-=1;s.sync(g);}assert.equal(c.sources.length,1);assert.ok(Math.abs(c.sources[0].started.offset-1.2)<1e-8);
});
test('pause silences voices immediately and resume uses the model remaining seconds for wheel and dice',async()=>{
 for(const [kind,phase,remaining,offset] of [['roulette','rou-spinning',3600,1.2],['sicbo','revealing',500,.4]]){const g=visualGame(kind,phase,remaining),{sound:s,c}=await player(g);assert.ok(Math.abs(c.sources[0].started.offset-offset)<1e-8);s.play('chip');g.paused=true;s.sync(g);assert.equal(s.voices.size,0);assert.equal(s.play('card'),false);const count=c.sources.length;s.sync(g);assert.equal(c.sources.length,count);g.paused=false;s.sync(g);assert.ok(Math.abs(c.sources.at(-1).started.offset-offset)<1e-8);assert.equal(g.round.remaining,remaining);assert.equal(s.voices.size,1);}
});
test('loop stops on phase completion, reroll starts a distinct wheel and one-shot opening is allowed on final loss',async()=>{
 const {sound:s,c,game:g}=await player();g.round.phase='rou-reroll';s.sync(g);assert.equal(s.voices.size,0);g.round.phase='rou-spinning';g.round.spin={};g.round.remaining=4800;s.sync(g);assert.equal(c.sources.at(-1).started.offset,0);assert.equal(c.sources.length,2);g.round.phase='settled';g.profile={status:'lost'};s.sync(g);assert.equal(s.voices.size,0);assert.equal(s.play('dice-open'),true);
});
test('background pause, shop, lobby and home stop sounds without replaying stale cards on return',async()=>{
 const {sound:s,c,game:g}=await player(visualGame('baccarat','dealing',500));s.play('card');g.paused=true;s.sync(g);assert.equal(s.voices.size,0);g.paused=false;s.sync(g);const after=c.sources.length;assert.equal(c.sources.length,after);for(const screen of ['shop','lobby','home']){s.play('chip');g.screen=screen;s.sync(g);assert.equal(s.voices.size,0);}g.screen='table';s.sync(g);assert.equal(c.sources.length,after+1);
});
test('interrupted AudioContext stops voices and a later running context resumes only current animation',async()=>{
 const {sound:s,c,game:g}=await player();c.state='interrupted';c.listener();assert.equal(s.voices.size,0);assert.ok(c.sources[0].disconnected);assert.equal(s.play('card'),false);g.round.remaining=1200;c.state='running';c.listener();assert.ok(Math.abs(c.sources.at(-1).started.offset-3.6)<1e-8);assert.equal(s.voices.size,1);
});
test('a rejected older resume cannot clear a newer pending gesture attempt',async()=>{
 const c=new FakeContext();let finish;c.resume=function(){this.resumes++;if(this.resumes===1)return Promise.reject(new Error('blocked'));return new Promise(resolve=>{finish=()=>{this.state='running';resolve();};});};const s=new CasinoSound({createContext:()=>c});s.sync(visualGame());const a=s.unlock(),b=s.unlock();assert.notEqual(a,b);assert.equal(await a,false);assert.equal(s.pending,b);assert.equal(c.resumes,2);finish();assert.equal(await b,true);assert.equal(s.pending,null);assert.equal(s.voices.size,1);
});
test('Safari can retry resume on touchend even when the first gesture promise never settles',async()=>{
 const c=new FakeContext();c.resume=function(){this.resumes++;if(this.resumes===1)return new Promise(()=>{});this.state='running';return Promise.resolve();};const s=new CasinoSound({createContext:()=>c});s.sync(visualGame());void s.unlock();void s.unlock();assert.equal(c.resumes,2,'a later trusted gesture must call native resume again');await Promise.resolve();await Promise.resolve();assert.equal(s.context.state,'running');assert.equal(s.voices.size,1);
});
test('Safari primer and native resume run inside the gesture before longer PCM preparation',async()=>{
 const c=new FakeContext(),order=[],buffer=c.createBuffer.bind(c),resume=c.resume.bind(c);c.createBuffer=(channels,length,rate)=>{order.push(length===1?'primer':'pcm');return buffer(channels,length,rate);};c.resume=()=>{order.push('resume');return resume();};const s=new CasinoSound({createContext:()=>c});s.sync(visualGame());await s.unlock();assert.ok(order.indexOf('primer')<order.indexOf('resume'));assert.ok(order.indexOf('resume')<order.indexOf('pcm'));assert.equal(c.primers.length,1);assert.equal(c.primers[0].buffer.getChannelData(0)[0],0);assert.equal(c.sources.length,1);
});
test('feature-detected playback session is requested and unsupported or denied sessions remain non-fatal',async()=>{
 const session={type:'auto'},c=new FakeContext(),s=new CasinoSound({createContext:()=>c,getAudioSession:()=>session});s.sync(visualGame('baccarat','dealing'));assert.equal(await s.unlock(),true);assert.equal(session.type,'playback');assert.equal(s.play('chip'),true);
 const denied={set type(value){throw new Error('denied');}},d=new FakeContext(),fallback=new CasinoSound({createContext:()=>d,getAudioSession:()=>denied});fallback.sync(visualGame('baccarat','dealing'));assert.equal(await fallback.unlock(),true);assert.equal(fallback.play('card'),true);
});
test('explicit menu test plays a single audible cue while paused, survives menu sync and never changes gameplay',async()=>{
 for(const screen of ['home','table']){const g=visualGame('roulette','rou-spinning',2300);g.screen=screen;g.paused=screen==='table';const before=JSON.stringify(g),{sound:s,c}=await player(g);assert.equal(s.play('chip'),false);assert.equal(await s.test(()=>true),true);assert.equal(s.voices.size,1);assert.equal([...s.voices][0].preview,true);for(let i=0;i<10;i++)s.sync(g);assert.equal(s.voices.size,1);assert.equal(c.sources.length,1);assert.equal(JSON.stringify(g),before);c.sources[0].onended();assert.equal(s.voices.size,0);}
});
test('pending menu test is canceled by background, mute or leaving its scope before audio starts',async()=>{
 for(const cancel of ['background','mute','scope']){const c=new FakeContext();let finish,allowed=true;c.resume=function(){this.resumes++;return new Promise(resolve=>{finish=()=>{this.state='running';resolve();};});};const s=new CasinoSound({createContext:()=>c}),g=visualGame();g.screen='home';s.sync(g);const attempt=s.test(()=>allowed);if(cancel==='background')s.stopAll();else if(cancel==='mute')s.setMuted(true);else allowed=false;finish();assert.equal(await attempt,false);assert.equal(s.voices.size,0);assert.equal(c.sources.length,0);}
});
test('entering live gameplay ends menu preview and periodic sync does not replay it',async()=>{
 const g=visualGame('baccarat','dealing',500);g.screen='home';const {sound:s,c}=await player(g);await s.test();const preview=c.sources[0];g.screen='table';s.sync(g);assert.ok(preview.stopped!==undefined);assert.equal(s.voices.size,0);for(let i=0;i<5;i++)s.sync(g);assert.equal(c.sources.length,1);
});
test('unavailable audio, blocked settings or source failure cannot break gameplay',async()=>{
 for(const factory of [()=>null,()=>{throw new Error('unsupported');}]){const s=new CasinoSound({storage:{getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}},createContext:factory});assert.equal(await s.unlock(),false);assert.equal(s.play('chip'),false);assert.doesNotThrow(()=>s.setMuted(true));}
 const {sound:s,c}=await player(visualGame('baccarat','dealing',500));c.createBufferSource=()=>({connect(){},disconnect(){},start(){throw new Error('failed start');}});assert.equal(s.play('card'),false);assert.equal(s.voices.size,0);
});
test('ended voices disconnect once and leave no active reference',async()=>{
 const {sound:s,c}=await player(visualGame('baccarat','dealing',500));assert.ok(s.play('card'));const source=c.sources[0];source.onended();assert.equal(source.disconnected,true);assert.equal(s.voices.size,0);assert.doesNotThrow(()=>source.onended());
});
test('Sic Bo emits one opening cue at the actual reveal, never during a pause or repeat settlement',()=>{
 const cues=[],g=new Game({roll:()=>2,onCue:n=>cues.push(n)});g.start('聲效');g.enterTable('sicbo');g.addBet('big',100);g.lock();g.tick(400);assert.deepEqual(cues,[]);g.paused=true;g.tick(3000);assert.deepEqual(cues,[]);g.paused=false;g.tick(500);assert.deepEqual(cues,['dice-open']);g.settle();assert.deepEqual(cues,['dice-open']);
});
test('Baccarat and Blackjack emit one paper cue per dealt card, with no render or paused replay',()=>{
 const bc=[],g=new Game({onCue:n=>bc.push(n)});g.start('發牌');g.enterTable('baccarat');g.round.initial=[1,2,3,4];g.round.cards=baccaratInitial(g.round.initial);g.addBet('bac-banker',100);g.lock();for(let i=0;i<4;i++)g.tick(400/.7);assert.deepEqual(bc,Array(4).fill('card'));
 const bj=[],h=new Game({onCue:n=>bj.push(n)});h.start('發牌');h.enterTable('blackjack');h.addBet('bj-main',100);h.lock();for(let i=0;i<4;i++)h.tick(BLACKJACK_DEAL_MS);assert.deepEqual(bj,Array(4).fill('card'));h.paused=true;h.tick(100000);assert.equal(bj.length,4);
});
test('Poker sounds only visible card events and does not sound a hidden burn',()=>{
 const cues=[],g=new Game({onCue:n=>cues.push(n)});g.start('六人發牌');g.enterTable('poker');g.startPoker();for(let i=0;i<12;i++)g.tick(450);assert.deepEqual(cues,Array(12).fill('card'));g.round.queue=[{type:'burn'},{type:'board'}];g.round.phase='poker-dealing';g.round.remaining=450;g.tick(450);assert.equal(cues.length,12);g.tick(450);assert.equal(cues.length,13);
});
test('throwing sound callback never changes round result, inventory or saved progress',()=>{
 const finish=onCue=>{const g=new Game({roll:()=>2,onCue});g.start('音效失敗');g.enterTable('sicbo');g.addBet('big',100);g.lock();g.tick(900);return g.checkpoint;};assert.deepEqual(finish(()=>{throw new Error('audio blocked');}),finish(()=>{}));
});
test('chip landings sound once, reduced motion still sounds, cancellations and late callbacks stay silent',()=>{
 let lands=0;const instant=new ChipFlights({art:p=>p,onChange:()=>{},onLand:()=>lands++,reduced:()=>true});instant.queue('rou-number-0',100);assert.equal(lands,1);assert.equal(instant.flights.length,0);
 const previous=globalThis.document;let animation;globalThis.document={querySelector:()=>({getBoundingClientRect:()=>({x:0,y:0,width:30,height:30})}),body:{append(){}},createElement:()=>({style:{},setAttribute(){},remove(){},animate(){animation={cancel(){}};return animation;}})};
 try{const fx=new ChipFlights({art:p=>p,onChange:()=>{},onLand:()=>lands++});fx.queue('rou-number-0',100);fx.mount();animation.onfinish();assert.equal(lands,2);animation.onfinish();assert.equal(lands,2);fx.queue('rou-number-1',100);fx.mount();const canceled=animation;fx.cancel();canceled.onfinish();assert.equal(lands,2);fx.queue('rou-number-2',100);fx.mount();const early=animation;fx.landAll();assert.equal(lands,3);early.onfinish();assert.equal(lands,3);}finally{globalThis.document=previous;}
});
