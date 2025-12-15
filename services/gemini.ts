
import { GoogleGenAI } from "@google/genai";

// Initialize the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const BASE_INSTRUCTION = `You are "Nexus AI", a highly intelligent business operating system assistant.
Your goal is to assist the user by analyzing their live business data (CRM, Payments, Schedule) and providing actionable insights, drafts, or summaries.

GUIDELINES:
1. Use the provided JSON context to answer questions accurately.
2. If asking about deals, refer to specific values and stages.
3. If asking about schedule, refer to specific times and clients.
4. Tone: Professional, executive, concise, and helpful.
5. Format: Use bullet points for lists. Keep paragraphs short.
`;

export const sendMessageToGemini = async (
  message: string,
  history: { role: 'user' | 'model'; content: string }[] = [],
  contextData: string = ''
): Promise<string> => {
  try {
    // Get the current language from the document root which is updated by LanguageContext
    const currentLang = document.documentElement.lang || 'en';
    
    // Inject the current state of the application into the system instruction
    const systemInstruction = contextData 
      ? `${BASE_INSTRUCTION}\n\nCURRENT BUSINESS DATA CONTEXT:\n${contextData}\n\nIMPORTANT: Respond in the following language code: ${currentLang}`
      : `${BASE_INSTRUCTION}\n\nIMPORTANT: Respond in the following language code: ${currentLang}`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the neural network right now. Please check your API key.";
  }
};
