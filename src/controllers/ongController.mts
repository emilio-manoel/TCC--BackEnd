import Ong from "../models/ONG.mjs";
import Necessidade from "../models/Necessidade.mjs";
import { Request, Response } from "express";
import type { CreateONGSent, NecessidadeType } from "../types/CreateOng.mjs";
import type { Coordinates } from "../types/checkExist.mjs";
import { cnpj } from "cpf-cnpj-validator";
const cnpjLibrary = cnpj;

export const createOng = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateONGSent = req.body;
    const { lat, lng } = res.locals.coordinates as Coordinates;

    data.localizacao = { type: "Point", coordinates: [lng, lat] };
    data.status_aprovacao = "pendente";
    data.cnpj = cnpjLibrary.strip(data.cnpj);

    const newOng = new Ong(data);
    await newOng.save();

    const listNecessidades = data.necessidade
    if (listNecessidades && Array.isArray(listNecessidades)) {
      const necessidadesDocs = listNecessidades
        .filter(
          (nec: NecessidadeType) =>
            nec && typeof nec.item === "string" && nec.item.trim().length > 0,
        )
        .map((nec: NecessidadeType) => ({
          ong: newOng._id,
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
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao cadastrar ONG";
    res.status(500).json({ message });
  }
};
