import "server-only";
import { createS3Storage } from "./s3";
import { StorageNotConfiguredError, type StorageProvider } from "./types";

export { StorageNotConfiguredError } from "./types";
export type { StorageProvider } from "./types";

let cached: StorageProvider | null = null;

function provider(): string {
  return process.env.STORAGE_PROVIDER || "s3";
}

/** ¿Hay configuración suficiente para subir archivos? */
export function isStorageConfigured(): boolean {
  if (provider() === "s3") {
    return Boolean(
      process.env.STORAGE_BUCKET &&
        process.env.STORAGE_ACCESS_KEY_ID &&
        process.env.STORAGE_SECRET_ACCESS_KEY &&
        process.env.STORAGE_PUBLIC_BASE_URL
    );
  }
  return false;
}

/**
 * Devuelve el proveedor de almacenamiento configurado. Lanza
 * StorageNotConfiguredError si faltan variables — los llamadores deben
 * comprobar isStorageConfigured() y degradar con gracia.
 */
export function getStorage(): StorageProvider {
  if (cached) return cached;
  const name = provider();

  if (name === "s3") {
    if (!isStorageConfigured()) throw new StorageNotConfiguredError();
    cached = createS3Storage({
      endpoint: process.env.STORAGE_ENDPOINT,
      region: process.env.STORAGE_REGION || "auto",
      bucket: process.env.STORAGE_BUCKET!,
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
      publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL!,
      forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
    });
    return cached;
  }

  throw new StorageNotConfiguredError(
    `Proveedor de almacenamiento no soportado: ${name}`
  );
}
