
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

function copyDir(source, destination) {
  if (!fs.existsSync(source)) return;

  fs.mkdirSync(destination, { recursive: true });

  for (const file of fs.readdirSync(source)) {
    const src = path.join(source, file);
    const dest = path.join(destination, file);

    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

// Main HTML
if (!fs.existsSync(path.join(root, 'index.html'))) {
  throw new Error('index.html not found');
}

fs.copyFileSync(
  path.join(root, 'index.html'),
  path.join(out, 'index.html')
);

// Copy existing source folders
copyDir(
  path.join(root, 'src'),
  path.join(out, 'src')
);

copyDir(
  path.join(root, 'public'),
  path.join(out, 'public')
);

// Copy root application files
const extensions = [
  '.js', '.css', '.json',
  '.png', '.jpg', '.jpeg',
  '.webp', '.svg', '.ico',
  '.woff', '.woff2', '.ttf'
];

for (const file of fs.readdirSync(root)) {
  const source = path.join(root, file);

  if (
    fs.statSync(source).isFile() &&
    extensions.includes(path.extname(file).toLowerCase())
  ) {
    fs.copyFileSync(source, path.join(out, file));
  }
}

// Ensure src/style.css exists if stylesheet is in root
const rootStyle = path.join(root, 'style.css');
const srcStyle = path.join(out, 'src', 'style.css');

if (fs.existsSync(rootStyle) && !fs.existsSync(srcStyle)) {
  fs.mkdirSync(path.dirname(srcStyle), { recursive: true });
  fs.copyFileSync(rootStyle, srcStyle);
}

if (!fs.existsSync(path.join(out, 'index.html'))) {
  throw new Error('Web build failed');
}

console.log('Islamic Daily Diary: Web build successful');
