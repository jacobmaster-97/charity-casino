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
  for(const file of ['app.mjs','game.mjs','rules.mjs','storage.mjs','board.mjs','baccarat.mjs','baccarat-view.mjs','styles.css']){
    assert.deepEqual(await readFile(path.join(site,'play/src',file)),await readFile(path.join(root,'src',file)));
  }
  assert.ok((await stat(path.join(site,'.nojekyll'))).isFile());
});
test('all runtime PNGs match original assets byte for byte',async()=>{
  const images=['art/styles/b/lobby-populated-v4.png',...['table','dice','props','dome'].map(id=>`art/prototype-b/${id}.png`),...['felt','dice','chip','chips-five'].map(id=>`art/sicbo-board-b/${id}.png`),'art/baccarat-b/cards.png'];
  for(const file of images)assert.deepEqual(await readFile(path.join(site,'play/public',file)),await readFile(path.join(root,'public',file)));
});
test('CSS and runtime assets resolve inside both root and project Pages URLs',async()=>{
  const css=await readFile(path.join(site,'play/src/styles.css'),'utf8');
  const refs=[...css.matchAll(/url\(['"]([^'"]+)['"]\)/g)].map(m=>m[1]);
  assert.ok(refs.length>=5);assert.ok(refs.every(ref=>ref.startsWith('../public/art/')));
  const app=await readFile(path.join(site,'play/src/app.mjs'),'utf8');
  const expression=app.match(/^const art=path=>(.*);$/m)?.[1];
  assert.ok(expression,'asset resolver must exist');
  const resolve=new Function('path','moduleURL',`return (${expression.replaceAll('import.meta.url','moduleURL')});`);
  for(const prefix of ['https://example.github.io/','https://example.github.io/charity-casino-game/']){
    const module=new URL('play/src/app.mjs',prefix);
    assert.equal(resolve('/art/prototype-b/dome.png',module.href),`${prefix}play/public/art/prototype-b/dome.png`);
    for(const ref of refs)assert.ok(new URL(ref,new URL('play/src/styles.css',prefix)).href.startsWith(`${prefix}play/public/art/`));
  }
  for(const ref of refs)assert.ok((await stat(new URL(ref,pathToFileURL(path.join(site,'play/src/styles.css'))))).isFile());
});
test('repository-root Pages resolves actual app and CSS images to existing PNGs',async()=>{
  const app=await readFile(path.join(root,'src/app.mjs'),'utf8');
  const expression=app.match(/^const art=path=>(.*);$/m)?.[1];
  const resolve=new Function('path','moduleURL',`return (${expression.replaceAll('import.meta.url','moduleURL')});`);
  for(const prefix of ['https://example.github.io/','https://example.github.io/charity-casino/']){
    assert.equal(resolve('/art/styles/b/lobby-populated-v4.png',`${prefix}src/app.mjs`),`${prefix}public/art/styles/b/lobby-populated-v4.png`);
  }
  const module=pathToFileURL(path.join(root,'src/app.mjs')).href;
  for(const image of ['styles/b/lobby-populated-v4.png','prototype-b/dome.png']){
    const url=resolve(`/art/${image}`,module);
    assert.ok((await stat(new URL(url))).isFile());
  }
  const css=await readFile(path.join(root,'src/styles.css'),'utf8');
  for(const match of css.matchAll(/url\(['"]([^'"]+)['"]\)/g))assert.ok((await stat(new URL(match[1],pathToFileURL(path.join(root,'src/styles.css'))))).isFile());
  assert.ok((await stat(path.join(root,'.nojekyll'))).isFile());
});
test('root and docs entry points version app and CSS without breaking relative paths',async()=>{
  for(const entry of ['index.html','docs/index.html']){
    const html=await readFile(path.join(root,entry),'utf8');
    assert.match(html,/src\/styles\.css\?v=0\.1\.6/);
    assert.match(html,/src\/app\.mjs\?v=0\.1\.6/);
  }
});
test('all entry-module dependencies share the release version to avoid stale export caches',async()=>{
  const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
  for(const base of [root,path.join(site,'play')]){
    for(const file of ['app.mjs','game.mjs','storage.mjs','board.mjs','baccarat-view.mjs']){
      const source=await readFile(path.join(base,'src',file),'utf8');
      const imports=[...source.matchAll(/from '(\.\/[^']+)'/g)].map(m=>m[1]);
      assert.ok(imports.length>0);
      for(const dependency of imports){
        assert.ok(dependency.endsWith(`?v=${version}`),`${file} has an unversioned dependency`);
        assert.ok((await stat(path.join(base,'src',dependency.split('?')[0]))).isFile());
      }
    }
  }
});
