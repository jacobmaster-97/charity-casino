import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json','.zip':'application/zip'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const relative=pathname.startsWith('/art/')?`public${pathname}`:pathname==='/'?'index.html':pathname.replace(/^\//,'');
    if(!/^(index\.html|src\/[\w.-]+|public\/art\/[\w./-]+)$/.test(relative)||relative.includes('..'))throw new Error('not found');
    const file=path.resolve(root,relative);if(!(await stat(file)).isFile())throw new Error('not found');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(await readFile(file));
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
const port=Number(process.env.PORT||4173);
server.on('error',error=>{process.stderr.write(`Unable to start local preview: ${error.code||error.message}\n`);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>process.stdout.write(`Local: http://127.0.0.1:${port}\n`));
