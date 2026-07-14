const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

serverJs = serverJs.replace("model: 'gemini-2.0-flash'", "model: 'gemini-1.5-flash'");
fs.writeFileSync('server.js', serverJs);
console.log('Model changed to gemini-1.5-flash');
