const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const targetInit = `document.addEventListener('DOMContentLoaded', function () {
    loadData();`;
const newInit = `document.addEventListener('DOMContentLoaded', function () {
    loadData();
    populateIAQuotationSelect();`;

if (appJs.includes(targetInit)) {
    appJs = appJs.replace(targetInit, newInit);
    fs.writeFileSync('app.js', appJs);
    console.log('DOMContentLoaded patched correctly');
}
