const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the neuroFab onclick
html = html.replace(/onclick="openModal\('aiMessageCenterModal'\)"/g, `onclick="openSalesMessageCenter()"`);

// Change the FAB icon and title
html = html.replace('<i class="fas fa-brain"></i>', '<i class="fas fa-magic"></i>');
html = html.replace('<div class="neuro-fab-tooltip">Asistente IA</div>', '<div class="neuro-fab-tooltip">Mensajes de Venta</div>');

fs.writeFileSync('index.html', html);
console.log('Patched FAB.');
