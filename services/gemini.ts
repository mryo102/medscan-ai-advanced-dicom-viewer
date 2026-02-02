
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeScan(base64Image: string, prompt?: string): Promise<AnalysisResult | string> {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are a professional Radiologist's AI Assistant. 
    Analyze the provided medical scan (DICOM converted to image).
    Identify:
    1. Anatomical region (e.g., Head, Chest, Abdomen).
    2. Modality (CT, MRI, X-Ray).
    3. Any visible anomalies (preliminary findings only).
    
    IMPORTANT: 
    - Always include a disclaimer that you are an AI and your output is for educational purposes only and not a clinical diagnosis.
    - Be concise and technical.
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  const textPart = {
    text: prompt || "Please provide a professional preliminary analysis of this medical scan."
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function extractStructuredData(base64Image: string): Promise<Partial<AnalysisResult>> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
        { text: "Extract metadata from this scan into JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          anatomicalRegion: { type: Type.STRING },
          summary: { type: Type.STRING },
          confidence: { type: Type.NUMBER }
        },
        required: ["anatomicalRegion", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
}
