// Mechanical browser-format exports of the approved A image; no redesign or retouching.
// ImageMagick is needed only to regenerate assets, not to run or package the game.
import {readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'public/icons/a-gold-seal-v1');
const source=path.join(dir,'source.png');
const approvedSha='399b38328c1748a5cd68e69e53364b8580db3c2e7c340b94ed4e1359c1d7ee09';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
if(sha(await readFile(source))!==approvedSha)throw new Error('The approved A source must stay byte-identical.');
const run=args=>{const result=spawnSync('magick',args,{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr||'ImageMagick unavailable');};
for(const [size,name] of [[16,'favicon-16.png'],[32,'favicon-32.png'],[180,'apple-touch-icon.png']])run([source,'-filter','Lanczos','-resize',`${size}x${size}`,'-strip',`PNG24:${path.join(dir,name)}`]);
run([source,'-strip','-define','icon:auto-resize=48,32,16',path.join(dir,'favicon.ico')]);
const files=[];
for(const file of ['source.png','favicon-16.png','favicon-32.png','apple-touch-icon.png','favicon.ico']){
 const bytes=await readFile(path.join(dir,file));files.push({file,bytes:bytes.length,sha256:sha(bytes)});
}
await writeFile(path.join(dir,'assets.json'),JSON.stringify({selected:'A · 金印賭字',approval:'User selected A and requested implementation',source:{generated_with:'OpenAI image_gen',sha256:approvedSha,original:'/workspace/generated_images/exec-16c320d0-048f-487c-adf5-9722ec4dde30.png',design:'Approved gold Traditional Chinese 賭 on burgundy; image content unchanged'},processing:'ImageMagick Lanczos browser-size/format export only; no redrawing, crop or padding',png_sizes:[16,32,180],ico_sizes:[16,32,48],files},null,2)+'\n');
console.log('Approved A exported: 16/32 PNG, 16/32/48 ICO, 180px Apple touch icon.');
