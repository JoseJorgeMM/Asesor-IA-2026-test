import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

// El SDK se inicializa de forma perezosa para evitar bloqueos si falta la clave
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

const SYSTEM_INSTRUCTION = `
Eres el asistente virtual principal de 'Innova-IA', una plataforma de educación y consultoría sobre Inteligencia Artificial Generativa para empresas.
Tu objetivo es educar y guiar a profesionales de todas las áreas (Marketing, RRHH, Desarrollo, Finanzas, etc.) sobre cómo implementar la IA.
Mantén un tono profesional, minimalista y directo.
Responde siempre en Español.
Usa formato Markdown para estructurar tus respuestas (listas, negritas, etc.).
`;

export const sendMessageToGemini = async (history: Message[], newMessage: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        ...history.filter(h => h.role !== 'system').map(h => ({
          role: h.role,
          parts: [{ text: h.text }],
        })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "Lo siento, no pude generar una respuesta.";
  } catch (error) {
    console.error("Error calling Gemini Chat:", error);
    throw error;
  }
};