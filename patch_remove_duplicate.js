const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(/<!-- New Task Modal -->\s*<div id="newTaskModal" class="modal">[\s\S]*?<\/form>\s*<\/div>\s*<\/div>\s*<\/div>/g, '');

fs.writeFileSync('index.html', indexHtml);
console.log('Removed duplicate modals');
