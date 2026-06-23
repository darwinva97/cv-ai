"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Eye,
  Loader2,
  Palette,
  Save,
  Type,
  Layout,
  Sparkles,
  Settings2,
  Columns,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ResumeStyleConfig,
  StyleColors,
  StyleTypography,
  StyleSpacing,
  StyleLayout,
  StyleSections,
  StyleExtras,
} from "@/db/schema/style";
import { defaultStyleConfig } from "@/db/schema/style";
import { toast } from "sonner";
import { createMyStyle } from "@/actions/style";

// Presets de colores
const colorPresets = [
  { name: "Azul Profesional", primary: "#2563eb", background: "#ffffff" },
  { name: "Verde Moderno", primary: "#16a34a", background: "#f0fdf4" },
  { name: "Morado Creativo", primary: "#7c3aed", background: "#faf5ff" },
  { name: "Naranja Energético", primary: "#ea580c", background: "#fff7ed" },
  { name: "Rosa Bold", primary: "#db2777", background: "#fdf2f8" },
  { name: "Oscuro Tech", primary: "#22c55e", background: "#0f172a" },
  { name: "Minimal Negro", primary: "#18181b", background: "#ffffff" },
  { name: "Clásico Sepia", primary: "#78716c", background: "#fafaf9" },
];

const fontOptions = [
  { value: "Inter, system-ui, sans-serif", label: "Inter" },
  { value: "system-ui, sans-serif", label: "System UI" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
];

const categories = [
  { value: "minimal", label: "Minimal" },
  { value: "modern", label: "Moderno" },
  { value: "classic", label: "Clásico" },
  { value: "creative", label: "Creativo" },
  { value: "professional", label: "Profesional" },
  { value: "tech", label: "Tech" },
  { value: "academic", label: "Académico" },
  { value: "other", label: "Otro" },
];

const allSections = [
  { id: "basics", label: "Información básica" },
  { id: "summary", label: "Resumen" },
  { id: "work", label: "Experiencia" },
  { id: "education", label: "Educación" },
  { id: "skills", label: "Habilidades" },
  { id: "projects", label: "Proyectos" },
  { id: "certificates", label: "Certificados" },
  { id: "languages", label: "Idiomas" },
  { id: "awards", label: "Premios" },
  { id: "publications", label: "Publicaciones" },
  { id: "volunteer", label: "Voluntariado" },
  { id: "interests", label: "Intereses" },
  { id: "references", label: "Referencias" },
];

export default function NewStylePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Metadata
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("modern");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Style config
  const [config, setConfig] = useState<ResumeStyleConfig>(defaultStyleConfig);

  const updateColors = (updates: Partial<StyleColors>) => {
    setConfig((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...updates },
    }));
  };

  const updateTypography = (updates: Partial<StyleTypography>) => {
    setConfig((prev) => ({
      ...prev,
      typography: { ...prev.typography, ...updates },
    }));
  };

  const updateSpacing = (updates: Partial<StyleSpacing>) => {
    setConfig((prev) => ({
      ...prev,
      spacing: { ...prev.spacing, ...updates },
    }));
  };

  const updateLayout = (updates: Partial<StyleLayout>) => {
    setConfig((prev) => ({
      ...prev,
      layout: { ...prev.layout, ...updates },
    }));
  };

  const updateSections = (updates: Partial<StyleSections>) => {
    setConfig((prev) => ({
      ...prev,
      sections: { ...prev.sections, ...updates },
    }));
  };

  const updateExtras = (updates: Partial<StyleExtras>) => {
    setConfig((prev) => ({
      ...prev,
      extras: { ...prev.extras, ...updates },
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const res = await createMyStyle({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category as
          | "minimal" | "modern" | "classic" | "creative" | "professional" | "tech" | "academic" | "other",
        isPublic,
        tags,
        config,
      });
      if (!res.ok || !res.id) {
        toast.error(res.error || "No se pudo guardar el estilo");
        return;
      }
      toast.success("Estilo guardado");
      router.push(`/styles/${res.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    updateColors({
      primary: preset.primary,
      background: preset.background,
      text: preset.background === "#0f172a" ? "#f8fafc" : "#0f172a",
      textMuted: preset.background === "#0f172a" ? "#94a3b8" : "#64748b",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/styles">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Crear nuevo estilo</h1>
            <p className="text-muted-foreground">
              Diseña tu propio estilo de CV
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/styles">Cancelar</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Editor */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Información del estilo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mi estilo personalizado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu estilo..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="Añadir tag..."
                  />
                  <Button variant="outline" onClick={handleAddTag}>
                    Añadir
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Hacer público</Label>
                  <p className="text-sm text-muted-foreground">
                    Otros usuarios podrán usar tu estilo
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </CardContent>
          </Card>

          {/* Style Configuration Tabs */}
          <Tabs defaultValue="colors">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="colors">
                <Palette className="mr-2 h-4 w-4" />
                Colores
              </TabsTrigger>
              <TabsTrigger value="typography">
                <Type className="mr-2 h-4 w-4" />
                Tipografía
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Columns className="mr-2 h-4 w-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="sections">
                <Layout className="mr-2 h-4 w-4" />
                Secciones
              </TabsTrigger>
              <TabsTrigger value="extras">
                <Settings2 className="mr-2 h-4 w-4" />
                Extras
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Presets de colores</CardTitle>
                  <CardDescription>
                    Selecciona un preset para empezar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary transition-colors"
                        onClick={() => applyColorPreset(preset)}
                      >
                        <div className="flex gap-1">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: preset.background }}
                          />
                        </div>
                        <span className="text-xs text-center">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Colores personalizados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(config.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={value}
                            onChange={(e) =>
                              updateColors({
                                [key]: e.target.value,
                              } as Partial<StyleColors>)
                            }
                            className="w-12 h-9 p-1 cursor-pointer"
                          />
                          <Input
                            value={value}
                            onChange={(e) =>
                              updateColors({
                                [key]: e.target.value,
                              } as Partial<StyleColors>)
                            }
                            className="font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fuentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fuente de títulos</Label>
                      <Select
                        value={config.typography.headingFont}
                        onValueChange={(v) =>
                          updateTypography({ headingFont: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fuente del cuerpo</Label>
                      <Select
                        value={config.typography.bodyFont}
                        onValueChange={(v) => updateTypography({ bodyFont: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tamaños</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Tamaño base</Label>
                        <span className="text-sm text-muted-foreground">
                          {config.typography.baseFontSize}px
                        </span>
                      </div>
                      <Slider
                        value={[config.typography.baseFontSize]}
                        onValueChange={([v]) =>
                          updateTypography({ baseFontSize: v })
                        }
                        min={10}
                        max={18}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Altura de línea</Label>
                        <span className="text-sm text-muted-foreground">
                          {config.typography.lineHeight}
                        </span>
                      </div>
                      <Slider
                        value={[config.typography.lineHeight * 10]}
                        onValueChange={([v]) =>
                          updateTypography({ lineHeight: v / 10 })
                        }
                        min={10}
                        max={25}
                        step={1}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tipo de layout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "single-column", label: "Una columna" },
                      { value: "two-column", label: "Dos columnas" },
                      { value: "sidebar-left", label: "Sidebar izquierda" },
                      { value: "sidebar-right", label: "Sidebar derecha" },
                    ].map((layout) => (
                      <button
                        key={layout.value}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          config.layout.type === layout.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() =>
                          updateLayout({
                            type: layout.value as StyleLayout["type"],
                          })
                        }
                      >
                        <span className="font-medium">{layout.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Foto de perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mostrar foto</Label>
                    <Switch
                      checked={config.layout.showPhoto}
                      onCheckedChange={(v) => updateLayout({ showPhoto: v })}
                    />
                  </div>
                  {config.layout.showPhoto && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Tamaño</Label>
                          <span className="text-sm text-muted-foreground">
                            {config.layout.photoSize}px
                          </span>
                        </div>
                        <Slider
                          value={[config.layout.photoSize]}
                          onValueChange={([v]) =>
                            updateLayout({ photoSize: v })
                          }
                          min={60}
                          max={150}
                          step={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Forma</Label>
                        <Select
                          value={config.layout.photoShape}
                          onValueChange={(v: StyleLayout["photoShape"]) =>
                            updateLayout({ photoShape: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circle">Circular</SelectItem>
                            <SelectItem value="square">Cuadrada</SelectItem>
                            <SelectItem value="rounded">Redondeada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sections Tab */}
            <TabsContent value="sections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Secciones visibles</CardTitle>
                  <CardDescription>
                    Selecciona qué secciones mostrar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {allSections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <span>{section.label}</span>
                        <Switch
                          checked={config.sections.visible.includes(section.id)}
                          onCheckedChange={(checked) => {
                            const visible = checked
                              ? [...config.sections.visible, section.id]
                              : config.sections.visible.filter(
                                  (s) => s !== section.id
                                );
                            updateSections({ visible });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Opciones de sección</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mostrar iconos</Label>
                    <Switch
                      checked={config.sections.icons}
                      onCheckedChange={(v) => updateSections({ icons: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Mostrar divisores</Label>
                    <Switch
                      checked={config.sections.dividers}
                      onCheckedChange={(v) => updateSections({ dividers: v })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estilo de títulos</Label>
                    <Select
                      value={config.sections.sectionStyle}
                      onValueChange={(v: StyleSections["sectionStyle"]) =>
                        updateSections({ sectionStyle: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uppercase">MAYÚSCULAS</SelectItem>
                        <SelectItem value="capitalize">Capitalizado</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Extras Tab */}
            <TabsContent value="extras" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estilos adicionales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Border radius</Label>
                      <span className="text-sm text-muted-foreground">
                        {config.extras.borderRadius}px
                      </span>
                    </div>
                    <Slider
                      value={[config.extras.borderRadius]}
                      onValueChange={([v]) =>
                        updateExtras({ borderRadius: v })
                      }
                      min={0}
                      max={20}
                      step={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sombras</Label>
                    <Select
                      value={config.extras.shadowLevel}
                      onValueChange={(v: StyleExtras["shadowLevel"]) =>
                        updateExtras({ shadowLevel: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin sombras</SelectItem>
                        <SelectItem value="sm">Sutil</SelectItem>
                        <SelectItem value="md">Media</SelectItem>
                        <SelectItem value="lg">Pronunciada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estilo de habilidades</Label>
                    <Select
                      value={config.extras.skillStyle}
                      onValueChange={(v: StyleExtras["skillStyle"]) =>
                        updateExtras({ skillStyle: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="badge">Badges</SelectItem>
                        <SelectItem value="bar">Barras de progreso</SelectItem>
                        <SelectItem value="dot">Puntos</SelectItem>
                        <SelectItem value="text">Solo texto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estilo de fechas</Label>
                    <Select
                      value={config.extras.dateStyle}
                      onValueChange={(v: StyleExtras["dateStyle"]) =>
                        updateExtras({ dateStyle: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inline">En línea</SelectItem>
                        <SelectItem value="side">Al lado</SelectItem>
                        <SelectItem value="badge">Badge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vista previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mini CV Preview */}
              <div
                className="aspect-[3/4] rounded-lg border overflow-hidden"
                style={{ backgroundColor: config.colors.background }}
              >
                <div
                  className="h-full p-4 flex flex-col gap-3"
                  style={{
                    fontFamily: config.typography.bodyFont,
                    fontSize: config.typography.baseFontSize * 0.5,
                    color: config.colors.text,
                  }}
                >
                  {/* Header */}
                  <div className="flex gap-3 items-center">
                    {config.layout.showPhoto && (
                      <div
                        className="shrink-0"
                        style={{
                          width: config.layout.photoSize * 0.4,
                          height: config.layout.photoSize * 0.4,
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
                    <div className="flex-1 space-y-1">
                      <div
                        className="h-3 rounded w-3/4"
                        style={{
                          backgroundColor: config.colors.primary,
                          fontFamily: config.typography.headingFont,
                        }}
                      />
                      <div
                        className="h-2 rounded w-1/2"
                        style={{
                          backgroundColor: config.colors.textMuted,
                          opacity: 0.5,
                        }}
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1">
                    <div
                      className="h-1 rounded w-full"
                      style={{ backgroundColor: config.colors.border }}
                    />
                    <div
                      className="h-1 rounded w-5/6"
                      style={{ backgroundColor: config.colors.border }}
                    />
                  </div>

                  {/* Sections */}
                  {config.sections.visible.slice(0, 3).map((section, i) => (
                    <div key={section} className="space-y-1">
                      {config.sections.dividers && (
                        <div
                          className="h-px w-full"
                          style={{ backgroundColor: config.colors.border }}
                        />
                      )}
                      <div
                        className="h-2 rounded w-1/3"
                        style={{
                          backgroundColor: config.colors.primary,
                          textTransform: config.sections.sectionStyle as any,
                        }}
                      />
                      <div className="space-y-0.5">
                        <div
                          className="h-1 rounded w-full"
                          style={{ backgroundColor: config.colors.border }}
                        />
                        <div
                          className="h-1 rounded w-4/5"
                          style={{ backgroundColor: config.colors.border }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground text-center">
                Esta es una vista previa simplificada. El resultado final
                incluirá todos los detalles del estilo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
