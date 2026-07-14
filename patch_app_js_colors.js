const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace(/--primary: #6366f1;/g, '--primary: #ff0066;');
appJs = appJs.replace(/rgba\(99, 102, 241/g, 'rgba(255, 0, 102');
appJs = appJs.replace(/rgba\(100, 108, 255/g, 'rgba(255, 0, 102');

fs.writeFileSync('app.js', appJs);
console.log('Patched app.js');
