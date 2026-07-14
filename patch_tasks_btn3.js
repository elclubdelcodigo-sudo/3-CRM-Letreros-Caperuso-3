const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(
    /<div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">[\s\S]*?<\/div>/,
    `<div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
        <button type="button" class="btn btn-outline" onclick="closeModal('newTaskModal')">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar Tarea</button>
    </div>`
);

indexHtml = indexHtml.replace(
    /<div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">[\s\S]*?<\/div>/,
    `<div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
        <button type="button" class="btn btn-outline" onclick="closeModal('newTaskModal')">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar Tarea</button>
    </div>`
);

fs.writeFileSync('index.html', indexHtml);
console.log('patched index html tasks button 3');
