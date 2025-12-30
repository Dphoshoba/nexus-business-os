
import { GoogleGenAI } from "@google/genai";

const BASE_INSTRUCTION = `You are "Echoes AI", the core intelligence engine for the "Echoes & Visions" Business OS.
Your goal is to provide strategic clarity from fragmented data. 

GUIDELINES:
1. Use the provided JSON context to answer questions accurately.
2. refer to specific values, dates, and names.
3. Tone: Professional, visionary, extremely concise.
4. If providing a summary, use a "CEO-level" narrative style.
`;

export const sendMessageToGemini = async (
  message: string,
  history: { role: 'user' | 'model'; content: string }[] = [],
  contextData: string = ''
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const currentLang = document.documentElement.lang || 'en';
    const systemInstruction = contextData 
      ? `${BASE_INSTRUCTION}\n\nCURRENT BUSINESS DATA CONTEXT:\n${contextData}\n\nIMPORTANT: Respond in the following language code: ${currentLang}`
      : `${BASE_INSTRUCTION}\n\nIMPORTANT: Respond in the following language code: ${currentLang}`;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
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
    return "Neural link interrupted. Please verify your connection.";
  }
};

/**
 * Performs a one-off analysis of business state for proactive dashboard insights.
 */
export const performQuickAnalysis = async (contextData: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this business snapshot and provide a one-sentence strategic narrative for the CEO. 
            Highlight the #1 most important thing they should focus on today based on their deals, invoices, and schedule.
            
            DATA:
            ${contextData}`,
            config: {
                temperature: 0.4,
                maxOutputTokens: 150
            }
        });
        return response.text || "Data stream active. Analyzing current trajectory...";
    } catch (e) {
        return "Intelligence engine standby. Manual review recommended.";
    }
};
