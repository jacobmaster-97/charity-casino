import {mkdir,readFile,writeFile,copyFile,readdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const destination=path.join(root,'dist/github-upload');
await rm(destination,{recursive:true,force:true});
const files=['.gitignore','index.html','package.json','README.md','AGENTS.md','CODEX_HANDOFF.md','DEBUG_HANDOFF.md'];
async function gather(directory){
  for(const entry of await readdir(path.join(root,directory),{withFileTypes:true})){
    const relative=path.join(directory,entry.name);
    if(entry.name==='__pycache__'||entry.name==='previews'||entry.name.endsWith('.pyc')||relative.startsWith('.agents/skills/gamestudio/assets'))continue;
    if(entry.isDirectory())await gather(relative);else if(entry.isFile())files.push(relative);
  }
}
for(const dir of ['src','scripts','tests','.agents/skills/gamestudio','public/art/prototype-b','docs/play'])await gather(dir);
files.push('docs/index.html','docs/.nojekyll','public/art/styles/b/lobby-populated-v4.png','public/art/styles/b/lobby-background.png','public/art/styles/b/asset.json');
for(const entry of await readdir(path.join(root,'docs'),{withFileTypes:true}))if(entry.isFile()&&(entry.name.endsWith('.md')||entry.name==='skill-installation.json'))files.push(path.join('docs',entry.name));
const manifest=[];
for(const relative of [...new Set(files)].sort()){
  const source=path.join(root,relative),output=path.join(destination,relative),bytes=await readFile(source);
  await mkdir(path.dirname(output),{recursive:true});await copyFile(source,output);
  manifest.push({path:relative,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile(path.join(root,'dist/github-upload-manifest.json'),JSON.stringify({status:'awaiting_repository_url',files:manifest},null,2)+'\n');
console.log(`GitHub source and Pages upload prepared: ${manifest.length} files (${manifest.reduce((n,f)=>n+f.bytes,0)} bytes).`);
