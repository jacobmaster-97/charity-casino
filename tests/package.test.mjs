import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const html=await readFile(path.join(root,'dist/charity-casino-prototype.html'),'utf8');
test('standalone package has no external script, stylesheet, import or network image dependency',()=>{
  assert.ok(!/<script[^>]+src=/.test(html));
  assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));
  const script=html.match(/<script type="module">([\s\S]*)<\/script>/)[1];
  assert.ok(!/^import /m.test(script));assert.ok(!/^export /m.test(script));
  assert.ok(!/url\(['"]?(?:\.\.\/)?(?:public\/)?art\//.test(html));
  assert.ok(html.includes('globalThis.__CASINO_ART'));
});
test('embedded executable module parses after bundling',async()=>{
  const temp=await mkdtemp(path.join(tmpdir(),'casino-package-'));
  try{
    const file=path.join(temp,'bundle.mjs');await writeFile(file,html.match(/<script type="module">([\s\S]*)<\/script>/)[1]);
    const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    assert.equal(check.status,0,check.stderr);
  }finally{await rm(temp,{recursive:true,force:true});}
});
test('all twelve embedded PNGs exactly match the approved runtime textures',async()=>{
  const map=JSON.parse(html.match(/globalThis\.__CASINO_ART=(\{[^\n]+\});/)[1]);
  assert.equal(Object.keys(map).length,12);assert.ok(!Object.keys(map).some(p=>p.endsWith('/hand.png')));
  for(const [ref,data] of Object.entries(map)){
    assert.ok(data.startsWith('data:image/png;base64,'));
    const embedded=Buffer.from(data.split(',')[1],'base64');
    const original=await readFile(path.join(root,'public',ref));
    assert.equal(createHash('sha256').update(embedded).digest('hex'),createHash('sha256').update(original).digest('hex'));
  }
});
test('standalone embeds all bookmark icons without a separate file or high-resolution download',async()=>{
 const links=[...html.matchAll(/<link rel="(icon|apple-touch-icon)"([^>]*)>/g)];assert.equal(links.length,4);
 for(const [,rel,attrs] of links){
  const size=attrs.match(/sizes="([^"]+)"/)[1],data=attrs.match(/href="([^"]+)"/)[1];assert.ok(data.startsWith('data:image/'));
  const file=rel==='apple-touch-icon'?'apple-touch-icon.png':size==='16x16'?'favicon-16.png':size==='32x32'?'favicon-32.png':'favicon.ico';
  assert.deepEqual(Buffer.from(data.split(',')[1],'base64'),await readFile(path.join(root,'public/icons/a-gold-seal-v1',file)));
 }
 assert.ok(!html.includes('href="./public/icons/'));assert.ok(!html.includes('source.png'));
});
