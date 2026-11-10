import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {HOME_ART} from '../src/home-view.mjs';
import {LEADERBOARD_ART} from '../src/leaderboard-view.mjs';
import {MUSIC_ASSET} from '../src/music.mjs';

const artRefs=[...Object.values(HOME_ART),...Object.values(LEADERBOARD_ART),'/art/styles/b/lobby-populated-v4.png',...['table','dice','props','dome'].map(n=>`/art/prototype-b/${n}.png`),...['felt','dice','chip','chips-five'].map(n=>`/art/sicbo-board-b/${n}.png`),'/art/baccarat-b/cards.png'];
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

// Lossless derivatives live only in Vercel output. Original artwork and the other packages stay intact.
export async function optimizeVercelAssets(root,output,files){
 const map={},assets=[];
 for(const ref of artRefs){
  const original=await readFile(path.join(root,'public',ref));
  const bytes=ref.endsWith('.png')?await sharp(original).webp({lossless:true,effort:6}).toBuffer():original;
  const a=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const b=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(a.info.width!==b.info.width||a.info.height!==b.info.height)throw new Error('Image dimensions changed: '+ref);
  for(let i=0;i<a.data.length;i+=4){
   if(a.data[i+3]!==b.data[i+3]||a.data[i+3]&&(a.data[i]!==b.data[i]||a.data[i+1]!==b.data[i+1]||a.data[i+2]!==b.data[i+2]))throw new Error('Visible image pixels changed: '+ref);
  }
  if(bytes.length>original.length)throw new Error('Image compression increased bytes: '+ref);
  const relative='play/public'+ref.replace(/\.png$/,'.webp'),sha256=digest(bytes);
  await mkdir(path.dirname(path.join(output,relative)),{recursive:true});await writeFile(path.join(output,relative),bytes);files.push(relative);
  map[ref]='./'+relative+'?v='+sha256.slice(0,16);
  assets.push({source:'public'+ref,path:relative,sourceBytes:original.length,bytes:bytes.length,sha256,sourceSha256:digest(original),width:a.info.width,height:a.info.height,visiblePixelsUnchanged:true});
 }
 const music=await readFile(path.join(root,'public',MUSIC_ASSET)),musicPath='play/public'+MUSIC_ASSET;
 await mkdir(path.dirname(path.join(output,musicPath)),{recursive:true});await writeFile(path.join(output,musicPath),music);files.push(musicPath);
 map[MUSIC_ASSET]='./'+musicPath+'?v='+digest(music).slice(0,16);
 for(const name of ['favicon-16.png','favicon-32.png','favicon.ico','apple-touch-icon.png','install-192.png','install-512.png']){
  const relative='play/public/icons/a-gold-seal-v1/'+name;await mkdir(path.dirname(path.join(output,relative)),{recursive:true});await copyFile(path.join(root,'public/icons/a-gold-seal-v1',name),path.join(output,relative));files.push(relative);
 }
 const social='play/public/social/thumbnail-v4.png';await mkdir(path.dirname(path.join(output,social)),{recursive:true});await copyFile(path.join(root,'public/social/thumbnail-v4.png'),path.join(output,social));files.push(social);
 let css=await readFile(path.join(output,'play/src/styles.css'),'utf8');
 for(const [ref,url] of Object.entries(map))css=css.replaceAll('../public'+ref,url.replace('./play/','../'));
 await writeFile(path.join(output,'play/src/styles.css'),css);
 return {map,assets,imageBytesBefore:assets.reduce((n,a)=>n+a.sourceBytes,0),imageBytesAfter:assets.reduce((n,a)=>n+a.bytes,0),musicBytes:music.length};
}
