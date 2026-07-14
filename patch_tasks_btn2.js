const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(
    /onclick="closeModal\('newTaskModal'\)">\s*Cancelar\s*<\/button>\s*<\/div>/g,
    `onclick="closeModal('newTaskModal')">Cancelar</button><button type="submit" class="btn btn-primary">Guardar Tarea</button></div>`
);

fs.writeFileSync('index.html', indexHtml);
console.log('patched index html tasks button 2');
