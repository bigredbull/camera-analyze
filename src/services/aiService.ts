import { GoogleGenAI, Type } from "@google/genai";
import { AnalyticRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeTrafficImage(base64Image: string): Promise<Partial<AnalyticRecord>> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              text: `Analyze this shopping mall/store entrance crowd. 
              Determine the age and gender distribution of people walking by.
              Be as accurate as possible based on the visual evidence.
              
              Age categories:
              - child: 0-12
              - teen: 13-19
              - adult: 20-64
              - senior: 65+

              Return the result in JSON format.`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalPeople: { type: Type.INTEGER },
            ageDistribution: {
              type: Type.OBJECT,
              properties: {
                child: { type: Type.INTEGER },
                teen: { type: Type.INTEGER },
                adult: { type: Type.INTEGER },
                senior: { type: Type.INTEGER }
              },
              required: ["child", "teen", "adult", "senior"]
            },
            genderDistribution: {
              type: Type.OBJECT,
              properties: {
                male: { type: Type.INTEGER },
                female: { type: Type.INTEGER }
              },
              required: ["male", "female"]
            }
          },
          required: ["totalPeople", "ageDistribution", "genderDistribution"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      totalPeople: result.totalPeople,
      ageDistribution: result.ageDistribution,
      genderDistribution: result.genderDistribution,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
