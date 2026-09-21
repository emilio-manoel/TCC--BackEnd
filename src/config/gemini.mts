import { GoogleGenAI } from "@google/genai";

if (!process.env.API_GEMINI) {
  throw new Error("GEMINI_API_KEY não encontrada no .env");
}

export const geminiClient = new GoogleGenAI({ apiKey: process.env.API_GEMINI });