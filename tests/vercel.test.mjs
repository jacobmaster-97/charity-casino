import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {buildVercel,vercelSiteURL} from '../scripts/vercel.mjs';
const root=path.resolve(import.meta.dirname,'..'),url='https://game-deployment.example/';
let report;
test('Vercel metadata uses a validated explicit or actual platform URL without guessing a domain',()=>{
 assert.equal(vercelSiteURL({SITE_URL:url,VERCEL_URL:'other.example'}),url);
 assert.equal(vercelSiteURL({VERCEL_PROJECT_PRODUCTION_URL:'game.example',VERCEL_URL:'preview.example'}),'https://game.example/');
 assert.equal(vercelSiteURL({VERCEL_URL:'preview.example'}),'https://preview.example/');
 for(const value of ['http://game.example','https://user:pass@game.example','https://game.example/path','https://game.example/?token=x','https://game.example/#x'])assert.throws(()=>vercelSiteURL({SITE_URL:value}));
 assert.throws(()=>vercelSiteURL({}));
});
test('Vercel exports only game runtime with unchanged assets and keeps the GitHub entry intact',async()=>{
 const source=await readFile(path.join(root,'index.html'));
 report=await buildVercel({SITE_URL:url});assert.equal(report.siteURL,url);assert.equal(report.files.filter(f=>f.path.startsWith('play/src/')).length,32);
 assert.deepEqual(await readFile(path.join(root,'index.html')),source);
 assert.ok(!report.files.some(f=>/cloudflare|wrangler|AGENTS|HANDOFF|tests|previews|\.env|server\.mjs|vercel\.json/.test(f.path)));
 for(const f of report.files){const bytes=await readFile(path.join(root,'dist/vercel',f.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);if(f.path.startsWith('play/'))assert.deepEqual(bytes,await readFile(path.join(root,'docs',f.path)));}
});
test('Vercel root manifest, game images and social URLs resolve at the deployed origin',async()=>{
 const html=await readFile(path.join(root,'dist/vercel/index.html'),'utf8');
 assert.ok(html.includes(`rel="canonical" href="${url}"`));
 assert.ok(html.includes(`property="og:url" content="${url}"`));
 assert.ok(html.includes(`property="og:image" content="${url}play/public/social/thumbnail-v4.png"`));
 assert.ok(html.includes(`name="twitter:image" content="${url}play/public/social/thumbnail-v4.png"`));
 assert.ok(!html.includes('jacobmaster-97.github.io'));
 const manifest=JSON.parse(await readFile(path.join(root,'dist/vercel/manifest.webmanifest'),'utf8'));assert.equal(manifest.start_url,'./');
 for(const icon of manifest.icons)assert.ok(report.files.some(f=>f.path===icon.src.slice(2)));
 const app=await readFile(path.join(root,'dist/vercel/play/src/app.mjs'),'utf8'),expression=app.match(/^const art=path=>(.*);$/m)[1];
 const resolve=new Function('path','moduleURL',`return (${expression.replaceAll('import.meta.url','moduleURL')});`);
 assert.equal(resolve('/art/home-b/logo.png',url+'play/src/app.mjs'),url+'play/public/art/home-b/logo.png');
});
test('Vercel configuration serves the isolated output without adding a backend or paid add-on',async()=>{
 const config=JSON.parse(await readFile(path.join(root,'vercel.json'),'utf8'));assert.equal(config.framework,null);assert.equal(config.outputDirectory,'dist/vercel');assert.equal(config.buildCommand,'npm run build:vercel');assert.ok(!config.functions&&!config.rewrites&&!config.crons);
 assert.ok((await readFile(path.join(root,'.gitignore'),'utf8')).includes('.vercel/'));
 assert.ok((await readFile(path.join(root,'.vercelignore'),'utf8')).includes('cloudflare/'));
 const worker=await readFile(path.join(root,'cloudflare/worker.mjs'),'utf8');assert.ok(worker.includes('allowed.includes(origin)'));assert.ok(!worker.includes('*.vercel.app'));
});

test('official analytics SDK only initializes at the configured Vercel origin and failures cannot block the game',async()=>{
 const {default:vm}=await import('node:vm');
 const html=await readFile(path.join(root,'dist/vercel/index.html'),'utf8');assert.match(html,/<script type="module" async src="\.\/analytics\.mjs\?v=2\.0\.1"><\/script>/);
 const source=await readFile(path.join(root,'dist/vercel/analytics.mjs'),'utf8');const executable=source.replace(/^export \{[\s\S]*?^\};/gm,'');
 for(const origin of [url.slice(0,-1),'https://jacobmaster-97.github.io','http://localhost:4173','null']){
  const scripts=[],logs=[],window={location:{origin}};const context=vm.createContext({window,document:{head:{querySelector:()=>scripts[0]||null,appendChild:s=>scripts.push(s)},createElement:()=>({dataset:{}})},console:{log:s=>logs.push(s)}});
  vm.runInContext(executable,context);vm.runInContext(executable,context);
  if(origin===url.slice(0,-1)){assert.equal(scripts.length,1);assert.equal(scripts[0].src,'/_vercel/insights/script.js');assert.equal(scripts[0].defer,true);assert.equal(scripts[0].dataset.sdkv,'2.0.1');assert.doesNotThrow(()=>scripts[0].onerror());assert.equal(logs.length,1);}else assert.equal(scripts.length,0);
 }
 assert.equal(report.analytics.customEvents,false);assert.equal(report.analytics.package,'@vercel/analytics');
 const sdk=await readFile(new URL(import.meta.resolve('@vercel/analytics')),'utf8');assert.ok(source.includes(sdk.replace(/^\/\/# sourceMappingURL=.*$/gm,'')));
 assert.equal(await readFile(path.join(root,'dist/vercel/analytics-LICENSE.txt'),'utf8'),await readFile(path.join(root,'node_modules/@vercel/analytics/LICENSE'),'utf8'));
});

test('analytics dependency is locked and never injected into GitHub Pages or the offline build',async()=>{
 const pkg=JSON.parse(await readFile(path.join(root,'package.json'))),lock=JSON.parse(await readFile(path.join(root,'package-lock.json')));assert.equal(pkg.dependencies['@vercel/analytics'],'^2.0.1');assert.equal(lock.packages['node_modules/@vercel/analytics'].version,'2.0.1');
 for(const file of ['index.html','docs/index.html','src/app.mjs']){const text=await readFile(path.join(root,file),'utf8');assert.ok(!text.includes('analytics.mjs'));assert.ok(!text.includes('/_vercel/insights'));}
 const prep=await readFile(path.join(root,'scripts/prepare-github.mjs'),'utf8');assert.ok(prep.includes("'package-lock.json'"));
});
