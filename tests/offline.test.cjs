const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('offline shell includes every script, manifest and icon and serves nested Pages scope',async()=>{
 const handlers={},entries=new Map(),scope='https://example.test/cpu-powtorka/';let network=0,claimed=false,deleted=[];
 const cache={async addAll(files){for(const f of files){const local=f==='./'?'index.html':f.split('?')[0];assert.ok(fs.existsSync(path.join(__dirname,'..',local)),local);entries.set(new URL(f,scope).pathname,{body:local});}},async match(req){return entries.get(new URL(req.url).pathname);}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8'),{URL,self:{registration:{scope},clients:{claim:async()=>{claimed=true;}},addEventListener:(n,f)=>handlers[n]=f},caches:{open:async()=>cache,keys:async()=>['powtorka-v7','powtorka-v8','unrelated'],delete:async k=>deleted.push(k)},fetch:async()=>{network++;throw Error('Offline');}});
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;handlers.activate({waitUntil:p=>pending=p});await pending;assert.ok(claimed);assert.deepEqual(deleted,['powtorka-v7']);
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const scripts=[...html.matchAll(/src="([^"]+)"/g)].map(m=>m[1]);
 for(const f of ['','index.html',...scripts,'styles.css?v=8.0','manifest.webmanifest','icon-192.png','icon-512.png']){let response;handlers.fetch({request:{method:'GET',url:scope+f},respondWith:p=>response=p});assert.ok((await response).body);}
 let intercepted=false;handlers.fetch({request:{method:'GET',url:'https://github.com/issues'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);assert.equal(network,0);
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../manifest.webmanifest'),'utf8'));assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.display,'standalone');assert.ok(manifest.icons.some(i=>i.sizes==='512x512'));
});
