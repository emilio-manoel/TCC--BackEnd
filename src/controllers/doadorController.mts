import Ong from '../models/ONG.mjs';
import { Request, Response } from 'express';
import { gerarRespostaMatch } from '../services/responseMatchService.mjs';

export const getUf = async (req: Request<{ uf: string }>, res: Response) => {
  try {
    const { uf } = req.params;
    const ongs = await Ong.find({ uf: String(uf), status_aprovacao: 'aprovado' }).limit(15).populate('necessidades');
    res.status(200).json({ ongs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ message });
  }
};

export const getNearbyOngs = async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : res.locals.lat;

    const lng = req.query.lng ? parseFloat(req.query.lng as string) : res.locals.lng;
    
    const distance = req.query.distance ? parseInt(req.query.distance as string) : 25000;

    if (!lat || !lng) {
      res.status(400).json({ message: 'Latitude e longitude são obrigatórios' });
      return;
    }

    const inicioDaBuscaPorONGsProximas = performance.now()
    const ongs = await Ong.find({
      status_aprovacao: 'aprovado',
      localizacao: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: distance,
        },
      },
    })
      .limit(15)
      .populate('necessidades');
      
    const FimDaBuscaPorONGsProximas = performance.now()

    const dadosExtraidos = res.locals.dadosExtraidos;

    const inicioDaRespostaGeradaPelaIA = performance.now()
    // Executa a IA para gerar a resposta empática/match
    const respostaMatch = dadosExtraidos
  ? await gerarRespostaMatch(dadosExtraidos, ongs)
  : undefined;
    
    const FimDaRespostaGeradaPelaIA = performance.now()
    console.log(`Tempo de execucao da resposta gerada pela IA: ${(FimDaRespostaGeradaPelaIA - inicioDaRespostaGeradaPelaIA)}ms`)

    // Mapeia as ONGs para expor explicitamente latitude e longitude para o Leaflet no front-end
    const ongsFormatadas = ongs.map((ong) => {
      const ongObj = ong.toObject();
      return {
        ...ongObj,
        latitude: ong.localizacao?.coordinates ? ong.localizacao.coordinates[1] : null,
        longitude: ong.localizacao?.coordinates ? ong.localizacao.coordinates[0] : null,
      };
    });


    console.log(`Tempo de execucao da busca por ONGs proximas: ${(FimDaBuscaPorONGsProximas - inicioDaBuscaPorONGsProximas)}ms`)
    console.log(`Tempo de geração da resposta final por IA de execucao: ${(FimDaRespostaGeradaPelaIA - inicioDaRespostaGeradaPelaIA)}ms`)
    console.log("------------------------------------------------")

    res.status(200).json({
      status: "completo",
      dadosExtraidos,
      coordenadasUsuario: { lat, lng },
      respostaMatch,
      ongs: ongsFormatadas,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar ONGs próximas';
    res.status(500).json({ message });
  }
};
