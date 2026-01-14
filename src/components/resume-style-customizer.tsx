"use client";

import { useState } from "react";
import {
  Palette,
  Type,
  Layout,
  Settings2,
  Columns,
  Eye,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { ResumeStyleConfig } from "@/db/schema/style";

interface ResumeStyleCustomizerProps {
  config: ResumeStyleConfig;
  onChange: (config: ResumeStyleConfig) => void;
  onReset?: () => void;
}

// Color presets for quick selection
const colorPresets = [
  { name: "Azul", primary: "#2563eb", background: "#ffffff", text: "#0f172a" },
  { name: "Verde", primary: "#16a34a", background: "#ffffff", text: "#0f172a" },
  { name: "Morado", primary: "#7c3aed", background: "#faf5ff", text: "#0f172a" },
  { name: "Naranja", primary: "#ea580c", background: "#fff7ed", text: "#0f172a" },
  { name: "Rosa", primary: "#db2777", background: "#fdf2f8", text: "#0f172a" },
  { name: "Oscuro", primary: "#22c55e", background: "#0f172a", text: "#f8fafc" },
  { name: "Negro", primary: "#18181b", background: "#ffffff", text: "#0f172a" },
  { name: "Gris", primary: "#374151", background: "#f9fafb", text: "#111827" },
];

const fontOptions = [
  { value: "Inter, system-ui, sans-serif", label: "Inter" },
  { value: "system-ui, sans-serif", label: "System" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Playfair Display', serif", label: "Playfair" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Source Code Pro', monospace", label: "Mono" },
];

const layoutOptions = [
  { value: "single-column", label: "Una columna", icon: "║" },
  { value: "two-column", label: "Dos columnas", icon: "║║" },
  { value: "sidebar-left", label: "Sidebar izquierda", icon: "▮║" },
  { value: "sidebar-right", label: "Sidebar derecha", icon: "║▮" },
];

function LivePreview({ config }: { config: ResumeStyleConfig }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Vista previa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="aspect-[3/4] rounded-lg overflow-hidden border"
          style={{
            backgroundColor: config.colors.background,
            fontFamily: config.typography.bodyFont,
            color: config.colors.text,
          }}
        >
          <div className="h-full p-4 flex flex-col gap-3" style={{ fontSize: config.typography.baseFontSize * 0.5 }}>
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
                  className="rounded w-3/4"
                  style={{
                    height: `${config.typography.headingSizes.h1 * 0.15}rem`,
                    backgroundColor: config.colors.primary,
                    fontFamily: config.typography.headingFont,
                  }}
                />
                <div
                  className="h-1.5 rounded w-1/2"
                  style={{ backgroundColor: config.colors.textMuted, opacity: 0.5 }}
                />
              </div>
            </div>

            {/* Section */}
            <div className="space-y-1">
              {config.sections.dividers && (
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: config.colors.border }}
                />
              )}
              <div
                className="rounded w-1/3"
                style={{
                  height: `${config.typography.headingSizes.h2 * 0.15}rem`,
                  backgroundColor: config.colors.primary,
                  textTransform: config.sections.sectionStyle as any,
                }}
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
            </div>

            {/* More sections */}
            {config.sections.visible.slice(1, 3).map((section) => (
              <div key={section} className="space-y-1">
                {config.sections.dividers && (
                  <div
                    className="h-px w-full"
                    style={{ backgroundColor: config.colors.border }}
                  />
                )}
                <div
                  className="rounded w-1/4"
                  style={{
                    height: `${config.typography.headingSizes.h2 * 0.15}rem`,
                    backgroundColor: config.colors.primary,
                    textTransform: config.sections.sectionStyle as any,
                  }}
                />
                <div className="space-y-0.5">
                  <div
                    className="h-0.5 rounded w-full"
                    style={{ backgroundColor: config.colors.border }}
                  />
                  <div
                    className="h-0.5 rounded w-4/5"
                    style={{ backgroundColor: config.colors.border }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResumeStyleCustomizer({
  config,
  onChange,
  onReset,
}: ResumeStyleCustomizerProps) {
  const [openSections, setOpenSections] = useState<string[]>(["colors", "layout"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const updateConfig = (updates: Partial<ResumeStyleConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateColors = (updates: Partial<typeof config.colors>) => {
    updateConfig({
      colors: { ...config.colors, ...updates },
    });
  };

  const updateTypography = (updates: Partial<typeof config.typography>) => {
    updateConfig({
      typography: { ...config.typography, ...updates },
    });
  };

  const updateSpacing = (updates: Partial<typeof config.spacing>) => {
    updateConfig({
      spacing: { ...config.spacing, ...updates },
    });
  };

  const updateLayout = (updates: Partial<typeof config.layout>) => {
    updateConfig({
      layout: { ...config.layout, ...updates },
    });
  };

  const updateExtras = (updates: Partial<typeof config.extras>) => {
    updateConfig({
      extras: { ...config.extras, ...updates },
    });
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    const isDark = preset.background === "#0f172a";
    updateColors({
      primary: preset.primary,
      background: preset.background,
      backgroundAlt: isDark ? "#1e293b" : "#f8fafc",
      text: preset.text,
      textMuted: isDark ? "#94a3b8" : "#64748b",
      border: isDark ? "#334155" : "#e2e8f0",
      accent: preset.primary,
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick color presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Colores rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border hover:border-primary transition-colors"
                onClick={() => applyColorPreset(preset)}
                title={preset.name}
              >
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: preset.primary }}
                />
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accordion-style customization sections */}
      <div className="space-y-2">
        {/* Colors */}
        <Collapsible open={openSections.includes("colors")} onOpenChange={() => toggleSection("colors")}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Colores
                  </CardTitle>
                  {openSections.includes("colors") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {Object.entries(config.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Label className="w-20 text-xs capitalize">
                      {key === "backgroundAlt" ? "Bg Alt" : key}
                    </Label>
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => updateColors({ [key]: e.target.value })}
                      className="w-10 h-8 p-1 cursor-pointer"
                    />
                    <Input
                      value={value}
                      onChange={(e) => updateColors({ [key]: e.target.value })}
                      className="flex-1 h-8 font-mono text-xs"
                    />
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Typography */}
        <Collapsible open={openSections.includes("typography")} onOpenChange={() => toggleSection("typography")}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Tipografía
                  </CardTitle>
                  {openSections.includes("typography") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Títulos</Label>
                    <Select
                      value={config.typography.headingFont}
                      onValueChange={(v) => updateTypography({ headingFont: v })}
                    >
                      <SelectTrigger className="h-8">
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
                  <div className="space-y-1">
                    <Label className="text-xs">Cuerpo</Label>
                    <Select
                      value={config.typography.bodyFont}
                      onValueChange={(v) => updateTypography({ bodyFont: v })}
                    >
                      <SelectTrigger className="h-8">
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
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Tamaño base</Label>
                    <span className="text-xs text-muted-foreground">
                      {config.typography.baseFontSize}px
                    </span>
                  </div>
                  <Slider
                    value={[config.typography.baseFontSize]}
                    onValueChange={([v]) => updateTypography({ baseFontSize: v })}
                    min={10}
                    max={18}
                    step={1}
                    className="h-1"
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Layout */}
        <Collapsible open={openSections.includes("layout")} onOpenChange={() => toggleSection("layout")}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Columns className="h-4 w-4" />
                    Layout
                  </CardTitle>
                  {openSections.includes("layout") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {layoutOptions.map((layout) => (
                    <button
                      key={layout.value}
                      className={`p-2 rounded-md border text-xs transition-colors ${
                        config.layout.type === layout.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() =>
                        updateLayout({ type: layout.value as typeof config.layout.type })
                      }
                    >
                      <span className="text-lg mr-1">{layout.icon}</span>
                      {layout.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Mostrar foto</Label>
                  <Switch
                    checked={config.layout.showPhoto}
                    onCheckedChange={(v) => updateLayout({ showPhoto: v })}
                  />
                </div>
                {config.layout.showPhoto && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs">Tamaño foto</Label>
                        <span className="text-xs text-muted-foreground">
                          {config.layout.photoSize}px
                        </span>
                      </div>
                      <Slider
                        value={[config.layout.photoSize]}
                        onValueChange={([v]) => updateLayout({ photoSize: v })}
                        min={60}
                        max={150}
                        step={10}
                        className="h-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Forma</Label>
                      <Select
                        value={config.layout.photoShape}
                        onValueChange={(v) =>
                          updateLayout({ photoShape: v as typeof config.layout.photoShape })
                        }
                      >
                        <SelectTrigger className="h-8">
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Extras */}
        <Collapsible open={openSections.includes("extras")} onOpenChange={() => toggleSection("extras")}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Extras
                  </CardTitle>
                  {openSections.includes("extras") ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Estilo habilidades</Label>
                    <Select
                      value={config.extras.skillStyle}
                      onValueChange={(v) =>
                        updateExtras({ skillStyle: v as typeof config.extras.skillStyle })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="badge">Badges</SelectItem>
                        <SelectItem value="bar">Barras</SelectItem>
                        <SelectItem value="dot">Puntos</SelectItem>
                        <SelectItem value="text">Texto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Estilo fechas</Label>
                    <Select
                      value={config.extras.dateStyle}
                      onValueChange={(v) =>
                        updateExtras({ dateStyle: v as typeof config.extras.dateStyle })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inline">En línea</SelectItem>
                        <SelectItem value="side">Lateral</SelectItem>
                        <SelectItem value="badge">Badge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Secciones con iconos</Label>
                  <Switch
                    checked={config.sections.icons}
                    onCheckedChange={(v) =>
                      updateConfig({
                        sections: { ...config.sections, icons: v },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Divisores entre secciones</Label>
                  <Switch
                    checked={config.sections.dividers}
                    onCheckedChange={(v) =>
                      updateConfig({
                        sections: { ...config.sections, dividers: v },
                      })
                    }
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Reset button */}
      {onReset && (
        <Button variant="outline" size="sm" className="w-full" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restablecer valores
        </Button>
      )}
    </div>
  );
}

export { LivePreview };
