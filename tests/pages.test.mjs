import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const site=path.join(root,'docs');
test('Pages entry references shipped runtime, without development server',async()=>{
  const html=await readFile(path.join(site,'index.html'),'utf8');
  assert.ok(html.includes('./play/src/app.mjs'));
  assert.ok(html.includes('./play/src/styles.css'));
  assert.ok(!html.includes('127.0.0.1'));
  for(const file of ['app.mjs','game.mjs','rules.mjs','storage.mjs','styles.css']){
    assert.deepEqual(await readFile(path.join(site,'play/src',file)),await readFile(path.join(root,'src',file)));
  }
  assert.ok((await stat(path.join(site,'.nojekyll'))).isFile());
});
test('all runtime PNGs match original assets byte for byte',async()=>{
  const images=['art/styles/b/lobby-populated-v4.png',...['table','dice','props','dome'].map(id=>`art/prototype-b/${id}.png`)];
  for(const file of images)assert.deepEqual(await readFile(path.join(site,'play',file)),await readFile(path.join(root,'public',file)));
});
test('CSS and runtime assets resolve inside both root and project Pages URLs',async()=>{
  const css=await readFile(path.join(site,'play/src/styles.css'),'utf8');
  const refs=[...css.matchAll(/url\(['"]([^'"]+)['"]\)/g)].map(m=>m[1]);
  assert.ok(refs.length>=5);assert.ok(refs.every(ref=>ref.startsWith('../art/')));
  const app=await readFile(path.join(site,'play/src/app.mjs'),'utf8');
  assert.ok(app.includes("new URL('..'+path,import.meta.url).href"));
  for(const prefix of ['https://example.github.io/','https://example.github.io/charity-casino-game/']){
    const module=new URL('play/src/app.mjs',prefix);
    assert.equal(new URL('../art/prototype-b/dome.png',module).href,`${prefix}play/art/prototype-b/dome.png`);
    for(const ref of refs)assert.ok(new URL(ref,new URL('play/src/styles.css',prefix)).href.startsWith(`${prefix}play/art/`));
  }
  for(const ref of refs)assert.ok((await stat(new URL(ref,pathToFileURL(path.join(site,'play/src/styles.css'))))).isFile());
});
