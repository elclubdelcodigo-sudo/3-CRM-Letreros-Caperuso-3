const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

if (!appJs.includes("document.getElementById('newTaskForm').addEventListener('submit'")) {
    appJs = appJs.replace(
        /document\.addEventListener\('DOMContentLoaded', \(\) => \{/,
        `document.addEventListener('DOMContentLoaded', () => {
    const newTaskForm = document.getElementById('newTaskForm');
    if (newTaskForm) {
        newTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const task = {
                id: generateId(),
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                dueDate: formData.get('dueDate'),
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            CRM.tasks.push(task);
            saveData();
            loadTasks();
            closeModal('newTaskModal');
            showNotification('✅ Tarea creada exitosamente', 'success');
        });
    }
    const dupModal = document.querySelectorAll('#newTaskModal');
    if (dupModal.length > 1) {
       dupModal[1].remove();
    }
`
    );
    fs.writeFileSync('app.js', appJs);
    console.log("Patched submit handler for tasks.");
} else {
    console.log("Submit handler already exists.");
}

