import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const site=path.join(root,'docs');
test('approved leaderboard WebP is identical in root and Pages export',async()=>{
 const ref='art/leaderboard-b/dragon-tiger-v1.webp';assert.deepEqual(await readFile(path.join(root,'public',ref)),await readFile(path.join(site,'play/public',ref)));
});
test('Pages entry references shipped runtime, without development server',async()=>{
  const html=await readFile(path.join(site,'index.html'),'utf8');
  assert.ok(html.includes('./play/src/app.mjs'));
  assert.ok(html.includes('./play/src/styles.css'));
  assert.ok(!html.includes('127.0.0.1'));
  for(const file of ['leaderboard-config.mjs','leaderboard-view.mjs','leaderboard.mjs','home-view.mjs','cash.mjs','challenge.mjs','record-share.mjs','sicbo-view.mjs','app.mjs','sound.mjs','roulette.mjs','roulette-game.mjs','roulette-view.mjs','poker.mjs','poker-game.mjs','poker-view.mjs','blackjack.mjs','blackjack-game.mjs','blackjack-view.mjs','game.mjs','rules.mjs','storage.mjs','board.mjs','table-layout.mjs','baccarat.mjs','baccarat-squeeze.mjs','baccarat-view.mjs','styles.css']){
    assert.deepEqual(await readFile(path.join(site,'play/src',file)),await readFile(path.join(root,'src',file)));
  }
  assert.ok((await stat(path.join(site,'.nojekyll'))).isFile());
});
test('all runtime PNGs match original assets byte for byte',async()=>{
  const images=['art/home-b/background.png','art/home-b/logo.png','art/styles/b/lobby-populated-v4.png',...['table','dice','props','dome'].map(id=>`art/prototype-b/${id}.png`),...['felt','dice','chip','chips-five'].map(id=>`art/sicbo-board-b/${id}.png`),'art/baccarat-b/cards.png'];
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
  const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
  for(const entry of ['index.html','docs/index.html']){
    const html=await readFile(path.join(root,entry),'utf8');
    assert.ok(html.includes(`src/styles.css?v=${version}"`));
    assert.ok(html.includes(`src/app.mjs?v=${version}"`));
  }
});
test('all entry-module dependencies share the release version to avoid stale export caches',async()=>{
  const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
  for(const base of [root,path.join(site,'play')]){
    for(const file of ['leaderboard-config.mjs','leaderboard-view.mjs','leaderboard.mjs','home-view.mjs','cash.mjs','challenge.mjs','record-share.mjs','sicbo-view.mjs','app.mjs','roulette.mjs','roulette-game.mjs','roulette-view.mjs','poker.mjs','poker-game.mjs','poker-view.mjs','blackjack.mjs','blackjack-game.mjs','blackjack-view.mjs','game.mjs','storage.mjs','board.mjs','table-layout.mjs','baccarat-squeeze.mjs','baccarat-view.mjs']){
      const source=await readFile(path.join(base,'src',file),'utf8');
      const imports=[...source.matchAll(/from '(\.\/[^']+)'/g)].map(m=>m[1]);
      assert.ok(imports.length>0||['cash.mjs','home-view.mjs','leaderboard-config.mjs','leaderboard-view.mjs'].includes(file));
      for(const dependency of imports){
        assert.ok(dependency.endsWith(`?v=${version}`),`${file} has an unversioned dependency`);
        assert.ok((await stat(path.join(base,'src',dependency.split('?')[0]))).isFile());
      }
    }
  }
});
test('root and docs favicon and iPhone bookmark links resolve under project Pages and ship the approved bytes',async()=>{
 const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
 for(const entry of ['index.html','docs/index.html']){
  const html=await readFile(path.join(root,entry),'utf8'),links=[...html.matchAll(/<link rel="(icon|apple-touch-icon)"([^>]*)>/g)];assert.equal(links.length,4);
  assert.ok(html.includes('name="apple-mobile-web-app-title" content="五分鐘賭神"'));
  for(const [,rel,attrs] of links){
   const href=attrs.match(/href="([^"]+)"/)[1];assert.ok(href.endsWith('?v='+version));assert.ok(href.startsWith(entry.startsWith('docs/')?'./play/public/icons/':'./public/icons/'));assert.ok(!href.includes('source.png'));
   const target=new URL(href,pathToFileURL(path.join(root,entry)));target.search='';const name=path.basename(target.pathname);assert.deepEqual(await readFile(target),await readFile(path.join(root,'public/icons/a-gold-seal-v1',name)));
   for(const prefix of ['https://example.github.io/','https://example.github.io/charity-casino/'])assert.ok(new URL(href,new URL(entry,prefix)).href.startsWith(prefix));
   if(rel==='apple-touch-icon')assert.ok(attrs.includes('sizes="180x180"'));
  }
 }
});
test('home-screen manifests use stable scoped starts, standalone mode and approved app icons in root and docs',async()=>{
 const version=JSON.parse(await readFile(path.join(root,'package.json'),'utf8')).version;
 for(const entry of ['index.html','docs/index.html']){
  const html=await readFile(path.join(root,entry),'utf8');assert.ok(html.includes('name="apple-mobile-web-app-capable" content="yes"'));
  const href=html.match(/<link rel="manifest" href="([^"]+)"/)[1];assert.equal(href,'./manifest.webmanifest?v='+version);
  const manifestURL=new URL(href,pathToFileURL(path.join(root,entry)));manifestURL.search='';const manifest=JSON.parse(await readFile(manifestURL,'utf8'));
  assert.equal(manifest.display,'standalone');for(const key of ['id','scope','start_url'])assert.equal(manifest[key],'./');assert.equal(manifest.name,'五分鐘賭神');assert.equal(manifest.icons.length,2);
  for(const icon of manifest.icons){
   const bytes=await readFile(new URL(icon.src,manifestURL)),size=Number(icon.sizes.split('x')[0]);assert.ok([192,512].includes(size));assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);assert.equal(bytes[25],2);assert.deepEqual(bytes,await readFile(path.join(root,'public/icons/a-gold-seal-v1',path.basename(icon.src))));
  }
 }
});
