import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {HOME_ART,homeView,homeLayout,fitHomeSurface,homeDialogView,homeInstallInfo} from '../src/home-view.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,cls='',extra='')=>`<button type="button" data-action="${action}" class="${cls}" ${extra}>${label}</button>`;
const args={kind:'start',name:'玩家',mode:'race',save:null,legacy:null,warning:'',button,escape,money:v=>'$'+v,soundControls:()=>'<button data-action="sound">音效</button>'};
test('approved home uses five actual named buttons, separate artwork and no removed footer or inline form',()=>{
 const html=homeView({art:p=>p});assert.deepEqual([...html.matchAll(/data-action="(home-[^"]+)"/g)].map(m=>m[1]),['home-start','home-rank','home-settings','home-install','home-support']);for(const name of ['開始遊戲','賭神龍虎榜','設定','加到主頁面','支持作者'])assert.ok(html.includes(name));assert.ok(html.includes('alt="五分鐘賭神"'));assert.ok(!/\$100|五分鐘決勝|賭王|慈善大賽|start-form|<canvas|<iframe/.test(html));assert.ok(html.includes(HOME_ART.background)&&html.includes(HOME_ART.logo));
});
test('wide title composition keeps its aspect and fits desktop, phone and tablet without cropping the logical canvas',()=>{
 for(const [w,h] of [[568,320],[667,375],[844,390],[915,412],[1024,768],[1366,768],[1920,1080]]){const l=homeLayout(w,h);assert.ok(l.width<=w+1e-6&&l.height<=h+1e-6);assert.ok(l.left>=-1e-6&&l.top>=-1e-6);assert.ok(Math.abs(l.width/l.height-l.viewWidth/1080)<1e-6);assert.ok(l.viewWidth>=1920);if(w/h>=16/9)assert.ok(Math.abs(l.height-h)<1e-6);else assert.ok(Math.abs(l.width-w)<1e-6);}
});
test('invalid viewport measurements leave title geometry alone until measurable',()=>{
 for(const [w,h] of [[0,10],[10,0],[-1,10],[Infinity,100],[100,NaN]])assert.equal(homeLayout(w,h),null);assert.equal(fitHomeSurface({querySelector:()=>null}),false);
 const root={querySelector:s=>s==='.home-safe-area'?{clientWidth:0,clientHeight:300}:{style:{setProperty(){assert.fail('should not write invalid layout');}}}};assert.equal(fitHomeSurface(root),false);
});
test('real home fitting writes the measured available area and reacts to orientation-size changes',()=>{
 const styles={},safe={clientWidth:844,clientHeight:390},scene={style:{setProperty:(k,v)=>styles[k]=v}},root={querySelector:s=>s==='.home-safe-area'?safe:scene};assert.equal(fitHomeSurface(root),true);assert.ok(Math.abs(parseFloat(styles['--home-width'])-844)<.01);assert.ok(Math.abs(parseFloat(styles['--home-height'])-390)<.01);safe.clientWidth=1024;safe.clientHeight=768;fitHomeSurface(root);assert.equal(styles['--home-top'],'96px');assert.equal(styles['--home-height'],'576px');
});
test('start dialog safely escapes names and storage warnings and offers only real saved continuation',()=>{
 let html=homeDialogView({...args,name:'"><script>',warning:'<error>'});assert.ok(html.includes('&quot;&gt;&lt;script&gt;'));assert.ok(html.includes('&lt;error&gt;'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('data-action="continue"'));html=homeDialogView({...args,save:{profile:{bank:10000}}});assert.ok(html.includes('data-action="continue"'));assert.ok(html.includes('aria-labelledby="home-dialog-title"'));
});
test('settings keeps old-save export available only when a legacy save exists',()=>{
 let html=homeDialogView({...args,kind:'settings'});assert.ok(html.includes('data-action="import"'));assert.ok(html.includes('data-action="sound"'));assert.ok(!html.includes('export-legacy'));html=homeDialogView({...args,kind:'settings',legacy:{}});assert.ok(html.includes('export-legacy'));
});
test('leaderboard and support entrances disclose unavailability without fake scores, payments or links',()=>{
 const rank=homeDialogView({...args,kind:'rank'}),support=homeDialogView({...args,kind:'support'});assert.ok(rank.includes('尚未開放')&&rank.includes('不會上傳'));assert.ok(support.includes('連結尚未開放'));assert.ok(!/href=|https:|<table|<form|付款|data-action="enter"/.test(rank+support));assert.equal(homeDialogView({...args,kind:'unknown'}),'');
});
test('production title artwork matches the recorded approved SHA without requiring preview files',async()=>{
 const approved=JSON.parse(await readFile(new URL('../public/art/home-b/assets.json',import.meta.url),'utf8'));
 assert.equal(approved.pixel_changes,false);assert.deepEqual(approved.assets.map(a=>a.file),['background.png','logo.png']);
 for(const asset of approved.assets){const bytes=await readFile(new URL('../public/art/home-b/'+asset.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
});

test('five landscape menu rows fit measured phone safe areas with 44px targets',()=>{
 for(const [width,height] of [[568,299],[667,320],[740,300],[814,354],[814,409],[932,430],[1920,1080]]){
  const styles={},scene={dataset:{},style:{setProperty:(k,v)=>styles[k]=v}},root={querySelector:s=>s==='.home-safe-area'?{clientWidth:width,clientHeight:height}:scene};fitHomeSurface(root);
  const top=parseFloat(styles['--home-menu-top']),button=parseFloat(styles['--home-menu-button-height']),gap=parseFloat(styles['--home-menu-gap']),sceneHeight=parseFloat(styles['--home-height']);
  assert.ok(button>=44);assert.ok(gap>=4);assert.ok(top>=0&&top+5*button+4*gap+6<=sceneHeight);
 }
});
test('home-screen guide detects Safari, Chrome, iPad desktop UA and unknown embedded browsers',()=>{
 assert.deepEqual(homeInstallInfo({userAgent:'Mozilla iPhone Safari/605.1',protocol:'https:'}),{browser:'safari',device:'ios',installed:false,local:false});
 assert.equal(homeInstallInfo({userAgent:'iPhone CriOS/140 Safari/605.1'}).browser,'chrome');assert.equal(homeInstallInfo({userAgent:'Android Chrome/140 Safari/537'}).browser,'chrome');
 assert.equal(homeInstallInfo({userAgent:'Macintosh Safari/605',platform:'MacIntel',maxTouchPoints:5}).device,'ios');
 for(const ua of ['iPhone FxiOS/140 Safari/605','Android Chrome/140 MicroMessenger','Android Chrome/140 Edg/140','unknown'])assert.equal(homeInstallInfo({userAgent:ua}).browser,null);
 assert.equal(homeInstallInfo({standalone:true}).installed,true);assert.equal(homeInstallInfo({displayStandalone:true}).installed,true);assert.equal(homeInstallInfo({protocol:'file:'}).local,true);
});
test('Safari and iPhone Chrome guide renders the requested steps and selectable browser controls',()=>{
 const safari=homeDialogView({...args,kind:'install',installInfo:{browser:'safari',device:'ios'}}),chrome=homeDialogView({...args,kind:'install',installInfo:{browser:'chrome',device:'ios'}});
 assert.equal((safari.match(/<li>/g)||[]).length,3);assert.ok(safari.includes('點選「分享」按鈕'));assert.ok(safari.includes('開啟為網頁 App'));assert.ok(safari.includes('data-browser="safari" aria-pressed="true"'));
 assert.equal((chrome.match(/<li>/g)||[]).length,4);assert.ok(chrome.includes('右上角「分享」'));assert.ok(chrome.includes('右下角「新增」'));assert.ok(chrome.includes('data-browser="chrome" aria-pressed="true"'));
 const changed=homeDialogView({...args,kind:'install',installInfo:{browser:'safari',device:'ios'},installBrowser:'chrome'});assert.ok(changed.includes('右下角「新增」'));
});
test('Android, standalone and local-file instructions remain honest without invoking native APIs',()=>{
 const android=homeDialogView({...args,kind:'install',installInfo:{browser:'chrome',device:'android'}});assert.ok(android.includes('「⋮」選單'));assert.ok(android.includes('安裝應用程式'));
 const installed=homeDialogView({...args,kind:'install',installInfo:{installed:true}});assert.ok(installed.includes('無需再次加入'));assert.ok(!installed.includes('<ol'));
 const local=homeDialogView({...args,kind:'install',installInfo:{local:true}});assert.ok(local.includes('開啟網頁版'));assert.ok(!local.includes('beforeinstallprompt'));
});
