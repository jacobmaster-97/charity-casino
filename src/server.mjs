import http from 'node:http';
import {createReadStream} from 'node:fs';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.ico':'image/vnd.microsoft.icon','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json','.json':'application/json','.zip':'application/zip'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const relative=pathname.startsWith('/art/')?`public${pathname}`:pathname==='/'?'index.html':pathname.replace(/^\//,'');
    if(!/^(index\.html|manifest\.webmanifest|src\/[\w.-]+|public\/(?:art|icons|audio|social)\/[\w./-]+)$/.test(relative)||relative.includes('..'))throw new Error('not found');
    const file=path.resolve(root,relative);if(!(await stat(file)).isFile())throw new Error('not found');
    if(path.extname(file)==='.mp3'){
      const size=(await stat(file)).size,headers={'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'};
      let start=0,end=size-1,status=200;
      if(req.headers.range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
        start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
        status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
      }
      headers['Content-Length']=end-start+1;res.writeHead(status,headers);
      if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);return;
    }
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(await readFile(file));
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
const port=Number(process.env.PORT||4173);
server.on('error',error=>{process.stderr.write(`Unable to start local preview: ${error.code||error.message}\n`);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>process.stdout.write(`Local: http://127.0.0.1:${port}\n`));
