"use client";

import { Plus, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/editable-field";
import type { Education } from "@/types/resume";

interface EducationSectionProps {
  educations: Education[];
  isEditingMode: boolean;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Education, value: any) => void;
  onRemove: (index: number) => void;
}

export function EducationSection({
  educations,
  isEditingMode,
  onAdd,
  onUpdate,
  onRemove,
}: EducationSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Educación</h2>
          <p className="text-sm text-muted-foreground">Tu formación académica</p>
        </div>
        {isEditingMode && (
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir
          </Button>
        )}
      </div>

      {educations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay educación añadida</p>
        </div>
      ) : (
        <div className="space-y-4">
          {educations.map((edu, index) => (
            <div key={edu.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {edu.institution || edu.area || `Educación ${index + 1}`}
                </h4>
                {isEditingMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <EditableField
                  label="Institución"
                  value={edu.institution}
                  onChange={(value) => onUpdate(index, "institution", value)}
                  isEditMode={isEditingMode}
                />
                <EditableField
                  label="Área de estudio"
                  value={edu.area}
                  onChange={(value) => onUpdate(index, "area", value)}
                  isEditMode={isEditingMode}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <EditableField
                  label="Tipo"
                  value={edu.studyType}
                  onChange={(value) => onUpdate(index, "studyType", value)}
                  isEditMode={isEditingMode}
                  placeholder="Licenciatura"
                />
                <EditableField
                  label="Inicio"
                  value={edu.startDate}
                  onChange={(value) => onUpdate(index, "startDate", value)}
                  isEditMode={isEditingMode}
                  placeholder="YYYY-MM"
                />
                <EditableField
                  label="Fin"
                  value={edu.endDate || ""}
                  onChange={(value) => onUpdate(index, "endDate", value)}
                  isEditMode={isEditingMode}
                  placeholder="YYYY-MM"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
