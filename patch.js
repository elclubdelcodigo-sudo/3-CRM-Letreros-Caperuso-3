const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `        <div style="padding: 1rem 1.5rem; margin-top: auto;">
            <button class="btn btn-primary" id="downloadAppBtn"
                style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; background: var(--gradient-1); color: #fff; border:none;">
                <i class="fas fa-download"></i> Descargar App®
            </button>
            <div
                style="display: flex; align-items: center; gap: 8px; margin-top: 1.5rem; font-size: 0.7rem; color: var(--text-secondary);">
                <div class="sync-dot success" id="syncDot"></div>
                <span id="syncStatusText">Nube Conectada</span>
            </div>
        </div>`;

if (html.includes(target)) {
    html = html.replace(target, '');
    fs.writeFileSync('index.html', html);
    console.log('Removed downloadAppBtn block.');
} else {
    console.log('Target not found.');
}
