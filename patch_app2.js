const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

js = js.replace(/    \/\/ Confirm approval[\s\S]*?    if \(\!confirm\(confirmMessage\)\) \{\s*return;\s*\}/, '');
fs.writeFileSync('app.js', js);
console.log('Patched');
