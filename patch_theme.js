const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace CSS variables
html = html.replace(/--primary:.*?;/, '--primary: #6366f1;');
html = html.replace(/--primary-dark:.*?;/, '--primary-dark: #4f46e5;');
html = html.replace(/--secondary:.*?;/, '--secondary: #818cf8;');
html = html.replace(/--accent:.*?;/, '--accent: #6366f1;');
html = html.replace(/--success:.*?;/, '--success: #34d399;');
html = html.replace(/--warning:.*?;/, '--warning: #fbbf24;');
html = html.replace(/--danger:.*?;/, '--danger: #fb7185;');

html = html.replace(/--bg-primary:.*?;/, '--bg-primary: #0c0e12;');
html = html.replace(/--bg-secondary:.*?;/, '--bg-secondary: #14171d;');
html = html.replace(/--bg-card:.*?;/, '--bg-card: #14171d;');
html = html.replace(/--bg-elevated:.*?;/, '--bg-elevated: #1a1e26;');
html = html.replace(/--text-primary:.*?;/, '--text-primary: #ffffff;');
html = html.replace(/--text-secondary:.*?;/, '--text-secondary: #cbd5e1;');
html = html.replace(/--border-color:.*?;/, '--border-color: #1e293b;');

html = html.replace(/--dark:.*?;/, '--dark: #ffffff;');
html = html.replace(/--dark-light:.*?;/, '--dark-light: #14171d;');
html = html.replace(/--gray:.*?;/, '--gray: #64748b;');
html = html.replace(/--gray-light:.*?;/, '--gray-light: #1e293b;');
html = html.replace(/--white:.*?;/, '--white: #ffffff;');

html = html.replace(/--gradient-1:.*?;/, '--gradient-1: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);');
html = html.replace(/--gradient-2:.*?;/, '--gradient-2: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);');
html = html.replace(/--gradient-3:.*?;/, '--gradient-3: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);');
html = html.replace(/--gradient-4:.*?;/, '--gradient-4: linear-gradient(135deg, #34d399 0%, #10b981 100%);');

// Add rgb variables for rgba
html = html.replace(/--primary: #6366f1;/, '--primary: #6366f1;\n            --primary-rgb: 99, 102, 241;');
html = html.replace(/--success: #34d399;/, '--success: #34d399;\n            --success-rgb: 52, 211, 153;');
html = html.replace(/--warning: #fbbf24;/, '--warning: #fbbf24;\n            --warning-rgb: 251, 191, 36;');
html = html.replace(/--danger: #fb7185;/, '--danger: #fb7185;\n            --danger-rgb: 251, 113, 133;');
html = html.replace(/--secondary: #818cf8;/, '--secondary: #818cf8;\n            --secondary-rgb: 129, 140, 248;');

// Replace hardcoded rgbas
// Primary (old #ff0055 -> 255, 0, 85) -> indigo-500
html = html.replace(/rgba\(255,\s*0,\s*85,/g, 'rgba(var(--primary-rgb),');
// Secondary/Purple (old #9932cc -> 153, 50, 204) -> secondary (indigo-400)
html = html.replace(/rgba\(153,\s*50,\s*204,/g, 'rgba(var(--secondary-rgb),');
// Success (old #00d4aa -> 0, 212, 170) -> emerald-400
html = html.replace(/rgba\(0,\s*212,\s*170,/g, 'rgba(var(--success-rgb),');
html = html.replace(/rgba\(67,\s*233,\s*123,/g, 'rgba(var(--success-rgb),');
html = html.replace(/rgba\(16,\s*185,\s*129,/g, 'rgba(var(--success-rgb),');
// Warning (old #ffa726 -> 255, 167, 38) -> amber-400
html = html.replace(/rgba\(255,\s*167,\s*38,/g, 'rgba(var(--warning-rgb),');
// Danger (old #ef5350 -> 239, 83, 80) -> rose-400
html = html.replace(/rgba\(239,\s*83,\s*80,/g, 'rgba(var(--danger-rgb),');
// Blue (old #4facfe -> 79, 172, 254) -> sky-400
html = html.replace(/rgba\(79,\s*172,\s*254,/g, 'rgba(56, 189, 248,');

// Extra hardcoded colors
html = html.replace(/#ff0055/gi, 'var(--primary)');
html = html.replace(/#00ff88/gi, 'var(--success)');
html = html.replace(/#ff4444/gi, 'var(--danger)');
html = html.replace(/#646cff/gi, 'var(--secondary)');
html = html.replace(/#00d4aa/gi, 'var(--success)');
html = html.replace(/#ffa726/gi, 'var(--warning)');
html = html.replace(/#ef5350/gi, 'var(--danger)');

// Box shadows for modal / cards
html = html.replace(/box-shadow: 0 4px 20px rgba\(255, 0, 85, 0.4\);/g, 'box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.4);');

fs.writeFileSync('index.html', html);
console.log('Theme patched');
