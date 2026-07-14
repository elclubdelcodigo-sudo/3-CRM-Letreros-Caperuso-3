const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const oldSwitch = `        case 'settings':
            loadSettings();
            break;
    }
}`;

const newSwitch = `        case 'settings':
            loadSettings();
            break;
        case 'mensajeria-ia':
            populateIAQuotationSelect();
            break;
    }
}`;

appJs = appJs.replace(oldSwitch, newSwitch);
fs.writeFileSync('app.js', appJs);
console.log('Navigation patched');
