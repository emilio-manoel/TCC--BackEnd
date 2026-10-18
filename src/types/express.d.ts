import { Coordinates } from "../types/checkExist.mjs";
import { ExtractionCompleto, ItemDonor } from "../types/extractionData.mjs";

declare global {
  namespace Express {
    interface Locals {
      coordinates?: Coordinates
      extractedData?: ExtractionCompleto
    }
  }
}
