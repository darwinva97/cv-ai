"use client";

import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeSheet } from "@/components/resume-sheet";
import type { ResumeStyleConfig } from "@/db/schema/style";
import type { Basics, Work, Education, Skill } from "@/types/resume";

interface PreviewPanelProps {
  currentStyleId?: string;
  currentStyleConfig: ResumeStyleConfig;
  basics: Basics;
  workExperiences: Work[];
  educations: Education[];
  skills: Skill[];
}

export function PreviewPanel({
  currentStyleId,
  currentStyleConfig,
  basics,
  workExperiences,
  educations,
  skills,
}: PreviewPanelProps) {
  return (
    <aside className="w-[45%] border-l bg-muted/20 flex-shrink-0 overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/80">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium">Vista previa</span>
          </div>
          {currentStyleId && (
            <Badge variant="secondary" className="text-xs">{currentStyleId}</Badge>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <ResumeSheet
              config={currentStyleConfig}
              basics={basics}
              work={workExperiences}
              education={educations}
              skills={skills}
              projects={[]}
              languages={[]}
            />
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
