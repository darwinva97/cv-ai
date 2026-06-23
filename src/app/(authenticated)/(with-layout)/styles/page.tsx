"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, ArrowRight, Heart, Bookmark, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { resumeTemplates, templateCategories } from "@/lib/resume-templates";
import type { ResumeStyleConfig } from "@/db/schema/style";
import { getStylesGalleryData, toggleLikeStyle, toggleSaveStyle } from "@/actions/style";

const categoryLabels: Record<string, string> = Object.fromEntries(
  templateCategories.map((c) => [c.value, c.label])
);

// Mini-preview de un diseño a partir de sus colores.
function MiniPreview({ colors }: { colors: ResumeStyleConfig["colors"] }) {
  return (
    <div className="mb-4 aspect-[4/5] overflow-hidden rounded-lg border" style={{ backgroundColor: colors.background }}>
      <div className="flex h-full flex-col p-3">
        <div className="mb-2 border-b pb-2 text-center" style={{ borderColor: colors.primary }}>
          <div className="mx-auto mb-1 h-2.5 w-2/3 rounded" style={{ backgroundColor: colors.primary }} />
          <div className="mx-auto h-1.5 w-2/5 rounded opacity-50" style={{ backgroundColor: colors.textMuted }} />
        </div>
        <div className="flex-1 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="mb-1 h-1.5 w-1/3 rounded" style={{ backgroundColor: colors.primary }} />
              <div className="space-y-1">
                <div className="h-1 w-full rounded opacity-25" style={{ backgroundColor: colors.text }} />
                <div className="h-1 w-4/5 rounded opacity-25" style={{ backgroundColor: colors.text }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type DbStyle = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isOfficial: boolean;
  likesCount: number;
  config: ResumeStyleConfig;
};

export default function StylesPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<DbStyle[]>([]);
  const [mine, setMine] = useState<DbStyle[]>([]);
  const [saved, setSaved] = useState<DbStyle[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getStylesGalleryData()
      .then((d) => {
        setCommunity(d.community as DbStyle[]);
        setMine(d.mine as DbStyle[]);
        setSaved(d.saved as DbStyle[]);
        setLikedIds(new Set(d.likedIds));
        setSavedIds(new Set(d.savedIds));
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resumeTemplates.filter((t) => {
      const matchCat = category === "all" || t.category === category;
      const matchQ = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [category, query]);

  const onLike = async (id: string) => {
    const res = await toggleLikeStyle(id);
    if (!res.ok) return toast.error(res.error || "Error");
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (res.liked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const onSave = async (id: string) => {
    const res = await toggleSaveStyle(id);
    if (!res.ok) return toast.error(res.error || "Error");
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (res.saved) next.add(id);
      else next.delete(id);
      return next;
    });
    toast.success(res.saved ? "Guardado" : "Quitado de guardados");
  };

  const DbGrid = ({ items, empty }: { items: DbStyle[]; empty: string }) => {
    if (loading) {
      return (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      );
    }
    if (items.length === 0) {
      return <p className="py-12 text-center text-sm text-muted-foreground">{empty}</p>;
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-4">
            <Link href={`/styles/${s.id}`}>
              <MiniPreview colors={s.config.colors} />
            </Link>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/styles/${s.id}`} className="flex items-center gap-1.5 hover:underline">
                  <h3 className="truncate font-medium">{s.name}</h3>
                  {s.isOfficial && <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{s.description || "Sin descripción"}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {categoryLabels[s.category] || s.category}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant={likedIds.has(s.id) ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onLike(s.id)}
              >
                <Heart className={cn("mr-1 h-3.5 w-3.5", likedIds.has(s.id) && "fill-current")} />
                {s.likesCount + (likedIds.has(s.id) ? 1 : 0)}
              </Button>
              <Button
                variant={savedIds.has(s.id) ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onSave(s.id)}
              >
                <Bookmark className={cn("mr-1 h-3.5 w-3.5", savedIds.has(s.id) && "fill-current")} />
                {savedIds.has(s.id) ? "Guardado" : "Guardar"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Estilos</h1>
          <p className="text-muted-foreground">
            Explora plantillas y diseños de la comunidad. Elige cualquiera al editar tu CV.
          </p>
        </div>
        <Button asChild>
          <Link href="/styles/new">
            <Plus className="mr-2 h-4 w-4" />
            Crear estilo
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="community">Comunidad</TabsTrigger>
          <TabsTrigger value="mine">Mis estilos</TabsTrigger>
          <TabsTrigger value="saved">Guardados</TabsTrigger>
        </TabsList>

        {/* Plantillas oficiales (en código) */}
        <TabsContent value="templates" className="space-y-4 pt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar plantillas…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {templateCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  category === cat.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {filteredTemplates.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No se encontraron plantillas.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((t) => (
                <Link key={t.id} href={`/styles/${t.id}`} className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
                  <MiniPreview colors={t.config.colors} />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-medium">{t.name}</h3>
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{t.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {categoryLabels[t.category] || t.category}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Ver diseño <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="community" className="pt-4">
          <DbGrid items={community} empty="Aún no hay estilos públicos de la comunidad." />
        </TabsContent>
        <TabsContent value="mine" className="pt-4">
          <DbGrid items={mine} empty="No has creado estilos todavía. Crea uno o usa una plantilla como base." />
        </TabsContent>
        <TabsContent value="saved" className="pt-4">
          <DbGrid items={saved} empty="No has guardado estilos todavía." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
