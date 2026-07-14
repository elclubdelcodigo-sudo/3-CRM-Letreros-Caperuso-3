const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const targetStr = `        <div class="card" style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1.5rem; color: var(--primary);">DATOS DEL CLIENTE</h3>
            <div class="grid grid-2">`;

const replaceStr = `        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: var(--primary);">DATOS DEL CLIENTE</h3>
                <button type="button" class="btn btn-outline btn-sm" onclick="openClientSelectorModal()">
                    <i class="fas fa-search"></i> Buscar Cliente Registrado
                </button>
            </div>
            <div class="grid grid-2">`;

appJs = appJs.replace(targetStr, replaceStr);
appJs = appJs.replace(targetStr, replaceStr); // Run again just in case there are multiple, wait it's just one string

fs.writeFileSync('app.js', appJs);
console.log('Quoter button added.');
