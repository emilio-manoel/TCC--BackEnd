import { cnpj } from "cpf-cnpj-validator";
import {
  BrasilApiCNPJResponse,
  BrasilApiCepV2Response,
  NominatimSearchResult,
  ValidationResult,
  LocationCheckResult,
} from "../types/checkExist.mjs";

export async function checkExistingCNPJ(
  Cnpj: string,
): Promise<ValidationResult<BrasilApiCNPJResponse>> {
  const cnpjClean = cnpj.strip(Cnpj);

  if (!cnpjClean) return { exists: false };

  try {
    const resposta = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`,
      {
        headers: {
          "User-Agent": "TCC-App-Validation",
        },
      },
    );

    if (!resposta.ok) return { exists: false };

    const data = (await resposta.json()) as BrasilApiCNPJResponse;
    return { exists: true, data };
  } catch {
    return { exists: false };
  }
}

async function apiBrasilCep(
  cep: string,
): Promise<ValidationResult<BrasilApiCepV2Response>> {
  try {
    const cepClean = cep.replace(/[^\d]+/g, "");
    if (!cepClean) return { exists: false };

    const response = await fetch(
      `https://brasilapi.com.br/api/cep/v2/${cepClean}`,
    );
    if (!response.ok) return { exists: false };

    const data = (await response.json()) as BrasilApiCepV2Response;
    return { exists: true, data };
  } catch {
    return { exists: false };
  }
}

async function openStreetMap(
  cidade: string,
  uf: string,
  povoado?: string,
): Promise<ValidationResult<NominatimSearchResult[]>> {
  const localQuery = povoado
    ? `${povoado}, ${cidade}, ${uf}, brasil`
    : `${cidade}, ${uf}, brasil`;

  const query = encodeURIComponent(localQuery);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const resposta = await fetch(url, {
      headers: {
        "User-Agent": "TCC-App-Validation",
      },
    });

    if (!resposta.ok) return { exists: false };

    const data = (await resposta.json()) as NominatimSearchResult[];
    return { exists: true, data };
  } catch {
    return { exists: false };
  }
}

export async function checkExistingCEP(
  cep?: string | null,
  cidade?: string | null,
  uf?: string | null,
  povoado?: string | null,
): Promise<LocationCheckResult> {
  if (cep) {
    const cepClean = cep.replace(/[^\d]+/g, "");
    if (cepClean) {
      const resultCep = await apiBrasilCep(cepClean);

      if (resultCep.exists) {
        let lat: number | undefined;
        let lng: number | undefined;

        if (resultCep.data.location?.coordinates) {
          lng = parseFloat(resultCep.data.location.coordinates.longitude);
          lat = parseFloat(resultCep.data.location.coordinates.latitude);
        }

        if (!lat || !lng) {
          const citySearch = resultCep.data.city || cidade;
          const stateSearch = resultCep.data.state || uf;

          if (citySearch && stateSearch) {
            const mapRes = await openStreetMap(citySearch, stateSearch);
            if (mapRes.exists && mapRes.data.length > 0) {
              lat = parseFloat(mapRes.data[0].lat);
              lng = parseFloat(mapRes.data[0].lon);
            }
          }
        }

        return {
          exists: true,
          lat,
          lng,
        };
      }
    }
  }

  if (cidade && uf) {
    if (povoado) {
      const specificResult = await openStreetMap(cidade, uf, povoado);
      if (specificResult.exists && specificResult.data.length > 0) {
        const item = specificResult.data[0];
        return {
          exists: true,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };
      }
    }

    const resultMap = await openStreetMap(cidade, uf);
    if (resultMap.exists && resultMap.data.length > 0) {
      const item = resultMap.data[0];
      return {
        exists: true,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    }
  }

  return { exists: false };
}
