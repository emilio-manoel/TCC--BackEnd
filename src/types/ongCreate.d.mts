import { IONG } from "../models/ONG.mts";

export interface CreateONGReceived {
  cnpj: string;
  razao_social: string;
  natureza_juridica: string;
  situacao_cadastral: string;
  endereco_completo: string;
  cep: string;
  descricao: string;
  municipio: string;
  uf: string;
  areas_atuacao: string[];
  subareas_atuacao?: string[];
  numero_contato?: string[];
  redes_sociais?: string[];
  necessidade?: NecessidadeType[];
}

export interface NecessidadeType {
  item: string;
  categoria?: string;
  urgencia: "baixa" | "media" | "alta";
}

export interface CreateONGSent extends IONG {
  necessidade: NecessidadeType[];
}
