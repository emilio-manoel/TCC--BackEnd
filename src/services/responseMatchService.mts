import { geminiClient } from "../config/gemini.mjs";
import { IONG } from "../models/ONG.mjs";
import {
  GENERAL_RESPONSE,
  matchResponseSchema,
} from "../prompts/generalResponse.mjs";
import type { ExtractionCompleto } from "../types/extractionData.mjs";

interface ResponseMatch {
  success: boolean;
  messageChat: string;
}

export const generateResponseMatch = async (
  extractedData: ExtractionCompleto,
  ongs: IONG[],
  historyFormatted: string,
): Promise<ResponseMatch> => {
  try {
    const inputContent = JSON.stringify({
      extractedData: extractedData,
      ongs: ongs.map((ong) => ({
        id: ong._id,
        razao_social: ong.razao_social,
        areas_atuacao: ong.areas_atuacao,
        subareas_atuacao: ong.subareas_atuacao,
        endereco_completo: ong.endereco_completo,
        municipio: ong.municipio,
        uf: ong.uf,
        necessidade: ong.virtualNecessidade,
        localizacao: ong.localizacao,
      })),
    });

    const promptFinal = `
    HISTÓRICO RECENTE DA CONVERSA (use para não repetir):

    ${historyFormatted || "(primeira interação - sem histórico)"}

    DADOS ATUAIS PARA PROCESSAMENTO:
    ${inputContent}
`;

    const response = await geminiClient.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: promptFinal }],
        },
      ],
      config: {
        systemInstruction: GENERAL_RESPONSE,
        responseMimeType: "application/json",
        responseSchema: matchResponseSchema,
        temperature: 0.3,
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Resposta do Match de IA veio vazia.");
    }

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Erro ao gerar resposta de Match com Gemini:", error);
    return {
      success: false,
      messageChat:
        "Encontrei estas ONGs próximas de você! Dá uma olhada na lista e no mapa.",
    };
  }
};
