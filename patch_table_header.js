const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldTableHead = `        .table thead {
            background: var(--gradient-1);
        }`;

const newTableHead = `        .table thead {
            background: rgba(15, 23, 42, 0.5); /* slate-900/50 */
            border-bottom: 1px solid var(--border-color);
        }`;

html = html.replace(oldTableHead, newTableHead);

const oldTableTh = `        .table thead th {
            padding: 1rem;
            text-align: left;
            color: var(--white);
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }`;

const newTableTh = `        .table thead th {
            padding: 1rem;
            text-align: left;
            color: var(--gray);
            font-weight: 700;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }`;

html = html.replace(oldTableTh, newTableTh);

fs.writeFileSync('index.html', html);
console.log('Table header patched');
