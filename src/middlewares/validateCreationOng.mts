import { Request, Response, NextFunction } from "express";
import { checkExistingCEP } from "../services/checkExistingCEP.mjs";
import { CNPJcheckExisting } from "../services/CNPJcheckExisting.mjs";
import Ong from "../models/ONG.mjs";
import type { CreateONGReceived } from "../types/CreateOng.mjs";
import type { Coordinates } from "../types/checkExist.mjs";
import { cnpj } from "cpf-cnpj-validator";
const cnpjLibrary = cnpj;

export const validateCreationOng = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const data: CreateONGReceived = req.body;

    if (!data.cnpj || !cnpjLibrary.isValid(data.cnpj)) {
      res.status(400).json({ message: "CNPJ inválido ou não fornecido" });
      return;
    }

    const resultExistCNPJ = await CNPJcheckExisting(data.cnpj);
    if (!resultExistCNPJ.exists) {
      res
        .status(400)
        .json({ message: "CNPJ não encontrado na Receita Federal" });
      return;
    }

    const situacaoCadastral = resultExistCNPJ.data.descricao_situacao_cadastral;

    if (!situacaoCadastral || situacaoCadastral.toUpperCase() !== "ATIVA") {
      res.status(400).json({
        message: `O CNPJ informado possui situação cadastral '${situacaoCadastral || "INVÁLIDA"}' na Receita Federal e não pode ser cadastrado.`,
      });
      return;
    }

    const NATUREZAS_VALIDAS = [3999, 3069, 3220, 3301, 3034];
    const legalNatureReceita = resultExistCNPJ.data?.codigo_natureza_juridica;
    if (
      !legalNatureReceita ||
      !NATUREZAS_VALIDAS.includes(legalNatureReceita)
    ) {
      res.status(400).json({
        message:
          "O CNPJ informado não pertence a uma organização sem fins lucrativos ativa na Receita Federal.",
      });
      return;
    }

    const legalNatureCheckEquality =
      Number(data.natureza_juridica) === legalNatureReceita;
    if (!legalNatureCheckEquality) {
      res.status(400).json({
        message:
          "A natureza jurídica selecionada não coincide com os registros oficiais da Receita Federal para este CNPJ.",
      });
      return;
    }

    const valCEP = await checkExistingCEP(data.cep, data.municipio, data.uf);
    if (!valCEP.exists) {
      res.status(400).json({
        message:
          "não foi possivel localizar o local pelo cep, estado ou cidade",
      });
      return;
    }

    const ongExists = await Ong.findOne({
      cnpj: cnpjLibrary.strip(data.cnpj),
    });
    if (ongExists) {
      res.status(400).json({ message: "ONG já cadastrada com este CNPJ" });
      return;
    }

    res.locals.coordinates = {
      lat: valCEP.lat,
      lng: valCEP.lng,
    } as Coordinates;

    next();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro na validação da ONG";
    res.status(500).json({ message });
  }
};
