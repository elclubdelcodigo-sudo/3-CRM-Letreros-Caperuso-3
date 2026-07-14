const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

js = js.replace(/rgba\(153, 50, 204, 0.8\)/g, 'rgba(99, 102, 241, 0.8)');
js = js.replace(/rgba\(29, 162, 245, 0.8\)/g, 'rgba(96, 165, 250, 0.8)');
js = js.replace(/rgba\(255, 0, 85, 0.8\)/g, 'rgba(79, 70, 229, 0.8)');
js = js.replace(/rgba\(0, 212, 170, 0.8\)/g, 'rgba(52, 211, 153, 0.8)');
js = js.replace(/--primary: #ff0055;/g, '--primary: #6366f1;');

fs.writeFileSync('app.js', js);
console.log('app.js patched');
