const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(/--primary: #6366f1;/, '--primary: #ff0066;');
indexHtml = indexHtml.replace(/--primary-rgb: 99, 102, 241;/, '--primary-rgb: 255, 0, 102;');
indexHtml = indexHtml.replace(/--primary-dark: #4f46e5;/, '--primary-dark: #cc0052;');
indexHtml = indexHtml.replace(/--secondary: #818cf8;/, '--secondary: #ff3385;');
indexHtml = indexHtml.replace(/--secondary-rgb: 129, 140, 248;/, '--secondary-rgb: 255, 51, 133;');
indexHtml = indexHtml.replace(/--accent: #6366f1;/, '--accent: #ff0066;');

fs.writeFileSync('index.html', indexHtml);
console.log('Patched colors');
