import type {
  BrasilApiCepV2Response,
  NominatimSearchResult,
  LocationCheckResult,
} from "../types/checkExist.mjs";

type FetchStatus<T> =
  | { status: "success"; data: T }
  | { status: "not_found" }
  | { status: "unavailable" };

async function apiBrasilCep(
  cep: string,
): Promise<FetchStatus<BrasilApiCepV2Response>> {
  if (!cep) return { status: "not_found" };

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`, {
      headers: {
        "User-Agent": "TCCApp/1.0",
      },
      signal: AbortSignal.timeout(7000),
    });

    if (response.ok) {
      const data = (await response.json()) as BrasilApiCepV2Response;
      return { status: "success", data };
    }

    if (response.status === 404 || response.status === 400) {
      return { status: "not_found" };
    }

    
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

async function queryNominatim(queryStr: string): Promise<FetchStatus<NominatimSearchResult[]>> {
  const query = encodeURIComponent(queryStr);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "TCCApp/1.0 (emilio.trabalho555@gmail.com)",
      },
      signal: AbortSignal.timeout(7000),
    });

    if (response.ok) {
      const data = (await response.json()) as NominatimSearchResult[];
      if (data && data.length > 0) {
        return { status: "success", data };
      }
      return { status: "not_found" };
    }

    if (response.status === 404) {
      return { status: "not_found" };
    }

    
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

async function openStreetMap(
  cidade: string,
  uf: string,
  povoado?: string,
): Promise<FetchStatus<NominatimSearchResult[]>> {
  if (!cidade || !uf) return { status: "not_found" };

 
  if (povoado && povoado.trim().length > 0) {
    const specificQuery = `${povoado.trim()}, ${cidade.trim()}, ${uf.trim()}, brasil`;
    const specificRes = await queryNominatim(specificQuery);

    if (specificRes.status === "success") {
      return specificRes;
    }

    if (specificRes.status === "unavailable") {
      return specificRes;
    }
  }


  const generalQuery = `${cidade.trim()}, ${uf.trim()}, brasil`;
  return await queryNominatim(generalQuery);
}

export async function checkExistingCEP(
  cep?: string | null,
  cidade?: string | null,
  uf?: string | null,
  povoado?: string | null,
): Promise<LocationCheckResult> {
  const cepClean = cep ? cep.replace(/[^\d]+/g, "") : "";
  const hasCepInJson = cepClean.length === 8;

  const cleanCidade = cidade ? cidade.trim() : "";
  const cleanUf = uf ? uf.trim() : "";
  const cleanPovoado = povoado ? povoado.trim() : undefined;
  const hasCityStateInJson = cleanCidade.length > 0 && cleanUf.length > 0;

 
  if (hasCepInJson) {
    const brasilApiResult = await apiBrasilCep(cepClean);

    if (brasilApiResult.status === "success") {
      let lat: number | undefined;
      let lng: number | undefined;

      
      if (brasilApiResult.data.location?.coordinates) {
        const rawLat = parseFloat(brasilApiResult.data.location.coordinates.latitude);
        const rawLng = parseFloat(brasilApiResult.data.location.coordinates.longitude);
        if (Number.isFinite(rawLat) && Number.isFinite(rawLng)) {
          lat = rawLat;
          lng = rawLng;
        }
      }

     
      if (lat === undefined || lng === undefined) {
        const citySearch = cleanCidade || brasilApiResult.data.city;
        const stateSearch = cleanUf || brasilApiResult.data.state;

        if (citySearch && stateSearch) {
          const mapRes = await openStreetMap(citySearch, stateSearch, cleanPovoado);
          if (mapRes.status === "success" && mapRes.data.length > 0) {
            const rawLat = parseFloat(mapRes.data[0].lat);
            const rawLng = parseFloat(mapRes.data[0].lon);
            if (Number.isFinite(rawLat) && Number.isFinite(rawLng)) {
              return {
                exists: true,
                lat: rawLat,
                lng: rawLng,
                source: "openstreetmap",
              };
            }
          } else if (mapRes.status === "unavailable") {
            return {
              exists: false,
              errorType: "SERVICES_UNAVAILABLE",
              message:
                "O serviço de coordenadas geográficas está temporariamente indisponível. Por favor, tente novamente mais tarde.",
            };
          }
        }
      }

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {
          exists: true,
          lat: lat!,
          lng: lng!,
          source: "brasilapi",
        };
      }
    }

   
    if (brasilApiResult.status === "unavailable") {
     
      if (hasCityStateInJson) {
        const mapRes = await openStreetMap(cleanCidade, cleanUf, cleanPovoado);
        if (mapRes.status === "success" && mapRes.data.length > 0) {
          const rawLat = parseFloat(mapRes.data[0].lat);
          const rawLng = parseFloat(mapRes.data[0].lon);
          if (Number.isFinite(rawLat) && Number.isFinite(rawLng)) {
            return {
              exists: true,
              lat: rawLat,
              lng: rawLng,
              source: "openstreetmap",
            };
          }
        }

        if (mapRes.status === "unavailable") {
          return {
            exists: false,
            errorType: "SERVICES_UNAVAILABLE",
            message:
              "Os serviços de localização estão temporariamente indisponíveis. Por favor, tente novamente mais tarde.",
          };
        }

        return {
          exists: false,
          errorType: "NOT_FOUND",
          message:
            "O serviço de busca por CEP está indisponível e não foi possível localizar a cidade e estado informados. Pode confirmar os dados?",
        };
      }

     
      return {
        exists: false,
        errorType: "BRASILAPI_UNAVAILABLE_NEED_CITY_STATE",
        message:
          "O serviço de busca por CEP está temporariamente indisponível. Por favor, informe sua cidade e estado para continuarmos.",
      };
    }

    
    if (brasilApiResult.status === "not_found") {
     
      if (hasCityStateInJson) {
        const mapRes = await openStreetMap(cleanCidade, cleanUf, cleanPovoado);
        if (mapRes.status === "success" && mapRes.data.length > 0) {
          const rawLat = parseFloat(mapRes.data[0].lat);
          const rawLng = parseFloat(mapRes.data[0].lon);
          if (Number.isFinite(rawLat) && Number.isFinite(rawLng)) {
            return {
              exists: true,
              lat: rawLat,
              lng: rawLng,
              source: "openstreetmap",
            };
          }
        }

        if (mapRes.status === "unavailable") {
          return {
            exists: false,
            errorType: "SERVICES_UNAVAILABLE",
            message:
              "O CEP não foi encontrado e o serviço de busca por cidade e estado está temporariamente indisponível. Por favor, tente novamente mais tarde.",
          };
        }
      }

      return {
        exists: false,
        errorType: "NOT_FOUND",
        message:
          "Não consegui localizar o CEP informado. Pode conferir os 8 dígitos ou me dizer sua cidade e estado?",
      };
    }
  }

  
  if (hasCityStateInJson) {
    const mapRes = await openStreetMap(cleanCidade, cleanUf, cleanPovoado);

    if (mapRes.status === "success" && mapRes.data.length > 0) {
      const rawLat = parseFloat(mapRes.data[0].lat);
      const rawLng = parseFloat(mapRes.data[0].lon);
      if (Number.isFinite(rawLat) && Number.isFinite(rawLng)) {
        return {
          exists: true,
          lat: rawLat,
          lng: rawLng,
          source: "openstreetmap",
        };
      }
    }

  
    if (mapRes.status === "unavailable") {
  
      return {
        exists: false,
        errorType: "OPENSTREETMAP_UNAVAILABLE_NEED_CEP",
        message:
          "O serviço de busca por cidade e estado está temporariamente indisponível. Por favor, informe o seu CEP para continuarmos.",
      };
    }

    return {
      exists: false,
      errorType: "NOT_FOUND",
      message:
        "Não consegui localizar a cidade e estado informados. Pode conferir os dados ou nos passar seu CEP?",
    };
  }

 
  return {
    exists: false,
    errorType: "NOT_FOUND",
    message: "Por favor, informe seu CEP ou cidade e estado para continuarmos.",
  };
}
