"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, FileText, X, Loader2, Sparkles, Wand2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResumeSheet } from "@/components/resume-sheet";
import { generateFreeResume, type FreeResumeData } from "@/actions/public-generate";
import { STYLE_PRESETS, getPreset } from "@/lib/style-presets";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = "image/png,image/jpeg,image/webp,image/gif,application/pdf";

type Selected = { name: string; mediaType: string; base64: string };

function creativityLabel(n: number): string {
  if (n <= 3) return "Conservador · no inventa nada";
  if (n <= 7) return "Equilibrado · refuerza sin inventar datos clave";
  return "Creativo · puede embellecer y extrapolar";
}

export function FreeGenerator() {
  const [file, setFile] = useState<Selected | null>(null);
  const [prompt, setPrompt] = useState("");
  const [jobOfferUrl, setJobOfferUrl] = useState("");
  const [creativity, setCreativity] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<FreeResumeData | null>(null);
  const [styleId, setStyleId] = useState<string>(STYLE_PRESETS[0].id);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
      setError("Formato no soportado. Usa una imagen (PNG/JPG/WEBP) o un PDF.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("El archivo es demasiado grande (máx 10MB).");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      setFile({ name: f.name, mediaType: f.type, base64 });
    };
    reader.readAsDataURL(f);
  };

  const runGenerate = async () => {
    if (!file) {
      setError("Sube tu CV actual (PDF o imagen).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await generateFreeResume({
        base64: file.base64,
        mediaType: file.mediaType,
        prompt: prompt.trim() || undefined,
        jobOfferUrl: jobOfferUrl.trim() || undefined,
        creativity,
      });
      if (!res.ok) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      setResult(res.data);
      setStyleId(res.styleId);
      toast.success("¡Listo! Cambia el diseño o regístrate para guardar.");
    } catch {
      setError("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Resultado ----
  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-3 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Diseño</Label>
            <Select value={styleId} onValueChange={setStyleId}>
              <SelectTrigger className="h-8 w-[200px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver a ajustar
            </Button>
            <Button size="sm" asChild>
              <Link href="/login">Regístrate para guardar y descargar</Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {getPreset(styleId).description}
        </p>

        <ResumeSheet
          config={getPreset(styleId).config}
          basics={result.basics}
          work={result.work}
          education={result.education}
          skills={result.skills}
          projects={[]}
          languages={[]}
        />

        <p className="pb-8 text-center text-sm text-muted-foreground">
          ¿Te gusta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Crea una cuenta gratis
          </Link>{" "}
          para guardarlo, exportarlo a PDF y crear más versiones.
        </p>
      </div>
    );
  }

  // ---- Formulario ----
  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-xl border bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
      <div className="space-y-2">
        <Label className="text-sm">Tu CV actual (PDF o imagen)</Label>
        <input
          id="free-file"
          type="file"
          accept={ACCEPTED}
          onChange={handleFile}
          className="hidden"
        />
        {!file ? (
          <label
            htmlFor="free-file"
            className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-muted/50"
          >
            <Upload className="mb-2 h-7 w-7 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Haz clic para subir tu CV
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WEBP o PDF · hasta 10MB
            </span>
          </label>
        ) : (
          <div className="relative flex items-center gap-3 rounded-lg border p-3">
            <FileText className="h-7 w-7 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              onClick={() => setFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Instrucciones (opcional)</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: enfatiza liderazgo y experiencia en React"
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">URL de la oferta de trabajo (opcional)</Label>
        <Input
          type="url"
          value={jobOfferUrl}
          onChange={(e) => setJobOfferUrl(e.target.value)}
          placeholder="https://… (adaptaremos tu CV a esa oferta)"
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Nivel de optimización</Label>
          <span className="text-xs font-medium text-primary">{creativity}/10</span>
        </div>
        <Slider
          value={[creativity]}
          onValueChange={([v]) => setCreativity(v)}
          min={1}
          max={10}
          step={1}
        />
        <p className="text-xs text-muted-foreground">{creativityLabel(creativity)}</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={runGenerate} disabled={loading || !file} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generando…
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-4 w-4" />
            Generar mi CV gratis
          </>
        )}
      </Button>

      <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        Gratis y sin registro. Para guardar y exportar, crea una cuenta.
      </p>
    </div>
  );
}
