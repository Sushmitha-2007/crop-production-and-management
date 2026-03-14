import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FarmingAdvice {
  summary: string;
  recommendations: string[];
  risks: string[];
}

export async function getFarmingAdvice(cropName: string, stage: string, location?: string): Promise<FarmingAdvice> {
  const prompt = `As an expert agricultural advisor, provide advice for growing ${cropName} at the ${stage} stage${location ? ` in ${location}` : ''}. 
  Return a JSON object with the following structure:
  {
    "summary": "A brief overview of current needs",
    "recommendations": ["list of 3-4 specific actions"],
    "risks": ["list of 2-3 potential pests or weather risks to watch for"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as FarmingAdvice;
  } catch (error) {
    console.error("Error getting farming advice:", error);
    return {
      summary: "Unable to fetch live advice. Please check your connection.",
      recommendations: ["Ensure proper irrigation", "Monitor for pests", "Check soil moisture"],
      risks: ["General weather fluctuations", "Common local pests"]
    };
  }
}
