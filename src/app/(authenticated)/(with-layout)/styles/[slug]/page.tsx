"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumePreview } from "@/components/resume-preview";
import { getTemplateById, templateCategories } from "@/lib/resume-templates";
import {
  SAMPLE_BASICS,
  SAMPLE_WORK,
  SAMPLE_EDUCATION,
  SAMPLE_SKILLS,
  SAMPLE_LANGUAGES,
} from "@/lib/sample-resume";

const categoryLabels: Record<string, string> = Object.fromEntries(
  templateCategories.map((c) => [c.value, c.label])
);

export default function StyleDetailPage() {
  const params = useParams();
  const id = params.slug as string;
  const template = getTemplateById(id);

  if (!template) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Estilo no encontrado.</p>
        <Button variant="outline" asChild>
          <Link href="/styles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a estilos
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2 mb-1" asChild>
            <Link href="/styles">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Estilos
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{template.name}</h1>
            {template.isOfficial && <Sparkles className="h-4 w-4 text-amber-500" />}
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[template.category] || template.category}
            </Badge>
          </div>
          <p className="max-w-prose text-sm text-muted-foreground">
            {template.description}
          </p>
        </div>
        <Button asChild>
          <Link href="/resumes/new">
            Usar este estilo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Vista previa con datos de ejemplo. Al crear o editar un CV puedes elegir
        este diseño y personalizarlo.
      </p>

      <ScrollArea className="h-[70vh] rounded-xl border bg-muted/20">
        <div className="p-6">
          <ResumePreview
            config={template.config}
            basics={SAMPLE_BASICS}
            work={SAMPLE_WORK}
            education={SAMPLE_EDUCATION}
            skills={SAMPLE_SKILLS}
            languages={SAMPLE_LANGUAGES}
            projects={[]}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
