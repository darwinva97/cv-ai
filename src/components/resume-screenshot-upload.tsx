"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeResumeScreenshot, type ParsedResumeData } from "@/lib/ai-resume-analyzer";

interface ResumeScreenshotUploadProps {
  onAnalysisComplete: (data: ParsedResumeData) => void;
}

export function ResumeScreenshotUpload({ onAnalysisComplete }: ResumeScreenshotUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen es demasiado grande (max 10MB)");
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await analyzeResumeScreenshot(preview);
      onAnalysisComplete(data);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError("Error al analizar la imagen. Intenta de nuevo.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
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
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="resume-screenshot-input"
      />

      {!preview ? (
        <label
          htmlFor="resume-screenshot-input"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">
            Haz clic para subir una imagen
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            PNG, JPG hasta 10MB
          </span>
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
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

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {preview && (
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
