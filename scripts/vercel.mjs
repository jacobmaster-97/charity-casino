import {readFile,writeFile,mkdir,copyFile,readdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {optimizeVercelAssets} from './optimize-vercel-assets.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function vercelSiteURL(env){
 const value=env.SITE_URL||env.VERCEL_PROJECT_PRODUCTION_URL||env.VERCEL_URL;
 if(!value)throw new Error('Set SITE_URL to the public HTTPS origin, or build inside Vercel with system environment variables enabled.');
 const url=new URL(value.includes('://')?value:'https://'+value);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/'||url.port)throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, port, query or hash.');
 return url.origin+'/';
}

export async function buildVercel(env=process.env){
 const siteURL=vercelSiteURL(env),output=path.join(root,'dist/vercel');
 const pages=spawnSync(process.execPath,[path.join(root,'scripts/pages.mjs')],{encoding:'utf8'});
 if(pages.status!==0)throw new Error(pages.stderr||'Pages asset export failed');
 await rm(output,{recursive:true,force:true});
 await mkdir(output,{recursive:true});
 const files=[];
 async function copyTree(relative){
  for(const entry of await readdir(path.join(root,'docs',relative),{withFileTypes:true})){
   const name=path.join(relative,entry.name);
   if(entry.isSymbolicLink())throw new Error('Refusing deployment symlink: '+name);
   if(entry.isDirectory())await copyTree(name);
   else if(entry.isFile()){
    if(!/\.(?:mjs|css|png|ico|webp|json|mp3)$/.test(name))throw new Error('Unexpected runtime asset: '+name);
    await mkdir(path.dirname(path.join(output,name)),{recursive:true});
    await copyFile(path.join(root,'docs',name),path.join(output,name));files.push(name);
   }
  }
 }
 await copyTree('play/src');
 const optimized=await optimizeVercelAssets(root,output,files);
 let html=await readFile(path.join(root,'docs/index.html'),'utf8');
 const oldSite=html.match(/<link rel="canonical" href="([^"]+)"/)[1];
 html=html.replaceAll(oldSite+'public/social/',siteURL+'play/public/social/').replaceAll(oldSite,siteURL);
 html=html.replace('</head>',`<script data-casino-assets>globalThis.__CASINO_ART=${JSON.stringify(optimized.map)};</script>\n</head>`);
 // Browser-ready official SDK; only Vercel output includes analytics, independent of the game.
 const analyticsEntry=fileURLToPath(import.meta.resolve('@vercel/analytics'));
 const analyticsRoot=path.resolve(path.dirname(analyticsEntry),'..');
 const analyticsPackage=JSON.parse(await readFile(path.join(analyticsRoot,'package.json'),'utf8'));
 const sdk=(await readFile(analyticsEntry,'utf8')).replace(/^\/\/# sourceMappingURL=.*$/gm,'');
 const analytics=`/* @vercel/analytics ${analyticsPackage.version}, MIT; see analytics-LICENSE.txt */\n${sdk}\nif(window.location.origin===${JSON.stringify(new URL(siteURL).origin)})inject({mode:'production'});\n`;
 await writeFile(path.join(output,'analytics.mjs'),analytics);files.push('analytics.mjs');
 await copyFile(path.join(analyticsRoot,'LICENSE'),path.join(output,'analytics-LICENSE.txt'));files.push('analytics-LICENSE.txt');
 html=html.replace('</head>',`<script type="module" async src="./analytics.mjs?v=${analyticsPackage.version}"></script>\n</head>`);
 await writeFile(path.join(output,'index.html'),html);files.push('index.html');
 await copyFile(path.join(root,'docs/manifest.webmanifest'),path.join(output,'manifest.webmanifest'));files.push('manifest.webmanifest');
 const manifest=[];
 for(const file of files.sort()){
  const bytes=await readFile(path.join(output,file));
  manifest.push({path:file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 }
 const report={siteURL,outputDirectory:'dist/vercel',optimization:optimized,analytics:{package:analyticsPackage.name,version:analyticsPackage.version,officialOrigin:new URL(siteURL).origin,customEvents:false},files:manifest};
 await writeFile(path.join(root,'dist/vercel-build.json'),JSON.stringify(report,null,2)+'\n');
 console.log(`Vercel static output: ${manifest.length} files; public metadata origin ${siteURL}`);
 return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await buildVercel();
