import Ong from "../models/ONG.mjs";
import Necessidade from "../models/Necessidade.mjs";
import { Request, Response } from "express";
import type { CreateONGEnviado} from "../types/typeCreateOng.mjs";



export const createOng = async (req: Request, res: Response): Promise<void> => {
  try {
    const data:CreateONGEnviado = req.body;
    
    const { lat, lng } = res.locals.coordenadas;
    data.localizacao = { type: "Point", coordinates: [lng, lat] };

    // Garante que o status inicial seja pendente
    data.status_aprovacao = "pendente";

    // Limpa o CNPJ de caracteres especiais antes de salvar
    data.cnpj = data.cnpj.replace(/[^\d]+/g, "");

    const novaOng = new Ong(data);
    await novaOng.save();

    // Se houver necessidades no body, salvá-las na nova coleção (ignorando itens vazios)
    const listaNecessidades = data.necessidades || (data as any).necessidade;
    if (listaNecessidades && Array.isArray(listaNecessidades)) {
      const necessidadesDocs = listaNecessidades
        .filter((nec: any) => nec && typeof nec.item === "string" && nec.item.trim().length > 0)
        .map((nec: any) => ({
          ong: novaOng._id,
          item: nec.item.trim(),
          categoria: nec.categoria ? String(nec.categoria).trim() : undefined,
          urgencia: nec.urgencia || "media",
          status_aprovacao: "pendente",
        }));

      if (necessidadesDocs.length > 0) {
        await Necessidade.insertMany(necessidadesDocs);
      }
    }

    res.status(201).json({
      message: "ONG cadastrada com sucesso. Aguardando aprovação.",
      ong: novaOng,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao cadastrar ONG";
    res.status(500).json({ message });
  }
};
