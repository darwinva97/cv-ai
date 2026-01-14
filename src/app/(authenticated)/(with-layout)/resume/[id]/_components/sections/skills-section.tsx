"use client";

import { Plus, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/editable-field";
import type { Skill } from "@/types/resume";

interface SkillsSectionProps {
  skills: Skill[];
  isEditingMode: boolean;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Skill, value: any) => void;
  onRemove: (index: number) => void;
}

export function SkillsSection({
  skills,
  isEditingMode,
  onAdd,
  onUpdate,
  onRemove,
}: SkillsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Habilidades</h2>
          <p className="text-sm text-muted-foreground">Tus competencias técnicas y profesionales</p>
        </div>
        {isEditingMode && (
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir
          </Button>
        )}
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay habilidades añadidas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={skill.id} className="border rounded-lg p-3 flex items-center gap-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <EditableField
                  label="Nombre"
                  value={skill.name}
                  onChange={(value) => onUpdate(index, "name", value)}
                  isEditMode={isEditingMode}
                  placeholder="JavaScript"
                />
                <EditableField
                  label="Nivel"
                  value={skill.level}
                  onChange={(value) => onUpdate(index, "level", value)}
                  isEditMode={isEditingMode}
                  placeholder="Avanzado"
                />
              </div>
              {isEditingMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
