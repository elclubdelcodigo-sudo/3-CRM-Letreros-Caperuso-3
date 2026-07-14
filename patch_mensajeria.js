const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<section id="mensajeria-ia" class="page-section">[\s\S]*?<\/section>/;

const newHTML = `        <section id="mensajeria-ia" class="page-section">
            <div class="card" style="min-height: calc(100vh - 120px); display: flex; flex-direction: column; background: var(--bg-card); border: 1px solid rgba(255,255,255,0.05);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <i class="fas fa-comment-dots" style="font-size: 1.5rem;"></i>
                        </div>
                        <div>
                            <h2 style="font-size: 1.5rem; margin: 0; font-weight: 700; background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                                Generador de Mensajes de Venta
                            </h2>
                            <p style="font-size: 0.85rem; color: var(--ai-text-dim); margin: 5px 0 0 0;">Crea mensajes estructurados a partir de tus cotizaciones para enviar a tus clientes</p>
                        </div>
                    </div>
                </div>

                <div class="ia-module-container" style="flex: 1; padding: 0; height: auto;">
                    <!-- Left: Parameters -->
                    <div class="glass-panel" style="grid-column: span 3; padding: 1.5rem; overflow-y: auto;">
                        <h3 style="font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 2rem;">
                            PARÁMETROS <i class="fas fa-sliders-h" style="float: right; opacity: 0.5;"></i>
                        </h3>

                        <div id="ctx-quotation" class="ia-context-panel active">
                            <div class="form-group">
                                <label class="form-label-premium">SELECCIONAR COTIZACIÓN</label>
                                <select id="iaQuotationSelect" class="form-control" style="background: rgba(0,0,0,0.3);" onchange="loadQuotationForIA()">
                                    <option value="">-- Buscar Cotización --</option>
                                </select>
                            </div>
                        </div>

                        <div id="iaQuotationPreview" style="display: none; margin-bottom: 1.5rem; padding: 1rem; background: rgba(var(--success-rgb), 0.05); border: 1px solid rgba(var(--success-rgb), 0.1); border-radius: 8px;">
                            <div id="iaPreviewClient" style="font-weight: 700; color: var(--ai-accent-emerald);"></div>
                            <div id="iaPreviewTotal" style="font-size: 1.2rem; margin: 5px 0;">$0</div>
                            <div id="iaPreviewItems" style="font-size: 0.75rem; opacity: 0.7;"></div>
                        </div>

                        <div class="form-group">
                            <label class="form-label-premium">TIPO DE LETRERO</label>
                            <select id="scriptType" class="form-control" style="background: rgba(0,0,0,0.3);">
                                <option value="acrilico">Letrero Acrílico 3D</option>
                                <option value="neon">Letrero Neón Flex</option>
                                <option value="tela">Tela Tensada / Backlight</option>
                                <option value="metalico">Estructura Metálica</option>
                            </select>
                        </div>

                        <button class="btn btn-primary" id="generateScriptBtn" style="width: 100%; margin-top: 1rem; background: var(--gradient-1); box-shadow: 0 0 15px rgba(100, 108, 255, 0.4); padding: 0.75rem; font-weight: 600;" onclick="generateSalesScript()">
                            <i class="fas fa-magic"></i> Generar Plantilla
                        </button>

                        <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05);">
                            <label class="form-label" style="font-size: 0.75rem; margin-bottom: 1rem; display: block;">CANAL DE ENVÍO</label>
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="hidden" id="iaMessageChannel" value="email">
                                <button class="btn" id="channelEmail" onclick="setMessageChannel('email')" style="flex: 1; border: 1px solid var(--primary); background: rgba(100, 108, 255, 0.1); color: #fff;">Email</button>
                                <button class="btn" id="channelWhatsapp" onclick="setMessageChannel('whatsapp')" style="flex: 1; border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">WhatsApp</button>
                            </div>
                        </div>
                    </div>

                    <!-- Center: Construct Buffer -->
                    <div class="glass-panel" style="grid-column: span 9;">
                        <div style="flex: 1; display: flex; flex-direction: column; padding: 1.5rem; position: relative;">
                            <span style="font-size: 0.7rem; letter-spacing: 2px; color: var(--ai-text-dim); margin-bottom: 1rem;">EDITOR DEL MENSAJE</span>

                             <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                                 <div style="flex: 2;">
                                     <label class="form-label" style="font-size: 0.65rem; letter-spacing: 1px; color: rgba(255,255,255,0.4);">DESTINATARIO</label>
                                     <input type="text" id="iaOutputRecipient" class="form-control" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; height: 38px;" placeholder="destinatario@correo.com">
                                 </div>
                                 <div style="flex: 3;">
                                     <label class="form-label" style="font-size: 0.65rem; letter-spacing: 1px; color: rgba(255,255,255,0.4);">ASUNTO</label>
                                     <input type="text" id="iaOutputSubject" class="form-control" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; height: 38px;" placeholder="Propuesta de Cotización">
                                 </div>
                             </div>

                            <textarea id="iaOutputBody" class="buffer-editor" style="flex: 1; background: transparent; border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; margin-top: 1rem; font-size: 0.95rem; line-height: 1.6; color: #e0e0e0; font-family: 'Inter', sans-serif; resize: none; min-height: 250px; padding: 1rem;" placeholder="Selecciona una cotización y presiona 'Generar Plantilla' para comenzar a redactar tu mensaje..."></textarea>

                            <!-- Floating Controls -->
                            <div style="position: absolute; bottom: 2rem; right: 2rem; display: flex; gap: 0.75rem;">
                                <button class="btn btn-outline" style="background: rgba(0,0,0,0.8); border-color: rgba(255,255,255,0.1);" onclick="copyIAMessage()">
                                    <i class="fas fa-copy"></i> Copiar Mensaje
                                </button>
                                <button class="btn btn-primary" id="iaExecuteTransmission" style="background: var(--success); color: #000; border: none; font-weight: 700; box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);" onclick="openIAMailClient()">
                                    <i class="fas fa-paper-plane"></i> Enviar Mensaje
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;

if (regex.test(html)) {
    const updated = html.replace(regex, newHTML);
    fs.writeFileSync('index.html', updated);
    console.log('Successfully replaced mensajeria-ia section.');
} else {
    console.log('Regex failed to match mensajeria-ia section.');
}
