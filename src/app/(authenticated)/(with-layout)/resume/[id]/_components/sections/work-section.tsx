"use client";

import { Plus, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/editable-field";
import type { Work } from "@/types/resume";

interface WorkSectionProps {
  workExperiences: Work[];
  isEditingMode: boolean;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Work, value: any) => void;
  onRemove: (index: number) => void;
}

export function WorkSection({
  workExperiences,
  isEditingMode,
  onAdd,
  onUpdate,
  onRemove,
}: WorkSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Experiencia laboral</h2>
          <p className="text-sm text-muted-foreground">Tu historial profesional</p>
        </div>
        {isEditingMode && (
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir
          </Button>
        )}
      </div>

      {workExperiences.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay experiencia añadida</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workExperiences.map((work, index) => (
            <div key={work.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {work.position || work.name || `Experiencia ${index + 1}`}
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
                  label="Empresa"
                  value={work.name}
                  onChange={(value) => onUpdate(index, "name", value)}
                  isEditMode={isEditingMode}
                />
                <EditableField
                  label="Cargo"
                  value={work.position}
                  onChange={(value) => onUpdate(index, "position", value)}
                  isEditMode={isEditingMode}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <EditableField
                  label="Inicio"
                  value={work.startDate}
                  onChange={(value) => onUpdate(index, "startDate", value)}
                  isEditMode={isEditingMode}
                  placeholder="YYYY-MM"
                />
                <EditableField
                  label="Fin"
                  value={work.endDate || ""}
                  onChange={(value) => onUpdate(index, "endDate", value)}
                  isEditMode={isEditingMode}
                  placeholder="YYYY-MM o vacío"
                />
              </div>
              <EditableField
                label="Descripción"
                type="textarea"
                value={work.summary}
                onChange={(value) => onUpdate(index, "summary", value)}
                isEditMode={isEditingMode}
                rows={3}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
