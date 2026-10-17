import { Coordinates } from "../types/checkExist.mjs";

declare global {
  namespace Express {
    interface Locals {
      coordinates?: {
        lat: number;
        lng: number;
      };
    }
  }
}
