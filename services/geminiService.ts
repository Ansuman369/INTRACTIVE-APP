import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedGridContent } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MOCK_DATA: Record<string, GeneratedGridContent> = {
  default: {
    statusUpdate: "Grid stability at 98%. No active faults.",
    technicalMetrics: "Load: 450MW | Freq: 50.02Hz",
    impactAnalysis: "Minimal impact on residential sectors."
  }
};

export const fetchGridDetails = async (moduleName: string): Promise<GeneratedGridContent> => {
  if (!ai) {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_DATA.default), 800));
  }

  try {
    const prompt = `Act as BESCOM Smart Grid AI. Analyze "${moduleName}".
    Constraints:
    - statusUpdate: Max 10 words. Technical status.
    - technicalMetrics: Max 8 words. Voltages, MW, Hz.
    - impactAnalysis: Max 10 words. Affected areas/time.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statusUpdate: { type: Type.STRING },
            technicalMetrics: { type: Type.STRING },
            impactAnalysis: { type: Type.STRING },
          },
        },
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text response");
    
    return JSON.parse(text) as GeneratedGridContent;

  } catch (error) {
    console.error("Gemini Error:", error);
    return MOCK_DATA.default;
  }
};