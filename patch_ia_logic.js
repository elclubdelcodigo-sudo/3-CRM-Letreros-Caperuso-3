const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const loadQuotTableRegex = /function loadQuotationsTable\(\) \{[\s\S]*?\}/;
// Actually, let's just patch loadQuotationForIA and generateIAPageMessage directly

const oldGenerateFn = appJs.match(/async function generateIAPageMessage\(\) \{[\s\S]*?output\.value = "Error: " \+ err\.message;\s*\n\s*\}\s*\n\s*if \(btn\) btn\.disabled = false;\s*\n\}/)[0];

const newGenerateFn = `async function generateIAPageMessage() {
    const output = document.getElementById('iaOutputBody');
    const logArea = document.getElementById('iaNeuralLogContent');
    const btn = document.getElementById('generateIAMsgBtn');
    
    if(!output) return;
    
    const msgType = document.getElementById('iaMsgType').value;
    const recipient = document.getElementById('iaOutputRecipient').value || 'Cliente';
    const channel = document.getElementById('iaMessageChannel').value;
    const quotation = window.currentIAQuotation;
    
    output.value = "Generando mensaje...";
    if (logArea) logArea.innerHTML += "<br>[SYS] Contactando red neuronal (Gemini 1.5 Flash-8B)...";
    if (btn) btn.disabled = true;
    
    try {
        let typeText = "";
        if (msgType === "venta") typeText = "un mensaje de venta persuasivo pero corto";
        else if (msgType === "soporte") typeText = "un mensaje de soporte técnico/amable";
        else if (msgType === "cobranza") typeText = "un mensaje de seguimiento de cobranza amable pero firme";
        
        let qData = "";
        if (quotation) {
            qData = \`\\nDatos de la cotización: #\${quotation.numero}, Total: \${formatPrecio(quotation.total)}, Cliente: \${quotation.cliente?.nombre || 'Cliente'}\`;
        }
        
        const prompt = \`Genera \${typeText} para enviarlo por \${channel} a \${recipient}. \${qData}. Escribe únicamente el texto del mensaje, directo al grano, simple y corto, sin texto adicional.\`;
        
        const response = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt,
                systemInstruction: "Eres un asistente de ventas de Letreros Caperuso. Crea respuestas simples, muy simples, ligeras."
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Error en el servidor");
        }
        
        output.value = data.result;
        if (logArea) logArea.innerHTML += "<br>[SYS] <span style='color:#00ff88'>Protocolo Completado.</span>";
        
    } catch (err) {
        console.error(err);
        output.value = "Error: " + err.message;
    }
    
    if (btn) btn.disabled = false;
}`;

appJs = appJs.replace(oldGenerateFn, newGenerateFn);


const oldLoadQuotFn = `function loadQuotationForIA() {
    console.log("Cotización cargada para IA");
}`;

const newLoadQuotFn = `function loadQuotationForIA() {
    const select = document.getElementById('iaQuotationSelect');
    const preview = document.getElementById('iaQuotationPreview');
    const id = select.value;
    
    if (!id) {
        window.currentIAQuotation = null;
        preview.style.display = 'none';
        return;
    }
    
    const quotation = CRM.quotations.find(q => q.id === id);
    if (quotation) {
        window.currentIAQuotation = quotation;
        document.getElementById('iaPreviewClient').textContent = quotation.cliente?.nombre || 'Sin cliente';
        document.getElementById('iaPreviewTotal').textContent = formatPrecio(quotation.total);
        document.getElementById('iaPreviewItems').textContent = \`Cotización #\${quotation.numero} - \${quotation.items?.length || 0} items\`;
        preview.style.display = 'block';
    } else {
        window.currentIAQuotation = null;
        preview.style.display = 'none';
    }
}`;

appJs = appJs.replace(oldLoadQuotFn, newLoadQuotFn);


// Also need to populate the IA Quotation Select when the page loads or when entering the section
const targetNavigate = `        case 'mensajeria-ia':
            // Logic for IA page
            break;`;

const newNavigate = `        case 'mensajeria-ia':
            populateIAQuotationSelect();
            break;`;
appJs = appJs.replace(targetNavigate, newNavigate);

// Add populateIAQuotationSelect function
const populateFn = `
function populateIAQuotationSelect() {
    const select = document.getElementById('iaQuotationSelect');
    if (!select) return;
    
    // Clear existing except first
    select.innerHTML = '<option value="">-- Buscar Cotización --</option>';
    
    CRM.quotations.forEach(q => {
        const option = document.createElement('option');
        option.value = q.id;
        option.textContent = \`#\${q.numero} - \${q.cliente?.nombre || 'Sin cliente'} (\${formatPrecio(q.total)})\`;
        select.appendChild(option);
    });
}
`;
appJs += populateFn;

fs.writeFileSync('app.js', appJs);
console.log('IA logic patched');
