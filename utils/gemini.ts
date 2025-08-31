import { GoogleGenAI } from "@google/genai";

// The API key is injected from the environment.
const API_KEY = process.env.API_KEY as string;
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error("Failed to read file as base64 string."));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
}

export const analyzeImage = async (prompt: string, image: File) => {
  try {
    const imagePart = await fileToGenerativePart(image);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image with the Gemini API.");
  }
};


export const generateText = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text with the Gemini API.");
  }
};