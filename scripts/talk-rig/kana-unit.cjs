const path=require('path'); const http=require('http'); const fs=require('fs');
const {chromium}=require(path.resolve('C:/Users/Julius/Documents/GitHub/node_modules/playwright'));
const ROOT='C:/Users/Julius/Documents/GitHub/japanese-trainer';
const srv=http.createServer((rq,rs)=>{ const f=path.join(ROOT, rq.url==='/'?'/index.html':rq.url.split('?')[0]); fs.readFile(f,(e,d)=>{ if(e){rs.writeHead(404);rs.end();return;} rs.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); rs.end(d); }); });
(async()=>{ await new Promise(r=>srv.listen(8996,r)); const b=await chromium.launch({args:['--mute-audio']}); const p=await b.newPage();
 await p.addInitScript(()=>{ try{ speechSynthesis.speak=()=>{}; speechSynthesis.cancel=()=>{}; }catch(e){} });
 await p.goto('http://localhost:8996/index.html',{waitUntil:'load'}); await p.waitForTimeout(2000);
 const out=await p.evaluate(()=>['こんにちは、元気ですか?','お元気ですか','行ってきます、ありがとう','私は学生です','hello 元気 world'].map(x=>x+'  ->  '+_talkKana(x)));
 console.log(out.join('\n')); await b.close(); srv.close(); })();
