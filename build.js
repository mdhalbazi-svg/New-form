const fs=require('fs');
const files=['index.html','app.js'];
fs.rmSync('www',{recursive:true,force:true});fs.mkdirSync('www',{recursive:true});
for(const f of files){if(!fs.existsSync(f))throw new Error('Missing '+f);fs.copyFileSync(f,'www/'+f)}
console.log('Web app built into www');
