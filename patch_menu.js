const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('Mensajería IA®', 'Mensajes de Venta');
html = html.replace('<i class="fas fa-robot"></i> Mensajería IA', '<i class="fas fa-envelope-open-text"></i> Mensajes de Venta');
html = html.replace('openAIMessageCenter', 'openSalesMessageCenter');
html = html.replace('openAIMessageCenter', 'openSalesMessageCenter');

fs.writeFileSync('index.html', html);

let js = fs.readFileSync('app.js', 'utf8');
js = js.replace(/function openAIMessageCenter\(\) \{[\s\S]*?\}/, `
function openSalesMessageCenter(quotationId = null) {
    showPage('mensajeria-ia');
    if (quotationId) {
        setTimeout(() => {
            const select = document.getElementById('iaQuotationSelect');
            if (select) {
                select.value = quotationId;
                loadQuotationForIA();
            }
        }, 100);
    }
}
`);
fs.writeFileSync('app.js', js);
console.log('Renamed menu and functions.');
