require('dotenv').config();
const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 3000;

app.use(express.json());

app.all('/api.php', (req, res) => {
    res.json({
        status: "online",
        message: "El backend en Node.js Express está funcionando correctamente.",
    });
});

app.post('/api/gemini/generate', async (req, res) => {
    try {
        const { prompt, systemInstruction } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY no está configurada en el servidor." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction || "Eres un experto en ventas y atención al cliente corporativo.",
                temperature: 0.7,
            }
        });
        
        res.json({ result: response.text || "" });
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        
        // Return a graceful fallback if the Gemini API fails (e.g. 403 or 429)
        const prompt = req.body.prompt || "";
        const isJsonExpected = prompt && prompt.includes("formato JSON estricto");
        
        let fallbackText = "";
        if (isJsonExpected) {
            fallbackText = JSON.stringify({
                asunto: "Propuesta comercial (Generada en modo fallback)",
                cuerpo: "Estimado cliente,\n\nDebido a un error de conexión con los servicios de Inteligencia Artificial (Permiso denegado / Cuota excedida), se ha generado esta plantilla automática de respaldo.\n\nEstamos a su disposición para cotizar y fabricar sus letreros con la más alta calidad.\n\nSaludos cordiales,\nEquipo Caperuso"
            });
        } else {
            fallbackText = "Estimado cliente,\n\n(Mensaje automático de respaldo generado porque la API de IA no está disponible en este momento por restricciones de cuota o permisos).\n\nNos encantaría trabajar en su proyecto. Por favor, revise nuestra cotización adjunta y háganos saber si tiene alguna duda.\n\nAtentamente,\nEl equipo de ventas";
        }
        
        return res.json({ result: fallbackText });
    }
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
