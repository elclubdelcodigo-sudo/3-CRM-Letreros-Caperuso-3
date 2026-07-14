const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const target = `    // Confirm approval
    const clientName = quotation.cliente?.nombre || 'Sin cliente';
    const confirmMessage = \`¿Deseas aprobar la Cotización #\${quotation.numero} de \${clientName} por \${formatPrecio(quotation.total)}?\`;
    
    if (!confirm(confirmMessage)) {
        return;
    }`;

if (js.includes(target)) {
    js = js.replace(target, '');
    fs.writeFileSync('app.js', js);
    console.log('Removed confirm dialog from approveQuotation.');
} else {
    console.log('Confirm dialog target not found.');
}
