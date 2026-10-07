import { NextFunction, Request, Response } from "express";
import { geminiClient } from "../config/gemini.mjs";
import { PROMPT_EXTRACAO } from "../prompts/obterLocal.mjs";
import { checkExistingCEP } from "./brasilApiService.mjs";

interface Mensagem {
  role: "user" | "model";
  texto: string;
}

interface ItemDoacao {
  descricao: string;
  quantidade: string | null;
}

type ResultadoExtracao =
  | { status: "incompleto"; pergunta: string }
  | {
      status: "completo";
      cep: string | null;
      cidade: string | null;
      uf: string | null;
      povoado: string | null;
      itens: ItemDoacao[];
    };

export const extrairDadosDoacao = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {

  try {
    

    const historico: Mensagem[] = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.historico)
      ? req.body.historico
      : [];

    const resposta = await geminiClient.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: historico.map((m) => ({
        role: m.role,
        parts: [{ text: m.texto }],
      })),
      config: {
        systemInstruction: PROMPT_EXTRACAO,
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    const textoResposta = resposta.text;

    if (!textoResposta) {
      throw new Error("Resposta da IA veio vazia.");
    }

    const dadosExtraidos: ResultadoExtracao = JSON.parse(textoResposta);

    if (dadosExtraidos.status === "incompleto") {
      res.status(200).json(dadosExtraidos);
      return;
    }
    
   

        const resultadoLocal = await checkExistingCEP(
      dadosExtraidos.cep,
      dadosExtraidos.cidade,
      dadosExtraidos.uf,
      dadosExtraidos.povoado,
    );
    
    if (!resultadoLocal.existe) {
      res.status(200).json({
        status: "incompleto",
        pergunta:
        "Não consegui localizar o endereço informado. Pode confirmar seu CEP ou cidade/estado?",
      });
      return;
    }
    
    // Guarda os dados extraídos e as coordenadas para a próxima rota (getNearbyOngs)
    res.locals.dadosExtraidos = dadosExtraidos;
    res.locals.lat = resultadoLocal.lat;
    res.locals.lng = resultadoLocal.lng;

    next();
  } catch (error) {
    console.error("Erro no processamento da doação:", error);
    res.status(200).json({
      status: "incompleto",
      pergunta: "Desculpa, não entendi direito, tente novamente, começando me passando o seu CEP ou cidade/estado, para fazer o match.",
    });
  }
};
