import {readFile,writeFile,mkdir,copyFile,rm,readdir} from 'node:fs/promises';
import path from 'node:path';
import {LEADERBOARD_ART} from '../src/leaderboard-view.mjs';
import {HOME_ART} from '../src/home-view.mjs';
const root=path.resolve(import.meta.dirname,'..');
const destination=path.join(root,'docs');
const runtime=path.join(destination,'play');
await mkdir(path.join(runtime,'src'),{recursive:true});
await rm(path.join(runtime,'public/art/baccarat-b/hand.png'),{force:true});
for(const file of ['music.mjs','landscape.mjs','instructions.mjs','settings-view.mjs','leaderboard-config.mjs','leaderboard-view.mjs','leaderboard.mjs','home-view.mjs','cash.mjs','challenge.mjs','record-share.mjs','sicbo-view.mjs','app.mjs','sound.mjs','roulette.mjs','roulette-game.mjs','roulette-view.mjs','poker.mjs','poker-game.mjs','poker-view.mjs','blackjack.mjs','blackjack-game.mjs','blackjack-view.mjs','game.mjs','rules.mjs','storage.mjs','board.mjs','table-layout.mjs','baccarat.mjs','baccarat-squeeze.mjs','baccarat-view.mjs','styles.css']){
  await copyFile(path.join(root,'src',file),path.join(runtime,'src',file));
}
const images=[...Object.values(HOME_ART).map(ref=>ref.slice(1)),...Object.values(LEADERBOARD_ART).map(ref=>ref.slice(1)),'art/styles/b/lobby-populated-v4.png',...['table','dice','props','dome'].map(id=>`art/prototype-b/${id}.png`),...['felt','dice','chip','chips-five'].map(id=>`art/sicbo-board-b/${id}.png`),'art/baccarat-b/cards.png'];
for(const file of images){
  const output=path.join(runtime,'public',file);
  await mkdir(path.dirname(output),{recursive:true});
  await copyFile(path.join(root,'public',file),output);
}
await mkdir(path.join(runtime,'public/audio'),{recursive:true});
for(const file of await readdir(path.join(root,'public/audio')))await copyFile(path.join(root,'public/audio',file),path.join(runtime,'public/audio',file));
const socialDir='social';
await mkdir(path.join(runtime,'public',socialDir),{recursive:true});
for(const file of await readdir(path.join(root,'public',socialDir)))await copyFile(path.join(root,'public',socialDir,file),path.join(runtime,'public',socialDir,file));
const iconDir='icons/a-gold-seal-v1';
await mkdir(path.join(runtime,'public',iconDir),{recursive:true});
for(const file of await readdir(path.join(root,'public',iconDir)))await copyFile(path.join(root,'public',iconDir,file),path.join(runtime,'public',iconDir,file));
const html=(await readFile(path.join(root,'index.html'),'utf8'))
  .replaceAll('href="./public/icons/','href="./play/public/icons/')
  .replace('href="./src/styles.css','href="./play/src/styles.css')
  .replace('src="./src/app.mjs','src="./play/src/app.mjs');
const manifest=JSON.parse(await readFile(path.join(root,'manifest.webmanifest'),'utf8'));
for(const icon of manifest.icons)icon.src=icon.src.replace('./public/','./play/public/');
await writeFile(path.join(destination,'manifest.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(destination,'index.html'),html);
await writeFile(path.join(destination,'.nojekyll'),'');
console.log('GitHub Pages ready: docs/index.html + docs/play/ (twelve game PNGs, thirty-two runtime files, approved A bookmark icons).');
