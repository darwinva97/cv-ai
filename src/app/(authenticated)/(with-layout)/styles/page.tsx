"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { resumeTemplates, templateCategories } from "@/lib/resume-templates";

const categoryLabels: Record<string, string> = Object.fromEntries(
  templateCategories.map((c) => [c.value, c.label])
);

export default function StylesPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resumeTemplates.filter((t) => {
      const matchCat = category === "all" || t.category === category;
      const matchQ =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [category, query]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Estilos</h1>
          <p className="text-muted-foreground">
            Explora los diseños disponibles. Elige cualquiera al editar tu CV.
          </p>
        </div>
        <Button asChild>
          <Link href="/resumes/new">
            Crear CV
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Buscador + categorías */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar estilos…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {templateCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                category === cat.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No se encontraron estilos.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const c = t.config.colors;
            return (
              <Link
                key={t.id}
                href={`/styles/${t.id}`}
                className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                {/* Mini preview */}
                <div
                  className="mb-4 aspect-[4/5] overflow-hidden rounded-lg border"
                  style={{ backgroundColor: c.background }}
                >
                  <div className="flex h-full flex-col p-3">
                    <div
                      className="mb-2 border-b pb-2 text-center"
                      style={{ borderColor: c.primary }}
                    >
                      <div
                        className="mx-auto mb-1 h-2.5 w-2/3 rounded"
                        style={{ backgroundColor: c.primary }}
                      />
                      <div
                        className="mx-auto h-1.5 w-2/5 rounded opacity-50"
                        style={{ backgroundColor: c.textMuted }}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i}>
                          <div
                            className="mb-1 h-1.5 w-1/3 rounded"
                            style={{ backgroundColor: c.primary }}
                          />
                          <div className="space-y-1">
                            <div
                              className="h-1 w-full rounded opacity-25"
                              style={{ backgroundColor: c.text }}
                            />
                            <div
                              className="h-1 w-4/5 rounded opacity-25"
                              style={{ backgroundColor: c.text }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-medium">{t.name}</h3>
                      {t.isOfficial && (
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {categoryLabels[t.category] || t.category}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
