const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

const modalCode = `    <!-- New Task Modal -->
    <div id="newTaskModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Nueva Tarea</h3>
                <button class="modal-close" onclick="closeModal('newTaskModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="newTaskForm">
                    <div class="form-group">
                        <label class="form-label">Título de la Tarea</label>
                        <input type="text" class="form-control" name="title" required placeholder="Ej: Llamar a cliente...">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descripción</label>
                        <textarea class="form-control" name="description" rows="3" placeholder="Detalles adicionales..."></textarea>
                    </div>
                    <div class="grid grid-2">
                        <div class="form-group">
                            <label class="form-label">Prioridad</label>
                            <select class="form-control" name="priority">
                                <option value="baja">Baja</option>
                                <option value="normal" selected>Normal</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha Límite</label>
                            <input type="date" class="form-control" name="dueDate">
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
                        <button type="button" class="btn btn-outline" onclick="closeModal('newTaskModal')">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Guardar Tarea</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
`;

indexHtml = indexHtml.replace('<!-- Add Opportunity to Pipeline Modal -->', modalCode + '\\n    <!-- Add Opportunity to Pipeline Modal -->');
fs.writeFileSync('index.html', indexHtml);
console.log('Re-added newTaskModal');
