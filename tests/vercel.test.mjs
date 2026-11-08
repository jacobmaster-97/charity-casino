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
