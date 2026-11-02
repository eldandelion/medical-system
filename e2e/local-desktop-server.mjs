// Loopback-only desktop UI server for disposable synthetic-data browser testing.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../frontend');
const require=createRequire(resolve(root,'package.json'));
const {createServer}=await import(require.resolve('vite'));
const backend=new URL(process.env.E2E_BACKEND_URL||'http://127.0.0.1:18080');
if(backend.protocol!=='http:'||backend.hostname!=='127.0.0.1'||backend.username||backend.password)throw Error('Loopback backend required');
const server=await createServer({root,configFile:resolve(root,'vite.config.ts'),server:{host:'127.0.0.1',port:13000,strictPort:true,proxy:{'/medical-system/api':{target:backend.origin,changeOrigin:true,rewrite:p=>p.replace(/^\/medical-system\/api/,'/api')},'/api':{target:backend.origin,changeOrigin:true}}}});
await server.listen();
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await server.close();process.exit(0);});
