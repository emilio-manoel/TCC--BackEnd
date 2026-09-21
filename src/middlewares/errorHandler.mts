import { Request, Response, NextFunction } from "express";
import { validaCNPJ } from "./validaCNPJ.mjs";
import {
  checkExistingCNPJ,
  checkExistingCEP,
} from "../services/brasilApiService.mjs";
import Ong from "../models/ONG.mjs";
import type { CreateONGRecebido } from "../types/typeCreateOng.mjs";

interface ApiCNPJ {
  existe: boolean;
  dados?: {
    codigo_natureza_juridica: number;
  };
}

export const validaCriacaoOng = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data:CreateONGRecebido = req.body;

    if (!data.cnpj || !validaCNPJ(data.cnpj)) {
      res.status(400).json({ message: "CNPJ inválido ou não fornecido" });
      return;
    }

    const resultadoExistCNPJ: ApiCNPJ = (await checkExistingCNPJ(
      data.cnpj,
    )) as ApiCNPJ;

    if (!resultadoExistCNPJ.existe) {
      res
        .status(400)
        .json({ message: "CNPJ não encontrado na Receita Federal" });
      return;
    }

    const NATUREZAS_VALIDAS = [3999, 3069, 3220, 3301, 3034];
    const codigoRecebido = resultadoExistCNPJ.dados?.codigo_natureza_juridica;

    if (!codigoRecebido || !NATUREZAS_VALIDAS.includes(codigoRecebido)) {
      res.status(400).json({
        message: "CNPJ não corresponde a uma organização sem fins lucrativos",
      });
      return;
    }

    const ongExists = await Ong.findOne({
      cnpj: data.cnpj.replace(/[^\d]+/g, ""),
    });

    const valCEP = await checkExistingCEP(data.cep, data.municipio, data.uf);
    if (!valCEP.existe) {
      res
        .status(400)
        .json({
          message:
            "não foi possivel localizar nem o local pelo cep, estado ou cidade",
        });
      return;
    }

    if (ongExists) {
      res.status(400).json({ message: "ONG já cadastrada com este CNPJ" });
      return;
    }

    res.locals.coordenadas = { lat: valCEP.lat, lng: valCEP.lng };
    next();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro na validação da ONG";
    res.status(500).json({ message });
  }
};
