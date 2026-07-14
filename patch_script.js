const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const regex = /if \(quotation && quotation.items && quotation.items.length > 0\) \{[\s\S]*?\} else \{/;
const newCode = `if (quotation && quotation.items && quotation.items.length > 0) {
        template += \`A continuación se detallan los productos y servicios cotizados:

\`;
        quotation.items.forEach(item => {
            const dim = item.dimensiones ? \` de \${item.dimensiones}\` : '';
            const desc = item.nombre ? item.nombre : 'Producto';
            const cantidad = item.cantidad ? item.cantidad : 1;
            
            let detStr = [];
            if(item.detalles) {
                if(item.detalles.placa && item.detalles.placa.tipo && item.detalles.placa.tipo !== 'SIN PLACA') {
                    detStr.push(\`placa de \${item.detalles.placa.tipo}\`);
                }
                if(item.detalles.adhesivo && item.detalles.adhesivo.tipo && item.detalles.adhesivo.tipo !== 'SIN ADHESIVO') {
                    detStr.push(\`adhesivo \${item.detalles.adhesivo.tipo}\`);
                }
                if(item.detalles.laminado && item.detalles.laminado.tipo && item.detalles.laminado.tipo !== 'SIN LAMINADO') {
                    detStr.push(\`laminado \${item.detalles.laminado.tipo}\`);
                }
                if(item.detalles.anclaje && item.detalles.anclaje.tipo && item.detalles.anclaje.tipo !== 'SIN ANCLAJE') {
                    detStr.push(\`\${item.detalles.anclaje.tipo.toLowerCase()}\`);
                }
            }
            
            const detallesTexto = detStr.length > 0 ? \` fabricado en \${detStr.join(', ')}\` : '';
            
            template += \`- \${cantidad}x \${desc}\${dim}\${detallesTexto}. Valor Total: \${formatPrecio(item.precio || item.total || item.precioTotal)}
\`;
        });
        template += \`\\n\`;
    } else {`;

if (regex.test(appJs)) {
    appJs = appJs.replace(regex, newCode);
    fs.writeFileSync('app.js', appJs);
    console.log("Successfully replaced script generation logic.");
} else {
    console.log("Regex not found.");
}
