const fs = require('fs');
let serverJs = fs.readFileSync('server.js', 'utf8');

serverJs = serverJs.replace("model: 'gemini-1.5-flash'", "model: 'gemini-1.5-flash-8b'");
serverJs = serverJs.replace("model: 'gemini-2.0-flash'", "model: 'gemini-1.5-flash-8b'");

fs.writeFileSync('server.js', serverJs);
console.log('Server updated to use gemini-1.5-flash-8b');
