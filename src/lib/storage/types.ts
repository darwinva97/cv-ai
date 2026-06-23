/**
 * Capa de almacenamiento agnóstica de infraestructura. Cualquier proveedor
 * (S3 de AWS, Cloudflare R2, Backblaze B2, MinIO, …) implementa esta interfaz;
 * cambiar de proveedor es solo cambiar la config (env). Mismo patrón que el
 * seam de pagos.
 */
export interface PutInput {
  key: string;
  body: Uint8Array;
  contentType: string;
}

export interface PutResult {
  key: string;
  url: string;
}

export interface StorageProvider {
  put(input: PutInput): Promise<PutResult>;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
}

export class StorageNotConfiguredError extends Error {
  constructor(message = "El almacenamiento de archivos no está configurado.") {
    super(message);
    this.name = "StorageNotConfiguredError";
  }
}
