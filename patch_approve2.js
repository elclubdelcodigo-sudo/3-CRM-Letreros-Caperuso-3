const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const targetToReplace = `    showSuccessOverlay(\`La cotización #\${quotation.numero} ha sido movida exitosamente al pipeline.\`);

    // Refresh tables
    loadQuotationsTable();
    updateDashboard();

    // Navigate to pipeline after a short delay to show the notification
    setTimeout(() => {
        navigateToPage('pipeline');
    }, 2300);`;

const newCode = `    showSuccessOverlay(\`La cotización #\${quotation.numero} ha sido aprobada exitosamente.\`);

    // Refresh tables
    loadQuotationsTable();
    updateDashboard();
    
    // We do NOT navigate away so the user can see it marked as 'aprobada' in the table
`;

if (appJs.includes(targetToReplace)) {
    appJs = appJs.replace(targetToReplace, newCode);
    fs.writeFileSync('app.js', appJs);
    console.log('Approve success logic updated (no redirect)');
} else {
    console.log('Could not find target to replace in approveQuotation');
}
