const fs=require('fs');
const path=require('path');
const required=['index.html','app.js'];
for(const f of required) if(!fs.existsSync(f)) throw new Error('Missing required file: '+f);
fs.rmSync('www',{recursive:true,force:true});
fs.mkdirSync('www',{recursive:true});
for(const f of fs.readdirSync('.')){
  if(['index.html','app.js','data.js','icons.js','theme.js','style.css','splash.png','splash-dark.png','icon-only.png','icon-background.png','icon-foreground.png'].includes(f)&&fs.statSync(f).isFile()) fs.copyFileSync(f,path.join('www',f));
}
if(!fs.existsSync('www/index.html')||!fs.existsSync('www/app.js')) throw new Error('Web build output incomplete');
console.log('Web application built successfully.');
