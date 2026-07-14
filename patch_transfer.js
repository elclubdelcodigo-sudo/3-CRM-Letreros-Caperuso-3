const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const oldTerms = `<div class="section-header"><i class="fas fa-info-circle"></i> Términos y Condiciones</div>            <div class="terms-box">                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">                    <div>                        <h3>Proceso de Compra</h3>                        <p>1. Una vez Aprobada la cotización debe cancelar el total del pedido 100% o enviar Orden de compra OC (Sujeto a aprobación).</p>                        <p>2. Aprobado el Pago entregaremos un Visto Bueno Digital para su validación.</p>                        <p>3. Tras su aprobación del diseño comienza el plazo de fabricación.</p>                    </div>                    <div>                        <h3>Consideraciones</h3>                        <p>• Pago: Transferencia, Efectivo o Cheque.</p>                        <p>• Plazo: 2-3 días hábiles desde aprobación de diseño.</p>                        <p>• Despacho: Vía Starken, Chilexpress o Correos de Chile (Por pagar).</p>                    </div>                </div>            </div>`;

const newTerms = `<div class="section-header"><i class="fas fa-info-circle"></i> Términos y Condiciones</div>
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
            </div>`;

appJs = appJs.replace(oldTerms.replace(/\s+/g, ' '), newTerms);
// let's do a more robust replace for oldTerms

// instead of string replace, use regex
const regex = /<div class="section-header"><i class="fas fa-info-circle"><\/i> Términos y Condiciones<\/div>[\s\S]*?<div class="terms-box">[\s\S]*?<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">[\s\S]*?<div>[\s\S]*?<h3>Proceso de Compra<\/h3>[\s\S]*?<p>1\. Una vez Aprobada la cotización debe cancelar el total del pedido 100% o enviar Orden de compra OC \(Sujeto a aprobación\)\.<\/p>[\s\S]*?<p>2\. Aprobado el Pago entregaremos un Visto Bueno Digital para su validación\.<\/p>[\s\S]*?<p>3\. Tras su aprobación del diseño comienza el plazo de fabricación\.<\/p>[\s\S]*?<\/div>[\s\S]*?<div>[\s\S]*?<h3>Consideraciones<\/h3>[\s\S]*?<p>• Pago: Transferencia, Efectivo o Cheque\.<\/p>[\s\S]*?<p>• Plazo: 2-3 días hábiles desde aprobación de diseño\.<\/p>[\s\S]*?<p>• Despacho: Vía Starken, Chilexpress o Correos de Chile \(Por pagar\)\.<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

if (regex.test(appJs)) {
    appJs = appJs.replace(regex, newTerms);
    fs.writeFileSync('app.js', appJs);
    console.log("Replaced successfully!");
} else {
    console.log("Regex not found!");
}

