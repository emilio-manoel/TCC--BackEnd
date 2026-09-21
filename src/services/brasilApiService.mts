interface RespostaValidacao {
  existe: boolean;
  dados?: any;
}

export async function checkExistingCNPJ(cnpj: string) {
    
   const cnpjClean = cnpj.replace(/[^\d]+/g, "");

  try {
    const resposta = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`,
      {
        headers: {
          'User-Agent': 'TCC-App-Validation'
        }
      }
    );
    if (!resposta.ok) return { existe: false };

    const dados = await resposta.json();
    return { existe: true, dados };
  } catch {
    return { existe: false };
  }
}

export async function checkExistingCEP(
  cep?: string | null,
  cidade?: string | null,
  uf?: string | null,
  povoado?: string | null,
) {
  if (cep) {
    const resultadoCep = await apiBrasilCep(cep);
    if (resultadoCep.existe) {
      let lat: number | undefined;
      let lng: number | undefined;
      if (resultadoCep.dados?.location?.coordinates) {
        lng = parseFloat(resultadoCep.dados.location.coordinates.longitude);
        lat = parseFloat(resultadoCep.dados.location.coordinates.latitude);
      }
      if (!lat || !lng) {
        const mapRes = await openStreetMap(cep, "");
        if (mapRes.existe && mapRes.dados?.length > 0) {
          lat = parseFloat(mapRes.dados[0].lat);
          lng = parseFloat(mapRes.dados[0].lon);
        }
      }
      return { existe: true, lat, lng, dados: resultadoCep.dados };
    }
  }

  if (cidade && uf) {
    // Se o usuário informou um povoado/bairro/distrito, tenta a busca mais específica primeiro
    if (povoado) {
      const resultadoEspecifico = await openStreetMap(cidade, uf, povoado);
      if (resultadoEspecifico.existe && resultadoEspecifico.dados?.length > 0) {
        const item = resultadoEspecifico.dados[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        return { existe: true, lat, lng, dados: resultadoEspecifico.dados };
      }
    }

    // Fallback: busca pela cidade/UF apenas
    const resultadoMap = await openStreetMap(cidade, uf);
    if (resultadoMap.existe && resultadoMap.dados?.length > 0) {
      const item = resultadoMap.dados[0];
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      return { existe: true, lat, lng, dados: resultadoMap.dados };
    }
  }
  return { existe: false };
}

async function apiBrasilCep(cep: string): Promise<RespostaValidacao> {
  try {
    const resposta = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
    if (!resposta.ok) return { existe: false };

    const dados = await resposta.json();
    return { existe: true, dados };
  } catch {
    return { existe: false };
  }
}

async function openStreetMap(cidade: string, uf: string, povoado?: string): Promise<RespostaValidacao> {
  
  const sanitize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const c = sanitize(cidade);
  const u = sanitize(uf);
  const p = povoado ? sanitize(povoado) : "";

  const localQuery = p 
    ? `${p}, ${c}, ${u}, brasil` 
    : `${c}, ${u}, brasil`;

  const query = encodeURIComponent(localQuery);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const resposta = await fetch(url, {
      headers: {
        'User-Agent': 'TCC-App-Validation' // Identifica sua aplicação na API deles
      }
    });
    if (!resposta.ok) return { existe: false };

    const dados = await resposta.json();
    return { existe: true, dados };
  } catch {
    return { existe: false };
  }
}
