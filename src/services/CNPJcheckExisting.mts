import { cnpj } from "cpf-cnpj-validator";
import type {
  BrasilApiCNPJResponse,
  ValidationResult,
} from "../types/checkExist.mjs";

export async function CNPJcheckExisting(
  Cnpj: string,
): Promise<ValidationResult<BrasilApiCNPJResponse>> {
  const cnpjClean = cnpj.strip(Cnpj);

  if (!cnpjClean) return { exists: false };

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`,
      {
        headers: {
          "User-Agent": "TCC-App-Validation",
        },
      },
    );

    if (!response.ok) return { exists: false };

    const data = (await response.json()) as BrasilApiCNPJResponse;

    return { exists: true, data };
  } catch {
    return { exists: false };
  }
}
