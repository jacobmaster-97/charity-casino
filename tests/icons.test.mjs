import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir=new URL('../public/icons/a-gold-seal-v1/',import.meta.url);
test('approved A original and small opaque PNG exports retain expected sizes and recorded content',async()=>{
 const meta=JSON.parse(await readFile(new URL('assets.json',dir),'utf8'));
 assert.equal(meta.source.sha256,'399b38328c1748a5cd68e69e53364b8580db3c2e7c340b94ed4e1359c1d7ee09');
 for(const f of meta.files){const bytes=await readFile(new URL(f.file,dir));assert.equal(bytes.length,f.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);}
 for(const [file,size] of [['source.png',1254],['favicon-16.png',16],['favicon-32.png',32],['apple-touch-icon.png',180]]){
  const bytes=await readFile(new URL(file,dir));assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);assert.equal(bytes[25],2,'RGB, without transparent pixels');
 }
 const small=meta.files.filter(f=>['favicon-16.png','favicon-32.png','apple-touch-icon.png','favicon.ico'].includes(f.file));assert.ok(small.reduce((n,f)=>n+f.bytes,0)<80000,'Only small exports belong on the page, not the 2.6MB source.');
});
test('ICO contains valid separate 16, 32 and 48 pixel entries within the file',async()=>{
 const bytes=await readFile(new URL('favicon.ico',dir));assert.equal(bytes.readUInt16LE(0),0);assert.equal(bytes.readUInt16LE(2),1);assert.equal(bytes.readUInt16LE(4),3);const sizes=[];
 for(let i=0;i<3;i++){const start=6+i*16,width=bytes[start]||256,height=bytes[start+1]||256,length=bytes.readUInt32LE(start+8),offset=bytes.readUInt32LE(start+12);assert.equal(width,height);assert.ok(offset>=54&&length>0&&offset+length<=bytes.length);sizes.push(width);}
 assert.deepEqual(sizes.sort((a,b)=>a-b),[16,32,48]);
});
