const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

let newTableHead = `                        <th>Ítem</th>
                        <th>Descripción</th>
                        <th>Cant.</th>
                        <th>Placa</th>
                        <th>Adhesivo</th>
                        <th>Laminado</th>
                        <th>Anclaje</th>
                        <th style="text-align:right">Unitario (Neto)</th>
                        <th style="text-align:right">Total (Neto)</th>`;

appJs = appJs.replace(/<th>Ítem<\/th>[\s\S]*?<th style="text-align:right">Total<\/th>/, newTableHead);

const oldItemRow = `                <td style="text-align:right">\${formatPrecio(item.detalles.precioFinalPorUnidad)}</td>
                <td style="text-align:right">\${formatPrecio(Math.round(item.precio / (1 + ivaRate)))}</td>
                <td style="text-align:right; font-weight:700">\${formatPrecio(item.precio)}</td>`;

const newItemRow = `                <td style="text-align:right">\${formatPrecio(Math.round(item.detalles.precioFinalPorUnidad / (1 + ivaRate)))}</td>
                <td style="text-align:right; font-weight:700">\${formatPrecio(Math.round(item.precio / (1 + ivaRate)))}</td>`;

appJs = appJs.replace(oldItemRow, newItemRow);

fs.writeFileSync('app.js', appJs);
console.log('Patched quotation table for Neto only.');
