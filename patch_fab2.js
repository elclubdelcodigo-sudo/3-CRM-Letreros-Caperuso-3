const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('<span class="neuro-fab-text">IA</span>', '<span class="neuro-fab-text">MSG</span>');
fs.writeFileSync('index.html', html);
console.log('Patched FAB text.');
