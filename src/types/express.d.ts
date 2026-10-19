import { Coordinates } from "../types/checkExist.mjs";
import { ExtractionCompleto, ItemDonor } from "../types/extractionData.mjs";
import type { AdminPayload } from "../middlewares/auth.mts";

declare global {
  namespace Express {
    interface Locals {
      coordinates: Coordinates
      extractedData: ExtractionCompleto
      user:AdminPayload
    }
  }
}
