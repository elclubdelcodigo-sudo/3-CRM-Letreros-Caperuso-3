const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldStyle = `        aside:nth-of-type(1) > nav:nth-of-type(1) > div:nth-of-type(2) > a:nth-of-type(1) {
            transition: background 0.2s;
        }
    </style>`;

const newStyle = `        aside:nth-of-type(1) > nav:nth-of-type(1) > div:nth-of-type(2) > a:nth-of-type(1) {
            transition: background 0.2s;
        }
        div#quotationModal:nth-of-type(6) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > button#modalApproveBtn:nth-of-type(1) {
            transition: all 0.2s ease-in-out;
        }
        div#quotationModal:nth-of-type(6) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > button#modalApproveBtn:nth-of-type(1):hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4) !important;
        }
    </style>`;

html = html.replace(oldStyle, newStyle);
fs.writeFileSync('index.html', html);
console.log('patched modal btn');
