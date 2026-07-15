// ===================================
// CRM LETREROS CAPERUSO
// Sistema de Gestión Comercial
// ===================================

// ============= DATA STRUCTURE =============
let CRM = {
    customers: [],
    companies: [],
    quotations: [],
    tasks: [],
    pipeline: [],
    library: [],
    settings: {
        companyName: 'LETREROS CAPERUSO',
        companyRut: '76.491.931-9',
        companyAddress: 'AV 18 SEPTIEMBRE 1350, PAINE, RM',
        companyPhone: '(+56) 9 8999 7253',
        companyWeb: 'WWW.LETREROSCAPERUSO.CL'
    }
};

// Precios de materiales (mantiene la estructura original)
let precios = {
    placas: {
        'SIN PLACA': 0,
        'ALUMINIO 3MM': 16056,
        'ALUMINIO 4MM': 20833,
        'TROVICEL 3MM': 4167,
        'TROVICEL 5MM': 8681,
        'TROVICEL 10MM': 12153,
        'ACRÍLICO 3MM': 20833,
        'ACRÍLICO 6MM': 55000,
        'ACRÍLICO 10MM': 95000,
        'IMANTADO 0.5MM': 15000,
        'PENDÓN ROLLER 80X200CM': 12500,
        'PENDÓN ROLLER 100X200CM': 15500
    },
    adhesivos: {
        'SIN ADHESIVO': 0,
        'ADHESIVO NORMAL': 1800,
        'ADH REFLECTANTE ING': 6000,
        'ADH REFLECTANTE ALTA INTENSIDAD': 30000,
        'ADH FOTOLUMINISCENTE': 29970,
        'TELA PVC': 6000,
        'DUSTED METAMARK': 12000,
        'LAMINADO TRANSPARENTE NORMAL': 1800,
        'LAMINADO TRANSPARENTE LG': 9000,
        'MALLA MESH': 17500
    },
    laminados: {
        'SIN LAMINADO': 0,
        'LAMINADO NORMAL': 1800,
        'LAMINADO LG': 9000,
        'LAMINADO FLOOR GRAPHICS': 12000
    },
    anclajes: {
        'SIN ANCLAJE': 0,
        'CINTA TESA 4965 12MM': 400,
        'CINTA 3M VHB 4910 12MM TRANSPARENTE': 2300,
        'CINTA 3M VHB – DE USO GENERAL 5952 12MM': 1750
    },
    impresion: 1400
};

let shippingPrices = {
    'retiro': 0,
    'privado': 15000,
    'starkenSucursal': 8000,
    'starkenDomicilio': 12000
};

// Carrito temporal para cotizaciones
let carrito = [];

// ============= ERP AUTHENTICATION SYSTEM =============
function checkErpAuth() {
    const overlay = document.getElementById('erpLoginOverlay');
    if (!overlay) return;
    
    if (sessionStorage.getItem('erp_logged_in') === 'true') {
        overlay.style.display = 'none';
    } else {
        overlay.style.display = 'flex';
    }
}

window.handleErpLogin = function(event) {
    if (event) event.preventDefault();
    
    const userEl = document.getElementById('erpUsername');
    const passEl = document.getElementById('erpPassword');
    const errorEl = document.getElementById('erpLoginError');
    
    if (!userEl || !passEl) return;
    
    const user = userEl.value.trim();
    const pass = passEl.value;
    
    if (user === 'admin' && pass === 'Paine2016@') {
        sessionStorage.setItem('erp_logged_in', 'true');
        if (errorEl) errorEl.style.display = 'none';
        
        // Hide overlay with a smooth transition
        const overlay = document.getElementById('erpLoginOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.style.opacity = '1'; // Reset opacity for next show
            }, 400);
        }
        
        // Reset fields
        userEl.value = '';
        passEl.value = '';
    } else {
        if (errorEl) {
            errorEl.style.display = 'flex';
            // Simple shake animation on the card
            const card = document.querySelector('#erpLoginOverlay .card');
            if (card) {
                card.style.transform = 'translateX(10px)';
                setTimeout(() => card.style.transform = 'translateX(-10px)', 100);
                setTimeout(() => card.style.transform = 'translateX(5px)', 200);
                setTimeout(() => card.style.transform = 'translateX(-5px)', 300);
                setTimeout(() => card.style.transform = 'none', 400);
            }
        }
    }
};

window.handleErpLogout = function() {
    sessionStorage.removeItem('erp_logged_in');
    const overlay = document.getElementById('erpLoginOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
    }
};

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function () {
    checkErpAuth();
    loadData();
    populateIAQuotationSelect();
    initializeNavigation();
    initializeCharts();
    updateDashboard();
    loadQuoterContent();
});

// ============= LOCAL STORAGE =============
function loadData() {
    const saved = localStorage.getItem('crmCaperuso');
    if (saved && saved !== 'undefined') {
        try {
            const data = JSON.parse(saved);
            CRM = { ...CRM, ...data };
            if (!CRM.companies) {
                CRM.companies = [];
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }

    // Load precios separately
    const savedPrecios = localStorage.getItem('preciosMateriales');
    if (savedPrecios && savedPrecios !== 'undefined') {
        try {
            precios = JSON.parse(savedPrecios);
        } catch (e) {
            console.error('Error loading prices:', e);
        }
    }
}

function saveData() {
    localStorage.setItem('crmCaperuso', JSON.stringify(CRM));
    localStorage.setItem('preciosMateriales', JSON.stringify(precios));
}

function exportAllData() {
    const data = {
        crm: CRM,
        precios: precios,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caperuso-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('✅ Datos exportados exitosamente', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                CRM = data.crm;
                precios = data.precios;
                saveData();
                location.reload();
            } catch (error) {
                showNotification('❌ Error al importar datos', 'danger');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (confirm('⚠️ ¿Estás seguro de eliminar todos los datos? Esta acción no se puede deshacer.')) {
        if (confirm('⚠️ ÚLTIMA CONFIRMACIÓN: ¿Realmente deseas eliminar TODOS los datos?')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// ============= NAVIGATION =============
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });
}

function navigateToPage(pageName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(pageName)?.classList.add('active');

    // Load page-specific content
    switch (pageName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'customers':
            loadCustomersTable();
            break;
        case 'companies':
            loadCompaniesTable();
            break;
        case 'quotations':
            loadQuotationsTable();
            break;
        case 'pipeline':
            loadPipeline();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'reports':
            updateReports();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'mensajeria-ia':
            populateIAQuotationSelect();
            break;
        case 'library':
            filterLibrary();
            break;
    }
}

// ============= DASHBOARD =============
function updateDashboard() {
    // Update stats
    const totalSales = CRM.quotations
        .filter(q => q.status === 'aprobada')
        .reduce((sum, q) => sum + (q.total || 0), 0);

    const monthSalesEl = document.getElementById('monthSales');
    if (monthSalesEl) monthSalesEl.textContent = formatPrecio(totalSales);

    const totalCustomersEl = document.getElementById('totalCustomers');
    if (totalCustomersEl) totalCustomersEl.textContent = CRM.customers.length;

    const activeQuotationsEl = document.getElementById('activeQuotations');
    if (activeQuotationsEl) activeQuotationsEl.textContent = CRM.quotations.filter(q => q.status !== 'aprobada' && q.status !== 'rechazada').length;

    // Update badges
    const customersCountEl = document.getElementById('customersCount');
    if (customersCountEl) customersCountEl.textContent = CRM.customers.length;

    const companiesCountEl = document.getElementById('companiesCount');
    if (companiesCountEl) companiesCountEl.textContent = (CRM.companies || []).length;

    const quotationsCountEl = document.getElementById('quotationsCount');
    if (quotationsCountEl) quotationsCountEl.textContent = CRM.quotations.length;

    // Load activity feed
    loadActivityFeed();

    // Update charts
    updateSalesChart();
}

function loadActivityFeed() {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    if (CRM.quotations.length === 0 && CRM.customers.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No hay actividad reciente</h3>
                <p>Las actividades aparecerán aquí</p>
            </div>
        `;
        return;
    }

    let activities = [];

    // Add recent quotations
    CRM.quotations.slice(-5).reverse().forEach(q => {
        activities.push({
            type: 'quotation',
            icon: 'fa-file-invoice',
            color: 'var(--gradient-1)',
            title: `Cotización #${q.numero} creada`,
            time: timeAgo(q.fecha)
        });
    });

    // Add recent customers
    CRM.customers.slice(-3).reverse().forEach(c => {
        activities.push({
            type: 'customer',
            icon: 'fa-user-plus',
            color: 'var(--gradient-3)',
            title: `Cliente ${c.nombre} agregado`,
            time: timeAgo(c.createdAt)
        });
    });

    feed.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${a.color};">
                <i class="fas ${a.icon}" style="color: white;"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${a.title}</div>
                <div class="activity-time">${a.time}</div>
            </div>
        </div>
    `).join('');
}

// ============= CUSTOMERS =============
function showNewCustomerModal() {
    document.getElementById('newCustomerModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Form submission for new customer
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('newCustomerForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const customer = {
                id: generateId(),
                nombre: formData.get('nombre'),
                empresa: formData.get('empresa'),
                rut: formData.get('rut'),
                telefono: formData.get('telefono'),
                correo: formData.get('correo'),
                giro: formData.get('giro'),
                direccion: formData.get('direccion'),
                notas: formData.get('notas'),
                createdAt: new Date().toISOString(),
                totalSales: 0,
                quotationsCount: 0,
                status: 'activo'
            };

            CRM.customers.push(customer);
            saveData();

            closeModal('newCustomerModal');
            this.reset();

            showNotification('✅ Cliente agregado exitosamente', 'success');

            if (document.getElementById('customers').classList.contains('active')) {
                loadCustomersTable();
            }
            updateDashboard();
        });
    }

    const companyForm = document.getElementById('newCompanyForm');
    if (companyForm) {
        companyForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const company = {
                id: generateId(),
                nombre: formData.get('nombre'),
                rut: formData.get('rut'),
                contacto: formData.get('contacto'),
                telefono: formData.get('telefono'),
                correo: formData.get('correo'),
                giro: formData.get('giro'),
                direccion: formData.get('direccion'),
                notas: formData.get('notas'),
                createdAt: new Date().toISOString(),
                totalSales: 0,
                quotationsCount: 0,
                status: 'activo'
            };

            CRM.companies.push(company);
            saveData();

            closeModal('newCompanyModal');
            this.reset();

            showNotification('✅ Empresa agregada exitosamente', 'success');

            if (document.getElementById('companies').classList.contains('active')) {
                loadCompaniesTable();
            }
            updateDashboard();
        });
    }
});

function loadCustomersTable() {
    const tbody = document.getElementById('customersTableBody');

    if (CRM.customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No hay clientes registrados</h3>
                        <p>Comienza agregando tu primer cliente</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = CRM.customers.map(c => `
        <tr>
            <td><input type="checkbox" class="customer-checkbox" value="${c.id}"></td>
            <td>
                <div class="customer-profile">
                    <div class="customer-avatar">${getInitials(c.nombre)}</div>
                    <div class="customer-info">
                        <h4>${c.nombre}</h4>
                        <p>${c.correo}</p>
                    </div>
                </div>
            </td>
            <td>${c.empresa || '-'}</td>
            <td>
                ${c.telefono}<br>
                <small style="color: var(--gray);">${c.correo}</small>
            </td>
            <td>${c.quotationsCount || 0}</td>
            <td>${formatPrecio(c.totalSales || 0)}</td>
            <td><span class="badge badge-success">Activo</span></td>
            <td>
                <button class="btn btn-sm" onclick="editCustomer('${c.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" onclick="viewCustomer('${c.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-3);">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function editCustomer(id) {
    const customer = CRM.customers.find(c => c.id === id);
    if (customer) {
        // TODO: Implement edit modal
        showNotification('🔧 Función de edición en desarrollo', 'warning');
    }
}

function viewCustomer(id) {
    const customer = CRM.customers.find(c => c.id === id);
    if (customer) {
        // TODO: Implement customer detail view
        showNotification('🔧 Vista de detalle en desarrollo', 'warning');
    }
}

// ============= COMPANIES =============
function showNewCompanyModal() {
    document.getElementById('newCompanyModal').classList.add('active');
}

function loadCompaniesTable() {
    const tbody = document.getElementById('companiesTableBody');
    if (!tbody) return;

    if (!CRM.companies || CRM.companies.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <i class="fas fa-building"></i>
                        <h3>No hay empresas registradas</h3>
                        <p>Comienza agregando tu primera empresa</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = CRM.companies.map(c => `
        <tr>
            <td><input type="checkbox" class="company-checkbox" value="${c.id}"></td>
            <td>
                <div class="customer-profile">
                    <div class="customer-avatar">${getInitials(c.nombre)}</div>
                    <div class="customer-info">
                        <h4>${c.nombre}</h4>
                        <p>${c.correo}</p>
                    </div>
                </div>
            </td>
            <td>${c.rut || '-'}</td>
            <td>
                ${c.contacto || '-'}<br>
                <small style="color: var(--gray);">${c.telefono || ''}</small>
            </td>
            <td>${c.quotationsCount || 0}</td>
            <td>${formatPrecio(c.totalSales || 0)}</td>
            <td><span class="badge badge-success">Activo</span></td>
            <td>
                <button class="btn btn-sm" onclick="editCompany('${c.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" onclick="viewCompany('${c.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-3);">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function editCompany(id) {
    const company = CRM.companies.find(c => c.id === id);
    if (company) {
        showNotification('🔧 Función de edición de empresas en desarrollo', 'warning');
    }
}

function viewCompany(id) {
    const company = CRM.companies.find(c => c.id === id);
    if (company) {
        showNotification('🔧 Vista de detalle de empresas en desarrollo', 'warning');
    }
}

window.showNewCompanyModal = showNewCompanyModal;
window.loadCompaniesTable = loadCompaniesTable;
window.editCompany = editCompany;
window.viewCompany = viewCompany;

// ============= QUOTATIONS =============
function showNewQuotationModal() {
    navigateToPage('quoter');

    // Clear form and cart for new quotation
    if (document.getElementById('clienteNombre')) {
        document.getElementById('cotizacionNumero').value = '';
        document.getElementById('clienteNombre').value = '';
        document.getElementById('clienteEmpresaNombre').value = '';
        document.getElementById('clienteRut').value = '';
        document.getElementById('clienteTelefono').value = '';
        document.getElementById('clienteEmail').value = '';
        document.getElementById('clienteDireccion').value = '';
        document.getElementById('clienteGiro').value = '';
        document.getElementById('diasFabricacion').value = '0';
        
        document.getElementById('tipoEnvio').value = 'Monto Manual';
        document.getElementById('costoEnvio').value = '';
        document.getElementById('costoEnvio').style.display = 'block';
        
        document.getElementById('tipoInstalacion').value = 'Monto Manual';
        document.getElementById('costoInstalacion').value = '';
        document.getElementById('costoInstalacion').style.display = 'block';
        
        document.getElementById('editingQuotationId').value = '';
    }

    // Optional: Ask if clear cart? For now we force clear for clean state
    carrito = [];
    if (document.getElementById('carrito')) {
        actualizarCarrito();
    }
}

function updateQuotationMetrics() {
    const elGanadas = document.getElementById('quoteMetricGanadas');
    const elPerdidas = document.getElementById('quoteMetricPerdidas');
    const elUtilidad = document.getElementById('quoteMetricUtilidad');
    const elPorGanar = document.getElementById('quoteMetricPorGanar');

    const wonQuotes = CRM.quotations.filter(q => q.status === 'aprobada' || q.status === 'aprobado');
    const wonTotal = wonQuotes.reduce((sum, q) => sum + (q.total || 0), 0);
    
    const lostTotal = CRM.quotations.filter(q => q.status === 'rechazada' || q.status === 'rechazado').reduce((sum, q) => sum + (q.total || 0), 0);
    
    const wonUtility = wonQuotes.reduce((sum, q) => {
        const qUtility = q.items ? q.items.reduce((itemSum, item) => {
            const utilPerUnit = item.detalles && typeof item.detalles.utilidadPorUnidad === 'number' 
                ? item.detalles.utilidadPorUnidad 
                : 0;
            const qty = typeof item.cantidad === 'number' ? item.cantidad : 1;
            return itemSum + (utilPerUnit * qty);
        }, 0) : 0;
        return sum + qUtility;
    }, 0);
    
    const pendingTotal = CRM.quotations.filter(q => q.status !== 'aprobada' && q.status !== 'aprobado' && q.status !== 'rechazada' && q.status !== 'rechazado').reduce((sum, q) => sum + (q.total || 0), 0);

    if (elGanadas) elGanadas.textContent = formatPrecio(wonTotal);
    if (elPerdidas) elPerdidas.textContent = formatPrecio(lostTotal);
    if (elUtilidad) elUtilidad.textContent = formatPrecio(wonUtility);
    if (elPorGanar) elPorGanar.textContent = formatPrecio(pendingTotal);
}

function loadQuotationsTable() {
    updateQuotationMetrics();
    const tbody = document.getElementById('quotationsTableBody');

    if (CRM.quotations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-file-invoice"></i>
                        <h3>No hay cotizaciones</h3>
                        <p>Crea tu primera cotización</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = CRM.quotations.map(q => {
        const statusBadge = {
            'borrador': 'badge-warning',
            'enviada': 'badge-primary',
            'aprobada': 'badge-success',
            'rechazada': 'badge-danger'
        }[q.status] || 'badge-warning';

        let approveButton = '';
        if (q.status === 'aprobada') {
            approveButton = `
                <span class="badge badge-success" style="padding: 0.5rem 1rem; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; box-shadow: 0 2px 8px rgba(67, 233, 123, 0.2);">
                    <i class="fas fa-check-circle"></i> Aprobada
                </span>
            `;
        } else if (q.status === 'rechazada') {
            approveButton = `
                <span class="badge badge-danger" style="padding: 0.5rem 1rem; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; background: var(--danger); color: white; box-shadow: 0 2px 8px rgba(251, 113, 133, 0.2);">
                    <i class="fas fa-times-circle"></i> Perdida
                </span>
            `;
        } else {
            approveButton = `
                <button class="btn btn-sm" onclick="approveQuotation('${q.id}', this)" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-4); color: white; box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4); display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Aprobar Cotización">
                    <i class="fas fa-check-circle"></i> Aprobar
                </button>
            `;
        }

        const lostOrReactivateButton = q.status === 'rechazada' ? `
            <button class="btn btn-sm btn-reactivate" onclick="reactivateQuotation('${q.id}')" style="padding: 0.5rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #3b82f6; color: white; border-radius: 8px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Reactivar Cotización">
                <i class="fas fa-undo"></i>
            </button>
        ` : `
            <button class="btn btn-sm btn-mark-lost" onclick="markQuotationAsLost('${q.id}')" style="padding: 0.5rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--danger); color: white; border-radius: 8px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Dar por Perdida">
                <i class="fas fa-ban"></i>
            </button>
        `;


        return `
            <tr>
                <td><input type="checkbox" class="quotation-checkbox" value="${q.id}" onchange="updateSelectedQuotationsCount()"></td>
                <td><strong>#${q.numero}</strong></td>
                <td>${q.cliente?.nombre || 'Sin cliente'}</td>
                <td>${formatDate(q.fecha)}</td>
                <td>${q.items?.length || 0}</td>
                <td><strong>${formatPrecio(q.total)}</strong></td>
                <td><span class="badge ${statusBadge}">${q.status}</span></td>
                <td style="display: flex; gap: 0.5rem; align-items: center; border: none; padding-top: 1.5rem; padding-bottom: 1.5rem;">
                    ${approveButton}
                    <button class="btn btn-sm" onclick="editQuotation('${q.id}')" style="padding: 0.5rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--warning); color: var(--dark);" title="Editar Cotización">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm" onclick="viewQuotation('${q.id}')" style="padding: 0.5rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;" title="Ver Detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm" onclick="printQuotation('${q.id}')" style="padding: 0.5rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--gradient-2);" title="Imprimir">
                        <i class="fas fa-print"></i>
                    </button>
                    ${lostOrReactivateButton}
                </td>
            </tr>
        `;
    }).join('');
}

function viewQuotation(id) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    const modalBody = document.getElementById('quotationModalBody');
    modalBody.innerHTML = generateQuotationHTML(quotation);

    // Store current quotation ID for buttons in modal
    modalBody.dataset.quotationId = id;

    // Handle Approve button visibility
    const approveBtn = document.getElementById('modalApproveBtn');
    if (approveBtn) {
        approveBtn.style.display = quotation.status === 'aprobada' ? 'none' : 'block';
    }

    document.getElementById('quotationModal').classList.add('active');
}

function approveFromModal() {
    const modalBody = document.getElementById('quotationModalBody');
    const id = modalBody.dataset.quotationId;
    if (id) {
        closeModal('quotationModal');
        approveQuotation(id);
    }
}

function printQuotation(id) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    const content = generateQuotationHTML(quotation, true);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Cotización N° ${quotation.numero}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                :root {
                    --primary: #ff0066;
                    --dark: #1a1a2e;
                    --dark-light: #16213e;
                    --gray: #6c757d;
                    --gray-light: #e9ecef;
                    --white: #ffffff;
                }
                body { 
                    font-family: 'Inter', sans-serif; 
                    font-size: 11px; 
                    color: var(--dark); 
                    margin: 0;
                    padding: 0;
                }
                .quotation-document { padding: 40px; max-width: 800px; margin: auto; }
                
                .doc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid var(--gray-light);
                    padding-bottom: 1rem;
                }

                .doc-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--primary);
                    margin-bottom: 5px;
                }

                .section-header {
                    background: var(--gray-light) !important;
                    padding: 8px 15px;
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 20px 0 10px 0;
                    border-radius: 8px;
                    color: var(--dark-light);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    -webkit-print-color-adjust: exact;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 20px;
                }

                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .info-table td {
                    padding: 6px 0;
                    border-bottom: 1px solid var(--gray-light);
                }

                .info-table .label {
                    font-weight: 600;
                    color: var(--gray);
                    width: 120px;
                }

                .items-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin-bottom: 25px;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid var(--gray-light);
                }

                .items-table th {
                    background: var(--dark-light) !important;
                    color: var(--white) !important;
                    padding: 12px 10px;
                    text-align: left;
                    font-size: 10px;
                    font-weight: 600;
                    -webkit-print-color-adjust: exact;
                }

                .items-table td {
                    padding: 10px;
                    border-bottom: 1px solid var(--gray-light);
                    font-size: 10px;
                }

                .totals-section {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 15px;
                }

                .totals-table {
                    width: 300px;
                    border-collapse: collapse;
                }

                .totals-table td {
                    padding: 8px 15px;
                    font-size: 11px;
                }

                .total-row {
                    background: var(--primary) !important;
                    color: var(--white) !important;
                    font-weight: 800;
                    font-size: 14px;
                    -webkit-print-color-adjust: exact;
                }
                
                .total-row td { border-radius: 8px; }

                .materials-summary {
                    background: #f8f9fa !important;
                    border-radius: 12px;
                    padding: 15px;
                    border: 1px dashed var(--gray);
                    -webkit-print-color-adjust: exact;
                }

                .terms-box {
                    font-size: 10px;
                    color: var(--gray);
                    line-height: 1.5;
                    background: #fff9fa !important;
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid var(--primary);
                    -webkit-print-color-adjust: exact;
                }

                .terms-box h3 {
                    color: var(--primary);
                    margin: 0 0 8px 0;
                    font-size: 11px;
                }

                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .quotation-document { padding: 0; }
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function printCurrentQuotation() {
    const modalBody = document.getElementById('quotationModalBody');
    const id = modalBody.dataset.quotationId;
    if (id) {
        printQuotation(id);
    }
}

function generateQuotationHTML(quotation, forPrint = false) {
    const client = quotation.cliente || {};
    const ivaRate = 0.19;
    
    // Calcular totales con los nuevos montos
    let baseTotal = quotation.total || 0;
    
    let costoEnvio = 0;
    if (quotation.envio && quotation.envio.tipo === 'Monto Manual') {
        costoEnvio = parseFloat(quotation.envio.costo) || 0;
    }
    
    let costoInstalacion = 0;
    if (quotation.instalacion && quotation.instalacion.tipo === 'Monto Manual') {
        costoInstalacion = parseFloat(quotation.instalacion.costo) || 0;
    }
    
    const subtotal = Math.round(baseTotal / (1 + ivaRate));
    const ivaAmount = Math.round(baseTotal - subtotal);
    
    const envioDisplay = quotation.envio ? (quotation.envio.tipo === 'Monto Manual' ? formatPrecio(costoEnvio) : quotation.envio.tipo) : '$0';
    const instalacionDisplay = quotation.instalacion ? (quotation.instalacion.tipo === 'Monto Manual' ? formatPrecio(costoInstalacion) : quotation.instalacion.tipo) : '$0';
    
    const totalFinal = baseTotal + costoEnvio + costoInstalacion;
    const diasFabDisplay = quotation.diasFabricacion || 0;

    const materials = { placas: {}, adhesivos: {}, laminados: {} };
    let totalArea = 0;

    const itemsHtml = quotation.items.map((item, index) => {
        if (item.detalles.placa.tipo !== 'SIN PLACA') {
            materials.placas[item.detalles.placa.tipo] = (materials.placas[item.detalles.placa.tipo] || 0) + (item.detalles.area * item.cantidad);
        }
        if (item.detalles.adhesivo.tipo !== 'SIN ADHESIVO') {
            materials.adhesivos[item.detalles.adhesivo.tipo] = (materials.adhesivos[item.detalles.adhesivo.tipo] || 0) + (item.detalles.area * item.cantidad);
        }
        if (item.detalles.laminado.tipo !== 'SIN LAMINADO') {
            materials.laminados[item.detalles.laminado.tipo] = (materials.laminados[item.detalles.laminado.tipo] || 0) + (item.detalles.area * item.cantidad);
        }
        totalArea += (item.detalles.area * item.cantidad);

        return `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight:600">${item.nombre}<br><small style="color:var(--gray)">${item.dimensiones}</small></td>
                <td style="text-align:center">${item.cantidad}</td>
                <td>${item.detalles.placa.tipo.replace(/SIN PLACA|SIN/g, '-')}</td>
                <td>${item.detalles.adhesivo.tipo.replace(/SIN ADHESIVO|SIN/g, '-')}</td>
                <td>${item.detalles.laminado.tipo.replace(/SIN LAMINADO|SIN/g, '-')}</td>
                <td>${item.detalles.anclaje.tipo.replace(/SIN ANCLAJE|SIN/g, '-')}</td>
                <td style="text-align:right">${formatPrecio(Math.round(item.detalles.precioFinalPorUnidad / (1 + ivaRate)))}</td>
                <td style="text-align:right; font-weight:700">${formatPrecio(Math.round(item.precio / (1 + ivaRate)))}</td>
            </tr>
        `;
    }).join('');

    let materialsHtml = '';
    for (const [name, area] of Object.entries(materials.placas)) { materialsHtml += `<tr><td>Placa ${name}</td><td style="text-align:right">${area.toFixed(2)} m²</td></tr>`; }
    for (const [name, area] of Object.entries(materials.adhesivos)) { materialsHtml += `<tr><td>Adhesivo ${name}</td><td style="text-align:right">${area.toFixed(2)} m²</td></tr>`; }
    for (const [name, area] of Object.entries(materials.laminados)) { materialsHtml += `<tr><td>Laminado ${name}</td><td style="text-align:right">${area.toFixed(2)} m²</td></tr>`; }

    return `
        <div class="quotation-document">
            <div class="doc-header">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="https://letreroscaperuso.cl/wp-content/uploads/2023/06/LOGO-LETREROSCAPERUSO-2023-04-scaled-e1774620911234.png" alt="Logo" style="height: 60px; width: auto; object-fit: contain;">
                    <div>
                        <div class="doc-title">Cotización N° ${quotation.numero}</div>
                        <div style="color: var(--gray); font-size: 0.9rem;">Fecha de Emisión: ${formatDate(quotation.fecha)}</div>
                    </div>
                </div>
                <div style="text-align: right">
                    <div style="font-weight: 800; color: var(--dark-light); font-size: 1.1rem;">LETREROS CAPERUSO</div>
                    <div style="font-size: 0.85rem; color: var(--gray)">Diseño Industrial EIRL</div>
                    <div style="font-size: 0.8rem; color: var(--gray)">RUT: ${CRM.settings.companyRut}</div>
                </div>
            </div>

            <div class="info-grid">
                <div>
                    <div class="section-header"><i class="fas fa-user"></i> Datos del Cliente</div>
                    <table class="info-table">
                        <tr><td class="label">Nombre:</td><td>${client.nombre || 'N/A'}</td></tr>
                        <tr><td class="label">Empresa:</td><td>${client.empresa || 'N/A'}</td></tr>
                        <tr><td class="label">RUT:</td><td>${client.rut || 'N/A'}</td></tr>
                        <tr><td class="label">Giro:</td><td>${client.giro || 'N/A'}</td></tr>
                    </table>
                </div>
                <div>
                    <div class="section-header"><i class="fas fa-map-marker-alt"></i> Contacto y Entrega</div>
                    <table class="info-table">
                        <tr><td class="label">Teléfono:</td><td>${client.telefono || 'N/A'}</td></tr>
                        <tr><td class="label">Email:</td><td>${client.email || 'N/A'}</td></tr>
                        <tr><td class="label">Dirección:</td><td>${client.direccion || 'N/A'}</td></tr>
                        <tr><td class="label">Pedido:</td><td>#${quotation.numero}</td></tr>
                    </table>
                </div>
            </div>

            <div class="section-header"><i class="fas fa-list"></i> Detalle de Productos</div>
            <table class="items-table">
                <thead>
                    <tr>
                                                                        <th>Ítem</th>
                        <th>Descripción</th>
                        <th>Cant.</th>
                        <th>Placa</th>
                        <th>Adhesivo</th>
                        <th>Laminado</th>
                        <th>Anclaje</th>
                        <th style="text-align:right">Unitario (Neto)</th>
                        <th style="text-align:right">Total (Neto)</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; align-items: start;">
                <div class="materials-summary">
                    <div style="font-weight:700; margin-bottom: 0.5rem; color: var(--dark-light); font-size: 0.9rem;">Resumen de Materiales</div>
                    <table style="width:100%; font-size: 0.85rem;">
                        ${materialsHtml}
                        <tr style="border-top: 1px solid #ddd"><td style="padding-top:0.5rem"><strong>Área Total de Impresión</strong></td><td style="text-align:right; padding-top:0.5rem"><strong>${totalArea.toFixed(2)} m²</strong></td></tr>
                    </table>
                    <div style="margin-top: 1rem; font-size: 0.85rem">
                        <strong>Tiempo estimado de fabricación:</strong> 3 días hábiles.
                    </div>
                </div>

                <div class="totals-section">
                    <table class="totals-table">
                        <tr><td>Subtotal Neto</td><td style="text-align:right">${formatPrecio(subtotal)}</td></tr>
                        <tr><td>IVA (19%)</td><td style="text-align:right">${formatPrecio(ivaAmount)}</td></tr>
                        <tr><td>Envío / Instalación</td><td style="text-align:right">${formatPrecio(costoEnvio + costoInstalacion)}</td></tr>
                        <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${formatPrecio(totalFinal)}</td></tr>
                    </table>
                </div>
            </div>

            <div class="section-header"><i class="fas fa-info-circle"></i> Términos y Condiciones</div>
            <div class="terms-box">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <div>
                        <h3>Proceso de Compra</h3>
                        <p>1. Una vez Aprobada la cotización debe cancelar el total del pedido 100% o enviar Orden de compra OC (Sujeto a aprobación).</p>
                        <p>2. Aprobado el Pago entregaremos un Visto Bueno Digital para su validación.</p>
                        <p>3. Tras su aprobación del diseño comienza el plazo de fabricación.</p>
                    </div>
                    <div>
                        <h3>Consideraciones</h3>
                        <p>• Pago: Transferencia, Efectivo o Cheque.</p>
                        <p>• Plazo: 2-3 días hábiles desde aprobación de diseño.</p>
                        <p>• Despacho: Vía Starken, Chilexpress o Correos de Chile (Por pagar).</p>
                    </div>
                </div>
                
                <div style="border-top: 1px solid var(--gray-light); padding-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h3>Datos para Transferencia</h3>
                        <p><strong>Razón Social:</strong> Eliseo Salazar Diseño Industrial EIRL</p>
                        <p><strong>RUT:</strong> 76.491.931-9</p>
                        <p><strong>Banco:</strong> BCI</p>
                        <p><strong>Cuenta:</strong> Cuenta Corriente 79048986</p>
                        <p><strong>Email:</strong> contacto@letreroscaperuso.cl</p>
                    </div>
                    <div>
                        <h3 style="visibility: hidden;">Contacto</h3>
                        <p><strong>Teléfono:</strong> (+56) 9 8993 9871</p>
                        <p><strong>Dirección:</strong> Av 18 Septiembre 1350, Paine, RM</p>
                        <p><strong>Web:</strong> www.letreroscaperuso.cl</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function editQuotation(id) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    navigateToPage('quoter');

    // Populate client data
    if (quotation.cliente) {
        document.getElementById('cotizacionNumero').value = quotation.numero || '';
        document.getElementById('clienteNombre').value = quotation.cliente.nombre || '';
        document.getElementById('clienteEmpresaNombre').value = quotation.cliente.empresa || '';
        document.getElementById('clienteRut').value = quotation.cliente.rut || '';
        document.getElementById('clienteTelefono').value = quotation.cliente.telefono || '';
        document.getElementById('clienteEmail').value = quotation.cliente.email || '';
        document.getElementById('clienteDireccion').value = quotation.cliente.direccion || '';
        document.getElementById('clienteGiro').value = quotation.cliente.giro || '';
        document.getElementById('diasFabricacion').value = quotation.diasFabricacion || 0;
        
        if (quotation.envio) {
            document.getElementById('tipoEnvio').value = quotation.envio.tipo || 'Monto Manual';
            document.getElementById('costoEnvio').value = quotation.envio.costo || '';
            document.getElementById('costoEnvio').style.display = document.getElementById('tipoEnvio').value === 'Monto Manual' ? 'block' : 'none';
        }
        
        if (quotation.instalacion) {
            document.getElementById('tipoInstalacion').value = quotation.instalacion.tipo || 'Monto Manual';
            document.getElementById('costoInstalacion').value = quotation.instalacion.costo || '';
            document.getElementById('costoInstalacion').style.display = document.getElementById('tipoInstalacion').value === 'Monto Manual' ? 'block' : 'none';
        }
    }

    // Populate items
    carrito = [...quotation.items];
    actualizarCarrito();

    // Set edit mode
    document.getElementById('editingQuotationId').value = id;

    showNotification(`✏️ Editando Cotización #${quotation.numero}`, 'info');
}

// ============= PIPELINE =============
function showNewOpportunityModal() {
    const container = document.getElementById('availableQuotationsList');

    // Get quotations that are not already in pipeline
    const quotationsInPipeline = CRM.pipeline.map(p => p.quotationId);
    const availableQuotations = CRM.quotations.filter(q => !quotationsInPipeline.includes(q.id));

    if (availableQuotations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No hay cotizaciones disponibles</h3>
                <p>Todas las cotizaciones ya están en el pipeline o no hay cotizaciones creadas.</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>N° Cotización</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${availableQuotations.map(q => {
            const statusBadge = {
                'borrador': 'badge-warning',
                'enviada': 'badge-primary',
                'aprobada': 'badge-success',
                'rechazada': 'badge-danger'
            }[q.status] || 'badge-warning';

            return `
                                <tr>
                                    <td><strong>#${q.numero}</strong></td>
                                    <td>${q.cliente?.nombre || 'Sin cliente'}</td>
                                    <td>${formatDate(q.fecha)}</td>
                                    <td><strong>${formatPrecio(q.total)}</strong></td>
                                    <td><span class="badge ${statusBadge}">${q.status}</span></td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" onclick="addQuotationToPipeline('${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                            <i class="fas fa-plus"></i> Agregar
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    document.getElementById('addOpportunityModal').classList.add('active');
}

function addQuotationToPipeline(quotationId) {
    const quotation = CRM.quotations.find(q => q.id === quotationId);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    // Check if already in pipeline
    const existingInPipeline = CRM.pipeline.find(p => p.quotationId === quotationId);
    if (existingInPipeline) {
        showNotification('⚠️ Esta cotización ya está en el pipeline', 'warning');
        return;
    }

    // Add to pipeline in Cotizacion stage
    CRM.pipeline.push({
        id: generateId(),
        quotationId: quotationId,
        stage: 'Cotizacion',
        cliente: quotation.cliente?.nombre || 'Sin cliente',
        total: quotation.total,
        fecha: new Date().toISOString()
    });

    saveData();
    showNotification('✅ Cotización agregada al pipeline', 'success');

    // Refresh the modal and pipeline
    showNewOpportunityModal();
    loadPipeline();
}

function approveQuotation(id, btn) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }



    // Trigger animation
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check checkmark-animate"></i>';
    btn.disabled = true;

    // Update quotation status
    quotation.status = 'aprobada';

    // Add to pipeline or advance if already there
    const existingInPipeline = CRM.pipeline.find(p => p.quotationId === id);
    if (!existingInPipeline) {
        CRM.pipeline.push({
            id: generateId(),
            quotationId: id,
            stage: 'Fabricacion', // Advancing to Fabricacion since it's approved
            cliente: quotation.cliente?.nombre || 'Sin cliente',
            total: quotation.total,
            fecha: new Date().toISOString()
        });
    } else {
        // Advance it in the pipeline
        existingInPipeline.stage = 'Fabricacion';
    }

    saveData();
    showSuccessOverlay(`La cotización #${quotation.numero} ha sido aprobada exitosamente.`);

    // Reset button after 2 seconds
    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;
        // Refresh tables
        loadQuotationsTable();
        updateDashboard();
    }, 2000);
    
    // We do NOT navigate away so the user can see it marked as 'aprobada' in the table
}

function markQuotationAsLost(id) {
    const q = CRM.quotations.find(quote => quote.id === id);
    if (!q) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }
    
    document.getElementById('markLostQuotationNumber').textContent = `#${q.numero}`;
    document.getElementById('markLostModal').classList.add('active');
    
    document.getElementById('confirmMarkLostBtn').onclick = () => {
        q.previousStatus = q.status;
        q.status = 'rechazada';
        
        // Update pipeline if it is there
        const existingInPipeline = CRM.pipeline.find(p => p.quotationId === id);
        if (existingInPipeline) {
            existingInPipeline.previousStage = existingInPipeline.stage;
            existingInPipeline.stage = 'Perdido';
        }
        
        saveData();
        loadQuotationsTable();
        loadPipeline();
        updateDashboard();
        closeModal('markLostModal');
        showNotification(`📉 Cotización #${q.numero} marcada como perdida`, 'warning');
    };
}

function reactivateQuotation(id) {
    const q = CRM.quotations.find(quote => quote.id === id);
    if (!q) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }
    
    document.getElementById('reactivateQuotationNumber').textContent = `#${q.numero}`;
    document.getElementById('reactivateModal').classList.add('active');
    
    document.getElementById('confirmReactivateBtn').onclick = () => {
        q.status = q.previousStatus || 'borrador';
        delete q.previousStatus;
        
        // Update pipeline if it is there
        const existingInPipeline = CRM.pipeline.find(p => p.quotationId === id);
        if (existingInPipeline) {
            existingInPipeline.stage = existingInPipeline.previousStage || 'Cotizacion';
            delete existingInPipeline.previousStage;
        }
        
        saveData();
        loadQuotationsTable();
        loadPipeline();
        updateDashboard();
        closeModal('reactivateModal');
        showNotification(`🔄 Cotización #${q.numero} reactivada`, 'success');
    };
}

function loadPipeline() {
    const stages = ['Cotizacion', 'Negociacion', 'Fabricacion', 'PendienteDePago', 'Terminado', 'Perdido'];

    // Clear all columns
    stages.forEach(stage => {
        const el = document.getElementById(`pipeline${stage}`);
        if (el) {
            el.innerHTML = '';
            el.ondragover = handleDragOver;
            el.ondragenter = handleDragEnter;
            el.ondragleave = handleDragLeave;
            el.ondrop = handleDrop;
        }
    });

    // Load pipeline items
    if (CRM.pipeline.length === 0) {
        stages.forEach(stage => {
            const el = document.getElementById(`pipeline${stage}`);
            if (el) {
                el.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Sin oportunidades</p></div>';
            }
        });
        return;
    }

    // Group items by stage
    CRM.pipeline.forEach(item => {
        const el = document.getElementById(`pipeline${item.stage}`);
        if (el) {
            // Remove empty state if present
            const emptyState = el.querySelector('.empty-state');
            if (emptyState) {
                el.innerHTML = '';
            }

            // Get quotation details
            const quotation = CRM.quotations.find(q => q.id === item.quotationId);

            const card = document.createElement('div');
            card.className = 'pipeline-item';
            card.draggable = true;
            card.dataset.itemId = item.id;
            card.ondragstart = handleDragStart;
            card.ondragend = handleDragEnd;

            card.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <strong>${item.cliente}</strong>
                </div>
                <div style="font-size: 0.875rem; color: var(--gray); margin-bottom: 0.5rem;">
                    ${quotation ? `Cotización #${quotation.numero}` : 'Sin cotización'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600; color: var(--primary);">${formatPrecio(item.total)}</span>
                    <span style="font-size: 0.75rem; color: var(--gray);">${timeAgo(item.fecha)}</span>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <button onclick="openPipelineQuotation('${item.quotationId}')" class="btn btn-sm" style="flex: 1; padding: 0.4rem; font-size: 0.75rem; background: var(--gradient-1);">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button onclick="deletePipelineItem('${item.id}')" class="btn btn-sm" style="padding: 0.4rem 0.6rem; font-size: 0.75rem; background: var(--danger); color: white;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            el.appendChild(card);
        }
    });

    // Update counts
    stages.forEach(stage => {
        const count = CRM.pipeline.filter(p => p.stage === stage).length;
        const total = CRM.pipeline.filter(p => p.stage === stage).reduce((sum, p) => sum + (p.total || 0), 0);

        const countEl = document.querySelector(`#pipeline${stage}`)?.parentElement?.querySelector('.pipeline-count');
        if (countEl) {
            countEl.textContent = count;
        }

        const totalId = {
            'Cotizacion': 'totalPipelineCotizacion',
            'Negociacion': 'totalPipelineNegociacion',
            'Fabricacion': 'totalPipelineFabricacion',
            'PendienteDePago': 'totalPipelinePendientePago',
            'Terminado': 'totalPipelineTerminado',
            'Perdido': 'totalPipelinePerdido'
        }[stage];

        const totalEl = document.getElementById(totalId);
        if (totalEl) {
            totalEl.textContent = formatPrecio(total);
        }
    });

    // Update main dashboard stats cards
    let activeTotal = 0;
    let activeCount = 0;
    let priorityCount = 0;
    let lostTotal = 0;

    CRM.pipeline.forEach(p => {
        if (p.stage === 'Perdido') {
            lostTotal += p.total || 0;
        } else {
            activeTotal += p.total || 0;
            activeCount++;
            if (p.total >= 1000000) {
                priorityCount++;
            }
        }
    });

    const valEl = document.getElementById('pipelineStatValue');
    if (valEl) valEl.textContent = formatPrecio(activeTotal);

    const statCountEl = document.getElementById('pipelineStatCount');
    if (statCountEl) statCountEl.textContent = activeCount;

    const priorityEl = document.getElementById('pipelineStatPriority');
    if (priorityEl) priorityEl.textContent = priorityCount;

    const lostEl = document.getElementById('pipelineStatLost');
    if (lostEl) lostEl.textContent = formatPrecio(lostTotal);

    // Render detailed breakdown of stages for both Pipeline and Reports page
    const breakdownEl = document.getElementById('pipelineStagesBreakdown');
    const reportsBreakdownEl = document.getElementById('reportsPipelineStagesBreakdown');
    if (breakdownEl || reportsBreakdownEl) {
        const stageDetails = [
            { key: 'Cotizacion', label: 'Cotización', icon: 'fa-file-invoice-dollar', color: 'var(--primary)' },
            { key: 'Negociacion', label: 'Negociación', icon: 'fa-comments', color: 'var(--secondary)' },
            { key: 'Fabricacion', label: 'Fabricación', icon: 'fa-industry', color: 'var(--warning)' },
            { key: 'PendienteDePago', label: 'Pendiente Pago', icon: 'fa-hand-holding-usd', color: '#06b6d4' },
            { key: 'Terminado', label: 'Terminado', icon: 'fa-check-circle', color: 'var(--success)' },
            { key: 'Perdido', label: 'Perdido', icon: 'fa-times-circle', color: 'var(--danger)' }
        ];

        const grandTotal = activeTotal + lostTotal;

        const html = stageDetails.map(stage => {
            const items = CRM.pipeline.filter(p => p.stage === stage.key);
            const stageTotal = items.reduce((sum, p) => sum + (p.total || 0), 0);
            const stageCount = items.length;
            const pct = grandTotal > 0 ? ((stageTotal / grandTotal) * 100).toFixed(0) : 0;

            return `
                <div class="card" style="padding: 1rem; border-top: 3px solid ${stage.color}; background: rgba(255,255,255,0.02); display: flex; flex-direction: column; justify-content: space-between; gap: 0.5rem; transition: transform 0.2s; cursor: default;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; font-weight: 600; color: var(--gray); display: flex; align-items: center; gap: 0.4rem;">
                            <i class="fas ${stage.icon}" style="color: ${stage.color};"></i> ${stage.label}
                        </span>
                        <span style="font-size: 0.65rem; background: rgba(255,255,255,0.06); padding: 0.15rem 0.4rem; border-radius: 10px; font-weight: 600; color: #fff;">
                            ${stageCount} ${stageCount === 1 ? 'opt' : 'opts'}
                        </span>
                    </div>
                    <div style="margin: 0.25rem 0;">
                        <div style="font-size: 1.15rem; font-weight: 800; color: #fff; font-family: 'Outfit';">${formatPrecio(stageTotal)}</div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--gray); margin-bottom: 0.25rem;">
                            <span>Porcentaje</span>
                            <span style="font-weight: bold; color: ${stage.color};">${pct}%</span>
                        </div>
                        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
                            <div style="width: ${pct}%; height: 100%; background: ${stage.color}; border-radius: 2px;"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (breakdownEl) breakdownEl.innerHTML = html;
        if (reportsBreakdownEl) reportsBreakdownEl.innerHTML = html;
    }

    // Apply quick search filter if any query is active
    const searchInput = document.getElementById('pipelineSearchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        filterPipelineVisually();
    }
}

function filterPipelineVisually() {
    const query = document.getElementById('pipelineSearchInput').value.toLowerCase().trim();
    const clearBtn = document.getElementById('pipelineSearchClear');
    
    if (clearBtn) {
        clearBtn.style.display = query ? 'block' : 'none';
    }

    const stages = ['Cotizacion', 'Negociacion', 'Fabricacion', 'PendienteDePago', 'Terminado', 'Perdido'];
    
    // Track visible counts and totals per stage
    const stageCounts = {
        'Cotizacion': 0,
        'Negociacion': 0,
        'Fabricacion': 0,
        'PendienteDePago': 0,
        'Terminado': 0,
        'Perdido': 0
    };
    const stageTotals = {
        'Cotizacion': 0,
        'Negociacion': 0,
        'Fabricacion': 0,
        'PendienteDePago': 0,
        'Terminado': 0,
        'Perdido': 0
    };

    // Card items in the DOM
    const cards = document.querySelectorAll('.pipeline-item');
    cards.forEach(card => {
        const itemId = card.dataset.itemId;
        const item = CRM.pipeline.find(p => p.id === itemId);
        if (!item) return;

        const quotation = CRM.quotations.find(q => q.id === item.quotationId);
        
        // Build search string: client name + quotation number + item descriptions
        let searchString = (item.cliente || '').toLowerCase();
        if (quotation) {
            searchString += ' #' + quotation.numero;
            if (quotation.items) {
                quotation.items.forEach(i => {
                    searchString += ' ' + (i.descripcion || '').toLowerCase();
                });
            }
        }

        const isMatch = searchString.includes(query);
        if (isMatch) {
            card.style.display = '';
            stageCounts[item.stage]++;
            stageTotals[item.stage] += item.total || 0;
        } else {
            card.style.display = 'none';
        }
    });

    // Update column headers with filtered counts and totals
    stages.forEach(stage => {
        const countEl = document.querySelector(`#pipeline${stage}`)?.parentElement?.querySelector('.pipeline-count');
        if (countEl) {
            countEl.textContent = stageCounts[stage];
        }

        const totalId = {
            'Cotizacion': 'totalPipelineCotizacion',
            'Negociacion': 'totalPipelineNegociacion',
            'Fabricacion': 'totalPipelineFabricacion',
            'PendienteDePago': 'totalPipelinePendientePago',
            'Terminado': 'totalPipelineTerminado',
            'Perdido': 'totalPipelinePerdido'
        }[stage];

        const totalEl = document.getElementById(totalId);
        if (totalEl) {
            totalEl.textContent = formatPrecio(stageTotals[stage]);
        }
    });

    // Update dashboard cards based on filtered/visible items
    let filteredActiveTotal = 0;
    let filteredActiveCount = 0;
    let filteredPriorityCount = 0;
    let filteredLostTotal = stageTotals['Perdido'];

    stages.forEach(stage => {
        if (stage !== 'Perdido') {
            filteredActiveTotal += stageTotals[stage];
            filteredActiveCount += stageCounts[stage];
            // Count "Prioridad Alta" as items in active stages with total >= 1,000,000
            const stageItems = CRM.pipeline.filter(p => p.stage === stage);
            stageItems.forEach(item => {
                const card = document.querySelector(`.pipeline-item[data-item-id="${item.id}"]`);
                if (card && card.style.display !== 'none') {
                    if (item.total >= 1000000) {
                        filteredPriorityCount++;
                    }
                }
            });
        }
    });

    const valEl = document.getElementById('pipelineStatValue');
    if (valEl) valEl.textContent = formatPrecio(filteredActiveTotal);

    const countEl = document.getElementById('pipelineStatCount');
    if (countEl) countEl.textContent = filteredActiveCount;

    const priorityEl = document.getElementById('pipelineStatPriority');
    if (priorityEl) priorityEl.textContent = filteredPriorityCount;

    const lostEl = document.getElementById('pipelineStatLost');
    if (lostEl) lostEl.textContent = formatPrecio(filteredLostTotal);
}

function clearPipelineSearch() {
    const input = document.getElementById('pipelineSearchInput');
    if (input) {
        input.value = '';
        filterPipelineVisually();
    }
}

// Drag and Drop handlers
let draggedItem = null;

function handleDragStart(e) {
    // Ensure we are dragging the item and not a child element
    draggedItem = e.target.closest('.pipeline-item');
    if (!draggedItem) return;

    draggedItem.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedItem.dataset.itemId);
}

function handleDragEnd(e) {
    if (draggedItem) {
        draggedItem.style.opacity = '1';
    }
    draggedItem = null;

    // Clean up any stray drag-over classes
    document.querySelectorAll('.pipeline-drop-zone').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();

    e.currentTarget.classList.remove('drag-over');

    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
        const newStage = e.currentTarget.id.replace('pipeline', '');

        // Find and update the item
        const item = CRM.pipeline.find(p => p.id === itemId);
        if (item) {
            if (item.stage !== newStage) {
                item.stage = newStage;
                saveData();
                loadPipeline();
                showNotification(`✅ Oportunidad movida a ${newStage}`, 'success');
            }
        }
    }

    return false;
}

function openPipelineQuotation(quotationId) {
    if (quotationId) {
        viewQuotation(quotationId);
    } else {
        showNotification('❌ No hay cotización asociada', 'danger');
    }
}

function deletePipelineItem(itemId) {
    if (confirm('¿Estás seguro de eliminar esta oportunidad del pipeline?')) {
        const index = CRM.pipeline.findIndex(p => p.id === itemId);
        if (index !== -1) {
            CRM.pipeline.splice(index, 1);
            saveData();
            loadPipeline();
            showNotification('✅ Oportunidad eliminada del pipeline', 'success');
        }
    }
}

// ============= TASKS =============
function showNewTaskModal() {
    document.getElementById('newTaskForm').reset();
    document.getElementById('newTaskModal').classList.add('active');
}

function loadTasks() {
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
            
            return `
                <div class="card" style="margin-bottom: 0.5rem; padding: 1rem; border-left: 4px solid ${color}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0;">${task.title}</h4>
                        <div style="display: flex; gap: 0.25rem;">
                            ${status !== 'completed' ? `<button class="btn btn-sm" style="padding: 0.2rem 0.5rem; background: var(--success);" onclick="updateTaskStatus('${task.id}', 'completed')"><i class="fas fa-check"></i></button>` : ''}
                            ${status === 'pending' ? `<button class="btn btn-sm" style="padding: 0.2rem 0.5rem; background: var(--primary);" onclick="updateTaskStatus('${task.id}', 'in_progress')"><i class="fas fa-play"></i></button>` : ''}
                            <button class="btn btn-sm btn-outline" style="padding: 0.2rem 0.5rem; border-color: var(--danger); color: var(--danger);" onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: var(--text-secondary);">${task.description || ''}</p>
                    ${task.dueDate ? `<div style="font-size: 0.75rem; color: var(--gray);"><i class="far fa-calendar"></i> ${formatDate(task.dueDate)}</div>` : ''}
                </div>
            `;
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

// ============= CHARTS =============
let salesChart, materialsChart, customersChart, reportSalesTrendChart, reportTasksChart, reportPipelineChart, reportTopCustomersChart, monthlySalesCalendarChart;

// Calendar States
let calendarCurrentDate = new Date();
let calendarSelectedDate = new Date();

function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        salesChart = new Chart(salesCtx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 7}, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - 6 + i);
                    return d.toLocaleDateString('es-CL', { weekday: 'short' });
                }),
                datasets: [{
                    label: 'Ventas',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: 'rgba(255, 0, 102, 0.7)',
                    borderColor: 'rgb(255, 0, 102)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toLocaleString('es-CL');
                            }
                        }
                    }
                }
            }
        });
    }

    // New Calendar Sales Chart
    const monthlySalesCalendarCtx = document.getElementById('monthlySalesCalendarChart');
    if (monthlySalesCalendarCtx) {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const labels = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());

        monthlySalesCalendarChart = new Chart(monthlySalesCalendarCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas del Día',
                    data: new Array(daysInMonth).fill(0),
                    backgroundColor: 'rgba(244, 63, 94, 0.7)',
                    borderColor: 'rgb(244, 63, 94)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function updateSalesChart() {
    if (salesChart && CRM.quotations.length > 0) {
        // Group sales by day (last 7 days)
        const dailyData = new Array(7).fill(0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        CRM.quotations.forEach(q => {
            if (q.status === 'aprobada' && q.fecha) {
                const date = new Date(q.fecha);
                date.setHours(0, 0, 0, 0);
                const diffTime = today - date;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays < 7) {
                    dailyData[6 - diffDays] += q.total || 0;
                }
            }
        });

        salesChart.data.datasets[0].data = dailyData;
        salesChart.update();
        updateMonthlySalesCalendarChart();
    }
}

function updateMonthlySalesCalendarChart() {
    if (monthlySalesCalendarChart && CRM.quotations.length > 0) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dailyData = new Array(daysInMonth).fill(0);

        CRM.quotations.forEach(q => {
            if (q.status === 'aprobada' && q.fecha) {
                const date = new Date(q.fecha);
                if (date.getFullYear() === year && date.getMonth() === month) {
                    const day = date.getDate();
                    dailyData[day - 1] += q.total || 0;
                }
            }
        });

        monthlySalesCalendarChart.data.datasets[0].data = dailyData;
        monthlySalesCalendarChart.update();
    }
}

function isSameCalendarDay(d1, d2) {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('T')) {
        return new Date(dateStr);
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
}

function updateReports() {
    const approvedQuotes = CRM.quotations.filter(q => q.status === 'aprobada' || q.status === 'aprobado');
    const totalSales = approvedQuotes.reduce((sum, q) => sum + (q.total || 0), 0);
    const conversionRate = CRM.quotations.length > 0 ? (approvedQuotes.length / CRM.quotations.length) * 100 : 0;
    const avgTicket = approvedQuotes.length > 0 ? totalSales / approvedQuotes.length : 0;
    const pendingTasks = CRM.tasks.filter(t => t.status !== 'completed').length;

    const formatMoney = (val) => '$' + val.toLocaleString('es-CL');
    
    // Calculate new KPIs
    const wonTotal = totalSales;
    const lostTotal = CRM.quotations.filter(q => q.status === 'rechazada' || q.status === 'rechazado').reduce((sum, q) => sum + (q.total || 0), 0);
    const wonUtility = approvedQuotes.reduce((sum, q) => {
        const qUtility = q.items ? q.items.reduce((itemSum, item) => {
            const utilPerUnit = item.detalles && typeof item.detalles.utilidadPorUnidad === 'number' 
                ? item.detalles.utilidadPorUnidad 
                : 0;
            const qty = typeof item.cantidad === 'number' ? item.cantidad : 1;
            return itemSum + (utilPerUnit * qty);
        }, 0) : 0;
        return sum + qUtility;
    }, 0);
    const pendingTotal = CRM.quotations.filter(q => q.status !== 'aprobada' && q.status !== 'aprobado' && q.status !== 'rechazada' && q.status !== 'rechazado').reduce((sum, q) => sum + (q.total || 0), 0);

    // Update numeric cards
    const elSales = document.getElementById('reportTotalSales');
    if(elSales) elSales.innerText = formatMoney(totalSales);
    const elConv = document.getElementById('reportConversionRate');
    if(elConv) elConv.innerText = conversionRate.toFixed(1) + '%';
    const elTicket = document.getElementById('reportAvgTicket');
    if(elTicket) elTicket.innerText = formatMoney(avgTicket);
    const elTasks = document.getElementById('reportPendingTasks');
    if(elTasks) elTasks.innerText = pendingTasks;

    // Update new KPI cards
    const elWon = document.getElementById('reportKpiWonValue');
    if(elWon) elWon.innerText = formatMoney(wonTotal);
    const elLost = document.getElementById('reportKpiLostValue');
    if(elLost) elLost.innerText = formatMoney(lostTotal);
    const elProfit = document.getElementById('reportKpiProfitValue');
    if(elProfit) elProfit.innerText = formatMoney(wonUtility);
    const elPending = document.getElementById('reportKpiPendingValue');
    if(elPending) elPending.innerText = formatMoney(pendingTotal);

    // Render calendar
    renderCalendar();
    renderCalendarDetail();

    // Render pipeline stages breakdown on reports page
    loadPipeline();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthYearText = document.getElementById('calendarMonthYear');
    if (!grid || !monthYearText) return;

    const year = calendarCurrentDate.getFullYear();
    const month = calendarCurrentDate.getMonth();

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    monthYearText.textContent = `${monthNames[month]} ${year}`;

    grid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    // Fill previous month padding cells
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayNum = prevTotalDays - i;
        const cell = document.createElement('div');
        cell.className = 'calendar-cell calendar-cell-other';
        cell.innerHTML = `<span class="calendar-cell-day-num">${dayNum}</span>`;
        grid.appendChild(cell);
    }

    const today = new Date();
    const approvedQuotes = CRM.quotations.filter(q => q.status === 'aprobada' || q.status === 'aprobado');

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        
        const cellDate = new Date(year, month, day);
        
        if (isSameCalendarDay(cellDate, today)) {
            cell.classList.add('calendar-cell-today');
        }
        
        if (isSameCalendarDay(cellDate, calendarSelectedDate)) {
            cell.classList.add('calendar-cell-selected');
        }

        let daySalesTotal = 0;
        approvedQuotes.forEach(q => {
            const qDate = q.fecha ? new Date(q.fecha) : null;
            if (qDate && isSameCalendarDay(qDate, cellDate)) {
                daySalesTotal += q.total || 0;
            }
        });

        const dayTasks = CRM.tasks.filter(t => {
            if (!t.dueDate) return false;
            const tDate = parseLocalDate(t.dueDate);
            return tDate && isSameCalendarDay(tDate, cellDate);
        });

        let html = `<span class="calendar-cell-day-num">${day}</span>`;
        
        if (daySalesTotal > 0) {
            let compactSales = '';
            if (daySalesTotal >= 1000000) {
                compactSales = `+$${(daySalesTotal / 1000000).toFixed(1).replace('.0', '')}M`;
            } else if (daySalesTotal >= 1000) {
                compactSales = `+$${(daySalesTotal / 1000).toFixed(0)}K`;
            } else {
                compactSales = `+$${daySalesTotal}`;
            }
            html += `<span class="calendar-cell-badge" title="${formatPrecio(daySalesTotal)}">${compactSales}</span>`;
        }

        if (dayTasks.length > 0) {
            html += `<div class="calendar-cell-dots">`;
            dayTasks.forEach(() => {
                html += `<span class="calendar-task-dot"></span>`;
            });
            html += `</div>`;
        }

        cell.innerHTML = html;
        
        cell.addEventListener('click', () => {
            const prevSelected = grid.querySelector('.calendar-cell-selected');
            if (prevSelected) {
                prevSelected.classList.remove('calendar-cell-selected');
            }
            cell.classList.add('calendar-cell-selected');
            
            calendarSelectedDate = cellDate;
            renderCalendarDetail();
        });

        grid.appendChild(cell);
    }

    const currentCellsCount = firstDayIndex + totalDays;
    const remainingCells = 42 - currentCellsCount;
    for (let day = 1; day <= remainingCells; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell calendar-cell-other';
        cell.innerHTML = `<span class="calendar-cell-day-num">${day}</span>`;
        grid.appendChild(cell);
    }
}

function changeCalendarMonth(direction) {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + direction);
    renderCalendar();
}

function setCalendarToToday() {
    calendarCurrentDate = new Date();
    calendarSelectedDate = new Date();
    renderCalendar();
    renderCalendarDetail();
}

function renderCalendarDetail() {
    const detailDateText = document.getElementById('calendarDetailDate');
    const detailContent = document.getElementById('calendarDetailContent');
    if (!detailDateText || !detailContent) return;

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthsShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const dayName = daysOfWeek[calendarSelectedDate.getDay()];
    const dayNum = calendarSelectedDate.getDate();
    const monthName = monthsShort[calendarSelectedDate.getMonth()];
    const year = calendarSelectedDate.getFullYear();

    detailDateText.textContent = `${dayName}, ${dayNum} ${monthName} ${year}`;
    detailContent.innerHTML = '';

    const approvedQuotes = CRM.quotations.filter(q => {
        if (q.status !== 'aprobada' && q.status !== 'aprobado') return false;
        const qDate = q.fecha ? new Date(q.fecha) : null;
        return qDate && isSameCalendarDay(qDate, calendarSelectedDate);
    });

    const dayTasks = CRM.tasks.filter(t => {
        if (!t.dueDate) return false;
        const tDate = parseLocalDate(t.dueDate);
        return tDate && isSameCalendarDay(tDate, calendarSelectedDate);
    });

    if (approvedQuotes.length === 0 && dayTasks.length === 0) {
        detailContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 200px; text-align: center; color: var(--text-secondary); opacity: 0.6; gap: 0.75rem;">
                <i class="far fa-calendar" style="font-size: 2.5rem; color: var(--text-secondary);"></i>
                <p style="font-size: 0.9rem; margin: 0;">Sin actividades ni ventas registradas para este día.</p>
            </div>
        `;
        return;
    }

    if (approvedQuotes.length > 0) {
        const salesSection = document.createElement('div');
        salesSection.style.display = 'flex';
        salesSection.style.flexDirection = 'column';
        salesSection.style.gap = '0.5rem';
        
        let salesHtml = `
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--success); letter-spacing: 0.5px; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.35rem;">
                <i class="fas fa-handshake"></i> Ventas Aprobadas (${approvedQuotes.length})
            </div>
        `;

        approvedQuotes.forEach(q => {
            const clientName = q.cliente?.nombre || 'Sin cliente';
            const projectInfo = q.items && q.items.length > 0 ? q.items.map(item => item.descripcion).join(', ') : 'Letrero Caperuso';
            
            salesHtml += `
                <div style="background: rgba(67, 233, 123, 0.05); border: 1px solid rgba(67, 233, 123, 0.15); border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(3px)'" onmouseout="this.style.transform='none'">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; font-weight: 700; color: #fff;">Cotización #${q.numero}</span>
                        <strong style="color: #43e97b; font-size: 0.9rem;">${formatPrecio(q.total || 0)}</strong>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
                        <i class="fas fa-user" style="font-size: 0.7rem; color: var(--secondary);"></i> ${clientName}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${projectInfo}">
                        <i class="fas fa-drafting-compass" style="font-size: 0.7rem;"></i> ${projectInfo}
                    </div>
                </div>
            `;
        });
        
        salesSection.innerHTML = salesHtml;
        detailContent.appendChild(salesSection);
    }

    if (dayTasks.length > 0) {
        if (approvedQuotes.length > 0) {
            const divider = document.createElement('div');
            divider.style.borderTop = '1px solid rgba(255,255,255,0.05)';
            divider.style.margin = '0.5rem 0';
            detailContent.appendChild(divider);
        }

        const tasksSection = document.createElement('div');
        tasksSection.style.display = 'flex';
        tasksSection.style.flexDirection = 'column';
        tasksSection.style.gap = '0.5rem';

        let tasksHtml = `
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--warning); letter-spacing: 0.5px; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.35rem;">
                <i class="fas fa-tasks"></i> Tareas de Fabricación (${dayTasks.length})
            </div>
        `;

        dayTasks.forEach(t => {
            const priorityColors = {
                'high': 'var(--danger)',
                'medium': 'var(--warning)',
                'low': 'var(--success)'
            };
            const priorityLabels = {
                'high': 'Alta',
                'medium': 'Media',
                'low': 'Baja'
            };
            const priorityBadgeColor = priorityColors[t.priority] || 'var(--primary)';
            const priorityLabel = priorityLabels[t.priority] || 'Normal';
            const statusLabel = t.status === 'completed' ? 'Completada' : 'Pendiente';
            const statusColor = t.status === 'completed' ? '#43e97b' : 'var(--warning)';

            tasksHtml += `
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(3px)'" onmouseout="this.style.transform='none'">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                        <span style="font-size: 0.85rem; font-weight: 500; color: #fff; line-height: 1.2;">${t.title || t.description}</span>
                        <span style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05); color: ${priorityBadgeColor}; border: 1px solid ${priorityBadgeColor}40; white-space: nowrap;">
                            ${priorityLabel}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">
                            <i class="far fa-check-circle" style="color: ${statusColor};"></i> ${statusLabel}
                        </span>
                    </div>
                </div>
            `;
        });

        tasksSection.innerHTML = tasksHtml;
        detailContent.appendChild(tasksSection);
    }
}

window.changeCalendarMonth = changeCalendarMonth;
window.setCalendarToToday = setCalendarToToday;

// ============= SETTINGS =============
function loadSettings() {
    const container = document.getElementById('materialsSettings');

    let html = '<div class="grid grid-2" style="gap: 1rem;">';

    // Placas
    html += '<div><h4 style="margin-bottom: 1rem;">Placas</h4>';
    for (const [name, price] of Object.entries(precios.placas)) {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid var(--gray-light);">
                <span style="font-weight: 500;">${name}</span>
                <span style="color: var(--primary); font-weight: 600;">${formatPrecio(price)}</span>
            </div>
        `;
    }
    html += '</div>';

    // Adhesivos
    html += '<div><h4 style="margin-bottom: 1rem;">Adhesivos</h4>';
    for (const [name, price] of Object.entries(precios.adhesivos)) {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid var(--gray-light);">
                <span style="font-weight: 500;">${name}</span>
                <span style="color: var(--primary); font-weight: 600;">${formatPrecio(price)}</span>
            </div>
        `;
    }
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
}

function showEditPricesModal() {
    showNotification('🔧 Editor de precios en desarrollo', 'warning');
}

// ============= QUOTER (ORIGINAL FUNCTIONALITY) =============
function loadQuoterContent() {
    const quoterContainer = document.getElementById('quoterContent');

    quoterContainer.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: var(--primary);">DATOS DEL CLIENTE</h3>
                <button type="button" class="btn btn-outline btn-sm" onclick="openClientSelectorModal()">
                    <i class="fas fa-search"></i> Buscar Cliente Registrado
                </button>
            </div>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">N° de Cotización:</label>
                    <input type="text" id="cotizacionNumero" class="form-control" placeholder="Ej: 0001">
                </div>
                <div class="form-group">
                    <label class="form-label">Nombre del Cliente:</label>
                    <input type="text" id="clienteNombre" class="form-control" placeholder="Ej: Juan Pérez">
                </div>
                <div class="form-group">
                    <label class="form-label">Empresa:</label>
                    <input type="text" id="clienteEmpresaNombre" class="form-control" placeholder="Nombre de la empresa">
                </div>
                <div class="form-group">
                    <label class="form-label">RUT Empresa:</label>
                    <input type="text" id="clienteRut" class="form-control" placeholder="77.123.456-7">
                </div>
                <div class="form-group">
                    <label class="form-label">Teléfono:</label>
                    <input type="tel" id="clienteTelefono" class="form-control" placeholder="+56 9 ...">
                </div>
                <div class="form-group">
                    <label class="form-label">Email:</label>
                    <input type="email" id="clienteEmail" class="form-control" placeholder="cliente@email.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Dirección:</label>
                    <input type="text" id="clienteDireccion" class="form-control" placeholder="Av. Principal 123">
                </div>
                <div class="form-group">
                    <label class="form-label">Giro:</label>
                    <input type="text" id="clienteGiro" class="form-control" placeholder="Venta de intangibles">
                </div>
                <div class="form-group">
                    <label class="form-label">Días de Fabricación:</label>
                    <input type="number" id="diasFabricacion" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <!-- Placeholder to align grid -->
                </div>
                <div class="form-group">
                    <label class="form-label">Costo de Envío:</label>
                    <select id="tipoEnvio" class="form-control" onchange="document.getElementById('costoEnvio').style.display = this.value === 'Monto Manual' ? 'block' : 'none'">
                        <option value="Monto Manual">Monto Manual</option>
                        <option value="Retiro en Tienda">Retiro en Tienda</option>
                        <option value="Envio Gratis">Envío Gratis</option>
                    </select>
                    <input type="number" id="costoEnvio" class="form-control" placeholder="Monto Envío" style="margin-top: 0.5rem; display: block;">
                </div>
                <div class="form-group">
                    <label class="form-label">Costo de Instalación:</label>
                    <select id="tipoInstalacion" class="form-control" onchange="document.getElementById('costoInstalacion').style.display = this.value === 'Monto Manual' ? 'block' : 'none'">
                        <option value="Monto Manual">Monto Manual</option>
                        <option value="Sin Instalación">Sin Instalación</option>
                    </select>
                    <input type="number" id="costoInstalacion" class="form-control" placeholder="Monto Instalación" style="margin-top: 0.5rem; display: block;">
                </div>
            </div>
            <input type="hidden" id="editingQuotationId" value="">
        </div>

        <div class="card" style="display: none;">
            <h3 style="margin-bottom: 2rem; color: var(--primary);">PRECIOS DE MATERIALES</h3>
            <div class="materiales-container" id="materialesContainer"></div>
        </div>
        
        <div class="card" style="margin-top: 2rem;">
            <h3 style="margin-bottom: 2rem; color: var(--primary);">DATOS DEL LETRERO</h3>
            <form id="cotizadorForm">
                <div class="grid grid-2">
                    <div class="form-group">
                        <label class="form-label">NOMBRE DEL LETRERO:</label>
                        <input type="text" id="nombre" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">CANTIDAD:</label>
                        <input type="number" id="cantidad" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ANCHO (CM):</label>
                        <input type="number" id="ancho" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ALTO (CM):</label>
                        <input type="number" id="alto" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">TIPO DE PLACA:</label>
                        <select id="tipoPlaca" class="form-control" required>
                            <option value="">SELECCIONE UN TIPO</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">TIPO DE ADHESIVO:</label>
                        <select id="tipoAdhesivo" class="form-control" required>
                            <option value="">SELECCIONE UN TIPO</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">TIPO DE LAMINADO:</label>
                        <select id="tipoLaminado" class="form-control" required>
                            <option value="">SELECCIONE UN TIPO</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">TIPO DE ANCLAJE:</label>
                        <select id="tipoAnclaje" class="form-control" required>
                            <option value="">SELECCIONE UN TIPO</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">UTILIDAD (%):</label>
                        <input type="number" id="utilidad" value="30" class="form-control" required>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                    <i class="fas fa-calculator"></i> CALCULAR COTIZACIÓN
                </button>
            </form>
        </div>
        
        <div id="resultado"></div>
        
        <div id="carrito" style="display: none;">
            <div class="card" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1.5rem; color: var(--primary);">CARRITO DE COMPRAS</h3>
                <div id="carritoItems"></div>
                <div id="carritoTotal"></div>
            </div>
        </div>
    `;

    // Initialize quoter
    generarCamposMateriales();
    actualizarOpcionesSelect();

    // Form submission
    document.getElementById('cotizadorForm').addEventListener('submit', calcularCotizacion);
}

function generarCamposMateriales() {
    const container = document.getElementById('materialesContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="grid grid-2">
            ${createMaterialGroup('PLACAS', precios.placas)}
            ${createMaterialGroup('ADHESIVOS', precios.adhesivos)}
            ${createMaterialGroup('LAMINADOS', precios.laminados)}
            ${createMaterialGroup('ANCLAJES', precios.anclajes)}
        </div>
    `;
}

function createMaterialGroup(title, items) {
    return `
        <div class="card">
            <h4 style="margin-bottom: 1rem; color: var(--dark);">${title}</h4>
            ${Object.entries(items).map(([name, price]) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid var(--gray-light);">
                    <span>${name}</span>
                    <input type="number" value="${price}" 
                           data-tipo="${title}" 
                           data-nombre="${name}" 
                           onchange="actualizarPrecio(event)"
                           style="width: 120px; padding: 0.5rem; border: 2px solid var(--gray-light); border-radius: 8px;">
                </div>
            `).join('')}
        </div>
    `;
}

function actualizarPrecio(e) {
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;
    const nuevoPrecio = parseFloat(e.target.value);

    if (tipo === 'IMPRESIÓN') {
        precios.impresion = nuevoPrecio;
    } else {
        precios[tipo.toLowerCase()][nombre] = nuevoPrecio;
    }

    actualizarOpcionesSelect();
    saveData();
}

function actualizarOpcionesSelect() {
    const selects = {
        tipoPlaca: precios.placas,
        tipoAdhesivo: precios.adhesivos,
        tipoLaminado: precios.laminados,
        tipoAnclaje: precios.anclajes
    };

    for (const [selectId, options] of Object.entries(selects)) {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">SELECCIONE UN TIPO</option>';
            for (const name of Object.keys(options)) {
                select.innerHTML += `<option value="${name}">${name}</option>`;
            }
        }
    }
}

function calcularCotizacion(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const ancho = parseFloat(document.getElementById('ancho').value);
    const alto = parseFloat(document.getElementById('alto').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const tipoPlaca = document.getElementById('tipoPlaca').value;
    const tipoAdhesivo = document.getElementById('tipoAdhesivo').value;
    const tipoLaminado = document.getElementById('tipoLaminado').value;
    const tipoAnclaje = document.getElementById('tipoAnclaje').value;
    const utilidad = parseFloat(document.getElementById('utilidad').value) / 100;

    const area = tipoPlaca.includes('PENDÓN ROLLER') ? 1 : (ancho * alto / 10000);
    const perimeter = tipoPlaca.includes('PENDÓN ROLLER') ? 0 : ((ancho + alto) * 2 / 100);

    const costoPlaca = tipoPlaca === 'SIN PLACA' ? 0 :
        tipoPlaca.includes('PENDÓN ROLLER') ? precios.placas[tipoPlaca] : precios.placas[tipoPlaca] * area;
    const costoAdhesivo = precios.adhesivos[tipoAdhesivo] * area;
    const costoLaminado = precios.laminados[tipoLaminado] * area;
    const costoImpresion = precios.impresion * area;
    const costoAnclaje = precios.anclajes[tipoAnclaje] * perimeter;

    const costoMaterialesPorUnidad = Math.round(costoPlaca + costoAdhesivo + costoLaminado + costoImpresion + costoAnclaje);
    const costoMaterialesBase = Math.round(costoPlaca + costoAdhesivo + costoLaminado + costoAnclaje);
    const costoDiseno = Math.round(costoMaterialesBase * 0.25);
    const costoFabricacion = Math.round(costoMaterialesBase * 0.25);
    const costoServiciosPorUnidad = Math.round(costoDiseno + costoFabricacion);
    const costoTotalPorUnidad = Math.round(costoMaterialesPorUnidad + costoServiciosPorUnidad);
    const utilidadPorUnidad = Math.round(costoTotalPorUnidad * utilidad);
    const precioFinalPorUnidad = Math.round(costoTotalPorUnidad + utilidadPorUnidad);
    const precioFinal = Math.round(precioFinalPorUnidad * cantidad);

    const item = {
        nombre,
        dimensiones: `${ancho}cm x ${alto}cm`,
        cantidad,
        precio: precioFinal,
        detalles: {
            placa: { tipo: tipoPlaca, costo: costoPlaca },
            adhesivo: { tipo: tipoAdhesivo, costo: costoAdhesivo },
            laminado: { tipo: tipoLaminado, costo: costoLaminado },
            anclaje: { tipo: tipoAnclaje, costo: costoAnclaje },
            impresion: { costo: costoImpresion },
            servicios: {
                diseno: { costo: costoDiseno },
                fabricacion: { costo: costoFabricacion }
            },
            area,
            costoMaterialesPorUnidad,
            costoServiciosPorUnidad,
            costoTotalPorUnidad,
            utilidadPorUnidad,
            precioFinalPorUnidad
        }
    };

    mostrarResultado(item);
}

function mostrarResultado(item) {
    const resultado = document.getElementById('resultado');

    resultado.innerHTML = `
        <div class="card" style="margin-top: 2rem;">
            <h3 style="color: var(--primary); margin-bottom: 1.5rem;">
                COTIZACIÓN: "${item.nombre.toUpperCase()}"
            </h3>
            
            <div class="grid grid-2" style="margin-bottom: 1.5rem;">
                <div>
                    <p><strong>Dimensiones:</strong> ${item.dimensiones}</p>
                    <p><strong>Área:</strong> ${Math.round(item.detalles.area * 100) / 100} M²</p>
                    <p><strong>Cantidad:</strong> ${item.cantidad}</p>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 0.875rem; color: var(--gray);">Precio Unitario</p>
                    <p style="font-size: 2rem; font-weight: 800; color: var(--primary);">
                        ${formatPrecio(item.detalles.precioFinalPorUnidad)}
                    </p>
                    <p style="font-size: 1.25rem; font-weight: 700; color: var(--dark);">
                        Total: ${formatPrecio(item.precio)}
                    </p>
                </div>
            </div>
            
            <details style="margin-bottom: 1rem;">
                <summary style="cursor: pointer; font-weight: 600; padding: 0.75rem; background: var(--gray-light); border-radius: 8px;">
                    Ver Desglose Detallado
                </summary>
                <div style="padding: 1rem; margin-top: 0.5rem;">
                    <h4>Materiales:</h4>
                    <ul>
                        <li>Placa: ${formatPrecio(item.detalles.placa.costo)}</li>
                        <li>Adhesivo: ${formatPrecio(item.detalles.adhesivo.costo)}</li>
                        <li>Laminado: ${formatPrecio(item.detalles.laminado.costo)}</li>
                        <li>Impresión: ${formatPrecio(item.detalles.impresion.costo)}</li>
                        <li>Anclaje: ${formatPrecio(item.detalles.anclaje.costo)}</li>
                    </ul>
                    <h4>Servicios:</h4>
                    <ul>
                        <li>Diseño: ${formatPrecio(item.detalles.servicios.diseno.costo)}</li>
                        <li>Fabricación: ${formatPrecio(item.detalles.servicios.fabricacion.costo)}</li>
                    </ul>
                    <h4>Totales:</h4>
                    <ul>
                        <li><strong>Costo Total: ${formatPrecio(item.detalles.costoTotalPorUnidad)}</strong></li>
                        <li><strong>Utilidad: ${formatPrecio(item.detalles.utilidadPorUnidad)}</strong></li>
                    </ul>
                </div>
            </details>
            
            <button class="btn btn-success" onclick='agregarAlCarrito(${JSON.stringify(item).replace(/'/g, "&#39;")})' style="width: 100%;">
                <i class="fas fa-cart-plus"></i> AGREGAR AL CARRITO
            </button>
        </div>
    `;
}

function agregarAlCarrito(item) {
    carrito.push(item);
    document.getElementById('carrito').style.display = 'block';
    actualizarCarrito();
    showNotification('✅ Item agregado al carrito', 'success');
}

function actualizarCarrito() {
    const carritoItems = document.getElementById('carritoItems');
    const carritoTotal = document.getElementById('carritoTotal');

    if (carrito.length === 0) {
        document.getElementById('carrito').style.display = 'none';
        return;
    }

    let total = 0;

    carritoItems.innerHTML = carrito.map((item, index) => {
        total += item.precio;
        return `
            <div class="card" style="margin-bottom: 1rem; background: rgba(30, 58, 138, 0.4); border: 1px solid rgba(59, 130, 246, 0.2);">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4>${item.nombre} - ${item.dimensiones}</h4>
                        <p>Cantidad: ${item.cantidad} | Unitario: ${formatPrecio(item.detalles.precioFinalPorUnidad)}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">
                            ${formatPrecio(item.precio)}
                        </p>
                        <button class="btn" onclick="eliminarDelCarrito(${index})" 
                                style="background: var(--danger); color: white; padding: 0.5rem 1rem; font-size: 0.875rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const iva = Math.round(total * 0.19);
    const totalConIva = total + iva;

    carritoTotal.innerHTML = `
        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 12px; margin-top: 1rem; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Subtotal:</span>
                <span style="font-weight: 600;">${formatPrecio(total)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>IVA (19%):</span>
                <span style="font-weight: 600;">${formatPrecio(iva)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 2px solid var(--gray-light);">
                <span style="font-size: 1.25rem; font-weight: 700;">TOTAL:</span>
                <span style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${formatPrecio(totalConIva)}</span>
            </div>
            
            <button class="btn btn-primary" onclick="finalizarCotizacion()" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-check"></i> FINALIZAR Y GUARDAR COTIZACIÓN
            </button>
        </div>
    `;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    showNotification('Item eliminado del carrito', 'warning');
}

function finalizarCotizacion() {
    if (carrito.length === 0) return;

    const editingId = document.getElementById('editingQuotationId').value;
    const manualNumero = document.getElementById('cotizacionNumero').value;
    const clientData = {
        nombre: document.getElementById('clienteNombre').value,
        empresa: document.getElementById('clienteEmpresaNombre').value,
        rut: document.getElementById('clienteRut').value,
        telefono: document.getElementById('clienteTelefono').value,
        email: document.getElementById('clienteEmail').value,
        direccion: document.getElementById('clienteDireccion').value,
        giro: document.getElementById('clienteGiro').value
    };
    
    const diasFabricacion = parseInt(document.getElementById('diasFabricacion').value) || 0;
    const envio = {
        tipo: document.getElementById('tipoEnvio').value,
        costo: parseFloat(document.getElementById('costoEnvio').value) || 0
    };
    const instalacion = {
        tipo: document.getElementById('tipoInstalacion').value,
        costo: parseFloat(document.getElementById('costoInstalacion').value) || 0
    };

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);

    if (editingId) {
        // Update existing quotation
        const index = CRM.quotations.findIndex(q => q.id === editingId);
        if (index !== -1) {
            CRM.quotations[index].items = [...carrito];
            CRM.quotations[index].total = total;
            CRM.quotations[index].cliente = clientData;
            CRM.quotations[index].diasFabricacion = diasFabricacion;
            CRM.quotations[index].envio = envio;
            CRM.quotations[index].instalacion = instalacion;
            if(manualNumero) CRM.quotations[index].numero = manualNumero;

            showNotification(`✅ Cotización #${CRM.quotations[index].numero} actualizada`, 'success');
        }
    } else {
        // Create new quotation
        const numero = (CRM.quotations.length + 1).toString().padStart(4, '0');

        const quotation = {
            id: generateId(),
            numero: manualNumero || numero,
            fecha: new Date().toISOString(),
            items: [...carrito],
            total: total,
            status: 'borrador',
            cliente: clientData,
            diasFabricacion: diasFabricacion,
            envio: envio,
            instalacion: instalacion
        };

        CRM.quotations.push(quotation);

        // Auto-add to pipeline stage 'Cotizacion'
        CRM.pipeline.push({
            id: generateId(),
            quotationId: quotation.id,
            stage: 'Cotizacion',
            cliente: quotation.cliente?.nombre || 'Sin cliente',
            total: quotation.total,
            fecha: new Date().toISOString()
        });

        showNotification(`✅ Cotización #${numero} guardada e ingresada al pipeline`, 'success');
    }

    saveData();

    carrito = [];
    actualizarCarrito();

    // Clear inputs
    if(document.getElementById('cotizacionNumero')) document.getElementById('cotizacionNumero').value = '';
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteEmpresaNombre').value = '';
    document.getElementById('clienteRut').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteEmail').value = '';
    document.getElementById('clienteDireccion').value = '';
    document.getElementById('clienteGiro').value = '';
    document.getElementById('diasFabricacion').value = '0';
    document.getElementById('costoEnvio').value = '';
    document.getElementById('tipoEnvio').value = 'Monto Manual';
    document.getElementById('costoEnvio').style.display = 'block';
    document.getElementById('costoInstalacion').value = '';
    document.getElementById('tipoInstalacion').value = 'Monto Manual';
    document.getElementById('costoInstalacion').style.display = 'block';
    document.getElementById('editingQuotationId').value = '';

    // Update dashboard
    updateDashboard();

    // Navigate back to quotations list
    navigateToPage('quotations');
    loadQuotationsTable();
}

// ============= UTILITY FUNCTIONS =============
function formatPrecio(valor) {
    return `$${Math.round(valor).toLocaleString('es-CL')}`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
}

function timeAgo(dateString) {
    if (!dateString) return 'Hace un momento';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return formatDate(dateString);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substr(0, 2).toUpperCase();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--gradient-4)' :
            type === 'danger' ? 'var(--gradient-2)' :
                type === 'warning' ? 'var(--warning)' : 'var(--gradient-3)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-weight: 600;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============= INITIALIZATION =============
console.log('🎨 CRM LETREROS CAPERUSO - Sistema Iniciado');
console.log('📊 Clientes:', CRM.customers.length);
console.log('📝 Cotizaciones:', CRM.quotations.length);

// --- AI Module Mocks and Missing Functions ---

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function openModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.add('active');
}

function configureGeminiKey() {
    alert("Función para configurar API Key de Gemini en desarrollo...");
}

function generateSalesScript() {
    const output = document.getElementById('iaOutputBody');
    const recipient = document.getElementById('iaOutputRecipient');
    const subject = document.getElementById('iaOutputSubject');
    
    if(!output) return;
    
    const quotation = window.currentIAQuotation;
    
    let clientName = quotation?.cliente?.nombre || 'Cliente';
    let qTotal = quotation ? formatPrecio(quotation.total) : '$0';
    let qNumber = quotation ? quotation.numero : '0000';
    
    if (quotation && quotation.cliente?.email && recipient) {
        recipient.value = quotation.cliente.email;
    }
    
    if (subject) {
        subject.value = `Propuesta de Cotización #${qNumber} - Letreros Caperuso`;
    }
    
    let template = `Estimado/a ${clientName},

Esperando que se encuentre muy bien, le enviamos la información detallada correspondiente a la cotización #${qNumber}.

`;

    if (quotation && quotation.items && quotation.items.length > 0) {
        template += `A continuación se detallan los productos y servicios cotizados:

`;
        quotation.items.forEach(item => {
            const dim = item.dimensiones ? ` de ${item.dimensiones}` : '';
            const desc = item.nombre ? item.nombre : 'Producto';
            const cantidad = item.cantidad ? item.cantidad : 1;
            
            let detStr = [];
            if(item.detalles) {
                if(item.detalles.placa && item.detalles.placa.tipo && item.detalles.placa.tipo !== 'SIN PLACA') {
                    detStr.push(`placa de ${item.detalles.placa.tipo}`);
                }
                if(item.detalles.adhesivo && item.detalles.adhesivo.tipo && item.detalles.adhesivo.tipo !== 'SIN ADHESIVO') {
                    detStr.push(`adhesivo ${item.detalles.adhesivo.tipo}`);
                }
                if(item.detalles.laminado && item.detalles.laminado.tipo && item.detalles.laminado.tipo !== 'SIN LAMINADO') {
                    detStr.push(`laminado ${item.detalles.laminado.tipo}`);
                }
                if(item.detalles.anclaje && item.detalles.anclaje.tipo && item.detalles.anclaje.tipo !== 'SIN ANCLAJE') {
                    detStr.push(`${item.detalles.anclaje.tipo.toLowerCase()}`);
                }
            }
            
            const detallesTexto = detStr.length > 0 ? ` fabricado en ${detStr.join(', ')}` : '';
            
            template += `- ${cantidad}x ${desc}${dim}${detallesTexto}. Valor Total: ${formatPrecio(item.precio || item.total || item.precioTotal)}
`;
        });
        template += `\n`;
    } else {
        template += `Adjuntamos nuestra propuesta de letreros corporativos de alta calidad para destacar su marca. Trabajamos con los mejores materiales del mercado, asegurando durabilidad, estética y resistencia.

`;
    }

    template += `El valor total de su cotización es de ${qTotal}.

Quedamos a su entera disposición para resolver cualquier duda o realizar ajustes si lo considera necesario.

Atentamente,
El Equipo de Ventas
Letreros Caperuso`;

    output.value = template;
}

function copyIAMessage() {
    const output = document.getElementById('iaOutputBody');
    if(output) {
        navigator.clipboard.writeText(output.value);
        showNotification("Mensaje copiado al portapapeles", "success");
    }
}

function openIAMailClient() {
    alert("Abriendo cliente de correo...");
}

function switchIAContext(context) {
    document.querySelectorAll('.ia-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + context)?.classList.add('active');
    document.querySelectorAll('.ia-context-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('ctx-' + context)?.classList.add('active');
}

function loadQuotationForIA() {
    const select = document.getElementById('iaQuotationSelect');
    const preview = document.getElementById('iaQuotationPreview');
    const id = select.value;
    
    if (!id) {
        window.currentIAQuotation = null;
        if (preview) preview.style.display = 'none';
        return;
    }
    
    const quotation = CRM.quotations.find(q => q.id === id);
    if (quotation) {
        window.currentIAQuotation = quotation;
        document.getElementById('iaPreviewClient').textContent = quotation.cliente?.nombre || 'Sin cliente';
        document.getElementById('iaPreviewTotal').textContent = formatPrecio(quotation.total);
        document.getElementById('iaPreviewItems').textContent = `Cotización #${quotation.numero} - ${quotation.items?.length || 0} items`;
        if (preview) preview.style.display = 'block';
    } else {
        window.currentIAQuotation = null;
        if (preview) preview.style.display = 'none';
    }
}

function setMessageChannel(channel) {
    document.getElementById('iaMessageChannel').value = channel;
    
    const emailBtn = document.getElementById('channelEmail');
    const whatsappBtn = document.getElementById('channelWhatsapp');
    
    if (channel === 'email') {
        emailBtn.style.border = '1px solid var(--primary)';
        emailBtn.style.background = 'rgba(255, 0, 102, 0.15)';
        emailBtn.style.color = '#fff';
        
        whatsappBtn.style.border = '1px solid rgba(255,255,255,0.1)';
        whatsappBtn.style.background = 'transparent';
        whatsappBtn.style.color = 'var(--text-secondary)';
    } else {
        emailBtn.style.border = '1px solid rgba(255,255,255,0.1)';
        emailBtn.style.background = 'transparent';
        emailBtn.style.color = 'var(--text-secondary)';
        
        whatsappBtn.style.border = '1px solid #25D366';
        whatsappBtn.style.background = 'rgba(37, 211, 102, 0.15)';
        whatsappBtn.style.color = '#fff';
    }
}

function syncKnowledgeWithFirebase() {
    alert("Sincronizando Base de Conocimientos...");
}

function handleBrainFileUpload(event) {
    alert("Archivos cargados en memoria");
}

function ingestBrainUrl() {
    alert("Rastreando URL...");
}

function saveBrainDirectives() {
    alert("Directivas guardadas");
}

function resetBrainIA() {
    if(confirm("¿Purgar toda la memoria?")) {
        alert("Memoria purgada");
    }
}

function exportCustomers() { alert("Exportando..."); }
function importCustomersFile() { alert("Importando..."); }
function deleteSelectedCustomers() { alert("Borrando seleccionados..."); }
function deleteAllCustomers() { if(confirm("¿Borrar todos?")) alert("Borrados"); }
function toggleSelectAllCustomers() {}

function exportCompanies() { alert("Exportando..."); }
function importCompaniesFile() { alert("Importando..."); }
function deleteSelectedCompanies() { alert("Borrando seleccionados..."); }
function deleteAllCompanies() { if(confirm("¿Borrar todos?")) { CRM.companies = []; saveData(); loadCompaniesTable(); updateDashboard(); showNotification('✅ Todas las empresas eliminadas', 'success'); } }
function toggleSelectAllCompanies() {}

function deleteSelectedQuotations() {
    const checkboxes = document.querySelectorAll('.quotation-checkbox:checked');
    if (checkboxes.length === 0) return;
    
    if (confirm(`¿Estás seguro de que deseas eliminar las ${checkboxes.length} cotizaciones seleccionadas?`)) {
        const idsToDelete = Array.from(checkboxes).map(cb => cb.value);
        CRM.quotations = CRM.quotations.filter(q => !idsToDelete.includes(q.id));
        
        // Also remove from pipeline if they exist there
        CRM.pipeline = CRM.pipeline.filter(p => !idsToDelete.includes(p.quotationId));
        
        saveData();
        loadQuotationsTable();
        updateDashboard();
        
        const mainCheckbox = document.getElementById('selectAllQuotations');
        if (mainCheckbox) mainCheckbox.checked = false;
        updateSelectedQuotationsCount();
        
        showNotification('✅ Cotizaciones seleccionadas eliminadas', 'success');
    }
}

function deleteAllQuotations() {
    if (confirm('¿Estás seguro de que deseas eliminar TODAS las cotizaciones? Esta acción no se puede deshacer.')) {
        CRM.quotations = [];
        CRM.pipeline = []; // Since all quotes are gone, empty pipeline too
        saveData();
        loadQuotationsTable();
        updateDashboard();
        
        const mainCheckbox = document.getElementById('selectAllQuotations');
        if (mainCheckbox) mainCheckbox.checked = false;
        updateSelectedQuotationsCount();
        
        showNotification('✅ Todas las cotizaciones eliminadas', 'success');
    }
}

function toggleSelectAllQuotations() {
    const mainCheckbox = document.getElementById('selectAllQuotations');
    const checkboxes = document.querySelectorAll('.quotation-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = mainCheckbox ? mainCheckbox.checked : false;
    });
    updateSelectedQuotationsCount();
}

function updateSelectedQuotationsCount() {
    const checkboxes = document.querySelectorAll('.quotation-checkbox:checked');
    const deleteBtn = document.getElementById('deleteSelectedQuotationsBtn');
    const countEl = document.getElementById('selectedQuotationsCount');
    if (countEl) {
        countEl.textContent = checkboxes.length;
    }
    if (deleteBtn) {
        deleteBtn.style.display = checkboxes.length > 0 ? 'inline-flex' : 'none';
    }
}

function showAddImageModal() { openModal('addImageModal'); }

function togglePipelineStats() {
    const el = document.getElementById('pipelineDashboard');
    if(el.style.display === 'none') {
        el.style.display = 'block';
        document.getElementById('pipelineStatsBtnText').textContent = 'Ocultar Reporte';
    } else {
        el.style.display = 'none';
        document.getElementById('pipelineStatsBtnText').textContent = 'Mostrar Reporte';
    }
}


function openSalesMessageCenter(quotationId = null) {
    navigateToPage('mensajeria-ia');
    if (quotationId) {
        setTimeout(() => {
            const select = document.getElementById('iaQuotationSelect');
            if (select) {
                select.value = quotationId;
                loadQuotationForIA();
            }
        }, 100);
    }
}

async function regenerateMessage() {
    const msgType = document.getElementById('msgType').value;
    const tone = document.getElementById('msgTone').value;
    const subjectEl = document.getElementById('aiMsgSubject');
    const bodyEl = document.getElementById('aiMsgBody');
    const recipient = document.getElementById('aiMsgRecipient').value;
    
    if(!bodyEl) return;
    
    bodyEl.value = "Generando...";
    
    try {
        const prompt = `
Genera un correo electrónico (Asunto y Cuerpo).
Tipo de mensaje: ${msgType}
Tono: ${tone}
Destinatario: ${recipient || 'Cliente'}

Devuelve la respuesta en formato JSON estricto con las siguientes claves: "asunto" y "cuerpo". No incluyas markdown de bloque de código.`;

        const response = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        try {
            let jsonText = data.result || '{}';
            // Clean markdown format if present
            if(jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n/g, '').replace(/```/g, '');
            }
            const parsed = JSON.parse(jsonText.trim() || '{}');
            if (subjectEl) subjectEl.value = parsed.asunto;
            bodyEl.value = parsed.cuerpo;
        } catch(e) {
            bodyEl.value = data.result;
        }
        
    } catch (err) {
        bodyEl.value = "Error: " + err.message;
    }
}
function regenerateEmailMessage() {}
function copyEmailToClipboard() {}
function openMailClient() {}
function openEmailClient() {}
function startPOSPrint() {
    const modalBody = document.getElementById('quotationModalBody');
    const id = modalBody ? modalBody.dataset.quotationId : null;
    if (id) {
        printPOSQuotation(id);
    } else {
        showNotification('❌ Error: No se pudo obtener la cotización', 'danger');
    }
}

function printPOSQuotation(id) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    const content = generatePOSQuotationHTML(quotation);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showNotification('❌ Error al abrir ventana de impresión. Verifique los permisos de ventanas emergentes.', 'danger');
        return;
    }
    
    printWindow.document.write(content);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function generatePOSQuotationHTML(quotation) {
    const client = quotation.cliente || {};
    const ivaRate = 0.19;
    
    let baseTotal = quotation.total || 0;
    
    let costoEnvio = 0;
    if (quotation.envio && quotation.envio.tipo === 'Monto Manual') {
        costoEnvio = parseFloat(quotation.envio.costo) || 0;
    }
    
    let costoInstalacion = 0;
    if (quotation.instalacion && quotation.instalacion.tipo === 'Monto Manual') {
        costoInstalacion = parseFloat(quotation.instalacion.costo) || 0;
    }
    
    const subtotal = Math.round(baseTotal / (1 + ivaRate));
    const ivaAmount = Math.round(baseTotal - subtotal);
    const totalFinal = baseTotal + costoEnvio + costoInstalacion;

    const itemsHtml = quotation.items.map((item, index) => {
        const itemSubtotalNeto = Math.round(item.precio / (1 + ivaRate));
        return `
            <div class="pos-item">
                <div style="font-weight: bold;">${index + 1}. ${item.nombre} x ${item.cantidad}</div>
                <div style="font-size: 11px; color: #555; padding-left: 10px;">
                    Dim: ${item.dimensiones}<br>
                    Placa: ${item.detalles.placa.tipo.replace(/SIN PLACA|SIN/g, '-')}<br>
                    Adh: ${item.detalles.adhesivo.tipo.replace(/SIN ADHESIVO|SIN/g, '-')}<br>
                    Lam: ${item.detalles.laminado.tipo.replace(/SIN LAMINADO|SIN/g, '-')}
                </div>
                <div style="text-align: right; font-weight: bold; font-size: 11px; margin-top: 2px;">
                    ${formatPrecio(Math.round(item.detalles.precioFinalPorUnidad / (1 + ivaRate)))} c/u | Total: ${formatPrecio(itemSubtotalNeto)} (Neto)
                </div>
            </div>
            <div class="dashed-line"></div>
        `;
    }).join('');

    return `
        <html>
        <head>
            <title>Ticket POS N° ${quotation.numero}</title>
            <meta charset="utf-8">
            <style>
                @page {
                    size: 80mm auto;
                    margin: 0;
                }
                body {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 12px;
                    color: #000;
                    background: #fff;
                    margin: 0;
                    padding: 4mm;
                    width: 72mm;
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .text-center {
                    text-align: center;
                }
                .text-right {
                    text-align: right;
                }
                .bold {
                    font-weight: bold;
                }
                .title {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .subtitle {
                    font-size: 10px;
                    color: #333;
                    margin: 2px 0;
                }
                .dashed-line {
                    border-top: 1px dashed #000;
                    margin: 8px 0;
                }
                .section-title {
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 11px;
                    margin-bottom: 4px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    margin-bottom: 2px;
                }
                .info-row span:first-child {
                    font-weight: bold;
                }
                .pos-item {
                    margin-bottom: 6px;
                    page-break-inside: avoid;
                }
                .totals-box {
                    font-size: 11px;
                    margin-top: 10px;
                }
                .total-highlight {
                    font-size: 14px;
                    font-weight: bold;
                    border-top: 1px dashed #000;
                    border-bottom: 1px dashed #000;
                    padding: 5px 0;
                    margin-top: 5px;
                }
                .footer-text {
                    font-size: 9px;
                    text-align: center;
                    margin-top: 15px;
                    line-height: 1.4;
                }
                @media print {
                    body {
                        width: 72mm;
                        padding: 0 2mm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="text-center">
                <img src="https://letreroscaperuso.cl/wp-content/uploads/2023/06/LOGO-LETREROSCAPERUSO-2023-04-scaled-e1774620911234.png" alt="Logo" style="height: 35px; width: auto; object-fit: contain;">
                <div class="title">LETREROS CAPERUSO</div>
                <div class="subtitle">Diseño Industrial EIRL</div>
                <div class="subtitle">RUT: 76.491.931-9</div>
                <div class="subtitle">Paine, Región Metropolitana</div>
                <div class="subtitle">contacto@letreroscaperuso.cl | (+56) 9 8993 9871</div>
            </div>

            <div class="dashed-line"></div>

            <div class="text-center bold" style="font-size: 13px;">
                COTIZACIÓN N° ${quotation.numero}
            </div>
            <div class="text-center" style="font-size: 10px; margin-top: 3px;">
                Fecha: ${formatDate(quotation.fecha)}
            </div>

            <div class="dashed-line"></div>

            <div class="section-title">Datos del Cliente:</div>
            <div class="info-row"><span>Nombre:</span> <span>${client.nombre || 'N/A'}</span></div>
            <div class="info-row"><span>Empresa:</span> <span>${client.empresa || 'N/A'}</span></div>
            <div class="info-row"><span>RUT:</span> <span>${client.rut || 'N/A'}</span></div>
            <div class="info-row"><span>Fono:</span> <span>${client.telefono || 'N/A'}</span></div>

            <div class="dashed-line"></div>

            <div class="section-title">Detalle de Productos:</div>
            <div class="dashed-line"></div>
            ${itemsHtml}

            <div class="totals-box">
                <div class="info-row"><span>Subtotal Neto:</span> <span>${formatPrecio(subtotal)}</span></div>
                <div class="info-row"><span>IVA (19%):</span> <span>${formatPrecio(ivaAmount)}</span></div>
                <div class="info-row"><span>Despacho/Inst.:</span> <span>${formatPrecio(costoEnvio + costoInstalacion)}</span></div>
                <div class="info-row total-highlight">
                    <span>TOTAL:</span> <span>${formatPrecio(totalFinal)}</span>
                </div>
            </div>

            <div style="margin-top: 15px; font-size: 10px; line-height: 1.4;">
                <div class="bold">Datos de Transferencia:</div>
                BCI Cta Corriente: 79048986<br>
                Eliseo Salazar Diseño Industrial EIRL<br>
                RUT: 76.491.931-9<br>
                Email: contacto@letreroscaperuso.cl
            </div>

            <div class="dashed-line"></div>

            <div class="footer-text">
                ¡Gracias por su preferencia!<br>
                Conserve este ticket para su pedido.<br>
                Plazo Fab: 3 días hábiles desde aprobación.<br>
                www.letreroscaperuso.cl
            </div>
        </body>
        </html>
    `;
}


function showSuccessOverlay(message) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        backdrop-filter: blur(4px);
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--bg-primary, white);
        padding: 3rem;
        border-radius: 24px;
        text-align: center;
        transform: scale(0.8);
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    `;
    
    modal.innerHTML = `
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-4, linear-gradient(135deg, #43e97b, #38f9d7)); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; box-shadow: 0 8px 20px rgba(67, 233, 123, 0.4);">
            <i class="fas fa-check" style="color: white; font-size: 2.5rem;"></i>
        </div>
        <h2 style="margin:0; color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 700;">¡Aprobado!</h2>
        <p style="margin:0; color: var(--text-secondary); font-size: 1.1rem; max-width: 320px; line-height: 1.5;">${message}</p>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    });
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.8)';
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 300);
    }, 2000);
}

function toggleImageSource(source) {
    const urlContainer = document.getElementById('urlInputContainer');
    const fileContainer = document.getElementById('fileInputContainer');
    const urlInput = document.getElementById('imageUrlInput');
    const fileInput = document.getElementById('imageFileInput');
    
    if (source === 'url') {
        urlContainer.style.display = 'block';
        fileContainer.style.display = 'none';
        urlInput.required = true;
        fileInput.required = false;
    } else {
        urlContainer.style.display = 'none';
        fileContainer.style.display = 'block';
        urlInput.required = false;
        fileInput.required = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
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

    const addImageForm = document.getElementById('addImageForm');
    if (addImageForm) {
        addImageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const title = formData.get('title');
            const category = formData.get('category');
            const tags = formData.get('tags');
            const imageSource = formData.get('imageSource');
            
            const proceedWithImage = (url) => {
                const newItem = {
                    id: generateId(),
                    title: title,
                    category: category,
                    tags: tags,
                    url: url,
                    createdAt: new Date().toISOString()
                };
                
                CRM.library = CRM.library || [];
                CRM.library.push(newItem);
                saveData();
                filterLibrary();
                closeModal('addImageModal');
                addImageForm.reset();
                toggleImageSource('url');
                showNotification('📸 Imagen guardada exitosamente', 'success');
            };

            if (imageSource === 'url') {
                const url = formData.get('url');
                if (!url) {
                    showNotification('Por favor, ingresa la URL de la imagen', 'warning');
                    return;
                }
                proceedWithImage(url);
            } else {
                const fileInput = document.getElementById('imageFileInput');
                const file = fileInput.files[0];
                if (!file) {
                    showNotification('Por favor, selecciona un archivo de imagen', 'warning');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    proceedWithImage(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

function populateIAQuotationSelect() {
    const select = document.getElementById('iaQuotationSelect');
    if (!select) return;
    
    // Store current value to restore if possible
    const currentVal = select.value;
    
    // Clear existing except first
    select.innerHTML = '<option value="">-- Buscar Cotización --</option>';
    
    CRM.quotations.forEach(q => {
        const option = document.createElement('option');
        option.value = q.id;
        option.textContent = `#${q.numero} - ${q.cliente?.nombre || 'Sin cliente'} (${formatPrecio(q.total)})`;
        select.appendChild(option);
    });
    
    if (currentVal) {
        select.value = currentVal;
    }
}

function openClientSelectorModal() {
    openModal('searchCustomerModal');
    filterCustomersForSearch();
}

function filterCustomersForSearch() {
    const input = document.getElementById('searchCustomerInput');
    const term = input.value.toLowerCase();
    const container = document.getElementById('customerSearchResults');
    
    container.innerHTML = '';
    
    const filtered = CRM.customers.filter(c => 
        (c.nombre && c.nombre.toLowerCase().includes(term)) ||
        (c.empresa && c.empresa.toLowerCase().includes(term)) ||
        (c.rut && c.rut.toLowerCase().includes(term))
    );
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No se encontraron clientes.</p>';
        return;
    }
    
    filtered.forEach(c => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginBottom = '0.5rem';
        div.style.cursor = 'pointer';
        div.style.padding = '1rem';
        div.style.border = '1px solid rgba(255,255,255,0.05)';
        div.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 0.25rem;">${c.nombre}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">${c.empresa || 'Sin empresa'} - ${c.rut || 'Sin RUT'}</div>
        `;
        div.onclick = () => selectCustomerForQuotation(c);
        div.onmouseover = () => div.style.background = 'rgba(255, 0, 102, 0.1)';
        div.onmouseout = () => div.style.background = 'transparent';
        container.appendChild(div);
    });
}

function selectCustomerForQuotation(c) {
    document.getElementById('clienteNombre').value = c.nombre || '';
    document.getElementById('clienteEmpresaNombre').value = c.empresa || '';
    document.getElementById('clienteRut').value = c.rut || '';
    document.getElementById('clienteTelefono').value = c.telefono || '';
    document.getElementById('clienteEmail').value = c.email || '';
    document.getElementById('clienteDireccion').value = c.direccion || '';
    document.getElementById('clienteGiro').value = c.giro || '';
    
    closeModal('searchCustomerModal');
}

// ============= LIBRARY OF REFERENCES =============
function filterLibrary() {
    const searchTerm = document.getElementById('librarySearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('libraryCategoryFilter')?.value || '';
    
    const filtered = (CRM.library || []).filter(item => {
        const matchesSearch = !searchTerm || 
            (item.title && item.title.toLowerCase().includes(searchTerm)) || 
            (item.tags && item.tags.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    renderLibrary(filtered);
}

function renderLibrary(items = null) {
    const grid = document.getElementById('libraryGrid');
    if (!grid) return;
    
    const list = items !== null ? items : (CRM.library || []);
    
    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-images" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <h3 style="margin-bottom: 0.5rem;">Biblioteca Vacía</h3>
                <p style="color: var(--text-secondary);">Agrega imágenes para usarlas en tus cotizaciones</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.overflow = 'hidden';
        card.style.position = 'relative';
        card.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease';
        
        // Category Badge Colors
        const badgeColor = {
            'Trabajos': 'var(--gradient-1)',
            'Productos': 'var(--gradient-4)',
            'Materiales': 'var(--gradient-3)',
            'Otros': 'var(--gradient-2)'
        }[item.category] || 'var(--gradient-1)';
        
        card.innerHTML = `
            <div style="height: 180px; position: relative; overflow: hidden; background: #0c1524;">
                <img src="${item.url}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span style="position: absolute; top: 0.75rem; left: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; color: white; background: ${badgeColor};">${item.category}</span>
                <button onclick="deleteLibraryItem('${item.id}', this)" class="btn-delete-item" style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(255,255,255,0.08); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10; backdrop-filter: blur(4px);" title="Eliminar Imagen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div style="padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1;">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600;">${item.title}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: auto;">
                    ${item.tags ? item.tags.split(',').map(tag => `<span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); padding: 0.15rem 0.5rem; border-radius: 4px; color: var(--text-secondary);">#${tag.trim()}</span>`).join('') : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function deleteLibraryItem(id, btn) {
    openModal('deleteLibraryConfirmModal');
    
    const confirmBtn = document.getElementById('confirmDeleteLibraryBtn');
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            closeModal('deleteLibraryConfirmModal');
            
            const card = btn ? btn.closest('.card') : null;
            if (card) {
                card.style.transform = 'scale(0.9) translateY(12px)';
                card.style.opacity = '0';
                card.style.boxShadow = 'none';
                
                setTimeout(() => {
                    CRM.library = (CRM.library || []).filter(item => item.id !== id);
                    saveData();
                    filterLibrary();
                    showNotification('🗑️ Imagen eliminada exitosamente', 'success');
                }, 350);
            } else {
                CRM.library = (CRM.library || []).filter(item => item.id !== id);
                saveData();
                filterLibrary();
                showNotification('🗑️ Imagen eliminada exitosamente', 'success');
            }
        };
    }
}
