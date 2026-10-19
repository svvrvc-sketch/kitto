const fs = require('fs');
const path = require('path');
const pkgs = new Set();
function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) scan(p);
    else if (/\.(ts|tsx|js|jsx)$/.test(f)) {
      const content = fs.readFileSync(p, 'utf8');
      const matches = content.matchAll(/from\s+['"]([^'./][^'"]*)['"]/g);
      for (const m of matches) {
        const parts = m[1].split('/');
        pkgs.add(parts[0].startsWith('@') ? parts[0] + '/' + parts[1] : parts[0]);
      }
    }
  }
}
scan('src');
console.log('Detected packages in src:', Array.from(pkgs));
