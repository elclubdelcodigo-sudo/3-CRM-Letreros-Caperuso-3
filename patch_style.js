const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const styleBlock = `
    <style id="focus-mode-styles">
        /* Focus mode styles for Approve button and Pipeline nav */
        main:nth-of-type(1) > section#quotations:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > table:nth-of-type(1) > tbody#quotationsTableBody:nth-of-type(1) > tr:nth-of-type(1) > td:nth-of-type(8) > button:nth-of-type(1) {
            transition: all 0.2s ease-in-out;
        }
        main:nth-of-type(1) > section#quotations:nth-of-type(3) > div:nth-of-type(2) > div:nth-of-type(1) > table:nth-of-type(1) > tbody#quotationsTableBody:nth-of-type(1) > tr:nth-of-type(1) > td:nth-of-type(8) > button:nth-of-type(1):hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4) !important;
        }
        aside:nth-of-type(1) > nav:nth-of-type(1) > div:nth-of-type(2) > a:nth-of-type(1) > span:nth-of-type(1) {
            font-weight: 500;
        }
        aside:nth-of-type(1) > nav:nth-of-type(1) > div:nth-of-type(2) > a:nth-of-type(1) {
            transition: background 0.2s;
        }
    </style>
</body>`;

html = html.replace('</body>', styleBlock);
fs.writeFileSync('index.html', html);
console.log('Focus mode styles patched');
