const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace(
    'title="Aprobar y Pasar a Pipeline"',
    'title="Aprobar"'
);

appJs = appJs.replace(
    /¿Deseas aprobar la Cotización #\${quotation.numero} de \${clientName} por \${formatPrecio\(quotation.total\)}\?\\n\\nEsta acción agregará la cotización al pipeline de ventas./,
    '¿Deseas aprobar la Cotización #${quotation.numero} de ${clientName} por ${formatPrecio(quotation.total)}?'
);

fs.writeFileSync('app.js', appJs);
console.log('Approve btn title and confirm message updated');
