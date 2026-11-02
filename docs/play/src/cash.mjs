// Exact integer cents: retain Number for ordinary values, promote large amounts to BigInt.
export const cashCompact=n=>n<=BigInt(Number.MAX_SAFE_INTEGER)&&n>=BigInt(Number.MIN_SAFE_INTEGER)?Number(n):n;
export const isCash=n=>typeof n==='bigint'||Number.isSafeInteger(n);
export function cashParse(n){if(isCash(n))return cashCompact(BigInt(n));if(typeof n==='string'&&/^-?\d{1,4096}$/.test(n))return cashCompact(BigInt(n));throw new Error('金額必須是精確整數分');}
export const cashAdd=(...values)=>cashCompact(values.reduce((s,n)=>s+BigInt(cashParse(n)),0n));
export const cashSub=(a,b)=>cashCompact(BigInt(cashParse(a))-BigInt(cashParse(b)));
export function cashRatio(a,n,d=1,round='floor'){let v=BigInt(cashParse(a))*BigInt(n),den=BigInt(d);if(den<=0n)throw new Error('無效金額比例');if(round==='round')v+=den/2n;let q=v/den;if(round==='floor'&&v<0n&&v%den)q--;return cashCompact(q);}
export const cashMin=(...values)=>values.reduce((a,b)=>a<b?a:b);
export const cashMax=(...values)=>values.reduce((a,b)=>a>b?a:b);
export const cashAbs=n=>n<0?cashSub(0,n):n;
export const cashCompare=(a,b)=>a<b?-1:a>b?1:0;
export const cashFraction=(a,b)=>Number(BigInt(cashParse(a))*1000000n/BigInt(cashParse(b)||1))/1000000;
export function cashDollars(n){const c=BigInt(cashParse(n)),a=c<0n?-c:c;return (c<0n?'-':'')+(a/100n).toString()+(a%100n?'.'+(a%100n).toString().padStart(2,'0'):'');}
export function parseDollars(value){const s=String(value).trim();if(!/^\d{1,4094}(?:\.\d{1,2})?$/.test(s))return null;const [w,f='']=s.split('.');return cashCompact(BigInt(w)*100n+BigInt(f.padEnd(2,'0')));}
export function cashMoney(n){const c=BigInt(cashParse(n)),a=c<0n?-c:c;return (c<0n?'-':'')+'$'+(a/100n).toLocaleString('en-US')+(a%100n?'.'+(a%100n).toString().padStart(2,'0'):'');}
export function cashShortRatio(n,unit){const q=cashRatio(n,100,unit),s=cashDollars(q);return s.replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');}
export function cashEncode(value){if(typeof value==='bigint')return value.toString();if(Array.isArray(value))return value.map(cashEncode);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,cashEncode(v)]));return value;}
