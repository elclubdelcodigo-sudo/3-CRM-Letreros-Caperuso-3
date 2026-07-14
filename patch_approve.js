const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const oldApproveCode = `    // Add to pipeline if not already there
    const existingInPipeline = CRM.pipeline.find(p => p.quotationId === id);
    if (!existingInPipeline) {
        CRM.pipeline.push({
            id: generateId(),
            quotationId: id,
            stage: 'Cotizacion',
            cliente: quotation.cliente?.nombre || 'Sin cliente',
            total: quotation.total,
            fecha: new Date().toISOString()
        });
    }`;

const newApproveCode = `    // Add to pipeline or advance if already there
    const existingInPipeline = CRM.pipeline.find(p => p.quotationId === id);
    if (!existingInPipeline) {
        CRM.pipeline.push({
            id: generateId(),
            quotationId: id,
            stage: 'Fabricacion', // Advancing to Fabricacion since it's approved
            cliente: quotation.cliente?.nombre || 'Sin cliente',
            total: quotation.total,
            fecha: new Date().toISOString()
        });
    } else {
        // Advance it in the pipeline
        existingInPipeline.stage = 'Fabricacion';
    }`;

appJs = appJs.replace(oldApproveCode, newApproveCode);
fs.writeFileSync('app.js', appJs);
console.log('approveQuotation patched in app.js');
