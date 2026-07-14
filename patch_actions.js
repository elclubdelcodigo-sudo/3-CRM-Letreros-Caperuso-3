const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const targetToReplaceActions = `                <td>
                    \${approveButton}
                    <button class="btn btn-sm" onclick="editQuotation('\${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--warning); color: var(--dark); margin-right: 0.5rem;" title="Editar Cotización">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm" onclick="viewQuotation('\${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;" title="Ver Detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm" onclick="printQuotation('\${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-2);" title="Imprimir">
                        <i class="fas fa-print"></i>
                    </button>
                </td>`;

const newActions = `                <td style="display: flex; gap: 0.5rem; align-items: center; border: none; padding-top: 1.5rem; padding-bottom: 1.5rem;">
                    \${approveButton}
                    <button class="btn btn-sm" onclick="editQuotation('\${q.id}')" style="padding: 0.5rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--warning); color: var(--dark);" title="Editar Cotización">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm" onclick="viewQuotation('\${q.id}')" style="padding: 0.5rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;" title="Ver Detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm" onclick="printQuotation('\${q.id}')" style="padding: 0.5rem; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--gradient-2);" title="Imprimir">
                        <i class="fas fa-print"></i>
                    </button>
                </td>`;

appJs = appJs.replace(targetToReplaceActions, newActions);

const targetButton = `            <button class="btn btn-sm" onclick="approveQuotation('\${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-4); color: white; margin-right: 0.5rem; box-shadow: 0 2px 8px rgba(67, 233, 123, 0.3);" title="Aprobar">
                <i class="fas fa-check-circle"></i> Aprobar
            </button>`;

const newButton = `            <button class="btn btn-sm" onclick="approveQuotation('\${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-4); color: white; box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4); display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Aprobar Cotización">
                <i class="fas fa-check-circle"></i> Aprobar
            </button>`;

appJs = appJs.replace(targetButton, newButton);

const targetBadge = `            <span class="badge badge-success" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">
                <i class="fas fa-check-circle"></i> Aprobada
            </span>`;

const newBadge = `            <span class="badge badge-success" style="padding: 0.5rem 1rem; display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; box-shadow: 0 2px 8px rgba(67, 233, 123, 0.2);">
                <i class="fas fa-check-circle"></i> Aprobada
            </span>`;

appJs = appJs.replace(targetBadge, newBadge);


fs.writeFileSync('app.js', appJs);
console.log('Actions layout and buttons updated');
