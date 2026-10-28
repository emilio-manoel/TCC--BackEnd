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
  | { exists: true; data: T; status?: "success" }
  | {
      exists: false;
      data?: undefined;
      status?: "not_found" | "unavailable";
      message?: string;
    };

export type LocationErrorType =
  | "NOT_FOUND"
  | "BRASILAPI_UNAVAILABLE_NEED_CITY_STATE"
  | "OPENSTREETMAP_UNAVAILABLE_NEED_CEP"
  | "SERVICES_UNAVAILABLE";

export type LocationCheckResult =
  | {
      exists: true;
      lat: number;
      lng: number;
      source?: "brasilapi" | "openstreetmap";
    }
  | {
      exists: false;
      lat?: undefined;
      lng?: undefined;
      errorType?: LocationErrorType;
      message?: string;
    };

export interface Coordinates {
  lat: number;
  lng: number;
}
