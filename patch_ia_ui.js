const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<div class="form-group">\s*<label class="form-label-premium">ESTRATEGIA \(FRAMEWORK\)[\s\S]*?<\/select>\s*<\/div>\s*<div style="margin-top: auto;/;
const replacement = `<div style="margin-top: auto;`;

html = html.replace(regex, replacement);

const typeRegex = /<select id="iaMsgType" class="form-control" style="background: rgba\(0,0,0,0.3\);">[\s\S]*?<\/select>/;
const newTypes = `<select id="iaMsgType" class="form-control" style="background: rgba(0,0,0,0.3);">
                                <option value="venta">🚀 Mensaje de Venta</option>
                                <option value="soporte">🛠️ Mensaje de Soporte</option>
                                <option value="cobranza">💰 Seguimiento de Cobranza</option>
                            </select>`;

html = html.replace(typeRegex, newTypes);

fs.writeFileSync('index.html', html);
console.log('IA UI patched');
