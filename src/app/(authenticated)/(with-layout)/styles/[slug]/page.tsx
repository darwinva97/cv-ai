import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumePreview } from "@/components/resume-preview";
import {
  getStyle,
  hasUserLikedStyle,
  hasUserSavedStyle,
} from "@/actions/style";
import { getSessionUser } from "@/lib/auth-helpers";
import { getTemplateById, templateCategories } from "@/lib/resume-templates";
import { defaultStyleConfig, type ResumeStyleConfig } from "@/db/schema/style";
import {
  SAMPLE_BASICS,
  SAMPLE_WORK,
  SAMPLE_EDUCATION,
  SAMPLE_SKILLS,
  SAMPLE_LANGUAGES,
} from "@/lib/sample-resume";
import { StyleActions } from "./_components/style-actions";
import { UseTemplateButton } from "./_components/use-template-button";

const categoryLabels: Record<string, string> = Object.fromEntries(
  templateCategories.map((c) => [c.value, c.label])
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Preview({ config }: { config: ResumeStyleConfig }) {
  return (
    <ScrollArea className="h-[70vh] rounded-xl border bg-muted/20">
      <div className="p-6">
        <ResumePreview
          config={config}
          basics={SAMPLE_BASICS}
          work={SAMPLE_WORK}
          education={SAMPLE_EDUCATION}
          skills={SAMPLE_SKILLS}
          languages={SAMPLE_LANGUAGES}
          projects={[]}
        />
      </div>
    </ScrollArea>
  );
}

function Shell({
  title,
  category,
  description,
  official,
  actions,
  children,
}: {
  title: string;
  category?: string;
  description?: string;
  official?: boolean;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
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
            <h1 className="text-2xl font-bold">{title}</h1>
            {official && <Sparkles className="h-4 w-4 text-amber-500" />}
            {category && (
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[category] || category}
              </Badge>
            )}
          </div>
          {description && (
            <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}

export default async function StyleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1) ¿Es una plantilla en código?
  const template = getTemplateById(slug);
  if (template) {
    return (
      <Shell
        title={template.name}
        category={template.category}
        description={template.description}
        official
        actions={
          <>
            <Button asChild>
              <Link href="/resumes/new">
                Usar este estilo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <UseTemplateButton templateId={template.id} />
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Plantilla oficial. Vista previa con datos de ejemplo.
        </p>
        <Preview config={template.config} />
      </Shell>
    );
  }

  // 2) ¿Es un estilo de la BD (comunidad / del usuario)?
  let style = null;
  if (UUID_RE.test(slug)) {
    try {
      style = await getStyle(slug);
    } catch {
      style = null;
    }
  }

  if (!style) {
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

  const user = await getSessionUser();
  const isOwner = user?.id === style.userId;
  const [liked, saved] = user
    ? await Promise.all([
        hasUserLikedStyle(style.id, user.id),
        hasUserSavedStyle(style.id, user.id),
      ])
    : [false, false];

  return (
    <Shell
      title={style.name}
      category={style.category}
      description={style.description || undefined}
      official={style.isOfficial}
      actions={
        <>
          <Button asChild>
            <Link href="/resumes/new">
              Usar este estilo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <StyleActions
            styleId={style.id}
            isOwner={isOwner}
            initialLiked={liked}
            initialSaved={saved}
            initialLikes={style.likesCount}
          />
        </>
      }
    >
      <Preview config={(style.config as ResumeStyleConfig) || defaultStyleConfig} />
    </Shell>
  );
}
