"use server";

import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/auth-helpers";
import { getStorage, isStorageConfigured } from "@/lib/storage";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 5 * 1024 * 1024;

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string; code?: "not_configured" };

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Sube una imagen de perfil al almacenamiento configurado y devuelve su URL. */
export async function uploadProfilePhoto(formData: FormData): Promise<UploadResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Archivo inválido." };
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, error: "Usa una imagen PNG, JPG, WEBP o GIF." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "La imagen es demasiado grande (máx 5MB)." };
  }

  if (!isStorageConfigured()) {
    return {
      ok: false,
      code: "not_configured",
      error:
        "La subida de archivos aún no está configurada. Por ahora pega la URL de una imagen.",
    };
  }

  try {
    const ext = EXT[file.type] || "bin";
    const key = `avatars/${user.id}/${randomUUID()}.${ext}`;
    const body = new Uint8Array(await file.arrayBuffer());
    const { url } = await getStorage().put({ key, body, contentType: file.type });
    return { ok: true, url };
  } catch (err) {
    console.error("uploadProfilePhoto failed:", err);
    return { ok: false, error: "No se pudo subir la imagen. Inténtalo de nuevo." };
  }
}
