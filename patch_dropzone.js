const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldColumnCss = `        .pipeline-column {
            flex: 1;
            min-width: 300px;
            background: var(--bg-secondary);
            border-radius: 16px;
            padding: 1rem;
            border: 1px solid var(--border-color);
        }`;

const newColumnCss = `        .pipeline-column {
            flex: 1;
            min-width: 300px;
            background: var(--bg-secondary);
            border-radius: 16px;
            padding: 1rem;
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
        }
        .pipeline-drop-zone {
            flex: 1;
            min-height: 150px;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding-bottom: 2rem;
            transition: all 0.2s ease;
        }`;

html = html.replace(oldColumnCss, newColumnCss);
fs.writeFileSync('index.html', html);
console.log('patched index.html drop zone');
