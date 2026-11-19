
const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'app.js',
  'data.js',
  'icons.js',
  'theme.js',
  'style.css',
  'splash.png',
  'icon-only.png',
  'icon-background.png',
  'icon-foreground.png'
];

fs.rmSync('www', { recursive: true, force: true });
fs.mkdirSync('www', { recursive: true });

for (const file of files) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('www', file));
  }
}

console.log('Web application built successfully.');
