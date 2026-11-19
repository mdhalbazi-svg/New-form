const fs=require('fs'),path=require('path');
const out='www';fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
fs.copyFileSync('index.html',out+'/index.html');
function cp(s,d){fs.mkdirSync(d,{recursive:true});for(const f of fs.readdirSync(s)){const p=path.join(s,f);fs.statSync(p).isDirectory()?cp(p,path.join(d,f)):fs.copyFileSync(p,path.join(d,f));}}
cp('src',out+'/src');cp('public',out+'/public');
console.log('www ready');
