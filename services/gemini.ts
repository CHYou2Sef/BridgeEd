
import { GoogleGenAI, Type } from "@google/genai";
import { Language, ChatMessage, Exercise, GradeResult } from "../types";

// Note: process.env.API_KEY is handled externally.

export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  // Fix: Direct use of process.env.API_KEY in constructor
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following text to ${targetLang}. Only provide the translated text: "${text}"`,
  });
  return response.text?.trim() || text;
};

export const generateExercise = async (courseTitle: string, courseDesc: string, lang: Language): Promise<Exercise> => {
  // Fix: Direct use of process.env.API_KEY in constructor
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a challenging academic exercise for the course "${courseTitle}" described as "${courseDesc}". The response must be in JSON format matching the schema. Respond in ${lang}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          type: { type: Type.STRING, description: 'Return either "multiple-choice" or "open-ended"' },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: 'Required if type is multiple-choice, otherwise empty.'
          },
          correctAnswer: { type: Type.STRING, description: 'Required for multiple-choice.' }
        },
        required: ["question", "type"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as Exercise;
};

export const evaluateExercise = async (exercise: Exercise, userAnswer: string, lang: Language): Promise<GradeResult> => {
  // Fix: Direct use of process.env.API_KEY in constructor
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Evaluate this answer for the exercise: 
    Q: ${exercise.question}
    User Answer: ${userAnswer}
    
    Provide a score (0-100) and detailed pedagogical feedback in ${lang}. Respond in JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          isCorrect: { type: Type.BOOLEAN }
        },
        required: ["score", "feedback", "isCorrect"]
      }
    }
  });
  return JSON.parse(response.text || "{}") as GradeResult;
};

export const getTutorResponse = async (history: ChatMessage[], currentLang: Language): Promise<string> => {
  // Fix: Direct use of process.env.API_KEY in constructor
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
    You are BridgeEd's Multilingual AI Tutor. 
    Current language: ${currentLang}.
    If context is Western: focus on critical thinking and project collaboration.
    If context is Arab World: focus on scientific rigor within cultural values.
    Answer in ${currentLang}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
    config: { systemInstruction }
  });
  
  return response.text || "I'm sorry, I couldn't process that.";
};
