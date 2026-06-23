import "server-only";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type { StorageProvider } from "./types";

/**
 * Driver compatible con S3. Sirve para AWS S3, Cloudflare R2, Backblaze B2 y
 * MinIO sin cambios de código: solo varían endpoint/region/credenciales y, en
 * algunos (MinIO/B2), `forcePathStyle`.
 */
export interface S3StorageConfig {
  endpoint?: string; // R2/B2/MinIO; vacío para AWS S3 nativo
  region: string; // "auto" para R2
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Base pública para construir URLs (CDN/dominio del bucket público). */
  publicBaseUrl: string;
  forcePathStyle: boolean;
}

export function createS3Storage(cfg: S3StorageConfig): StorageProvider {
  const client = new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint || undefined,
    forcePathStyle: cfg.forcePathStyle,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  const base = cfg.publicBaseUrl.replace(/\/+$/, "");
  const publicUrl = (key: string) => `${base}/${key.replace(/^\/+/, "")}`;

  return {
    publicUrl,
    async put({ key, body, contentType }) {
      await client.send(
        new PutObjectCommand({
          Bucket: cfg.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      );
      return { key, url: publicUrl(key) };
    },
    async delete(key) {
      await client.send(
        new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key })
      );
    },
  };
}
