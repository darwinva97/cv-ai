"use client";

import { Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ResumeScreenshotUpload } from "@/components/resume-screenshot-upload";
import type { ParsedResumeData } from "@/lib/ai-resume-analyzer";

interface AISectionProps {
  aiPrompt: string;
  jobOffer: string;
  onAiPromptChange: (value: string) => void;
  onJobOfferChange: (value: string) => void;
  onScreenshotAnalysis: (data: ParsedResumeData) => void;
}

export function AISection({
  aiPrompt,
  jobOffer,
  onAiPromptChange,
  onJobOfferChange,
  onScreenshotAnalysis,
}: AISectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Asistente IA</h2>
        <p className="text-sm text-muted-foreground">Importa datos o genera contenido con IA</p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Importar desde imagen</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Sube una captura de tu CV actual y extraeremos los datos automáticamente
          </p>
          <ResumeScreenshotUpload onAnalysisComplete={onScreenshotAnalysis} />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Generar con IA</h3>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Instrucciones para la IA</Label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => onAiPromptChange(e.target.value)}
              placeholder="Ej: Enfatiza experiencia en React y habilidades de liderazgo"
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Oferta de trabajo (opcional)</Label>
            <Textarea
              value={jobOffer}
              onChange={(e) => onJobOfferChange(e.target.value)}
              placeholder="Pega aquí la descripción de la oferta"
              rows={4}
              className="text-sm"
            />
          </div>

          <Button className="w-full" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Generar con IA
          </Button>
        </div>
      </div>
    </div>
  );
}
