
import { GoogleGenAI } from "@google/genai";

// Fixed: Initializing the GoogleGenAI client using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDetailedExplanation(question: string, options: string[], correctIndex: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed, professional explanation for the following multiple choice question.
      Question: ${question}
      Options: ${options.join(', ')}
      Correct Option: ${options[correctIndex]}
      
      Keep the explanation concise but educational. Format it as plain text.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    // Fixed: response.text is a property, not a method.
    return response.text || "No detailed explanation available at the moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The system was unable to generate a dynamic explanation. Please refer to standard study materials.";
  }
}
