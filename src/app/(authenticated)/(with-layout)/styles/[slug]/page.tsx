"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Download,
  GitFork,
  Bookmark,
  Share2,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Loader2,
  Check,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ResumeStyleConfig } from "@/db/schema/style";
import { defaultStyleConfig } from "@/db/schema/style";

// Datos de ejemplo
const mockStyle = {
  id: "1",
  name: "Clean Modern",
  description:
    "Un diseño limpio y moderno con colores sutiles, perfecto para profesionales de tecnología y diseño. Este estilo prioriza la legibilidad y la jerarquía visual clara.",
  slug: "clean-modern",
  category: "modern",
  isPublic: true,
  isOfficial: true,
  isFeatured: true,
  tags: ["profesional", "tech", "minimalista", "moderno"],
  likesCount: 234,
  usageCount: 1520,
  forksCount: 45,
  thumbnailUrl: null,
  forkedFrom: null,
  author: {
    id: "1",
    name: "CV AI",
    image: null,
  },
  config: defaultStyleConfig,
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-06-20"),
};

const mockUserResumes = [
  { id: "1", name: "Mi CV Principal", hasStyle: true },
  { id: "2", name: "CV para Tech", hasStyle: false },
  { id: "3", name: "CV Freelance", hasStyle: true },
];

function StylePreview({ config }: { config: ResumeStyleConfig }) {
  return (
    <div
      className="aspect-[3/4] rounded-lg border overflow-hidden shadow-lg"
      style={{ backgroundColor: config.colors.background }}
    >
      <div
        className="h-full p-6 flex flex-col gap-4"
        style={{
          fontFamily: config.typography.bodyFont,
          color: config.colors.text,
        }}
      >
        {/* Header */}
        <div className="flex gap-4 items-center">
          {config.layout.showPhoto && (
            <div
              className="shrink-0"
              style={{
                width: config.layout.photoSize * 0.6,
                height: config.layout.photoSize * 0.6,
                backgroundColor: config.colors.primary,
                borderRadius:
                  config.layout.photoShape === "circle"
                    ? "50%"
                    : config.layout.photoShape === "rounded"
                    ? config.extras.borderRadius
                    : 0,
              }}
            />
          )}
          <div className="flex-1 space-y-2">
            <div
              className="h-4 rounded w-3/4"
              style={{ backgroundColor: config.colors.primary }}
            />
            <div
              className="h-2.5 rounded w-1/2"
              style={{ backgroundColor: config.colors.textMuted, opacity: 0.5 }}
            />
            <div
              className="h-2 rounded w-2/3"
              style={{ backgroundColor: config.colors.border }}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <div
            className="h-1.5 rounded w-full"
            style={{ backgroundColor: config.colors.border }}
          />
          <div
            className="h-1.5 rounded w-5/6"
            style={{ backgroundColor: config.colors.border }}
          />
          <div
            className="h-1.5 rounded w-4/6"
            style={{ backgroundColor: config.colors.border }}
          />
        </div>

        {/* Sections */}
        {config.sections.visible.slice(0, 4).map((section, i) => (
          <div key={section} className="space-y-2">
            {config.sections.dividers && (
              <div
                className="h-px w-full"
                style={{ backgroundColor: config.colors.border }}
              />
            )}
            <div
              className="h-2.5 rounded w-1/3"
              style={{ backgroundColor: config.colors.primary }}
            />
            <div className="space-y-1">
              <div className="flex justify-between">
                <div
                  className="h-2 rounded w-1/2"
                  style={{ backgroundColor: config.colors.text, opacity: 0.6 }}
                />
                <div
                  className="h-2 rounded w-1/4"
                  style={{ backgroundColor: config.colors.textMuted }}
                />
              </div>
              <div
                className="h-1.5 rounded w-full"
                style={{ backgroundColor: config.colors.border }}
              />
              <div
                className="h-1.5 rounded w-4/5"
                style={{ backgroundColor: config.colors.border }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorSwatch({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-md border shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground font-mono">{color}</p>
      </div>
    </div>
  );
}

export default function StyleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  void params;
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string>("");

  const style = mockStyle;

  if (!style) {
    return notFound();
  }

  const handleLike = async () => {
    setIsLiked(!isLiked);
    // TODO: API call
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
    // TODO: API call
  };

  const handleApply = async () => {
    if (!selectedResume) return;
    setIsApplying(true);
    try {
      // TODO: API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowApplyDialog(false);
    } finally {
      setIsApplying(false);
    }
  };

  const handleFork = async () => {
    // TODO: Navigate to new style page with forked data
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    // TODO: Toast
  };

  const isOwner = false; // TODO: Check if current user is the owner

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/styles">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{style.name}</h1>
              {style.isOfficial && (
                <Badge variant="secondary">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Oficial
                </Badge>
              )}
              {style.isFeatured && (
                <Badge variant="outline">Destacado</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{style.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/styles/${style.slug}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </DropdownMenuItem>
              {!isOwner && (
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Reportar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista previa
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-md">
                <StylePreview config={style.config} />
              </div>
            </CardContent>
          </Card>

          {/* Details tabs */}
          <Tabs defaultValue="colors">
            <TabsList>
              <TabsTrigger value="colors">Colores</TabsTrigger>
              <TabsTrigger value="typography">Tipografía</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="sections">Secciones</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Paleta de colores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ColorSwatch
                      color={style.config.colors.primary}
                      label="Primario"
                    />
                    <ColorSwatch
                      color={style.config.colors.secondary}
                      label="Secundario"
                    />
                    <ColorSwatch
                      color={style.config.colors.accent}
                      label="Acento"
                    />
                    <ColorSwatch
                      color={style.config.colors.background}
                      label="Fondo"
                    />
                    <ColorSwatch
                      color={style.config.colors.backgroundAlt}
                      label="Fondo alt"
                    />
                    <ColorSwatch
                      color={style.config.colors.text}
                      label="Texto"
                    />
                    <ColorSwatch
                      color={style.config.colors.textMuted}
                      label="Texto muted"
                    />
                    <ColorSwatch
                      color={style.config.colors.border}
                      label="Bordes"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tipografía</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fuente títulos
                      </p>
                      <p className="font-medium">
                        {style.config.typography.headingFont.split(",")[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Fuente cuerpo
                      </p>
                      <p className="font-medium">
                        {style.config.typography.bodyFont.split(",")[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tamaño base
                      </p>
                      <p className="font-medium">
                        {style.config.typography.baseFontSize}px
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Altura de línea
                      </p>
                      <p className="font-medium">
                        {style.config.typography.lineHeight}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de layout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium capitalize">
                        {style.config.layout.type.replace("-", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Ancho máximo
                      </p>
                      <p className="font-medium">
                        {style.config.layout.maxWidth}px
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Mostrar foto
                      </p>
                      <p className="font-medium">
                        {style.config.layout.showPhoto ? "Sí" : "No"}
                      </p>
                    </div>
                    {style.config.layout.showPhoto && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Tamaño foto
                          </p>
                          <p className="font-medium">
                            {style.config.layout.photoSize}px
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Forma foto
                          </p>
                          <p className="font-medium capitalize">
                            {style.config.layout.photoShape}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Secciones configuradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {style.config.sections.visible.map((section) => (
                      <Badge key={section} variant="secondary">
                        {section}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Iconos</p>
                      <p className="font-medium">
                        {style.config.sections.icons ? "Sí" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Divisores
                      </p>
                      <p className="font-medium">
                        {style.config.sections.dividers ? "Sí" : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Estilo títulos
                      </p>
                      <p className="font-medium capitalize">
                        {style.config.sections.sectionStyle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowApplyDialog(true)}
              >
                <Check className="mr-2 h-5 w-5" />
                Usar este estilo
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  onClick={handleLike}
                >
                  <Heart
                    className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  {style.likesCount + (isLiked ? 1 : 0)}
                </Button>
                <Button
                  variant={isSaved ? "default" : "outline"}
                  onClick={handleSave}
                >
                  <Bookmark
                    className={`mr-1 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
                  />
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleFork}>
                  <GitFork className="mr-1 h-4 w-4" />
                  Fork
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Usos
                </span>
                <span className="font-medium">{style.usageCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Likes
                </span>
                <span className="font-medium">{style.likesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <GitFork className="h-4 w-4" />
                  Forks
                </span>
                <span className="font-medium">{style.forksCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Author */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Autor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={style.author.image || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{style.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Creado el{" "}
                    {style.createdAt.toLocaleDateString("es", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {style.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aplicar estilo a un CV</DialogTitle>
            <DialogDescription>
              Selecciona el CV al que quieres aplicar este estilo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Seleccionar CV</Label>
              <Select value={selectedResume} onValueChange={setSelectedResume}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un CV" />
                </SelectTrigger>
                <SelectContent>
                  {mockUserResumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {resume.name}
                      {resume.hasStyle && " (tiene estilo)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApply} disabled={!selectedResume || isApplying}>
              {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aplicar estilo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
