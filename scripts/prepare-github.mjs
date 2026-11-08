import {mkdir,readFile,writeFile,copyFile,readdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const destination=path.join(root,'dist/github-upload');
await rm(destination,{recursive:true,force:true});
const files=['vercel.json','.vercelignore','.gitignore','.nojekyll','index.html','manifest.webmanifest','package.json','README.md','AGENTS.md','CODEX_HANDOFF.md','DEBUG_HANDOFF.md','cloudflare/worker.mjs','cloudflare/wrangler.example.jsonc','cloudflare/migrations/0001_scores.sql','docs/text/revisions/TEXT_REVISIONS_0132.json'];
async function gather(directory){
  for(const entry of await readdir(path.join(root,directory),{withFileTypes:true})){
    const relative=path.join(directory,entry.name);
    if(entry.name==='__pycache__'||entry.name==='previews'||entry.name.endsWith('.pyc')||relative.startsWith('.agents/skills/gamestudio/assets'))continue;
    if(entry.isDirectory())await gather(relative);else if(entry.isFile())files.push(relative);
  }
}
for(const dir of ['src','scripts','tests','.agents/skills/gamestudio','public/icons/a-gold-seal-v1','public/social','public/audio','public/art/home-b','public/art/leaderboard-b','public/art/prototype-b','public/art/sicbo-board-b','public/art/baccarat-b','docs/play'])await gather(dir);
files.push('docs/manifest.webmanifest','docs/index.html','docs/.nojekyll','public/art/styles/b/lobby-populated-v4.png','public/art/styles/b/lobby-background.png','public/art/styles/b/asset.json');
for(const entry of await readdir(path.join(root,'docs'),{withFileTypes:true}))if(entry.isFile()&&(entry.name.endsWith('.md')||entry.name.endsWith('_RELEASE.json')||['skill-installation.json','GITHUB_UPLOAD.json','LOCAL_FIVE_MINUTE_VALIDATION.json','HOME_SCREEN_VALIDATION.json','LOBBY_VIEW_VALIDATION.json','LOBBY_WIDE_VALIDATION.json','UI_POLISH_VALIDATION.json','LOAD_RECOVERY_VALIDATION.json','CHALLENGE_RECORD_VALIDATION.json','BLACKJACK_LANDSCAPE_VALIDATION.json','FEATURES_PAUSED_VALIDATION.json','BLACKJACK_OVAL_VALIDATION.json','BOOKMARK_ICON_VALIDATION.json','HOME_INSTALL_VALIDATION.json','SINGLE_CHALLENGE_VALIDATION.json','LEADERBOARD_PREREQUISITES_VALIDATION.json','LEADERBOARD_VALIDATION.json','LEADERBOARD_UI_VALIDATION.json'].includes(entry.name)))files.push(path.join('docs',entry.name));
const manifest=[];
for(const relative of [...new Set(files)].sort()){
  const source=path.join(root,relative),output=path.join(destination,relative),bytes=await readFile(source);
  await mkdir(path.dirname(output),{recursive:true});await copyFile(source,output);
  manifest.push({path:relative,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile(path.join(root,'dist/github-upload-manifest.json'),JSON.stringify({status:'repository_selected_pages_setup_pending',files:manifest},null,2)+'\n');
console.log(`GitHub source and Pages upload prepared: ${manifest.length} files (${manifest.reduce((n,f)=>n+f.bytes,0)} bytes).`);
