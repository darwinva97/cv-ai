"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useResumeEditor } from "./_hooks/use-resume-editor";
import {
  EditorHeader,
  EditorSidebar,
  PreviewPanel,
  BasicsSection,
  WorkSection,
  EducationSection,
  SkillsSection,
  SettingsSection,
  AISection,
} from "./_components";

export default function ResumeEditorPage() {
  const params = useParams();
  const resumeId = params.id as string;

  const editor = useResumeEditor(resumeId);

  // Loading state
  if (editor.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando CV...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!editor.resume) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">CV no encontrado</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-0.1rem)] flex flex-col">
      <EditorHeader
        resume={editor.resume}
        versionTitle={editor.versionTitle}
        versions={editor.versions}
        currentVersionId={editor.currentVersionId}
        editMode={editor.editMode}
        isEditingMode={editor.isEditingMode}
        isSaving={editor.isSaving}
        showPreview={editor.showPreview}
        onVersionChange={editor.setCurrentVersionId}
        onStartEdit={editor.handleStartEdit}
        onStartCreate={editor.handleStartCreate}
        onSave={
          editor.editMode === "create"
            ? editor.handleCreateVersion
            : editor.handleSave
        }
        onCancel={editor.handleCancelEdit}
        onTogglePreview={() => editor.setShowPreview(!editor.showPreview)}
      />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          activeSection={editor.activeSection}
          onSectionChange={editor.setActiveSection}
        />

        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-2xl">
              {editor.activeSection === "basics" && (
                <BasicsSection
                  basics={editor.basics}
                  isEditingMode={editor.isEditingMode}
                  onBasicsChange={editor.setBasics}
                  isFieldPinned={editor.isFieldPinned}
                  isFieldAiModified={editor.isFieldAiModified}
                  toggleFieldPin={editor.toggleFieldPin}
                />
              )}

              {editor.activeSection === "work" && (
                <WorkSection
                  workExperiences={editor.workExperiences}
                  isEditingMode={editor.isEditingMode}
                  onAdd={editor.addWorkExperience}
                  onUpdate={editor.updateWorkExperience}
                  onRemove={editor.removeWorkExperience}
                />
              )}

              {editor.activeSection === "education" && (
                <EducationSection
                  educations={editor.educations}
                  isEditingMode={editor.isEditingMode}
                  onAdd={editor.addEducation}
                  onUpdate={editor.updateEducation}
                  onRemove={editor.removeEducation}
                />
              )}

              {editor.activeSection === "skills" && (
                <SkillsSection
                  skills={editor.skills}
                  isEditingMode={editor.isEditingMode}
                  onAdd={editor.addSkill}
                  onUpdate={editor.updateSkill}
                  onRemove={editor.removeSkill}
                />
              )}

              {editor.activeSection === "settings" && (
                <SettingsSection
                  versionTitle={editor.versionTitle}
                  isResultPublic={editor.isResultPublic}
                  isCommunityPublic={editor.isCommunityPublic}
                  currentStyleId={editor.currentStyleId}
                  currentStyleConfig={editor.currentStyleConfig}
                  onVersionTitleChange={editor.setVersionTitle}
                  onIsResultPublicChange={editor.setIsResultPublic}
                  onIsCommunityPublicChange={editor.setIsCommunityPublic}
                  onStyleSelect={editor.handleStyleSelect}
                  onStyleConfigChange={editor.setCurrentStyleConfig}
                />
              )}

              {editor.activeSection === "ai" && (
                <AISection
                  aiPrompt={editor.aiPrompt}
                  jobOffer={editor.jobOffer}
                  onAiPromptChange={editor.setAiPrompt}
                  onJobOfferChange={editor.setJobOffer}
                  onScreenshotAnalysis={editor.handleScreenshotAnalysis}
                />
              )}
            </div>
          </ScrollArea>
        </main>

        {editor.showPreview && (
          <PreviewPanel
            currentStyleId={editor.currentStyleId}
            currentStyleConfig={editor.currentStyleConfig}
            basics={editor.basics}
            workExperiences={editor.workExperiences}
            educations={editor.educations}
            skills={editor.skills}
          />
        )}
      </div>
    </div>
  );
}
