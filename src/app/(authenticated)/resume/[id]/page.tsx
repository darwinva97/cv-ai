"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Eye,
  GitBranch,
  Loader2,
  MoreVertical,
  Palette,
  Plus,
  Save,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { StylePicker } from "@/components/style-picker";
import type { ResumeStyleConfig } from "@/db/schema/style";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Tipos basados en el schema
interface Location {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

interface Basics {
  id?: string;
  name: string;
  label: string;
  image?: string;
  email: string;
  phone: string;
  url?: string;
  summary: string;
  location: Location;
}

interface Profile {
  id?: string;
  network: string;
  username: string;
  url: string;
}

interface Work {
  id?: string;
  name: string;
  position: string;
  url?: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
}

interface Education {
  id?: string;
  institution: string;
  url?: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate?: string;
  score?: string;
  courses: string[];
}

interface Skill {
  id?: string;
  name: string;
  level: string;
  keywords: string[];
}

interface Language {
  id?: string;
  language: string;
  fluency: string;
}

interface Project {
  id?: string;
  name: string;
  startDate?: string;
  endDate?: string;
  description: string;
  highlights: string[];
  url?: string;
  keywords: string[];
}

// Datos de ejemplo
const mockResume = {
  id: "1",
  title: "CV Desarrollador Full Stack",
  slug: "dev-fullstack",
  description: "Para ofertas de desarrollo web",
  currentVersion: {
    id: "1.3",
    title: "v1.3",
    isResultPublic: true,
    isCommunityPublic: false,
    prompt: "Enfatizar experiencia en React y Node.js",
    jobOfferText: "Buscamos desarrollador full stack...",
  },
  versions: [
    { id: "1.3", title: "v1.3 - Actualizado para Google" },
    { id: "1.2", title: "v1.2 - Con proyectos" },
    { id: "1.1", title: "v1.1 - Versión inicial" },
  ],
};

const mockBasics: Basics = {
  name: "Juan Pérez",
  label: "Desarrollador Full Stack",
  email: "juan@example.com",
  phone: "+34 612 345 678",
  url: "https://juanperez.dev",
  summary:
    "Desarrollador con 5+ años de experiencia en React, Node.js y TypeScript. Apasionado por crear productos de alta calidad.",
  location: {
    city: "Madrid",
    countryCode: "ES",
    region: "Comunidad de Madrid",
  },
};

const mockProfiles: Profile[] = [
  { id: "1", network: "LinkedIn", username: "juanperez", url: "https://linkedin.com/in/juanperez" },
  { id: "2", network: "GitHub", username: "juanperez", url: "https://github.com/juanperez" },
];

const mockWork: Work[] = [
  {
    id: "1",
    name: "Tech Corp",
    position: "Senior Full Stack Developer",
    startDate: "2022-01",
    summary: "Desarrollo de aplicaciones web con React y Node.js",
    highlights: ["Lideré migración a TypeScript", "Implementé CI/CD"],
  },
  {
    id: "2",
    name: "StartupXYZ",
    position: "Full Stack Developer",
    startDate: "2019-06",
    endDate: "2021-12",
    summary: "Desarrollo de MVP y features principales",
    highlights: ["Desarrollo desde 0 del producto", "Crecimiento de 0 a 10k usuarios"],
  },
];

const mockEducation: Education[] = [
  {
    id: "1",
    institution: "Universidad Politécnica",
    area: "Ingeniería Informática",
    studyType: "Grado",
    startDate: "2015-09",
    endDate: "2019-06",
    courses: [],
  },
];

const mockSkills: Skill[] = [
  { id: "1", name: "React", level: "Experto", keywords: ["Hooks", "Next.js", "Redux"] },
  { id: "2", name: "Node.js", level: "Avanzado", keywords: ["Express", "NestJS", "Fastify"] },
  { id: "3", name: "TypeScript", level: "Experto", keywords: [] },
];

const mockLanguages: Language[] = [
  { id: "1", language: "Español", fluency: "Nativo" },
  { id: "2", language: "Inglés", fluency: "C1" },
];

export default function ResumeEditorPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");

  // Form states
  const [basics, setBasics] = useState<Basics>(mockBasics);
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [work, setWork] = useState<Work[]>(mockWork);
  const [education, setEducation] = useState<Education[]>(mockEducation);
  const [skills, setSkills] = useState<Skill[]>(mockSkills);
  const [languages, setLanguages] = useState<Language[]>(mockLanguages);

  // Settings
  const [isResultPublic, setIsResultPublic] = useState(mockResume.currentVersion.isResultPublic);
  const [isCommunityPublic, setIsCommunityPublic] = useState(mockResume.currentVersion.isCommunityPublic);
  const [currentStyleId, setCurrentStyleId] = useState<string | undefined>(undefined);
  const [currentStyleConfig, setCurrentStyleConfig] = useState<ResumeStyleConfig | undefined>(undefined);

  const handleStyleSelect = (styleId: string, config: ResumeStyleConfig) => {
    setCurrentStyleId(styleId);
    setCurrentStyleConfig(config);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Guardar en la API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsSaving(false);
    }
  };

  const updateBasics = (field: keyof Basics, value: unknown) => {
    setBasics((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocation = (field: keyof Location, value: string) => {
    setBasics((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/resumes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{mockResume.title}</h1>
            <p className="text-sm text-muted-foreground">
              {mockResume.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Version selector */}
          <Select defaultValue={mockResume.currentVersion.id}>
            <SelectTrigger className="w-[200px]">
              <GitBranch className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockResume.versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  {version.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" asChild>
            <Link href={`/resume-result/${mockResume.slug}`} target="_blank">
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <GitBranch className="mr-2 h-4 w-4" />
                Nueva versión
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerar con IA
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar CV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
        </div>
      </div>

      {/* Version info badges */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          Versión {mockResume.currentVersion.title}
        </Badge>
        {isResultPublic && (
          <Badge variant="default">
            <Eye className="mr-1 h-3 w-3" />
            Público
          </Badge>
        )}
        {mockResume.currentVersion.prompt && (
          <Badge variant="outline">
            <Sparkles className="mr-1 h-3 w-3" />
            Generado con IA
          </Badge>
        )}
      </div>

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basics">Básico</TabsTrigger>
          <TabsTrigger value="work">Experiencia</TabsTrigger>
          <TabsTrigger value="education">Educación</TabsTrigger>
          <TabsTrigger value="skills">Habilidades</TabsTrigger>
          <TabsTrigger value="projects">Proyectos</TabsTrigger>
          <TabsTrigger value="other">Otros</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        {/* Basics Tab */}
        <TabsContent value="basics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>
                Tu información de contacto principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={basics.name}
                    onChange={(e) => updateBasics("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Título profesional</Label>
                  <Input
                    id="label"
                    value={basics.label}
                    onChange={(e) => updateBasics("label", e.target.value)}
                    placeholder="Ej: Desarrollador Full Stack"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={basics.email}
                    onChange={(e) => updateBasics("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={basics.phone}
                    onChange={(e) => updateBasics("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Sitio web</Label>
                <Input
                  id="url"
                  value={basics.url || ""}
                  onChange={(e) => updateBasics("url", e.target.value)}
                  placeholder="https://tuportfolio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Resumen profesional</Label>
                <Textarea
                  id="summary"
                  value={basics.summary}
                  onChange={(e) => updateBasics("summary", e.target.value)}
                  rows={4}
                  placeholder="Un breve resumen sobre ti y tu experiencia..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={basics.location.city || ""}
                    onChange={(e) => updateLocation("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Región/Provincia</Label>
                  <Input
                    id="region"
                    value={basics.location.region || ""}
                    onChange={(e) => updateLocation("region", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={basics.location.countryCode || ""}
                    onChange={(e) =>
                      updateLocation("countryCode", e.target.value)
                    }
                    placeholder="ES"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código postal</Label>
                  <Input
                    id="postalCode"
                    value={basics.location.postalCode || ""}
                    onChange={(e) =>
                      updateLocation("postalCode", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Perfiles sociales</CardTitle>
                <CardDescription>
                  Tus redes sociales y perfiles profesionales
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Añadir
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile, index) => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <Input
                        placeholder="Red social"
                        value={profile.network}
                        onChange={(e) => {
                          const newProfiles = [...profiles];
                          newProfiles[index].network = e.target.value;
                          setProfiles(newProfiles);
                        }}
                      />
                      <Input
                        placeholder="Usuario"
                        value={profile.username}
                        onChange={(e) => {
                          const newProfiles = [...profiles];
                          newProfiles[index].username = e.target.value;
                          setProfiles(newProfiles);
                        }}
                      />
                      <Input
                        placeholder="URL"
                        value={profile.url}
                        onChange={(e) => {
                          const newProfiles = [...profiles];
                          newProfiles[index].url = e.target.value;
                          setProfiles(newProfiles);
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setProfiles(profiles.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Experience Tab */}
        <TabsContent value="work" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Experiencia laboral</h2>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Añadir experiencia
            </Button>
          </div>

          {work.map((job, index) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{job.position}</CardTitle>
                  <CardDescription>
                    {job.name} • {job.startDate} -{" "}
                    {job.endDate || "Presente"}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Input
                      value={job.name}
                      onChange={(e) => {
                        const newWork = [...work];
                        newWork[index].name = e.target.value;
                        setWork(newWork);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Puesto</Label>
                    <Input
                      value={job.position}
                      onChange={(e) => {
                        const newWork = [...work];
                        newWork[index].position = e.target.value;
                        setWork(newWork);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha inicio</Label>
                    <Input
                      type="month"
                      value={job.startDate}
                      onChange={(e) => {
                        const newWork = [...work];
                        newWork[index].startDate = e.target.value;
                        setWork(newWork);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha fin</Label>
                    <Input
                      type="month"
                      value={job.endDate || ""}
                      onChange={(e) => {
                        const newWork = [...work];
                        newWork[index].endDate = e.target.value;
                        setWork(newWork);
                      }}
                      placeholder="Presente"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={job.summary}
                    onChange={(e) => {
                      const newWork = [...work];
                      newWork[index].summary = e.target.value;
                      setWork(newWork);
                    }}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logros destacados</Label>
                  <div className="space-y-2">
                    {job.highlights.map((highlight, hIndex) => (
                      <div key={hIndex} className="flex gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => {
                            const newWork = [...work];
                            newWork[index].highlights[hIndex] = e.target.value;
                            setWork(newWork);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newWork = [...work];
                            newWork[index].highlights = job.highlights.filter(
                              (_, i) => i !== hIndex
                            );
                            setWork(newWork);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newWork = [...work];
                        newWork[index].highlights.push("");
                        setWork(newWork);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir logro
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Educación</h2>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Añadir educación
            </Button>
          </div>

          {education.map((edu, index) => (
            <Card key={edu.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{edu.area}</CardTitle>
                  <CardDescription>
                    {edu.institution} • {edu.studyType}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institución</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index].institution = e.target.value;
                        setEducation(newEdu);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Título/Área de estudio</Label>
                    <Input
                      value={edu.area}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index].area = e.target.value;
                        setEducation(newEdu);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Input
                      value={edu.studyType}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index].studyType = e.target.value;
                        setEducation(newEdu);
                      }}
                      placeholder="Grado, Máster, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha inicio</Label>
                    <Input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index].startDate = e.target.value;
                        setEducation(newEdu);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha fin</Label>
                    <Input
                      type="month"
                      value={edu.endDate || ""}
                      onChange={(e) => {
                        const newEdu = [...education];
                        newEdu[index].endDate = e.target.value;
                        setEducation(newEdu);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Habilidades</h2>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Añadir habilidad
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {skills.map((skill, index) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          value={skill.name}
                          onChange={(e) => {
                            const newSkills = [...skills];
                            newSkills[index].name = e.target.value;
                            setSkills(newSkills);
                          }}
                          className="font-medium"
                        />
                      </div>
                      <Select
                        value={skill.level}
                        onValueChange={(value) => {
                          const newSkills = [...skills];
                          newSkills[index].level = value;
                          setSkills(newSkills);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Principiante">
                            Principiante
                          </SelectItem>
                          <SelectItem value="Intermedio">Intermedio</SelectItem>
                          <SelectItem value="Avanzado">Avanzado</SelectItem>
                          <SelectItem value="Experto">Experto</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1">
                        {skill.keywords.map((keyword, kIndex) => (
                          <Badge key={kIndex} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setSkills(skills.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Idiomas</h2>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Añadir idioma
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {languages.map((lang, index) => (
                  <div
                    key={lang.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        value={lang.language}
                        onChange={(e) => {
                          const newLangs = [...languages];
                          newLangs[index].language = e.target.value;
                          setLanguages(newLangs);
                        }}
                        placeholder="Idioma"
                      />
                      <Input
                        value={lang.fluency}
                        onChange={(e) => {
                          const newLangs = [...languages];
                          newLangs[index].fluency = e.target.value;
                          setLanguages(newLangs);
                        }}
                        placeholder="Nivel"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setLanguages(languages.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Proyectos</h2>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Añadir proyecto
            </Button>
          </div>

          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No tienes proyectos todavía
              </h3>
              <p className="text-muted-foreground mb-4">
                Añade proyectos para mostrar tu trabajo
              </p>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Añadir proyecto
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Certificados</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No hay certificados añadidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Premios</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No hay premios añadidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Publicaciones</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No hay publicaciones añadidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Voluntariado</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No hay voluntariado añadido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Referencias</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No hay referencias añadidas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Intereses</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No hay intereses añadidos
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibilidad</CardTitle>
              <CardDescription>
                Controla quién puede ver tu CV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>CV público</Label>
                  <p className="text-sm text-muted-foreground">
                    Cualquiera con el link puede ver tu CV
                  </p>
                </div>
                <Switch
                  checked={isResultPublic}
                  onCheckedChange={setIsResultPublic}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar en comunidad</Label>
                  <p className="text-sm text-muted-foreground">
                    Otros usuarios pueden ver tu CV como ejemplo
                  </p>
                </div>
                <Switch
                  checked={isCommunityPublic}
                  onCheckedChange={setIsCommunityPublic}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Estilo visual
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de tu CV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StylePicker
                currentStyleId={currentStyleId}
                onSelectStyle={handleStyleSelect}
              />
              {currentStyleConfig && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                  <div className="flex gap-1">
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: currentStyleConfig.colors.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: currentStyleConfig.colors.background }}
                    />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Estilo aplicado</p>
                    <p className="text-muted-foreground">
                      {currentStyleConfig.layout.type.replace("-", " ")} • {currentStyleConfig.typography.baseFontSize}px
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slug personalizado</CardTitle>
              <CardDescription>
                Personaliza la URL de tu CV público
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  /resume-result/
                </span>
                <Input
                  value={mockResume.slug}
                  placeholder="mi-cv"
                  className="max-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {mockResume.currentVersion.prompt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generación con IA
                </CardTitle>
                <CardDescription>
                  Esta versión fue generada con inteligencia artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Prompt utilizado</Label>
                  <Textarea
                    value={mockResume.currentVersion.prompt}
                    readOnly
                    rows={2}
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Oferta de trabajo</Label>
                  <Textarea
                    value={mockResume.currentVersion.jobOfferText}
                    readOnly
                    rows={3}
                    className="bg-muted"
                  />
                </div>
                <Button variant="secondary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerar con nuevo prompt
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Zona peligrosa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Eliminar esta versión</p>
                  <p className="text-sm text-muted-foreground">
                    Se eliminará solo esta versión del CV
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Eliminar versión</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Eliminar versión?</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer. ¿Estás seguro de que
                        quieres eliminar esta versión?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancelar</Button>
                      <Button variant="destructive">Eliminar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Eliminar CV completo</p>
                  <p className="text-sm text-muted-foreground">
                    Se eliminarán todas las versiones de este CV
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Eliminar CV</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Eliminar CV?</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminarán todas
                        las versiones de este CV.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">Cancelar</Button>
                      <Button variant="destructive">Eliminar todo</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
