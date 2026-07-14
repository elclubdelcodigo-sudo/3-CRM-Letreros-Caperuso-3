const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const overlayFunc = `
function showSuccessOverlay(message) {
    const overlay = document.createElement('div');
    overlay.style.cssText = \`
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
    \`;
    
    const modal = document.createElement('div');
    modal.style.cssText = \`
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
    \`;
    
    modal.innerHTML = \`
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-4, linear-gradient(135deg, #43e97b, #38f9d7)); display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; box-shadow: 0 8px 20px rgba(67, 233, 123, 0.4);">
            <i class="fas fa-check" style="color: white; font-size: 2.5rem;"></i>
        </div>
        <h2 style="margin:0; color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 700;">¡Aprobado!</h2>
        <p style="margin:0; color: var(--text-secondary); font-size: 1.1rem; max-width: 320px; line-height: 1.5;">\${message}</p>
    \`;
    
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
`;

appJs = appJs + '\n' + overlayFunc;

// Replace showNotification with showSuccessOverlay in approveQuotation
const oldApprovalNotification = "showNotification(`✅ Cotización #${quotation.numero} aprobada y agregada al pipeline`, 'success');";
const newApprovalNotification = "showSuccessOverlay(`La cotización #${quotation.numero} ha sido movida exitosamente al pipeline.`);";

appJs = appJs.replace(oldApprovalNotification, newApprovalNotification);

// Let's also adjust the setTimeout to wait a bit longer before navigating so the user can enjoy the overlay
appJs = appJs.replace(
`    // Navigate to pipeline after a short delay to show the notification
    setTimeout(() => {
        navigateToPage('pipeline');
    }, 1500);`,
`    // Navigate to pipeline after a short delay to show the notification
    setTimeout(() => {
        navigateToPage('pipeline');
    }, 2300);`
);

fs.writeFileSync('app.js', appJs);
console.log('Success overlay added');
