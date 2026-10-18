import Ong from "../models/ONG.mjs";
import { Request, Response } from "express";
import { generateResponseMatch } from "../services/responseMatchService.mjs";
import { Coordinates } from "../types/checkExist.mjs";

export const getUf = async (req: Request<{ uf: string }>, res: Response) => {
  try {
    const { uf } = req.params;
    const ongs = await Ong.find({
      uf: String(uf),
      status_aprovacao: "aprovado",
    })
      .limit(15)
      .populate("necessidades");
    res.status(200).json({ ongs });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    res.status(500).json({ message });
  }
};

export const getNearbyOngs = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { lat, lng } = res.locals.coordinates as Coordinates;
    const distance = 25000;

    const ongs = await Ong.find({
      status_aprovacao: "aprovado",
      localizacao: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: distance,
        },
      },
    })
      .limit(15)
      .populate("necessidades");

    const extractedData = res.locals.extractedData;
    const responseMatch = await generateResponseMatch(extractedData, ongs);

    const ongsFormatted = ongs.map((ong) => {
      const [longitude, latitude] = ong.localizacao.coordinates;

      return {
        _id: ong._id,
        razao_social: ong.razao_social,
        endereco_completo: ong.endereco_completo,
        latitude,
        longitude,
      };
    });

    res.status(200).json({
      status: "completo",
      userCoordinates: { lat, lng },
      responseMatch,
      ongs: ongsFormatted,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar ONGs próximas";
    res.status(500).json({ message });
  }
};
