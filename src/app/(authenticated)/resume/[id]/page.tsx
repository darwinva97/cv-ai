"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Edit,
  X,
  Check,
  ChevronDown,
  FileText,
} from "lucide-react";
import { StylePicker } from "@/components/style-picker";
import { EditableField } from "@/components/editable-field";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Basics, Profile, Work, Education, Skill, Language, Project } from "@/types/resume";
import {
  getResume,
  getResumeVersions,
  getResumeVersion,
  getVersionData,
  createResumeVersion,
  updateResumeVersion,
  updateVersionBasics,
  createVersionBasics,
} from "@/actions/resume";

type EditMode = "none" | "edit" | "create";

export default function ResumeEditorPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basics");

  // Resume data from DB
  const [resume, setResume] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [currentVersion, setCurrentVersion] = useState<any>(null);
  const [basicsId, setBasicsId] = useState<string | null>(null);

  const [editMode, setEditMode] = useState<EditMode>("none");
  const [showPreview, setShowPreview] = useState(true);
  const [currentVersionId, setCurrentVersionId] = useState("");

  // Form states
  const [basics, setBasics] = useState<Basics>({
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    summary: "",
    location: {
      city: "",
      countryCode: "",
      region: "",
    },
    pinnedFields: [],
    aiModifiedFields: [],
  });
  const [workExperiences, setWorkExperiences] = useState<Work[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [versionTitle, setVersionTitle] = useState("Versión 1");
  const [aiPrompt, setAiPrompt] = useState("");
  const [jobOffer, setJobOffer] = useState("");

  // Settings
  const [isResultPublic, setIsResultPublic] = useState(false);
  const [isCommunityPublic, setIsCommunityPublic] = useState(false);
  const [currentStyleId, setCurrentStyleId] = useState<string | undefined>(undefined);
  const [currentStyleConfig, setCurrentStyleConfig] = useState<ResumeStyleConfig | undefined>(undefined);

  // Load resume data on mount
  useEffect(() => {
    async function loadResumeData() {
      try {
        setIsLoading(true);
        
        // Get resume
        const resumeData = await getResume(resumeId);
        if (!resumeData) {
          throw new Error("Resume not found");
        }
        setResume(resumeData);

        // Get all versions
        const versionsData = await getResumeVersions(resumeId);
        setVersions(versionsData);

        // If there are versions, load the current one
        if (versionsData.length > 0) {
          const versionId = resumeData.currentVersionId || versionsData[0].id;
          setCurrentVersionId(versionId);
          await loadVersionData(versionId);
        }
      } catch (error) {
        console.error("Error loading resume:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadResumeData();
  }, [resumeId]);

  async function loadVersionData(versionId: string) {
    try {
      const version = await getResumeVersion(versionId);
      setCurrentVersion(version);

      // Load version metadata
      setVersionTitle(version?.title || "Versión 1");
      setAiPrompt(version?.prompt || "");
      setJobOffer(version?.jobOfferText || "");
      setIsResultPublic(version?.isResultPublic ?? false);
      setIsCommunityPublic(version?.isCommunityPublic ?? false);

      // Load version data (basics, work, education, etc.)
      const versionData = await getVersionData(versionId);
      
      if (versionData.basics) {
        setBasicsId(versionData.basics.id);
        setBasics({
          name: versionData.basics.name || "",
          label: versionData.basics.label || "",
          email: versionData.basics.email || "",
          phone: versionData.basics.phone || "",
          url: versionData.basics.url || "",
          summary: versionData.basics.summary || "",
          location: versionData.basics.location || {
            city: "",
            countryCode: "",
            region: "",
          },
          pinnedFields: versionData.basics.pinnedFields || [],
          aiModifiedFields: versionData.basics.aiModifiedFields || [],
        });
      }
    } catch (error) {
      console.error("Error loading version data:", error);
    }
  }

  // Load version data when version changes
  useEffect(() => {
    if (currentVersionId) {
      loadVersionData(currentVersionId);
    }
  }, [currentVersionId]);

  const handleStyleSelect = (styleId: string, config: ResumeStyleConfig) => {
    setCurrentStyleId(styleId);
    setCurrentStyleConfig(config);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update version metadata
      await updateResumeVersion(currentVersionId, {
        title: versionTitle,
        prompt: aiPrompt,
        jobOfferText: jobOffer,
        isResultPublic,
        isCommunityPublic,
      });

      // Update basics
      if (basicsId) {
        await updateVersionBasics(basicsId, basics);
      }

      setEditMode("none");
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartCreateVersion = () => {
    // Reset form for new version
    setVersionTitle("");
    setAiPrompt("");
    setJobOffer("");
    setEditMode("create");
  };

  const handleStartEdit = () => {
    setEditMode("edit");
  };

  const handleCancelEdit = () => {
    setEditMode("none");
    // Reload data to reset form
    if (currentVersionId) {
      loadVersionData(currentVersionId);
    }
  };

  const handleCreateVersion = async () => {
    setIsSaving(true);
    try {
      // Create new version
      const newVersion = await createResumeVersion({
        resumeId,
        title: versionTitle.trim() || undefined, // Let server generate default title if empty
        basedOn: currentVersionId || undefined,
        prompt: aiPrompt.trim() || undefined,
        jobOfferText: jobOffer.trim() || undefined,
        isResultPublic,
        isCommunityPublic,
      });

      // Create basics for this version
      const newBasics = await createVersionBasics(newVersion.id, basics);
      setBasicsId(newBasics.id);

      // Reload versions list
      const versionsData = await getResumeVersions(resumeId);
      setVersions(versionsData);
      
      // Set current version to the new one
      setCurrentVersionId(newVersion.id);
      setEditMode("none");
    } catch (error) {
      console.error("Error creating version:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFieldPin = (section: string, field: string) => {
    if (section === "basics") {
      setBasics((prev) => {
        const pinnedFields = prev.pinnedFields || [];
        const isPinned = pinnedFields.includes(field);
        return {
          ...prev,
          pinnedFields: isPinned
            ? pinnedFields.filter((f) => f !== field)
            : [...pinnedFields, field],
        };
      });
    }
    // Similar logic for other sections
  };

  const isFieldPinned = (section: string, field: string): boolean => {
    if (section === "basics") {
      return (basics.pinnedFields || []).includes(field);
    }
    return false;
  };

  const isFieldAiModified = (section: string, field: string): boolean => {
    if (section === "basics") {
      return (basics.aiModifiedFields || []).includes(field);
    }
    return false;
  };

  // Add new items
  const addWorkExperience = () => {
    const newWork: Work = {
      id: `temp-${Date.now()}`,
      name: "",
      position: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
      pinnedFields: [],
      aiModifiedFields: [],
    };
    setWorkExperiences((prev) => [...prev, newWork]);
  };

  const updateWorkExperience = (index: number, field: keyof Work, value: any) => {
    setWorkExperiences((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: `temp-${Date.now()}`,
      institution: "",
      area: "",
      studyType: "",
      startDate: "",
      endDate: "",
      courses: [],
      pinnedFields: [],
      aiModifiedFields: [],
    };
    setEducations((prev) => [...prev, newEducation]);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    setEducations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeEducation = (index: number) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: `temp-${Date.now()}`,
      name: "",
      level: "",
      keywords: [],
      pinnedFields: [],
      aiModifiedFields: [],
    };
    setSkills((prev) => [...prev, newSkill]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    setSkills((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const isEditingMode = editMode !== "none";

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-9xl py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando CV...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto max-w-9xl py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">CV no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-9xl py-6 space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-6 pb-4 space-y-4 bg-background border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/resumes">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{resume.title}</h1>
              <p className="text-sm text-muted-foreground">
                {resume.description || "Nuevo currículum"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Version selector */}
            <Select
              value={currentVersionId}
              onValueChange={setCurrentVersionId}
              disabled={isEditingMode || versions.length === 0}
            >
              <SelectTrigger className="w-[220px]">
                <GitBranch className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sin versiones" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.title || `Versión ${version.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action buttons based on mode */}
            {editMode === "none" && (
              <>
                <Button onClick={handleStartEdit} variant="outline" disabled={versions.length === 0}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar versión
                </Button>
                <Button onClick={handleStartCreateVersion}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva versión
                </Button>
              </>
            )}

            {editMode === "edit" && (
              <>
                <Button onClick={handleCancelEdit} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Guardar
                </Button>
              </>
            )}

            {editMode === "create" && (
              <>
                <Button onClick={handleCancelEdit} variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleCreateVersion} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Crear versión
                </Button>
              </>
            )}

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/resume-result/${resume.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver página
                  </Link>
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <FileText className="mr-2 h-4 w-4" />
              {showPreview ? "Ocultar" : "Mostrar"} vista previa
            </Button>
          </div>
        </div>

        {/* Preview toggle */}
        <div className="flex items-center justify-end">

        </div>
      </div>

      {/* Main content */}
      <div className={`grid ${showPreview ? "grid-cols-2" : "grid-cols-1"} gap-6`}>
        {/* Editor Panel */}
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basics">Básicos</TabsTrigger>
              <TabsTrigger value="work">Experiencia</TabsTrigger>
              <TabsTrigger value="education">Educación</TabsTrigger>
              <TabsTrigger value="skills">Habilidades</TabsTrigger>
              <TabsTrigger value="settings">Ajustes</TabsTrigger>
              <TabsTrigger value="ai">IA</TabsTrigger>
            </TabsList>

            {/* Basics Tab */}
            <TabsContent value="basics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                  <CardDescription>
                    Tu información de contacto y perfil profesional
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <EditableField
                    label="Nombre completo"
                    value={basics.name}
                    onChange={(value) => setBasics({ ...basics, name: value })}
                    isPinned={isFieldPinned("basics", "name")}
                    isAiModified={isFieldAiModified("basics", "name")}
                    onPinToggle={() => toggleFieldPin("basics", "name")}
                    isEditMode={isEditingMode}
                  />

                  <EditableField
                    label="Título profesional"
                    value={basics.label}
                    onChange={(value) => setBasics({ ...basics, label: value })}
                    isPinned={isFieldPinned("basics", "label")}
                    isAiModified={isFieldAiModified("basics", "label")}
                    onPinToggle={() => toggleFieldPin("basics", "label")}
                    isEditMode={isEditingMode}
                    placeholder="ej: Desarrollador Full Stack"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <EditableField
                      label="Email"
                      type="email"
                      value={basics.email}
                      onChange={(value) => setBasics({ ...basics, email: value })}
                      isPinned={isFieldPinned("basics", "email")}
                      isAiModified={isFieldAiModified("basics", "email")}
                      onPinToggle={() => toggleFieldPin("basics", "email")}
                      isEditMode={isEditingMode}
                    />

                    <EditableField
                      label="Teléfono"
                      type="tel"
                      value={basics.phone}
                      onChange={(value) => setBasics({ ...basics, phone: value })}
                      isPinned={isFieldPinned("basics", "phone")}
                      isAiModified={isFieldAiModified("basics", "phone")}
                      onPinToggle={() => toggleFieldPin("basics", "phone")}
                      isEditMode={isEditingMode}
                    />
                  </div>

                  <EditableField
                    label="URL / Portafolio"
                    type="url"
                    value={basics.url || ""}
                    onChange={(value) => setBasics({ ...basics, url: value })}
                    isPinned={isFieldPinned("basics", "url")}
                    isAiModified={isFieldAiModified("basics", "url")}
                    onPinToggle={() => toggleFieldPin("basics", "url")}
                    isEditMode={isEditingMode}
                  />

                  <EditableField
                    label="Resumen profesional"
                    type="textarea"
                    value={basics.summary}
                    onChange={(value) => setBasics({ ...basics, summary: value })}
                    isPinned={isFieldPinned("basics", "summary")}
                    isAiModified={isFieldAiModified("basics", "summary")}
                    onPinToggle={() => toggleFieldPin("basics", "summary")}
                    isEditMode={isEditingMode}
                    rows={5}
                  />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Ubicación</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <EditableField
                        label="Ciudad"
                        value={basics.location.city || ""}
                        onChange={(value) =>
                          setBasics({
                            ...basics,
                            location: { ...basics.location, city: value },
                          })
                        }
                        isPinned={isFieldPinned("basics", "location.city")}
                        isAiModified={isFieldAiModified("basics", "location.city")}
                        onPinToggle={() => toggleFieldPin("basics", "location.city")}
                        isEditMode={isEditingMode}
                      />

                      <EditableField
                        label="País"
                        value={basics.location.countryCode || ""}
                        onChange={(value) =>
                          setBasics({
                            ...basics,
                            location: { ...basics.location, countryCode: value },
                          })
                        }
                        isPinned={isFieldPinned("basics", "location.country")}
                        isAiModified={isFieldAiModified("basics", "location.country")}
                        onPinToggle={() => toggleFieldPin("basics", "location.country")}
                        isEditMode={isEditingMode}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Tab */}
            <TabsContent value="work" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Experiencia laboral</CardTitle>
                      <CardDescription>
                        Tu historial profesional
                      </CardDescription>
                    </div>
                    {isEditingMode && (
                      <Button variant="outline" size="sm" onClick={addWorkExperience}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir experiencia
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {workExperiences.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay experiencia laboral añadida
                    </p>
                  ) : (
                    workExperiences.map((work, index) => (
                      <div key={work.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {work.name || work.position || `Experiencia ${index + 1}`}
                          </h4>
                          {isEditingMode && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeWorkExperience(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <EditableField
                            label="Empresa"
                            value={work.name}
                            onChange={(value) => updateWorkExperience(index, "name", value)}
                            isEditMode={isEditingMode}
                          />
                          <EditableField
                            label="Cargo"
                            value={work.position}
                            onChange={(value) => updateWorkExperience(index, "position", value)}
                            isEditMode={isEditingMode}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <EditableField
                            label="Fecha inicio"
                            value={work.startDate}
                            onChange={(value) => updateWorkExperience(index, "startDate", value)}
                            isEditMode={isEditingMode}
                            placeholder="YYYY-MM"
                          />
                          <EditableField
                            label="Fecha fin"
                            value={work.endDate || ""}
                            onChange={(value) => updateWorkExperience(index, "endDate", value)}
                            isEditMode={isEditingMode}
                            placeholder="YYYY-MM o vacío si actual"
                          />
                        </div>
                        <EditableField
                          label="Descripción"
                          type="textarea"
                          value={work.summary}
                          onChange={(value) => updateWorkExperience(index, "summary", value)}
                          isEditMode={isEditingMode}
                          rows={3}
                        />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Educación</CardTitle>
                      <CardDescription>
                        Tu formación académica
                      </CardDescription>
                    </div>
                    {isEditingMode && (
                      <Button variant="outline" size="sm" onClick={addEducation}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir educación
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {educations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay educación añadida
                    </p>
                  ) : (
                    educations.map((edu, index) => (
                      <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {edu.institution || edu.area || `Educación ${index + 1}`}
                          </h4>
                          {isEditingMode && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEducation(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <EditableField
                            label="Institución"
                            value={edu.institution}
                            onChange={(value) => updateEducation(index, "institution", value)}
                            isEditMode={isEditingMode}
                          />
                          <EditableField
                            label="Área de estudio"
                            value={edu.area}
                            onChange={(value) => updateEducation(index, "area", value)}
                            isEditMode={isEditingMode}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <EditableField
                            label="Tipo de estudio"
                            value={edu.studyType}
                            onChange={(value) => updateEducation(index, "studyType", value)}
                            isEditMode={isEditingMode}
                            placeholder="Ej: Licenciatura"
                          />
                          <EditableField
                            label="Fecha inicio"
                            value={edu.startDate}
                            onChange={(value) => updateEducation(index, "startDate", value)}
                            isEditMode={isEditingMode}
                            placeholder="YYYY-MM"
                          />
                          <EditableField
                            label="Fecha fin"
                            value={edu.endDate || ""}
                            onChange={(value) => updateEducation(index, "endDate", value)}
                            isEditMode={isEditingMode}
                            placeholder="YYYY-MM"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Habilidades</CardTitle>
                      <CardDescription>
                        Tus competencias técnicas y profesionales
                      </CardDescription>
                    </div>
                    {isEditingMode && (
                      <Button variant="outline" size="sm" onClick={addSkill}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir habilidad
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {skills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay habilidades añadidas
                    </p>
                  ) : (
                    skills.map((skill, index) => (
                      <div key={skill.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {skill.name || `Habilidad ${index + 1}`}
                          </h4>
                          {isEditingMode && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSkill(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <EditableField
                            label="Nombre"
                            value={skill.name}
                            onChange={(value) => updateSkill(index, "name", value)}
                            isEditMode={isEditingMode}
                            placeholder="Ej: JavaScript"
                          />
                          <EditableField
                            label="Nivel"
                            value={skill.level}
                            onChange={(value) => updateSkill(index, "level", value)}
                            isEditMode={isEditingMode}
                            placeholder="Ej: Avanzado"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de la versión</CardTitle>
                  <CardDescription>
                    Personaliza esta versión de tu CV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre de la versión</Label>
                    <Input
                      value={versionTitle}
                      onChange={(e) => setVersionTitle(e.target.value)}
                      placeholder="ej: v1 - Para empresa X"
                    />
                    <p className="text-xs text-muted-foreground">
                      Por defecto se usa el número de versión
                    </p>
                  </div>
                </CardContent>
              </Card>

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
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Configuración de IA
                  </CardTitle>
                  <CardDescription>
                    Personaliza cómo la IA edita tu CV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Prompt para la IA</Label>
                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ej: Enfatiza experiencia en React y habilidades de liderazgo"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Oferta de trabajo (opcional)</Label>
                    <Textarea
                      value={jobOffer}
                      onChange={(e) => setJobOffer(e.target.value)}
                      placeholder="Pega aquí la descripción de la oferta de trabajo"
                      rows={6}
                    />
                  </div>

                  <Button className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar con IA
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campos fijados</CardTitle>
                  <CardDescription>
                    Controla qué campos puede editar la IA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Información básica</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2 pl-4">
                      {["name", "label", "email", "phone", "summary"].map((field) => (
                        <div key={field} className="flex items-center justify-between py-2">
                          <Label className="text-sm">
                            {field === "name"
                              ? "Nombre"
                              : field === "label"
                                ? "Título"
                                : field === "email"
                                  ? "Email"
                                  : field === "phone"
                                    ? "Teléfono"
                                    : "Resumen"}
                          </Label>
                          <Switch
                            checked={isFieldPinned("basics", field)}
                            onCheckedChange={() => toggleFieldPin("basics", field)}
                          />
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Experiencia laboral</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2 pl-4">
                      <p className="text-sm text-muted-foreground">
                        No hay experiencia laboral
                      </p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Educación</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2 pl-4">
                      <p className="text-sm text-muted-foreground">
                        No hay educación
                      </p>
                    </CollapsibleContent>
                  </Collapsible>

                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span>Habilidades</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2 pl-4">
                      <p className="text-sm text-muted-foreground">
                        No hay habilidades
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="sticky top-20 h-[calc(100vh-120px)]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm">Vista previa</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] overflow-auto">
                <div className="bg-white p-8 shadow-lg rounded-lg">
                  <h2 className="text-2xl font-bold">{basics.name}</h2>
                  <p className="text-lg text-gray-600">{basics.label}</p>
                  <div className="mt-4 space-y-1 text-sm">
                    <p>{basics.email} • {basics.phone}</p>
                    {basics.url && <p>{basics.url}</p>}
                    <p>{basics.location.city}, {basics.location.countryCode}</p>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Resumen</h3>
                    <p className="text-sm text-gray-700">{basics.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
