const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace(
    /const approvedQuotes = CRM.quotations.filter\(q => q.estado === 'aprobada' \|\| q.estado === 'aprobado'\);/,
    "const approvedQuotes = CRM.quotations.filter(q => q.status === 'aprobada');"
);

fs.writeFileSync('app.js', appJs);
console.log('Fixed reports approved quotes property');
