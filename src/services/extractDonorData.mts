import { NextFunction, Request, Response } from "express";
import { geminiClient } from "../config/gemini.mjs";
import {
  PROMPT_EXTRACTION,
  extractionResponseSchema,
} from "../prompts/getLocation.mjs";
import { checkExistingCEP } from "./checkExistingCEP.mjs";
import type {
  ChatMessageInput,
  ExtractionResult,
} from "../types/extractionData.mjs";
import { Coordinates } from "../types/checkExist.mjs";
import {
  isMongoConnected,
  isMongoError,
  MONGO_UNAVAILABLE_MESSAGE,
} from "../middlewares/mongoError.mjs";

export const extractDonorData = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!isMongoConnected()) {
      res.status(200).json({
        status: "incompleto",
        question: MONGO_UNAVAILABLE_MESSAGE,
        message: MONGO_UNAVAILABLE_MESSAGE,
      });
      return;
    }

    const history: ChatMessageInput[] = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.history)
        ? req.body.history
        : [];

    let textResponse: string | undefined;

    try {
      const response = await geminiClient.models.generateContent({
        model: "gemini-3.5-flash-lite",
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

      textResponse = response.text;
    } catch (geminiError) {
      console.error("Erro na API do Gemini:", geminiError);
      res.status(200).json({
        status: "incompleto",
        question:
          "O serviço de inteligência artificial está temporariamente indisponível. Por favor, tente novamente mais tarde.",
        message:
          "O serviço de inteligência artificial está temporariamente indisponível. Por favor, tente novamente mais tarde.",
      });
      return;
    }

    if (!textResponse) {
      res.status(200).json({
        status: "incompleto",
        question:
          "O serviço de inteligência artificial está temporariamente indisponível. Por favor, tente novamente mais tarde.",
        message:
          "O serviço de inteligência artificial está temporariamente indisponível. Por favor, tente novamente mais tarde.",
      });
      return;
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
          localResult.message ||
          "Não consegui localizar o endereço informado. Pode confirmar seu CEP ou cidade/estado?",
        message: localResult.message,
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
    if (isMongoError(error)) {
      res.status(200).json({
        status: "incompleto",
        question: MONGO_UNAVAILABLE_MESSAGE,
        message: MONGO_UNAVAILABLE_MESSAGE,
      });
      return;
    }

    res.status(200).json({
      status: "incompleto",
      question:
        "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.",
      message:
        "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.",
    });
  }
};
