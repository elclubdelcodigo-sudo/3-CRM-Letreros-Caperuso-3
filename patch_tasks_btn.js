const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

indexHtml = indexHtml.replace(
    /<button type="button" class="btn btn-outline" onclick="closeModal\('newTaskModal'\)">\s*Cancelar\s*<\/button>\s*<\/div>\s*<\/form>/,
    `<button type="button" class="btn btn-outline" onclick="closeModal('newTaskModal')">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar Tarea</button>
                        </div>
                    </form>`
);

indexHtml = indexHtml.replace(
    /<button type="button" class="btn btn-outline" onclick="closeModal\('newTaskModal'\)">\s*Cancelar\s*<\/button>\s*<\/div>\s*<\/form>/,
    `<button type="button" class="btn btn-outline" onclick="closeModal('newTaskModal')">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Guardar Tarea</button>
                        </div>
                    </form>`
);

fs.writeFileSync('index.html', indexHtml);
console.log('patched index html tasks button');
