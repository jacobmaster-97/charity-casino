// Original procedural foley. No recordings, network requests or gameplay RNG.
export const SOUND_ENABLED=true;
export const SOUND_PREF_KEY='charity-casino-sound-muted-v1';
export const SOUND_SPECS={card:{seconds:.16,seed:311},chip:{seconds:.23,seed:701},'dice-shake':{seconds:.9,seed:1019},'dice-open':{seconds:.32,seed:1601},'roulette-spin':{seconds:4.8,seed:2003}};
export function makeSoundSamples(name,sampleRate=44100){
 const spec=SOUND_SPECS[name];if(!spec||!Number.isInteger(sampleRate)||sampleRate<8000||sampleRate>192000)throw new Error('無效聲效資料');
 const data=new Float32Array(Math.ceil(spec.seconds*sampleRate));let seed=spec.seed,low=0;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 for(let i=0;i<data.length;i++){const t=i/sampleRate,n=noise();low+=.08*(n-low);const high=n-low;
   if(name==='card')data[i]=high*Math.sin(Math.PI*Math.min(1,t/.14))**2*Math.exp(-t*12)*.7;
   else if(name==='dice-shake')data[i]=low*.16*Math.sin(Math.PI*t/.9)**2;
   else if(name==='dice-open')data[i]=high*.18*Math.sin(Math.PI*Math.min(1,t/.18))**2;
   else if(name==='roulette-spin'){const progress=t/spec.seconds,fade=(1-progress)**.65;data[i]=(low*.38+Math.sin(2*Math.PI*(155*t-10*t*t))*.025)*fade;}
 }
 const impact=(at,amplitude,frequency,decay=45)=>{for(let i=Math.floor(at*sampleRate);i<data.length&&i<(at+.18)*sampleRate;i++){const t=i/sampleRate-at;if(t<0)continue;data[i]+=amplitude*Math.exp(-t*decay)*(Math.sin(2*Math.PI*frequency*t)+.45*Math.sin(2*Math.PI*frequency*2.13*t)+noise()*.2);}};
 if(name==='card')impact(.105,.12,185,75);
 if(name==='chip'){impact(.004,.65,1700,42);impact(.032,.42,2600,52);impact(.075,.2,1100,55);}
 if(name==='dice-shake')[.025,.071,.13,.198,.263,.328,.399,.476,.542,.613,.69,.758,.823].forEach((at,i)=>impact(at,.24+(i%3)*.07,320+(i%4)*135,70));
 if(name==='dice-open'){impact(.015,.15,220,50);impact(.155,.6,280,38);impact(.205,.23,740,65);}
 if(name==='roulette-spin'){for(let i=1;i<=35;i++)impact(spec.seconds*(i/36)**1.55,.16+.16*(i/35),650+(i%5)*100,85);impact(4.71,.24,430,55);}
 const edge=Math.round(sampleRate*.006);let peak=0;for(let i=0;i<data.length;i++){data[i]*=Math.min(1,i/edge,(data.length-1-i)/edge);peak=Math.max(peak,Math.abs(data[i]));}if(peak)for(let i=0;i<data.length;i++)data[i]*=.34/peak;
 return data;
}
export class CasinoSound{
 constructor({storage=null,getAudioSession=()=>globalThis.navigator?.audioSession,createContext=()=>{const Context=globalThis.AudioContext||globalThis.webkitAudioContext;return Context?new Context():null;}}={}){
   this.storage=storage;this.createContext=createContext;this.getAudioSession=getAudioSession;this.context=null;this.master=null;this.buffers=new Map();this.voices=new Set();this.lastPlayed=new Map();this.loop=null;this.game=null;this.paused=true;this.pending=null;this.muted=false;this.primer=null;this.previewSerial=0;this.screen=null;
   try{this.muted=storage?.getItem(SOUND_PREF_KEY)==='1';}catch{}
 }
 get enabled(){return SOUND_ENABLED&&!this.muted;}
 _prime(){
   const c=this.context;try{this._stopPrimer();const source=c.createBufferSource();source.buffer=c.createBuffer(1,1,c.sampleRate);source.connect(c.destination);source.onended=()=>{try{source.disconnect();}catch{}if(this.primer===source)this.primer=null;};this.primer=source;source.start(0);}catch{this._stopPrimer();}
 }
 _stopPrimer(){if(!this.primer)return;try{this.primer.stop();this.primer.disconnect();}catch{}this.primer=null;}
 _prepareBuffers(){for(const name of Object.keys(SOUND_SPECS)){if(this.buffers.has(name))continue;const c=this.context,pcm=makeSoundSamples(name,c.sampleRate),buffer=c.createBuffer(1,pcm.length,c.sampleRate);buffer.getChannelData(0).set(pcm);this.buffers.set(name,buffer);}}
 unlock(force=false){
   if(!this.enabled)return Promise.resolve(false);
   try{if(!this.context){const c=this.createContext();if(!c)return Promise.resolve(false);this.context=c;this.master=c.createGain();this.master.gain.value=.55;this.master.connect(c.destination);c.addEventListener?.('statechange',()=>{if(c.state!=='running')this.stopAll({cancelPreview:false});else if(this.game)this.sync(this.game);});}
     // Feature-detected iPad media playback category; settings refusal is non-fatal.
     try{const session=this.getAudioSession();if(session&&session.type!=='playback')session.type='playback';}catch{}
     const c=this.context;let resumed;
     if(c.state!=='running'||force){this._prime();resumed=c.resume();}
     // Native start/resume occur in the gesture, before any PCM generation or await.
     this._prepareBuffers();
     if(c.state==='running'&&!resumed){if(this.game)this.sync(this.game);return Promise.resolve(true);}
     // Never let an earlier pending resume swallow a later touchend/click gesture.
     const operation=Promise.resolve(resumed).then(()=>{if(this.game)this.sync(this.game);return c.state==='running';},()=>false).finally(()=>{if(this.pending===operation)this.pending=null;});this.pending=operation;return operation;
   }catch{this.stopAll();return Promise.resolve(false);}
 }
 test(allowed=()=>true){
   this.setMuted(false);const serial=++this.previewSerial;
   return this.unlock(true).then(ready=>{if(!ready||!this.enabled||serial!==this.previewSerial||!allowed())return false;for(const voice of [...this.voices])if(voice.preview)this._stop(voice);return Boolean(this._start('chip',0,false,true));});
 }
 setMuted(muted){this.muted=Boolean(muted);try{this.storage?.setItem(SOUND_PREF_KEY,this.muted?'1':'0');}catch{}if(this.master){this.master.gain.value=this.enabled ? .55 : 0;}if(!this.enabled)this.stopAll();else if(this.game)this.sync(this.game);return this.enabled;}
 _cleanup(voice){if(voice.cleaned)return;voice.cleaned=true;this.voices.delete(voice);try{voice.source.disconnect();voice.gain.disconnect();}catch{}}
 _stop(voice){if(!voice||voice.stopped)return;voice.stopped=true;this.voices.delete(voice);try{if(this.context.state!=='running'){voice.source.stop();this._cleanup(voice);return;}const now=this.context.currentTime;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setValueAtTime(voice.gain.gain.value,now);voice.gain.gain.linearRampToValueAtTime(0,now+.008);voice.source.stop(now+.010);}catch{this._cleanup(voice);}}
 stopAll({cancelPreview=true}={}){if(cancelPreview){this.previewSerial++;this._stopPrimer();}for(const voice of [...this.voices])this._stop(voice);this.loop=null;this.lastPlayed.clear();}
 _start(name,offset=0,long=false,preview=false){
   const c=this.context,b=this.buffers.get(name);if(!this.enabled||this.paused&&!preview||!c||c.state!=='running'||!b||!Number.isFinite(offset)||offset<0||offset>=b.duration)return null;
   while(this.voices.size>=4){const oldest=[...this.voices].find(v=>!v.long)||this.voices.values().next().value;this._stop(oldest);}
   let source,gain,voice;try{source=c.createBufferSource();gain=c.createGain();source.buffer=b;gain.gain.value=1;source.connect(gain);gain.connect(this.master);voice={source,gain,long,preview,stopped:false,cleaned:false};source.onended=()=>this._cleanup(voice);this.voices.add(voice);source.start(c.currentTime,offset);return voice;}catch{if(voice)this._cleanup(voice);else try{source?.disconnect();gain?.disconnect();}catch{}return null;}
 }
 play(name){try{if(!['card','chip','dice-open'].includes(name)||!this.enabled||this.paused||this.context?.state!=='running')return false;const now=this.context.currentTime,previous=this.lastPlayed.get(name);if(previous!==undefined&&now-previous<.035)return false;const voice=this._start(name);if(!voice)return false;this.lastPlayed.set(name,now);return true;}catch{return false;}}
 sync(game){
   const active=game?.screen==='table'&&!game.paused,changedScreen=this.screen!==game?.screen,enteringPause=!active&&(!this.paused||changedScreen);this.game=game;this.screen=game?.screen;this.paused=!active;if(!this.enabled){this.stopAll();return;}if(!active){for(const voice of [...this.voices])if(!voice.preview||enteringPause)this._stop(voice);this.loop=null;return;}this.previewSerial++;for(const voice of [...this.voices])if(voice.preview)this._stop(voice);
   const r=game.round;let desired=null;
   if(r?.kind==='sicbo'&&r.phase==='revealing')desired={key:r,name:'dice-shake',offset:Math.max(0,.9-r.remaining/1000)};
   else if(r?.kind==='roulette'&&r.phase==='rou-spinning')desired={key:r.spin,name:'roulette-spin',offset:Math.max(0,4.8-r.remaining/1000)};
   if(!desired){if(this.loop)this._stop(this.loop.voice);this.loop=null;return;}
   if(this.loop?.key===desired.key)return;if(this.loop)this._stop(this.loop.voice);const voice=this._start(desired.name,desired.offset,true);this.loop=voice?{key:desired.key,voice}:null;
 }
}
