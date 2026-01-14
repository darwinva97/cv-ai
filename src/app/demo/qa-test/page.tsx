"use client";

import { useState } from "react";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumePreview } from "@/components/resume-preview";
import { resumeTemplates } from "@/lib/resume-templates";
import type { Basics, Work, Education, Skill } from "@/types/resume";
import { cn } from "@/lib/utils";

// Datos extraídos del CV
const qaBasics: Basics = {
  name: "Ricar Sedil",
  label: "Técnico de Pruebas",
  email: "ricarsedil@gmail.com",
  phone: "(249) 569 1856",
  url: "",
  summary: "Técnico de pruebas con experiencia especializada en pruebas y mantenimiento eléctrico y electrónico. Experto en la ejecución de pruebas de rendimiento, el análisis de resultados y el desarrollo de soluciones innovadoras.",
  location: { city: "Almería", countryCode: "España", region: "Baleares" },
  pinnedFields: [],
  aiModifiedFields: [],
};

const qaWork: Work[] = [
  {
    id: "1",
    name: "Indra Sistemas",
    position: "Técnico de pruebas",
    startDate: "2023-03",
    endDate: "Presente",
    summary: "Gestión y mantuvo con éxito una amplia gama de equipos y recursos de prueba. Realización de pruebas de sistemas electrónicos y mecánicos para determinar su rendimiento, fiabilidad y conformidad con los requisitos.",
    highlights: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
  {
    id: "2",
    name: "Indra Sistemas",
    position: "Técnico de pruebas",
    startDate: "2021-05",
    endDate: "2023-02",
    summary: "Realización de pruebas de diagnóstico y localización de averías para identificar y resolver problemas técnicos. Colaboró con otros técnicos e ingenieros de pruebas para garantizar la finalización satisfactoria de los proyectos.",
    highlights: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
];

const qaEducation: Education[] = [
  {
    id: "1",
    institution: "Universidad Politécnica de Madrid",
    area: "Ingeniería de Software",
    studyType: "Licenciatura",
    startDate: "2017-09",
    endDate: "2021-06",
    courses: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
];

const qaSkills: Skill[] = [
  { id: "1", name: "Solución de problemas", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "2", name: "Ejecución de pruebas", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "3", name: "Depuración", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "4", name: "Garantía de calidad", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "5", name: "Análisis técnico", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "6", name: "Análisis de datos", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
];

// Category labels in Spanish
const categoryLabels: Record<string, string> = {
  academic: "Académico",
  modern: "Moderno",
  minimal: "Minimal",
  creative: "Creativo",
  tech: "Tech",
  professional: "Profesional",
};

export default function QATestPage() {
  const [selectedStyle, setSelectedStyle] = useState("modern-clean");
  const template = resumeTemplates.find((t) => t.id === selectedStyle)!;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Subtle texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="relative border-b border-stone-200/80">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-stone-50" />
              </div>
              <span className="font-semibold text-stone-900 tracking-tight">CV AI</span>
            </div>
            <Button
              size="sm"
              className="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-5 text-sm font-medium"
            >
              Crear mi CV
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-stone-200/80">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-amber-700 mb-4 tracking-wide uppercase">
              Demo interactiva
            </p>
            <h1
              className="text-4xl lg:text-5xl font-light text-stone-900 leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
            >
              Transforma tu CV con{" "}
              <span className="italic">inteligencia artificial</span>
            </h1>
            <p className="text-lg text-stone-500 leading-relaxed max-w-xl">
              Sube una captura de tu currículum y observa cómo la IA extrae y reorganiza tu información en diseños profesionales al instante.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="grid lg:grid-cols-[380px_1fr] gap-12 lg:gap-16">

            {/* Left Column - Style Selector */}
            <div className="space-y-8">
              {/* Extracted Data Summary */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-xl font-semibold text-stone-600">
                    RS
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 text-lg">{qaBasics.name}</h3>
                    <p className="text-stone-500 text-sm">{qaBasics.label}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Extraído
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {qaSkills.slice(0, 4).map((skill) => (
                    <span
                      key={skill.id}
                      className="text-xs px-2.5 py-1 bg-stone-100 text-stone-600 rounded-md"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {qaSkills.length > 4 && (
                    <span className="text-xs px-2.5 py-1 text-stone-400">
                      +{qaSkills.length - 4} más
                    </span>
                  )}
                </div>
              </div>

              {/* Style Selection */}
              <div>
                <h2 className="text-sm font-medium text-stone-900 mb-4 tracking-wide uppercase">
                  Selecciona un estilo
                </h2>

                <div className="space-y-3">
                  {resumeTemplates.map((t) => {
                    const isSelected = selectedStyle === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedStyle(t.id)}
                        className={cn(
                          "w-full group relative rounded-xl border p-4 text-left transition-all duration-200",
                          isSelected
                            ? "bg-white border-stone-900 shadow-sm"
                            : "bg-white/50 border-stone-200 hover:border-stone-300 hover:bg-white"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Mini Preview */}
                          <div
                            className="w-12 h-16 rounded-lg overflow-hidden shrink-0 shadow-sm border border-stone-200/50"
                            style={{ backgroundColor: t.previewColors.background }}
                          >
                            <div className="h-full p-1.5 flex flex-col">
                              {/* Header bar */}
                              <div
                                className="h-1.5 rounded-sm w-3/4 mb-1"
                                style={{ backgroundColor: t.previewColors.primary }}
                              />
                              <div
                                className="h-1 rounded-sm w-1/2 mb-2 opacity-40"
                                style={{ backgroundColor: t.previewColors.primary }}
                              />
                              {/* Content lines */}
                              <div className="flex-1 space-y-1">
                                <div
                                  className="h-0.5 rounded-full w-full opacity-20"
                                  style={{ backgroundColor: t.previewColors.primary }}
                                />
                                <div
                                  className="h-0.5 rounded-full w-4/5 opacity-20"
                                  style={{ backgroundColor: t.previewColors.primary }}
                                />
                                <div
                                  className="h-0.5 rounded-full w-3/5 opacity-20"
                                  style={{ backgroundColor: t.previewColors.primary }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={cn(
                                "font-medium text-sm transition-colors",
                                isSelected ? "text-stone-900" : "text-stone-700"
                              )}>
                                {t.name}
                              </h3>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-stone-900 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 line-clamp-1 mb-2">
                              {t.description}
                            </p>
                            <span className={cn(
                              "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded",
                              isSelected
                                ? "bg-stone-900 text-white"
                                : "bg-stone-100 text-stone-500"
                            )}>
                              {categoryLabels[t.category] || t.category}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-stone-900 rounded-2xl p-6 text-stone-50">
                <h3
                  className="text-xl font-light mb-2"
                  style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}
                >
                  ¿Te gusta el resultado?
                </h3>
                <p className="text-stone-400 text-sm mb-5 leading-relaxed">
                  Sube tu propio CV y obtén el mismo diseño profesional en segundos.
                </p>
                <Button
                  className="w-full bg-white text-stone-900 hover:bg-stone-100 rounded-full font-medium"
                >
                  Probar con mi CV
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-stone-900 tracking-wide uppercase">
                  Vista previa
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-stone-200"
                      style={{ backgroundColor: template.previewColors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-stone-200"
                      style={{ backgroundColor: template.previewColors.background }}
                    />
                  </div>
                  <span className="text-sm text-stone-500">{template.name}</span>
                </div>
              </div>

              {/* Preview Container with paper effect */}
              <div className="relative">
                {/* Shadow layers for depth */}
                <div className="absolute inset-0 bg-stone-200/50 rounded-2xl transform translate-x-2 translate-y-2" />
                <div className="absolute inset-0 bg-stone-100 rounded-2xl transform translate-x-1 translate-y-1" />

                {/* Main preview */}
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200/80">
                  {/* Browser-like header */}
                  <div className="bg-stone-50 border-b border-stone-200/80 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white border border-stone-200 rounded-md px-3 py-1 text-xs text-stone-400 max-w-xs">
                        cv-preview.pdf
                      </div>
                    </div>
                  </div>

                  {/* CV Content */}
                  <div className="p-8 bg-white min-h-[600px]">
                    <ResumePreview
                      config={template.config}
                      basics={qaBasics}
                      work={qaWork}
                      education={qaEducation}
                      skills={qaSkills}
                      projects={[]}
                      languages={[]}
                    />
                  </div>
                </div>
              </div>

              {/* Style metadata */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-stone-200/80 p-4">
                  <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1">Tipografía</p>
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {template.config.typography.headingFont.split(",")[0].replace(/'/g, "")}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-stone-200/80 p-4">
                  <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1">Layout</p>
                  <p className="text-sm font-medium text-stone-900 capitalize">
                    {template.config.layout.type.replace("-", " ")}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-stone-200/80 p-4">
                  <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1">Skills</p>
                  <p className="text-sm font-medium text-stone-900 capitalize">
                    {template.config.extras.skillStyle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 mt-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-400">
              Diseñado con precisión. Potenciado por IA.
            </p>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Sparkles className="w-4 h-4" />
              CV AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
