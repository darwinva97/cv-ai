"use client";

import { useState } from "react";
import { Check, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resumeTemplates, templateCategories } from "@/lib/resume-templates";
import type { ResumeStyleConfig } from "@/db/schema/style";
import { cn } from "@/lib/utils";

interface ResumeStyleGalleryProps {
  currentStyleId?: string;
  onSelectStyle: (styleId: string, config: ResumeStyleConfig) => void;
  trigger?: React.ReactNode;
}

// Category labels mapping
const categoryLabels: Record<string, string> = {
  all: "Todos",
  modern: "Moderno",
  minimal: "Minimal",
  creative: "Creativo",
  professional: "Profesional",
  academic: "Académico",
  tech: "Tech",
};

export function ResumeStyleGallery({
  currentStyleId,
  onSelectStyle,
  trigger,
}: ResumeStyleGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredTemplates = resumeTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (template: (typeof resumeTemplates)[0]) => {
    onSelectStyle(template.id, template.config);
    setIsOpen(false);
  };

  // Get preview template (hovered or currently selected)
  const previewTemplate =
    resumeTemplates.find((t) => t.id === hoveredId) ||
    resumeTemplates.find((t) => t.id === currentStyleId) ||
    filteredTemplates[0];

  const defaultTrigger = (
    <Button variant="outline" className="w-full justify-start">
      <span className="truncate">
        {currentStyleId
          ? resumeTemplates.find((t) => t.id === currentStyleId)?.name ||
            "Estilo personalizado"
          : "Seleccionar estilo"}
      </span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="text-lg">Seleccionar estilo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Templates list */}
          <div className="w-[55%] border-r flex flex-col">
            {/* Search & Filters */}
            <div className="p-4 space-y-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar estilos..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                {templateCategories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                      selectedCategory === cat.value
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates grid */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No se encontraron estilos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates.map((template) => {
                      const isSelected = currentStyleId === template.id;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleSelect(template)}
                          onMouseEnter={() => setHoveredId(template.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={cn(
                            "group relative text-left rounded-lg border-2 p-3 transition-all",
                            isSelected
                              ? "border-foreground bg-muted/50"
                              : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/20"
                          )}
                        >
                          {/* Mini Preview */}
                          <div
                            className="aspect-[4/5] rounded-md overflow-hidden mb-3 shadow-sm"
                            style={{
                              backgroundColor: template.previewColors.background,
                            }}
                          >
                            <div className="h-full p-2.5 flex flex-col">
                              {/* Header simulation */}
                              <div className="text-center mb-2 pb-2 border-b border-current/10">
                                <div
                                  className="h-2 rounded-sm w-3/4 mx-auto mb-1"
                                  style={{
                                    backgroundColor: template.previewColors.primary,
                                  }}
                                />
                                <div
                                  className="h-1 rounded-sm w-1/2 mx-auto opacity-50"
                                  style={{
                                    backgroundColor: template.previewColors.primary,
                                  }}
                                />
                              </div>

                              {/* Content simulation */}
                              <div className="flex-1 space-y-2">
                                {/* Section 1 */}
                                <div>
                                  <div
                                    className="h-1 rounded-sm w-2/5 mb-1"
                                    style={{
                                      backgroundColor: template.previewColors.primary,
                                    }}
                                  />
                                  <div className="space-y-0.5">
                                    <div
                                      className="h-0.5 rounded-full w-full opacity-30"
                                      style={{
                                        backgroundColor: template.previewColors.primary,
                                      }}
                                    />
                                    <div
                                      className="h-0.5 rounded-full w-4/5 opacity-30"
                                      style={{
                                        backgroundColor: template.previewColors.primary,
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Section 2 */}
                                <div>
                                  <div
                                    className="h-1 rounded-sm w-1/3 mb-1"
                                    style={{
                                      backgroundColor: template.previewColors.primary,
                                    }}
                                  />
                                  <div className="space-y-0.5">
                                    <div
                                      className="h-0.5 rounded-full w-full opacity-30"
                                      style={{
                                        backgroundColor: template.previewColors.primary,
                                      }}
                                    />
                                    <div
                                      className="h-0.5 rounded-full w-3/4 opacity-30"
                                      style={{
                                        backgroundColor: template.previewColors.primary,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-sm truncate">
                                  {template.name}
                                </span>
                                {template.isOfficial && (
                                  <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {categoryLabels[template.category] || template.category}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                                <Check className="h-3 w-3 text-background" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer count */}
            <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
              {filteredTemplates.length} estilo{filteredTemplates.length !== 1 ? "s" : ""} disponible{filteredTemplates.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="w-[45%] bg-muted/20 flex flex-col">
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm">{previewTemplate?.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {previewTemplate?.description}
                  </p>
                </div>
                {previewTemplate && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {categoryLabels[previewTemplate.category] || previewTemplate.category}
                  </Badge>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {previewTemplate && (
                  <div
                    className="rounded-lg shadow-lg overflow-hidden"
                    style={{
                      backgroundColor: previewTemplate.previewColors.background,
                    }}
                  >
                    {/* Large CV Preview */}
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="text-center pb-4 border-b-2" style={{ borderColor: previewTemplate.previewColors.primary }}>
                        <div
                          className="h-5 rounded w-2/3 mx-auto mb-2"
                          style={{ backgroundColor: previewTemplate.previewColors.primary }}
                        />
                        <div
                          className="h-3 rounded w-2/5 mx-auto opacity-60"
                          style={{ backgroundColor: previewTemplate.previewColors.primary }}
                        />
                        <div className="flex justify-center gap-4 mt-3">
                          <div
                            className="h-2 rounded w-20 opacity-40"
                            style={{ backgroundColor: previewTemplate.previewColors.primary }}
                          />
                          <div
                            className="h-2 rounded w-16 opacity-40"
                            style={{ backgroundColor: previewTemplate.previewColors.primary }}
                          />
                          <div
                            className="h-2 rounded w-24 opacity-40"
                            style={{ backgroundColor: previewTemplate.previewColors.primary }}
                          />
                        </div>
                      </div>

                      {/* Profile section */}
                      <div>
                        <div
                          className="h-3 rounded w-1/4 mb-2"
                          style={{ backgroundColor: previewTemplate.previewColors.primary }}
                        />
                        <div className="space-y-1.5">
                          <div
                            className="h-2 rounded w-full opacity-30"
                            style={{ backgroundColor: previewTemplate.previewColors.primary }}
                          />
                          <div
                            className="h-2 rounded w-11/12 opacity-30"
                            style={{ backgroundColor: previewTemplate.previewColors.primary }}
                          />
                          <div
                            className="h-2 rounded w-4/5 opacity-30"
                            style={{ backgroundColor: previewTemplate.previewColors.primary }}
                          />
                        </div>
                      </div>

                      {/* Experience section */}
                      <div>
                        <div
                          className="h-3 rounded w-1/3 mb-2"
                          style={{ backgroundColor: previewTemplate.previewColors.primary }}
                        />
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <div
                                className="h-2.5 rounded w-1/3"
                                style={{ backgroundColor: previewTemplate.previewColors.primary }}
                              />
                              <div
                                className="h-2 rounded w-20 opacity-40"
                                style={{ backgroundColor: previewTemplate.previewColors.primary }}
                              />
                            </div>
                            <div
                              className="h-2 rounded w-1/4 mb-1.5"
                              style={{ backgroundColor: previewTemplate.previewColors.primary, opacity: 0.6 }}
                            />
                            <div className="space-y-1">
                              <div
                                className="h-1.5 rounded w-full opacity-25"
                                style={{ backgroundColor: previewTemplate.previewColors.primary }}
                              />
                              <div
                                className="h-1.5 rounded w-5/6 opacity-25"
                                style={{ backgroundColor: previewTemplate.previewColors.primary }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <div
                                className="h-2.5 rounded w-2/5"
                                style={{ backgroundColor: previewTemplate.previewColors.primary }}
                              />
                              <div
                                className="h-2 rounded w-24 opacity-40"
                                style={{ backgroundColor: previewTemplate.previewColors.primary }}
                              />
                            </div>
                            <div
                              className="h-2 rounded w-1/3 mb-1.5"
                              style={{ backgroundColor: previewTemplate.previewColors.primary, opacity: 0.6 }}
                            />
                            <div className="space-y-1">
                              <div
                                className="h-1.5 rounded w-full opacity-25"
                                style={{ backgroundColor: previewTemplate.previewColors.primary }}
                              />
                              <div
                                className="h-1.5 rounded w-3/4 opacity-25"
                                style={{ backgroundColor: previewTemplate.previewColors.primary }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Skills section */}
                      <div>
                        <div
                          className="h-3 rounded w-1/4 mb-2"
                          style={{ backgroundColor: previewTemplate.previewColors.primary }}
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="h-5 rounded px-2"
                              style={{
                                backgroundColor: previewTemplate.previewColors.primary,
                                width: `${Math.random() * 30 + 40}px`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Select button */}
            <div className="p-4 border-t bg-background/50">
              <Button
                className="w-full"
                onClick={() => previewTemplate && handleSelect(previewTemplate)}
              >
                <Check className="h-4 w-4 mr-2" />
                Usar este estilo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResumeStyleGallery;
