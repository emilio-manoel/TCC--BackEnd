import { cnpj } from "cpf-cnpj-validator";
import type {
  BrasilApiCNPJResponse,
  ValidationResult,
} from "../types/checkExist.mjs";

export async function CNPJcheckExisting(
  Cnpj: string,
): Promise<ValidationResult<BrasilApiCNPJResponse>> {
  const cnpjClean = cnpj.strip(Cnpj);

  if (!cnpjClean) {
    return {
      exists: false,
      status: "not_found",
      message: "CNPJ inválido ou não fornecido",
    };
  }

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`,
      {
        headers: {
          "User-Agent": "TCC-App-Validation",
        },
        signal: AbortSignal.timeout(7000),
      },
    );

    if (response.ok) {
      const data = (await response.json()) as BrasilApiCNPJResponse;
      return { exists: true, data, status: "success" };
    }

    if (response.status === 404 || response.status === 400) {
      return {
        exists: false,
        status: "not_found",
        message: "CNPJ não encontrado na Receita Federal",
      };
    }

    // Erros 429, 500, 502, 503, 504 indicam indisponibilidade da BrasilAPI
    return {
      exists: false,
      status: "unavailable",
      message:
        "O serviço de consulta de CNPJ (Brasil API) está temporariamente indisponível. Por favor, tente novamente mais tarde.",
    };
  } catch {
    return {
      exists: false,
      status: "unavailable",
      message:
        "O serviço de consulta de CNPJ (Brasil API) está temporariamente indisponível. Por favor, tente novamente mais tarde.",
    };
  }
}
