const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldHeaderStyle = `        .page-header {
            background: var(--bg-card);
            backdrop-filter: blur(10px);
            padding: 1.5rem 2rem;
            border-radius: 16px;
            box-shadow: var(--shadow-lg);
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid var(--border-color);
        }`;

const newHeaderStyle = `        .page-header {
            background: transparent;
            padding: 0 0 1.5rem 0;
            border-radius: 0;
            box-shadow: none;
            margin-bottom: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: none;
            border-bottom: 1px solid var(--border-color);
        }`;

html = html.replace(oldHeaderStyle, newHeaderStyle);

// Also remove border-radius and shadow from table container if it should be flat, but the design HTML shows:
// border border-slate-800 shadow-2xl rounded-xl
// The existing app has: background: var(--bg-elevated); border-radius: 16px; box-shadow: var(--shadow-md); border: 1px solid var(--border-color);
// That matches the design nicely!

fs.writeFileSync('index.html', html);
console.log('Page header patched');
