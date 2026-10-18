import type { CreateONGReceived } from "./ongCreate.d.mts";

export interface BrasilApiCNPJResponse {
  codigo_natureza_juridica: number;
  descricao_situacao_cadastral: string;
}

interface BrasilApiLocationCoordinates {
  longitude: string;
  latitude: string;
}

export interface BrasilApiLocation {
  type: string;
  coordinates: BrasilApiLocationCoordinates;
}

export interface BrasilApiCepV2Response {
  state: string;
  city: string;
  location?: BrasilApiLocation;
}

export interface NominatimSearchResult {
  lat: string;
  lon: string;
}

export type ValidationResult<T> =
  | { exists: true; data: T }
  | { exists: false; data?: undefined };

export type LocationCheckResult =
  | {
      exists: true;
      lat?: number;
      lng?: number;
    }
  | {
      exists: false;
      lat?: undefined;
      lng?: undefined;
    };

export interface Coordinates {
  lat: number;
  lng: number;
}
