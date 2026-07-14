const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

// First replace the old chart declarations
appJs = appJs.replace(/let salesChart, materialsChart, customersChart;/, 
    'let salesChart, materialsChart, customersChart, reportSalesTrendChart, reportTasksChart, reportPipelineChart, reportTopCustomersChart;');

// Now replace updateReports
const newUpdateReports = `function updateReports() {
    const approvedQuotes = CRM.quotations.filter(q => q.estado === 'aprobada' || q.estado === 'aprobado');
    const totalSales = approvedQuotes.reduce((sum, q) => sum + (q.total || 0), 0);
    const conversionRate = CRM.quotations.length > 0 ? (approvedQuotes.length / CRM.quotations.length) * 100 : 0;
    const avgTicket = approvedQuotes.length > 0 ? totalSales / approvedQuotes.length : 0;
    const pendingTasks = CRM.tasks.filter(t => t.status !== 'completed').length;

    const formatMoney = (val) => '$' + val.toLocaleString('es-CL');
    const elSales = document.getElementById('reportTotalSales');
    if(elSales) elSales.innerText = formatMoney(totalSales);
    const elConv = document.getElementById('reportConversionRate');
    if(elConv) elConv.innerText = conversionRate.toFixed(1) + '%';
    const elTicket = document.getElementById('reportAvgTicket');
    if(elTicket) elTicket.innerText = formatMoney(avgTicket);
    const elTasks = document.getElementById('reportPendingTasks');
    if(elTasks) elTasks.innerText = pendingTasks;

    if (reportSalesTrendChart) reportSalesTrendChart.destroy();
    if (reportTasksChart) reportTasksChart.destroy();
    if (reportPipelineChart) reportPipelineChart.destroy();
    if (reportTopCustomersChart) reportTopCustomersChart.destroy();
    if (materialsChart) materialsChart.destroy();

    const salesCtx = document.getElementById('reportSalesTrendChart');
    if (salesCtx) {
        const last6Months = Array.from({length: 6}, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return d;
        });
        const monthNames = last6Months.map(d => d.toLocaleString('es-ES', { month: 'short' }));
        
        const monthlyData = last6Months.map(d => {
            const m = d.getMonth();
            const y = d.getFullYear();
            return approvedQuotes.filter(q => {
                const qd = new Date(q.fecha || Date.now());
                return qd.getMonth() === m && qd.getFullYear() === y;
            }).reduce((sum, q) => sum + (q.total || 0), 0);
        });

        reportSalesTrendChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: monthNames,
                datasets: [{
                    label: 'Ventas Totales ($)',
                    data: monthlyData,
                    borderColor: 'rgba(255, 0, 102, 1)',
                    backgroundColor: 'rgba(255, 0, 102, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const tasksCtx = document.getElementById('reportTasksChart');
    if (tasksCtx) {
        const p = CRM.tasks.filter(t => t.status === 'pending').length;
        const ip = CRM.tasks.filter(t => t.status === 'in_progress').length;
        const c = CRM.tasks.filter(t => t.status === 'completed').length;
        reportTasksChart = new Chart(tasksCtx, {
            type: 'doughnut',
            data: {
                labels: ['Pendientes', 'En Progreso', 'Completadas'],
                datasets: [{
                    data: [p, ip, c],
                    backgroundColor: ['rgba(255, 167, 38, 0.8)', 'rgba(96, 165, 250, 0.8)', 'rgba(52, 211, 153, 0.8)']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const pipelineCtx = document.getElementById('reportPipelineChart');
    if (pipelineCtx) {
        const stages = ['lead', 'contact', 'proposal', 'negotiation'];
        const stageNames = ['Lead', 'Contacto', 'Propuesta', 'Negociación'];
        const stageValues = stages.map(st => {
            return CRM.pipeline.filter(p => p.stage === st)
                .reduce((sum, p) => sum + (p.value || 0), 0);
        });

        reportPipelineChart = new Chart(pipelineCtx, {
            type: 'bar',
            data: {
                labels: stageNames,
                datasets: [{
                    label: 'Valor en Etapa ($)',
                    data: stageValues,
                    backgroundColor: 'rgba(79, 70, 229, 0.8)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const topCtx = document.getElementById('reportTopCustomersChart');
    if (topCtx) {
        const customerSales = {};
        approvedQuotes.forEach(q => {
            const customerName = q.cliente?.nombre || 'Desconocido';
            customerSales[customerName] = (customerSales[customerName] || 0) + (q.total || 0);
        });
        let sortedCustomers = Object.entries(customerSales).sort((a,b) => b[1] - a[1]).slice(0, 5);
        
        if (sortedCustomers.length === 0) {
            sortedCustomers = [['Sin ventas', 0]];
        }

        reportTopCustomersChart = new Chart(topCtx, {
            type: 'bar',
            data: {
                labels: sortedCustomers.map(c => c[0]),
                datasets: [{
                    label: 'Ventas Totales ($)',
                    data: sortedCustomers.map(c => c[1]),
                    backgroundColor: 'rgba(52, 211, 153, 0.8)'
                }]
            },
            options: { 
                indexAxis: 'y', 
                responsive: true, 
                maintainAspectRatio: false 
            }
        });
    }

    const materialsCtx = document.getElementById('materialsChart');
    if (materialsCtx) {
        materialsChart = new Chart(materialsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Acrílico', 'Aluminio', 'Trovicel', 'Otros'],
                datasets: [{
                    data: [30, 35, 25, 10],
                    backgroundColor: [
                        'rgba(255, 0, 102, 0.8)',
                        'rgba(96, 165, 250, 0.8)',
                        'rgba(79, 70, 229, 0.8)',
                        'rgba(52, 211, 153, 0.8)'
                    ]
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}`;

const oldUpdateReportsRegex = /function updateReports\(\) \{[\s\S]*?\}\n\}\n\/\/ ============= SETTINGS =============/m;
appJs = appJs.replace(oldUpdateReportsRegex, newUpdateReports + '\\n\\n// ============= SETTINGS =============');

fs.writeFileSync('app.js', appJs);
console.log('Patched reports successfully');
