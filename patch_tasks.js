const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// replace showNewTaskModal
appJs = appJs.replace(
    /function showNewTaskModal\(\) \{\s*showNotification\('🔧 Función en desarrollo', 'warning'\);\s*\}/,
    `function showNewTaskModal() {
    document.getElementById('newTaskForm').reset();
    document.getElementById('newTaskModal').classList.add('active');
}`
);

// find where tasks are loaded and fix it
appJs = appJs.replace(
    /function loadTasks\(\) \{[\s\S]*?\}/,
    `function loadTasks() {
    const tasksByStatus = {
        'pending': [],
        'in_progress': [],
        'completed': []
    };
    
    CRM.tasks.forEach(task => {
        if(tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(task);
        } else {
            tasksByStatus['pending'].push(task);
        }
    });

    ['pending', 'in_progress', 'completed'].forEach(status => {
        const containerId = status === 'pending' ? 'tasksPending' : (status === 'in_progress' ? 'tasksInProgress' : 'tasksCompleted');
        const el = document.getElementById(containerId);
        
        // update badge
        const badge = el.previousElementSibling.querySelector('.badge');
        if (badge) {
            badge.textContent = tasksByStatus[status].length;
        }
        
        if (tasksByStatus[status].length === 0) {
            el.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Sin tareas</p></div>';
            return;
        }
        
        el.innerHTML = tasksByStatus[status].map(task => {
            const priorityColors = {
                'baja': 'var(--gray)',
                'low': 'var(--gray)',
                'normal': 'var(--primary)',
                'alta': 'var(--warning)',
                'high': 'var(--warning)',
                'urgente': 'var(--danger)',
                'urgent': 'var(--danger)'
            };
            const color = priorityColors[task.priority] || 'var(--primary)';
            
            return \`
                <div class="card" style="margin-bottom: 0.5rem; padding: 1rem; border-left: 4px solid \${color}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0;">\${task.title}</h4>
                        <div style="display: flex; gap: 0.25rem;">
                            \${status !== 'completed' ? \`<button class="btn btn-sm" style="padding: 0.2rem 0.5rem; background: var(--success);" onclick="updateTaskStatus('\${task.id}', 'completed')"><i class="fas fa-check"></i></button>\` : ''}
                            \${status === 'pending' ? \`<button class="btn btn-sm" style="padding: 0.2rem 0.5rem; background: var(--primary);" onclick="updateTaskStatus('\${task.id}', 'in_progress')"><i class="fas fa-play"></i></button>\` : ''}
                            <button class="btn btn-sm btn-outline" style="padding: 0.2rem 0.5rem; border-color: var(--danger); color: var(--danger);" onclick="deleteTask('\${task.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: var(--text-secondary);">\${task.description || ''}</p>
                    \${task.dueDate ? \`<div style="font-size: 0.75rem; color: var(--gray);"><i class="far fa-calendar"></i> \${formatDate(task.dueDate)}</div>\` : ''}
                </div>
            \`;
        }).join('');
    });
}

function updateTaskStatus(id, newStatus) {
    const task = CRM.tasks.find(t => t.id === id);
    if(task) {
        task.status = newStatus;
        saveData();
        loadTasks();
    }
}

function deleteTask(id) {
    if(confirm('¿Estás seguro de eliminar esta tarea?')) {
        CRM.tasks = CRM.tasks.filter(t => t.id !== id);
        saveData();
        loadTasks();
    }
}
`
);

fs.writeFileSync('app.js', appJs);
console.log('patched tasks code');
