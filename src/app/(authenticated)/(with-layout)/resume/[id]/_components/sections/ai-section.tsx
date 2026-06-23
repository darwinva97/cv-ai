"use client";

import Link from "next/link";
import { Upload, Sparkles, Loader2, Coins, CreditCard, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ResumeScreenshotUpload } from "@/components/resume-screenshot-upload";
import type { ParsedResumeData } from "@/lib/ai-resume-analyzer";

interface AISectionProps {
  aiPrompt: string;
  jobOffer: string;
  creativity: number;
  onAiPromptChange: (value: string) => void;
  onJobOfferChange: (value: string) => void;
  onCreativityChange: (value: number) => void;
  onScreenshotAnalysis: (data: ParsedResumeData) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  creditNotice?: { balance?: number; estCost?: number } | null;
  onDismissCreditNotice?: () => void;
}

const creativityLabel = (n: number): string => {
  if (n <= 3) return "Conservador · no inventa nada";
  if (n <= 7) return "Equilibrado · refuerza sin inventar datos clave";
  return "Creativo · puede embellecer y extrapolar";
};

export function AISection({
  aiPrompt,
  jobOffer,
  creativity,
  onAiPromptChange,
  onJobOfferChange,
  onCreativityChange,
  onScreenshotAnalysis,
  onGenerate,
  isGenerating,
  creditNotice,
  onDismissCreditNotice,
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
            <h3 className="text-sm font-medium">Importar desde imagen o PDF</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Sube una captura o el PDF de tu CV actual y extraeremos los datos automáticamente
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Nivel de optimización</Label>
              <span className="text-xs font-medium text-primary">{creativity}/10</span>
            </div>
            <Slider
              value={[creativity]}
              onValueChange={([v]) => onCreativityChange(v)}
              min={1}
              max={10}
              step={1}
            />
            <p className="text-xs text-muted-foreground">{creativityLabel(creativity)}</p>
          </div>

          <Button
            className="w-full"
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? "Generando…" : "Generar con IA"}
          </Button>

          {creditNotice && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold">Créditos insuficientes</h4>
                <p className="text-xs text-muted-foreground">
                  Saldo: {creditNotice.balance ?? 0}
                  {typeof creditNotice.estCost === "number" &&
                    ` · costo estimado: ${creditNotice.estCost}`}
                  . Compra créditos, suscríbete, o usa tu propia API key (gratis).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/billing">
                    <Coins className="mr-1 h-4 w-4" /> Comprar créditos
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/billing">
                    <CreditCard className="mr-1 h-4 w-4" /> Suscribirme
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/settings/ai">
                    <KeyRound className="mr-1 h-4 w-4" /> Usar mi API key
                  </Link>
                </Button>
                {onDismissCreditNotice && (
                  <Button size="sm" variant="ghost" onClick={onDismissCreditNotice}>
                    Descartar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
