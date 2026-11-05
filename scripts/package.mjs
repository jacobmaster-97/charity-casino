import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {HOME_ART} from '../src/home-view.mjs';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'dist');
await mkdir(output,{recursive:true});
let html=await readFile(path.join(root,'index.html'),'utf8');
// A local standalone file cannot be installed as a hosted app; its help opens the web version.
html=html.replace(/\s*<link rel="manifest"[^>]*>/,'');
let css=await readFile(path.join(root,'src/styles.css'),'utf8');
let js='';
for(const file of ['leaderboard-config','leaderboard','home-view','cash','rules','challenge','record-share','sound','baccarat','blackjack','blackjack-game','poker','poker-game','roulette','roulette-game','game','storage','board','table-layout','baccarat-squeeze','baccarat-view','blackjack-view','poker-view','roulette-view','sicbo-view','app']){
  const source=await readFile(path.join(root,`src/${file}.mjs`),'utf8');
  js+=source.replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')+'\n';
}
const references=[...Object.values(HOME_ART),'/art/styles/b/lobby-populated-v4.png',...['table','dice','props','dome'].map(name=>`/art/prototype-b/${name}.png`),...['felt','dice','chip','chips-five'].map(name=>`/art/sicbo-board-b/${name}.png`),'/art/baccarat-b/cards.png'];
const assetMap={};let bootstrap='';
for(const [index,ref] of references.entries()){
  const bytes=await readFile(path.join(root,'public',ref));
  const data=`data:image/png;base64,${bytes.toString('base64')}`;
  assetMap[ref]=data;
  css=css.replaceAll(`url('../public${ref}')`,`var(--bundled-art-${index})`);
  bootstrap+=`document.documentElement.style.setProperty('--bundled-art-${index}', 'url("'+globalThis.__CASINO_ART[${JSON.stringify(ref)}]+'")');\n`;
}
bootstrap=`globalThis.__CASINO_ART=${JSON.stringify(assetMap)};\n`+bootstrap;
// Inline only the small browser icons; the full approved source is never fetched at startup.
for(const match of [...html.matchAll(/href="(\.\/public\/icons\/[^"?]+)(?:\?[^" ]*)?"/g)]){
  const bytes=await readFile(path.join(root,match[1]));
  const type=match[1].endsWith('.ico')?'image/x-icon':'image/png';
  html=html.replace(match[0],`href="data:${type};base64,${bytes.toString('base64')}"`);
}
html=html.replace(/<link rel="stylesheet" href="\.\/src\/styles\.css(?:\?[^"\s]*)?">/,()=>`<style>${css}</style>`).replace(/<script type="module" src="\.\/src\/app\.mjs(?:\?[^"\s]*)?"><\/script>/,()=>`<script type="module">${bootstrap}${js.replaceAll('</script','<\\/script')}</script>`);
if(/(?:src|href)="\.\/src\//.test(html)||/url\(['"]?\/art\//.test(html))throw new Error('Unbundled reference');
await writeFile(path.join(output,'charity-casino-prototype.html'),html);
console.log(`Standalone HTML: ${path.join(output,'charity-casino-prototype.html')} (${Buffer.byteLength(html)} bytes)`);
