import { GoogleGenAI, Type } from "@google/genai";
import { AnalyticRecord } from "../types";
import { settingsService } from "./settingsService";

const defaultGeminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT_INSTRUCTIONS = `Analyze this shopping mall/store entrance crowd. 
Determine the age and gender distribution of people walking by.
Be as accurate as possible based on the visual evidence.

Age categories:
- child: 0-12
- teen: 13-19
- adult: 20-64
- senior: 65+

Return the result strictly as a JSON object with these keys:
totalPeople (number), 
ageDistribution (object with child, teen, adult, senior as keys),
genderDistribution (object with male, female as keys).`;

export async function analyzeTrafficImage(base64Image: string): Promise<Partial<AnalyticRecord>> {
  const settings = settingsService.getSettings();
  
  if (settings.aiProvider === 'openai' && settings.openaiKey) {
    return analyzeWithOpenAI(base64Image, settings.openaiKey);
  }
  
  return analyzeWithGemini(base64Image);
}

async function analyzeWithGemini(base64Image: string): Promise<Partial<AnalyticRecord>> {
  try {
    const response = await defaultGeminiAi.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: PROMPT_INSTRUCTIONS },
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
    return formatResult(result);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

async function analyzeWithOpenAI(base64Image: string, apiKey: string): Promise<Partial<AnalyticRecord>> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT_INSTRUCTIONS },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "OpenAI API Error");
    
    const result = JSON.parse(data.choices[0].message.content);
    return formatResult(result);
  } catch (error) {
    console.error("OpenAI Analysis Error:", error);
    throw error;
  }
}

function formatResult(result: any): Partial<AnalyticRecord> {
  return {
    totalPeople: result.totalPeople || 0,
    ageDistribution: result.ageDistribution || { child: 0, teen: 0, adult: 0, senior: 0 },
    genderDistribution: result.genderDistribution || { male: 0, female: 0 },
    timestamp: new Date().toISOString(),
    id: crypto.randomUUID()
  };
}
