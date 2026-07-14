const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const oldPipeline = `    const pipelineCtx = document.getElementById('reportPipelineChart');
    if (pipelineCtx) {
        const stages = ['lead', 'contact', 'proposal', 'negotiation'];
        const stageNames = ['Lead', 'Contacto', 'Propuesta', 'Negociación'];`;

const newPipeline = `    const pipelineCtx = document.getElementById('reportPipelineChart');
    if (pipelineCtx) {
        const stages = ['Cotizacion', 'Negociacion', 'Fabricacion', 'PendienteDePago', 'Terminado', 'Perdido'];
        const stageNames = ['Cotización', 'Negociación', 'Fabricación', 'Pendiente de Pago', 'Terminado', 'Perdido'];`;

appJs = appJs.replace(oldPipeline, newPipeline);

fs.writeFileSync('app.js', appJs);
console.log('Fixed pipeline stages in reports');
