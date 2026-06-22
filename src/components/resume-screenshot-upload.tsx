"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { analyzeResumeFile } from "@/actions/ai";
import type { ParsedResumeData } from "@/lib/ai-resume-analyzer";

interface ResumeScreenshotUploadProps {
  onAnalysisComplete: (data: ParsedResumeData) => void;
}

type Selected = {
  name: string;
  mediaType: string;
  base64: string; // sin prefijo data:
  dataUrl: string;
  isPdf: boolean;
};

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = "image/png,image/jpeg,image/webp,image/gif,application/pdf";

export function ResumeScreenshotUpload({ onAnalysisComplete }: ResumeScreenshotUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      setError("Formato no soportado. Usa una imagen (PNG/JPG/WEBP) o un PDF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("El archivo es demasiado grande (máx 10MB)");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      setSelected({ name: file.name, mediaType: file.type, base64, dataUrl, isPdf });
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selected) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeResumeFile({
        base64: selected.base64,
        mediaType: selected.mediaType,
      });

      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      onAnalysisComplete(result.data as ParsedResumeData);
      toast.success(
        result.source === "byok"
          ? "Datos extraídos con tu clave (gratis). Revísalos y guarda."
          : `Datos extraídos · ${result.charged} créditos · saldo ${result.remaining}. Revísalos y guarda.`
      );
      handleClear();
    } catch (err) {
      setError("Error al analizar el archivo. Intenta de nuevo.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelected(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFileSelect}
        className="hidden"
        id="resume-screenshot-input"
      />

      {!selected ? (
        <label
          htmlFor="resume-screenshot-input"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">
            Haz clic para subir una imagen o PDF
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WEBP o PDF · hasta 10MB
          </span>
        </label>
      ) : selected.isPdf ? (
        <div className="relative flex items-center gap-3 rounded-lg border p-3">
          <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
          <span className="text-sm truncate">{selected.name}</span>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.dataUrl}
            alt="Preview del CV"
            className="w-full h-32 object-cover rounded-lg border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selected && (
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Extraer datos
            </>
          )}
        </Button>
      )}
    </div>
  );
}
