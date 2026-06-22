import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";

import { getPublicResume } from "@/actions/resume";
import { getVersionStyle } from "@/actions/style";
import { getSessionUser } from "@/lib/auth-helpers";
import { defaultStyleConfig } from "@/db/schema/style";
import type { ResumeStyleConfig } from "@/db/schema/style";
import type { Basics, Work, Education, Skill, Project, Language } from "@/types/resume";
import { ResumePreview } from "@/components/resume-preview";
import { ResultActions } from "./_components/result-actions";

export default async function ResumeResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id_or_slug: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id_or_slug } = await params;
  const { print } = await searchParams;

  const result = await getPublicResume(id_or_slug);
  if (!result) notFound();

  const { resume, version, data } = result;

  // Gating de visibilidad: público si la versión es isResultPublic; el dueño
  // siempre puede verlo (para previsualizar / exportar antes de publicar).
  const sessionUser = await getSessionUser();
  const isOwner = sessionUser?.id === resume.userId;
  const isPublic = version?.isResultPublic ?? false;

  if (!isPublic && !isOwner) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h1 className="text-lg font-semibold mb-1">Este CV es privado</h1>
          <p className="text-sm text-muted-foreground">
            Su autor aún no lo ha hecho público.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-primary hover:underline">
            Volver a CV AI
          </Link>
        </div>
      </div>
    );
  }

  // Resolver el estilo de la versión (config base + overrides) con fallback.
  let styleConfig: ResumeStyleConfig = defaultStyleConfig;
  if (version) {
    const versionStyle = await getVersionStyle(version.id);
    if (versionStyle?.style?.config) {
      styleConfig = { ...versionStyle.style.config, ...(versionStyle.overrides ?? {}) };
    }
  }

  // Mapear las filas de BD a los tipos que consume ResumePreview.
  const b = data?.basics;
  const basics: Basics = {
    name: b?.name || resume.title || "",
    label: b?.label || "",
    email: b?.email || "",
    phone: b?.phone || "",
    url: b?.url || "",
    summary: b?.summary || "",
    location: b?.location || { city: "", countryCode: "", region: "" },
  };

  const work: Work[] = (data?.work || []).map((w) => ({
    id: w.id,
    name: w.name || "",
    position: w.position || "",
    url: w.url || undefined,
    startDate: w.startDate || "",
    endDate: w.endDate || "",
    summary: w.summary || "",
    highlights: w.highlights || [],
  }));

  const education: Education[] = (data?.education || []).map((e) => ({
    id: e.id,
    institution: e.institution || "",
    url: e.url || undefined,
    area: e.area || "",
    studyType: e.studyType || "",
    startDate: e.startDate || "",
    endDate: e.endDate || "",
    score: e.score || undefined,
    courses: e.courses || [],
  }));

  const skills: Skill[] = (data?.skills || []).map((s) => ({
    id: s.id,
    name: s.name || "",
    level: s.level || "",
    keywords: s.keywords || [],
  }));

  const languages: Language[] = (data?.languages || []).map((l) => ({
    id: l.id,
    language: l.language || "",
    fluency: l.fluency || "",
  }));

  const projects: Project[] = (data?.projects || []).map((p) => ({
    id: p.id,
    name: p.name || "",
    startDate: p.startDate || undefined,
    endDate: p.endDate || undefined,
    description: p.description || "",
    highlights: p.highlights || [],
    url: p.url || undefined,
    keywords: p.keywords || [],
  }));

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Reglas de impresión: al imprimir/guardar como PDF solo queda el CV. */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #ffffff !important; }
          .print-area { padding: 0 !important; max-width: none !important; }
        }
      `}</style>

      {/* Barra de acciones (no se imprime) */}
      <div className="no-print sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-zinc-950/80 dark:border-zinc-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="font-semibold truncate">{basics.name || "CV"}</h1>
          <div className="flex items-center gap-2">
            {isOwner && !isPublic && (
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Vista privada (solo tú) · actívalo en Ajustes
              </span>
            )}
            <ResultActions autoPrint={print === "1"} />
          </div>
        </div>
      </div>

      {/* CV */}
      <div className="print-area container mx-auto max-w-4xl px-4 py-8">
        <ResumePreview
          config={styleConfig}
          basics={basics}
          work={work}
          education={education}
          skills={skills}
          projects={projects}
          languages={languages}
        />

        <p className="no-print mt-6 text-center text-sm text-muted-foreground">
          CV generado con{" "}
          <Link href="/" className="text-primary hover:underline">
            CV AI
          </Link>
        </p>
      </div>
    </div>
  );
}
