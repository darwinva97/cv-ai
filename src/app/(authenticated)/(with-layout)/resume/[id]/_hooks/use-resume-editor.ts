"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResumeStyleConfig } from "@/db/schema/style";
import { defaultStyleConfig } from "@/db/schema/style";
import type { ParsedResumeData } from "@/lib/ai-resume-analyzer";
import type { Basics, Work, Education, Skill } from "@/types/resume";
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

export type EditMode = "none" | "edit" | "create";
export type ActiveSection = "basics" | "work" | "education" | "skills" | "settings" | "ai";

const initialBasics: Basics = {
  name: "",
  label: "",
  email: "",
  phone: "",
  url: "",
  summary: "",
  location: { city: "", countryCode: "", region: "" },
  pinnedFields: [],
  aiModifiedFields: [],
};

export function useResumeEditor(resumeId: string) {
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // UI states
  const [activeSection, setActiveSection] = useState<ActiveSection>("basics");
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [showPreview, setShowPreview] = useState(true);

  // Resume data
  const [resume, setResume] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState("");
  const [basicsId, setBasicsId] = useState<string | null>(null);

  // Form states
  const [basics, setBasics] = useState<Basics>(initialBasics);
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
  const [currentStyleConfig, setCurrentStyleConfig] = useState<ResumeStyleConfig>(defaultStyleConfig);

  const isEditingMode = editMode !== "none";

  // Load version data
  const loadVersionData = useCallback(async (versionId: string) => {
    try {
      // Fetch version metadata and data in parallel for optimal performance
      const [version, versionData] = await Promise.all([
        getResumeVersion(versionId),
        getVersionData(versionId),
      ]);

      setVersionTitle(version?.title || "Versión 1");
      setAiPrompt(version?.prompt || "");
      setJobOffer(version?.jobOfferText || "");
      setIsResultPublic(version?.isResultPublic ?? false);
      setIsCommunityPublic(version?.isCommunityPublic ?? false);
      if (versionData.basics) {
        setBasicsId(versionData.basics.id);
        setBasics({
          name: versionData.basics.name || "",
          label: versionData.basics.label || "",
          email: versionData.basics.email || "",
          phone: versionData.basics.phone || "",
          url: versionData.basics.url || "",
          summary: versionData.basics.summary || "",
          location: versionData.basics.location || { city: "", countryCode: "", region: "" },
          pinnedFields: versionData.basics.pinnedFields || [],
          aiModifiedFields: versionData.basics.aiModifiedFields || [],
        });
      }
    } catch (error) {
      console.error("Error loading version data:", error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    async function loadResumeData() {
      try {
        setIsLoading(true);
        // Fetch resume and versions in parallel for optimal performance
        const [resumeData, versionsData] = await Promise.all([
          getResume(resumeId),
          getResumeVersions(resumeId),
        ]);

        if (!resumeData) throw new Error("Resume not found");
        setResume(resumeData);
        setVersions(versionsData);

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
  }, [resumeId, loadVersionData]);

  // Reload when version changes
  useEffect(() => {
    if (currentVersionId) loadVersionData(currentVersionId);
  }, [currentVersionId, loadVersionData]);

  // Actions
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateResumeVersion(currentVersionId, {
        title: versionTitle,
        prompt: aiPrompt,
        jobOfferText: jobOffer,
        isResultPublic,
        isCommunityPublic,
      });
      if (basicsId) await updateVersionBasics(basicsId, basics);
      setEditMode("none");
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateVersion = async () => {
    setIsSaving(true);
    try {
      const newVersion = await createResumeVersion({
        resumeId,
        title: versionTitle.trim() || undefined,
        basedOn: currentVersionId || undefined,
        prompt: aiPrompt.trim() || undefined,
        jobOfferText: jobOffer.trim() || undefined,
        isResultPublic,
        isCommunityPublic,
      });
      const newBasics = await createVersionBasics(newVersion.id, basics);
      setBasicsId(newBasics.id);
      const versionsData = await getResumeVersions(resumeId);
      setVersions(versionsData);
      setCurrentVersionId(newVersion.id);
      setEditMode("none");
    } catch (error) {
      console.error("Error creating version:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode("none");
    if (currentVersionId) loadVersionData(currentVersionId);
  };

  const handleStartEdit = () => setEditMode("edit");

  const handleStartCreate = () => {
    setVersionTitle("");
    setAiPrompt("");
    setJobOffer("");
    setEditMode("create");
  };

  const handleStyleSelect = (styleId: string, config: ResumeStyleConfig) => {
    setCurrentStyleId(styleId);
    setCurrentStyleConfig(config);
  };

  const handleScreenshotAnalysis = (data: ParsedResumeData) => {
    if (data.basics) {
      setBasics((prev) => ({
        ...prev,
        name: data.basics?.name || prev.name,
        email: data.basics?.email || prev.email,
        phone: data.basics?.phone || prev.phone,
        url: data.basics?.website || prev.url,
        summary: data.summary || prev.summary,
        location: {
          ...prev.location,
          city: data.basics?.location?.split(",")?.[0] || prev.location.city,
          countryCode: data.basics?.location?.split(",")?.[1] || prev.location.countryCode,
        },
      }));
    }

    if (data.work?.length) {
      setWorkExperiences(data.work.map((w, i) => ({
        id: `imported-${Date.now()}-${i}`,
        name: w.company || "",
        position: w.position || "",
        startDate: w.startDate || "",
        endDate: w.endDate || "",
        summary: w.description || "",
        highlights: [],
        pinnedFields: [],
        aiModifiedFields: [],
      })));
    }

    if (data.education?.length) {
      setEducations(data.education.map((e, i) => ({
        id: `imported-${Date.now()}-${i}`,
        institution: e.institution || "",
        area: e.field || "",
        studyType: e.degree || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        courses: [],
        pinnedFields: [],
        aiModifiedFields: [],
      })));
    }

    if (data.skills?.length) {
      setSkills(data.skills.map((s, i) => ({
        id: `imported-${Date.now()}-${i}`,
        name: s,
        level: "",
        keywords: [],
        pinnedFields: [],
        aiModifiedFields: [],
      })));
    }
  };

  // Field helpers
  const toggleFieldPin = (field: string) => {
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
  };

  const isFieldPinned = (field: string) => (basics.pinnedFields || []).includes(field);
  const isFieldAiModified = (field: string) => (basics.aiModifiedFields || []).includes(field);

  // Work CRUD
  const addWorkExperience = () => {
    setWorkExperiences((prev) => [...prev, {
      id: `temp-${Date.now()}`,
      name: "",
      position: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
      pinnedFields: [],
      aiModifiedFields: [],
    }]);
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

  // Education CRUD
  const addEducation = () => {
    setEducations((prev) => [...prev, {
      id: `temp-${Date.now()}`,
      institution: "",
      area: "",
      studyType: "",
      startDate: "",
      endDate: "",
      courses: [],
      pinnedFields: [],
      aiModifiedFields: [],
    }]);
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

  // Skills CRUD
  const addSkill = () => {
    setSkills((prev) => [...prev, {
      id: `temp-${Date.now()}`,
      name: "",
      level: "",
      keywords: [],
      pinnedFields: [],
      aiModifiedFields: [],
    }]);
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

  return {
    // States
    isLoading,
    isSaving,
    activeSection,
    editMode,
    showPreview,
    resume,
    versions,
    currentVersionId,
    basics,
    workExperiences,
    educations,
    skills,
    versionTitle,
    aiPrompt,
    jobOffer,
    isResultPublic,
    isCommunityPublic,
    currentStyleId,
    currentStyleConfig,
    isEditingMode,

    // Setters
    setActiveSection,
    setShowPreview,
    setCurrentVersionId,
    setBasics,
    setVersionTitle,
    setAiPrompt,
    setJobOffer,
    setIsResultPublic,
    setIsCommunityPublic,
    setCurrentStyleConfig,

    // Actions
    handleSave,
    handleCreateVersion,
    handleCancelEdit,
    handleStartEdit,
    handleStartCreate,
    handleStyleSelect,
    handleScreenshotAnalysis,

    // Field helpers
    toggleFieldPin,
    isFieldPinned,
    isFieldAiModified,

    // Work CRUD
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,

    // Education CRUD
    addEducation,
    updateEducation,
    removeEducation,

    // Skills CRUD
    addSkill,
    updateSkill,
    removeSkill,
  };
}
