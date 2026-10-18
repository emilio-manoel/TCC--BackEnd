import { geminiClient } from "../config/gemini.mjs";
import { GENERAL_RESPONSE } from "../prompts/generalResponse.mjs";

export interface ResponseMatch {
  success: boolean;
  messageChat: string;
  ongSelected?: {
    id?: string;
    nome?: string;
    endereco_completo?: string;
  };
}

export const generateResponseMatch = async (
  extractedData: any,
  ongs: any[],
): Promise<ResponseMatch> => {
  try {
    const inputContent = JSON.stringify({
      extractedData,
      ongs: ongs.map((ong) => ({
        id: ong._id,
        razao_social: ong.razao_social,
        areas_atuacao: ong.areas_atuacao,
        subareas_atuacao: ong.subareas_atuacao,
        endereco_completo: ong.endereco_completo,
        municipio: ong.municipio,
        uf: ong.uf,
        necessidades: ong.necessidades,
        localizacao: ong.localizacao,
      })),
    });

    const resposta = await geminiClient.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: inputContent }],
        },
      ],
      config: {
        systemInstruction: GENERAL_RESPONSE,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const textoResposta = resposta.text;
    if (!textoResposta) {
      throw new Error("Resposta do Match de IA veio vazia.");
    }

    return JSON.parse(textoResposta);
  } catch (error) {
    console.error("Erro ao gerar resposta de Match com Gemini:", error);
    return {
      success: false,
      messageChat:
        "Encontrei estas ONGs próximas de você! Dá uma olhada na lista e no mapa.",
    };
  }
};
