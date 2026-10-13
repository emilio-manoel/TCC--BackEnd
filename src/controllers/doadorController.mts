import Ong from "../models/ONG.mjs";
import { Request, Response } from "express";
import { gerarRespostaMatch } from "../services/responseMatchService.mjs";

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
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lat = req.query.lat
      ? parseFloat(req.query.lat as string)
      : res.locals.lat;

    const lng = req.query.lng
      ? parseFloat(req.query.lng as string)
      : res.locals.lng;

    const distance = req.query.distance
      ? parseInt(req.query.distance as string)
      : 25000;

    if (!lat || !lng) {
      res
        .status(400)
        .json({ message: "Latitude e longitude são obrigatórios" });
      return;
    }

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

    const dadosExtraidos = res.locals.dadosExtraidos;

    // Executa a IA para gerar a resposta empática/match
    const responseMatch = dadosExtraidos
      ? await gerarRespostaMatch(dadosExtraidos, ongs)
      : undefined;

  
    const ongsFormatadas = ongs.map((ong) => {
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
      coordenadasUsuario: { lat, lng },
      responseMatch,
      ongs: ongsFormatadas,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar ONGs próximas";
    res.status(500).json({ message });
  }
};
