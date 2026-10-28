import mongoose from "mongoose";

export const MONGO_UNAVAILABLE_MESSAGE =
  "O banco de dados está temporariamente indisponível. Por favor, tente novamente mais tarde.";

/**
 * Verifica se a conexão com o MongoDB está ativa (readyState === 1).
 */
export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Verifica se um erro capturado está relacionado à indisponibilidade ou falha do MongoDB/Mongoose.
 */
export function isMongoError(error: unknown): boolean {
  if (mongoose.connection.readyState !== 1) return true;
  if (!error) return false;

  if (typeof error === "object") {
    const err = error as { name?: string; message?: string; code?: string | number };
    const name = err.name || "";
    const msg = err.message || "";

    if (
      name.includes("Mongo") ||
      name.includes("Mongoose") ||
      msg.includes("buffering timed out") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("failed to connect to server") ||
      msg.includes("topology was closed") ||
      msg.includes("connection closed")
    ) {
      return true;
    }
  }

  return false;
}
