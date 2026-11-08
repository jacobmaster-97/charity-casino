export const MUSIC_ASSET='/audio/brass-command-v1.mp3';
export const MUSIC_PREF_KEY='charity-casino-music-v1';

// One media element survives DOM renders and table changes. No startup fetch or game dependency.
export class CasinoMusic{
 constructor({storage,url,createAudio=()=>typeof Audio==='function'?new Audio():null,createContext=()=>{const C=globalThis.AudioContext||globalThis.webkitAudioContext;return C?new C():null;}}={}){
  this.storage=storage;this.url=url;this.createAudio=createAudio;this.createContext=createContext;this.audio=null;this.context=null;this.gain=null;
  this.enabled=true;this.volume=35;this.unlocked=false;this.allowed=true;this.pending=false;this.blocked=false;this.preferenceWarning='';
  try{const p=JSON.parse(storage?.getItem(MUSIC_PREF_KEY)||'null');if(p&&typeof p.enabled==='boolean'&&Number.isInteger(p.volume)&&p.volume>=0&&p.volume<=100){this.enabled=p.enabled;this.volume=p.volume;}}catch{}
 }
 _save(){try{this.storage?.setItem(MUSIC_PREF_KEY,JSON.stringify({enabled:this.enabled,volume:this.volume}));if(!this.storage)throw new Error('storage');this.preferenceWarning='';}catch{this.preferenceWarning='音樂設定只在本次開啟期間生效。';}}
 _element(){if(!this.audio){try{this.audio=this.createAudio();if(this.audio){this.audio.preload='none';this.audio.loop=true;this.audio.setAttribute?.('playsinline','');this.audio.src=this.url;
   // iOS ignores media.volume. A separate gain keeps music volume independent of SFX.
   try{const c=this.createContext();if(c){const source=c.createMediaElementSource(this.audio),gain=c.createGain();source.connect(gain);gain.connect(c.destination);this.context=c;this.gain=gain;}}catch{}
  }}catch{this.blocked=true;}}return this.audio;}
 _level(){if(this.gain){this.audio.volume=1;this.gain.gain.value=this.allowed&&this.enabled?this.volume/100:0;}else if(this.audio)this.audio.volume=this.volume/100;}
 sync(allowed=true){this.allowed=allowed;this._level();if(!allowed||!this.enabled||this.volume===0){this.audio?.pause();return;}if(this.unlocked&&!this.blocked)this._play();}
 gesture(){this.unlocked=true;this.blocked=false;this._play();if(this.context?.state!=='running')try{this.context?.resume()?.catch?.(()=>{});}catch{}}
 _play(){if(!this.unlocked||!this.allowed||!this.enabled||this.volume===0||this.pending)return;const audio=this._element();if(!audio||!audio.paused)return;this._level();this.pending=true;
  // Call play in the gesture itself, never after an await (iOS autoplay policy).
  try{Promise.resolve(audio.play()).then(()=>{this.pending=false;if(!this.allowed||!this.enabled||this.volume===0)audio.pause();},()=>{this.pending=false;this.blocked=true;});}catch{this.pending=false;this.blocked=true;}
 }
 setEnabled(value){this.enabled=Boolean(value);this._save();this.sync(this.allowed);}
 setVolume(value){if(Number.isFinite(value))this.volume=Math.round(Math.max(0,Math.min(100,value)));this._save();this.sync(this.allowed);return this.volume;}
}
