const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// Replace generateIAPageMessage with generateSalesScript
const jsFunction = `
function generateSalesScript() {
    const output = document.getElementById('iaOutputBody');
    const recipient = document.getElementById('iaOutputRecipient');
    const subject = document.getElementById('iaOutputSubject');
    
    if(!output) return;
    
    const scriptType = document.getElementById('scriptType').value;
    const quotation = window.currentIAQuotation;
    
    let clientName = quotation?.cliente?.nombre || 'Cliente';
    let qTotal = quotation ? formatPrecio(quotation.total) : '$0';
    let qNumber = quotation ? quotation.numero : '0000';
    
    if (quotation && quotation.cliente?.email) {
        recipient.value = quotation.cliente.email;
    }
    
    subject.value = \`Propuesta de Cotización #\${qNumber} - Letreros Caperuso\`;
    
    let template = \`Estimado/a \${clientName},

Esperando que se encuentre muy bien, le enviamos la información detallada correspondiente a la cotización #\${qNumber}.

\`;

    if (scriptType === 'acrilico') {
        template += \`Nuestro Letrero Acrílico 3D está fabricado con acrílico de alta densidad y corte láser de precisión, lo que garantiza bordes perfectos y una estética premium. 
- Material: Acrílico de 3mm a 5mm.
- Resistencia: Alta durabilidad en interiores y exteriores.
- Valor: Otorga una imagen corporativa moderna y elegante a su marca.

\`;
    } else if (scriptType === 'neon') {
        template += \`Nuestro Letrero Neón Flex es ideal para destacar. Utilizamos tecnología LED de bajo consumo recubierta en silicona flexible.
- Material: Neón Flex LED sobre base de acrílico transparente.
- Resistencia: Larga vida útil y bajo consumo eléctrico.
- Valor: Brinda un impacto visual vibrante y llamativo, perfecto para captar la atención.

\`;
    } else if (scriptType === 'tela') {
        template += \`Nuestro Letrero de Tela Tensada (Backlight) ofrece una iluminación uniforme y un acabado impecable sin uniones visibles en el frontal.
- Material: Tela sublimada de alta resolución con perfiles de aluminio.
- Resistencia: Colores vivos y sistema intercambiable fácil de renovar.
- Valor: Excelente para grandes formatos en interiores, entregando una calidad fotográfica inigualable.

\`;
    } else if (scriptType === 'metalico') {
        template += \`Nuestra Estructura Metálica está diseñada para soportar condiciones extremas y grandes formatos.
- Material: Acero galvanizado o fierro tratado con pintura anticorrosiva.
- Resistencia: Máxima solidez estructural ante vientos y clima.
- Valor: La opción más segura y duradera para letreros de gran escala y tótems corporativos.

\`;
    }

    template += \`El valor total de su cotización es de \${qTotal}.

Quedamos a su entera disposición para resolver cualquier duda o realizar ajustes si lo considera necesario.

Atentamente,
El Equipo de Ventas
Letreros Caperuso\`;

    output.value = template;
}
`;

appJs = appJs.replace(/async function generateIAPageMessage\(\) \{[\s\S]*?\}\s*\}\s*\}/, jsFunction);

fs.writeFileSync('app.js', appJs);
console.log('Successfully added generateSalesScript and removed generateIAPageMessage.');
