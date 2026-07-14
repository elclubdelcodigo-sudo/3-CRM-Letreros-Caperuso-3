const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(/--gradient-1: linear-gradient\(135deg, #4f46e5 0%, #6366f1 100%\);/, '--gradient-1: linear-gradient(135deg, #cc0052 0%, #ff0066 100%);');
indexHtml = indexHtml.replace(/#a5b4fc/, '#ffb3d9');
indexHtml = indexHtml.replace(/100, 108, 255/g, '255, 0, 102');
indexHtml = indexHtml.replace(/background: rgba\(99, 102, 241/g, 'background: rgba(255, 0, 102');

fs.writeFileSync('index.html', indexHtml);
console.log('Patched gradients');
