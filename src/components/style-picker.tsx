"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Palette,
  Sparkles,
  Heart,
  Download,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResumeStyleConfig } from "@/db/schema/style";
import { defaultStyleConfig } from "@/db/schema/style";

interface StyleOption {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  isOfficial: boolean;
  likesCount: number;
  usageCount: number;
  config: ResumeStyleConfig;
}

const mockStyles: StyleOption[] = [
  {
    id: "1",
    name: "Clean Modern",
    description: "Diseño limpio y moderno",
    slug: "clean-modern",
    category: "modern",
    isOfficial: true,
    likesCount: 234,
    usageCount: 1520,
    config: defaultStyleConfig,
  },
  {
    id: "2",
    name: "Developer Dark",
    description: "Tema oscuro para devs",
    slug: "developer-dark",
    category: "tech",
    isOfficial: false,
    likesCount: 189,
    usageCount: 890,
    config: {
      ...defaultStyleConfig,
      colors: {
        ...defaultStyleConfig.colors,
        primary: "#22c55e",
        background: "#0f172a",
        text: "#f8fafc",
        textMuted: "#94a3b8",
      },
    },
  },
  {
    id: "3",
    name: "Minimal Pro",
    description: "Minimalismo profesional",
    slug: "minimal-pro",
    category: "minimal",
    isOfficial: true,
    likesCount: 445,
    usageCount: 2100,
    config: {
      ...defaultStyleConfig,
      colors: {
        ...defaultStyleConfig.colors,
        primary: "#18181b",
      },
    },
  },
  {
    id: "4",
    name: "Creative Bold",
    description: "Colores vibrantes",
    slug: "creative-bold",
    category: "creative",
    isOfficial: false,
    likesCount: 98,
    usageCount: 340,
    config: {
      ...defaultStyleConfig,
      colors: {
        ...defaultStyleConfig.colors,
        primary: "#ec4899",
        background: "#fdf4ff",
      },
    },
  },
];

const categories = [
  { value: "all", label: "Todos" },
  { value: "minimal", label: "Minimal" },
  { value: "modern", label: "Moderno" },
  { value: "creative", label: "Creativo" },
  { value: "tech", label: "Tech" },
];

function StylePreviewMini({ config }: { config: ResumeStyleConfig }) {
  return (
    <div
      className="aspect-[3/4] rounded-md border overflow-hidden"
      style={{ backgroundColor: config.colors.background }}
    >
      <div className="h-full p-2 flex flex-col gap-1.5">
        {/* Header */}
        <div className="flex gap-1.5 items-center">
          {config.layout.showPhoto && (
            <div
              className="w-5 h-5 shrink-0"
              style={{
                backgroundColor: config.colors.primary,
                borderRadius:
                  config.layout.photoShape === "circle" ? "50%" : 2,
              }}
            />
          )}
          <div className="flex-1 space-y-0.5">
            <div
              className="h-1.5 rounded w-3/4"
              style={{ backgroundColor: config.colors.primary }}
            />
            <div
              className="h-1 rounded w-1/2"
              style={{ backgroundColor: config.colors.textMuted, opacity: 0.5 }}
            />
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 space-y-1.5 pt-1">
          <div
            className="h-1 rounded w-1/3"
            style={{ backgroundColor: config.colors.primary }}
          />
          <div className="space-y-0.5">
            <div
              className="h-0.5 rounded w-full"
              style={{ backgroundColor: config.colors.border }}
            />
            <div
              className="h-0.5 rounded w-5/6"
              style={{ backgroundColor: config.colors.border }}
            />
          </div>
          <div
            className="h-1 rounded w-1/4 mt-1"
            style={{ backgroundColor: config.colors.primary }}
          />
          <div className="space-y-0.5">
            <div
              className="h-0.5 rounded w-full"
              style={{ backgroundColor: config.colors.border }}
            />
            <div
              className="h-0.5 rounded w-3/4"
              style={{ backgroundColor: config.colors.border }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StylePickerProps {
  currentStyleId?: string;
  onSelectStyle: (styleId: string, config: ResumeStyleConfig) => void;
}

export function StylePicker({ currentStyleId, onSelectStyle }: StylePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const currentStyle = mockStyles.find((s) => s.id === currentStyleId);

  const filteredStyles =
    selectedCategory === "all"
      ? mockStyles
      : mockStyles.filter((s) => s.category === selectedCategory);

  const handleSelect = (style: StyleOption) => {
    onSelectStyle(style.id, style.config);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {currentStyle ? currentStyle.name : "Seleccionar estilo"}
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Estilos de CV
          </SheetTitle>
          <SheetDescription>
            Elige un estilo para tu CV. Puedes personalizarlo después.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Category tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full">
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="flex-1">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Style grid */}
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid grid-cols-2 gap-4 pr-4">
              {filteredStyles.map((style) => (
                <button
                  key={style.id}
                  className={`group text-left rounded-lg border-2 p-3 transition-all hover:border-primary/50 ${
                    currentStyleId === style.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => handleSelect(style)}
                >
                  <StylePreviewMini config={style.config} />
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {style.name}
                      </span>
                      {style.isOfficial && (
                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                      )}
                      {currentStyleId === style.id && (
                        <Check className="h-4 w-4 text-primary shrink-0 ml-auto" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {style.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {style.likesCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {style.usageCount}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Link to full gallery */}
            <div className="mt-6 text-center pb-4">
              <Button variant="outline" asChild>
                <Link href="/styles">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver más estilos
                </Link>
              </Button>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default StylePicker;
