"use client";

import { useState } from "react";
import { Palette, Eye, User, Briefcase, GraduationCap, Award, Code, Mail, Phone, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ResumePreview } from "@/components/resume-preview";
import { resumeTemplates } from "@/lib/resume-templates";
import type { ResumeStyleConfig } from "@/db/schema/style";
import type { Basics, Work, Education, Skill, Project, Language } from "@/types/resume";
import { defaultStyleConfig } from "@/db/schema/style";
import { ResumeScreenshotUpload } from "@/components/resume-screenshot-upload";

// Demo data - simulates extracted info from a CV screenshot
const demoBasics: Basics = {
  name: "María García López",
  label: "Senior Full Stack Developer",
  email: "maria.garcia@email.com",
  phone: "+34 612 345 678",
  url: "mariagarcia.dev",
  summary: "Desarrolladora Full Stack con más de 8 años de experiencia construyendo aplicaciones web escalables. Especializada en React, Node.js y arquitecturas cloud. Apasionada por el código limpio, las mejores prácticas y el mentorizado de equipos junior.",
  location: {
    city: "Madrid",
    countryCode: "España",
    region: "",
  },
  pinnedFields: [],
  aiModifiedFields: [],
};

const demoWork: Work[] = [
  {
    id: "1",
    name: "TechCorp Innovations",
    position: "Senior Full Stack Developer",
    startDate: "2021-03",
    endDate: "Present",
    summary: "Lideré el desarrollo de plataformas SaaS B2B utilizando React y Node.js. Implementé microservicios que redujeron la latencia en un 40%. Mentoricé a 3 desarrolladores junior y participé en decisiones de arquitectura técnica.",
    highlights: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
  {
    id: "2",
    name: "Digital Solutions SL",
    position: "Full Stack Developer",
    startDate: "2018-06",
    endDate: "2021-02",
    summary: "Desarrollé aplicaciones web para clientes en sectores fintech y healthcare. Integré APIs de terceros y sistemas de pago. Implementé testing automatizado que redujo bugs en producción en un 60%.",
    highlights: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
  {
    id: "3",
    name: "StartupX",
    position: "Frontend Developer",
    startDate: "2016-09",
    endDate: "2018-05",
    summary: "Desarrollé interfaces de usuario responsive con React y Vue.js. Colaboré con diseñadores para implementar sistemas de diseño consistentes. Optimicé el rendimiento web mejorando el tiempo de carga en un 50%.",
    highlights: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
];

const demoEducation: Education[] = [
  {
    id: "1",
    institution: "Universidad Politécnica de Madrid",
    area: "Ingeniería de Software",
    studyType: "Grado en Ingeniería Informática",
    startDate: "2011-09",
    endDate: "2016-06",
    courses: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
  {
    id: "2",
    institution: "UC Berkeley Extension",
    area: "Machine Learning",
    studyType: "Certificado",
    startDate: "2020-01",
    endDate: "2020-06",
    courses: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
];

const demoSkills: Skill[] = [
  { id: "1", name: "React", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "2", name: "TypeScript", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "3", name: "Node.js", level: "Avanzado", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "4", name: "Next.js", level: "Avanzado", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "5", name: "Python", level: "Intermedio", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "6", name: "AWS", level: "Avanzado", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "7", name: "Docker", level: "Intermedio", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "8", name: "PostgreSQL", level: "Avanzado", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "9", name: "GraphQL", level: "Intermedio", keywords: [], pinnedFields: [], aiModifiedFields: [] },
  { id: "10", name: "Git/GitHub", level: "Experto", keywords: [], pinnedFields: [], aiModifiedFields: [] },
];

const demoProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    description: "Plataforma de comercio electrónico construida con Next.js, Stripe y PostgreSQL. Procesa más de 1000 transacciones diarias.",
    url: "github.com/mariagarcia/ecommerce",
    highlights: [],
    keywords: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
  {
    id: "2",
    name: "Task Management App",
    description: "Aplicación de gestión de tareas en tiempo real usando React, Firebase y WebSockets.",
    url: "github.com/mariagarcia/taskapp",
    highlights: [],
    keywords: [],
    pinnedFields: [],
    aiModifiedFields: [],
  },
];

const demoLanguages: Language[] = [
  { language: "Español", fluency: "Nativo" },
  { language: "Inglés", fluency: "C1 Avanzado" },
  { language: "Francés", fluency: "B2 Intermedio" },
];

export default function StylePreviewDemoPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("modern-clean");
  const [activeTab, setActiveTab] = useState("preview");
  const [extractedData, setExtractedData] = useState(true);

  const selectedTemplate = resumeTemplates.find((t) => t.id === selectedTemplateId) || resumeTemplates[0];
  const currentConfig: ResumeStyleConfig = selectedTemplate?.config || defaultStyleConfig;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleAnalysisComplete = (data: any, style?: any) => {
    // In a real app, this would populate the form with extracted data
    console.log("Extracted data:", data);
    console.log("Detected style:", style);
    setActiveTab("preview");
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Demo: Vista Previa de Estilos de CV</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Visualiza cómo tus datos se verían con diferentes estilos. Sube una captura de tu CV actual
          o usa los datos de ejemplo para probar todas las plantillas.
        </p>
      </div>

      {/* Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Selecciona un Estilo
          </CardTitle>
          <CardDescription>
            Haz clic en una plantilla para ver cómo queda tu CV con ese estilo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {resumeTemplates.map((template) => (
              <button
                key={template.id}
                className={`group relative rounded-lg border-2 p-3 transition-all hover:scale-105 ${
                  selectedTemplateId === template.id
                    ? "border-primary shadow-md shadow-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div
                  className="aspect-[3/4] rounded-md overflow-hidden relative"
                  style={{ backgroundColor: template.previewColors.background }}
                >
                  <div className="h-full p-2 flex flex-col gap-1">
                    <div
                      className="h-2 rounded w-2/3"
                      style={{ backgroundColor: template.previewColors.primary }}
                    />
                    <div
                      className="h-1 rounded w-1/3 opacity-60"
                      style={{ backgroundColor: template.previewColors.primary }}
                    />
                    <div className="flex-1 space-y-1 pt-2">
                      <div className="h-0.5 rounded w-full" style={{ backgroundColor: template.previewColors.accent || template.previewColors.primary }} />
                      <div className="h-0.5 rounded w-2/3" style={{ backgroundColor: template.previewColors.accent || template.previewColors.primary }} />
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium truncate">{template.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {template.category}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Template Info */}
      {selectedTemplate && (
        <Card className={`border-l-4`} style={{ borderLeftColor: selectedTemplate.previewColors.primary }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              </div>
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: selectedTemplate.previewColors.primary }}
                  title="Color primario"
                />
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{ backgroundColor: selectedTemplate.previewColors.background }}
                  title="Color de fondo"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          <TabsTrigger value="data">Datos del CV</TabsTrigger>
          <TabsTrigger value="upload">Subir Captura</TabsTrigger>
          <TabsTrigger value="compare">Comparar</TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa: {selectedTemplate.name}
              </CardTitle>
              <CardDescription>
                Así se verá tu CV con el estilo seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-8 bg-gray-50 rounded-lg">
                <ResumePreview
                  config={currentConfig}
                  basics={demoBasics}
                  work={demoWork}
                  education={demoEducation}
                  skills={demoSkills}
                  projects={demoProjects}
                  languages={demoLanguages}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Nombre:</span>
                  <p className="font-medium">{demoBasics.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Título:</span>
                  <p className="font-medium">{demoBasics.label}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail size={14} /> Email
                    </span>
                    <p className="font-medium text-sm">{demoBasics.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone size={14} /> Teléfono
                    </span>
                    <p className="font-medium text-sm">{demoBasics.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin size={14} /> Ubicación
                    </span>
                    <p className="font-medium text-sm">{demoBasics.location.city}, {demoBasics.location.countryCode}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Globe size={14} /> Website
                    </span>
                    <p className="font-medium text-sm">{demoBasics.url}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Resumen:</span>
                  <p className="text-sm">{demoBasics.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Skills Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5" />
                  Habilidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {demoSkills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                      {skill.level && <span className="ml-1 text-xs opacity-70">({skill.level})</span>}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                Experiencia Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoWork.map((work) => (
                <div key={work.id} className="border-l-2 pl-4" style={{ borderColor: currentConfig.colors.primary }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{work.position}</h4>
                      <p className="text-sm text-muted-foreground">{work.name}</p>
                    </div>
                    <Badge variant="outline">{work.startDate} - {work.endDate}</Badge>
                  </div>
                  <p className="text-sm mt-2">{work.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education & Languages */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  Educación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoEducation.map((edu) => (
                  <div key={edu.id} className="border-b pb-3 last:border-0">
                    <h4 className="font-medium">{edu.institution}</h4>
                    <p className="text-sm">{edu.studyType} en {edu.area}</p>
                    <p className="text-xs text-muted-foreground">{edu.startDate} - {edu.endDate}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5" />
                  Idiomas & Proyectos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Idiomas</h4>
                  <div className="space-y-1">
                    {demoLanguages.map((lang, i) => (
                      <div key={i} className="text-sm flex justify-between">
                        <span>{lang.language}</span>
                        <Badge variant="outline" className="text-xs">{lang.fluency}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Proyectos Destacados</h4>
                  <div className="space-y-2">
                    {demoProjects.map((proj) => (
                      <div key={proj.id} className="text-sm">
                        <span className="font-medium">{proj.name}</span>
                        <p className="text-xs text-muted-foreground">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sube tu CV para análisis</CardTitle>
              <CardDescription>
                Sube una captura de tu CV actual y la IA extraerá toda la información automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeScreenshotUpload
                onAnalysisComplete={handleAnalysisComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Estilos</CardTitle>
              <CardDescription>
                Compara cómo los mismos datos se ven en diferentes estilos
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumeTemplates.slice(0, 6).map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <CardHeader className="pb-2" style={{ backgroundColor: template.previewColors.background }}>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="scale-[0.4] origin-top-left -ml-8 -mt-4">
                    <ResumePreview
                      config={template.config}
                      basics={demoBasics}
                      work={demoWork.slice(0, 2)}
                      education={demoEducation.slice(0, 1)}
                      skills={demoSkills.slice(0, 5)}
                      projects={[]}
                      languages={[]}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Style Configuration Details */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Estilo: {selectedTemplate.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Colors */}
            <div>
              <h4 className="font-medium mb-3">Colores</h4>
              <div className="space-y-2">
                {Object.entries(currentConfig.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: value as string }}
                    />
                    <span className="text-sm capitalize">{key}</span>
                    <span className="text-xs text-muted-foreground ml-auto font-mono">
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h4 className="font-medium mb-3">Tipografía</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuente títulos:</span>
                  <span className="font-medium">{currentConfig.typography.headingFont.split(",")[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuente cuerpo:</span>
                  <span className="font-medium">{currentConfig.typography.bodyFont.split(",")[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tamaño base:</span>
                  <span className="font-medium">{currentConfig.typography.baseFontSize}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Line height:</span>
                  <span className="font-medium">{currentConfig.typography.lineHeight}</span>
                </div>
              </div>
            </div>

            {/* Layout */}
            <div>
              <h4 className="font-medium mb-3">Layout</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{currentConfig.layout.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ancho máximo:</span>
                  <span className="font-medium">{currentConfig.layout.maxWidth}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estilo habilidades:</span>
                  <span className="font-medium">{currentConfig.extras.skillStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estilo fechas:</span>
                  <span className="font-medium">{currentConfig.extras.dateStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Divisores:</span>
                  <span className="font-medium">{currentConfig.sections.dividers ? "Sí" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
