require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
    try {
        console.log("Using API Key:", process.env.GEMINI_API_KEY ? "Set" : "Not Set");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: "Say hello",
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
