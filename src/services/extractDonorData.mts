import { NextFunction, Request, Response } from "express";
import { geminiClient } from "../config/gemini.mjs";
import { PROMPT_EXTRACTION } from "../prompts/getLocation.mjs";
import { checkExistingCEP } from "./checkExistingCEP.mjs";
import type {
  ChatMessageInput,
  ExtractionResult,
} from "../types/extractionData.mjs";
import { extractionResponseSchema } from "../prompts/getLocation.mjs";
import { Coordinates } from "../types/checkExist.mjs";

export const extractDonorData = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const history: ChatMessageInput[] = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.history)
        ? req.body.history
        : [];

    const response = await geminiClient.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: history
        .filter((m) => m.content?.trim())
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      config: {
        systemInstruction: PROMPT_EXTRACTION,
        responseSchema: extractionResponseSchema,
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Resposta da IA veio vazia.");
    }
    const extractedData: ExtractionResult = JSON.parse(textResponse);

    if (extractedData.status === "incompleto") {
      res.status(200).json(extractedData);
      return;
    }

    const localResult = await checkExistingCEP(
      extractedData.cep,
      extractedData.cidade,
      extractedData.uf,
      extractedData.povoado,
    );

    if (!localResult.exists) {
      res.status(200).json({
        status: "incompleto",
        question:
          "Não consegui localizar o endereço informado. Pode confirmar seu CEP ou cidade/estado?",
      });
      return;
    }

    res.locals.extractedData = extractedData;
      res.locals.coordinates = {
      lat: localResult.lat,
      lng: localResult.lng,
    } as Coordinates;
    
    next();
  } catch (error) {
    console.error("Erro no processamento da doação:", error);
    res.status(200).json({
      status: "incompleto",
      question:
        "Desculpa, não entendi direito, tente novamente, começando me passando o seu CEP ou cidade/estado, para fazer o match.",
    });
  }
};
