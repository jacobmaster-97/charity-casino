import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const destination=path.join(root,'docs');
const runtime=path.join(destination,'play');
await mkdir(path.join(runtime,'src'),{recursive:true});
for(const file of ['app.mjs','game.mjs','rules.mjs','storage.mjs','board.mjs','baccarat.mjs','baccarat-squeeze.mjs','baccarat-view.mjs','styles.css']){
  await copyFile(path.join(root,'src',file),path.join(runtime,'src',file));
}
const images=['art/styles/b/lobby-populated-v4.png',...['table','dice','props','dome'].map(id=>`art/prototype-b/${id}.png`),...['felt','dice','chip','chips-five'].map(id=>`art/sicbo-board-b/${id}.png`),'art/baccarat-b/cards.png','art/baccarat-b/hand.png'];
for(const file of images){
  const output=path.join(runtime,'public',file);
  await mkdir(path.dirname(output),{recursive:true});
  await copyFile(path.join(root,'public',file),output);
}
const html=(await readFile(path.join(root,'index.html'),'utf8'))
  .replace('href="./src/styles.css','href="./play/src/styles.css')
  .replace('src="./src/app.mjs','src="./play/src/app.mjs');
await writeFile(path.join(destination,'index.html'),html);
await writeFile(path.join(destination,'.nojekyll'),'');
console.log('GitHub Pages ready: docs/index.html + docs/play/ (eleven PNGs, nine runtime files).');
