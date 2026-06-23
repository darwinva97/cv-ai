"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EditableField } from "@/components/editable-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { uploadProfilePhoto } from "@/actions/upload";
import type { Basics } from "@/types/resume";

interface BasicsSectionProps {
  basics: Basics;
  isEditingMode: boolean;
  onBasicsChange: (basics: Basics) => void;
  isFieldPinned: (field: string) => boolean;
  isFieldAiModified: (field: string) => boolean;
  toggleFieldPin: (field: string) => void;
}

export function BasicsSection({
  basics,
  isEditingMode,
  onBasicsChange,
  isFieldPinned,
  isFieldAiModified,
  toggleFieldPin,
}: BasicsSectionProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const updateField = (field: string, value: string) => {
    onBasicsChange({ ...basics, [field]: value });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadProfilePhoto(fd);
      if (res.ok) {
        updateField("image", res.url);
        toast.success("Foto subida");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("No se pudo subir la foto");
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const updateLocation = (field: string, value: string) => {
    onBasicsChange({
      ...basics,
      location: { ...basics.location, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Información básica</h2>
        <p className="text-sm text-muted-foreground">Tu información de contacto y perfil</p>
      </div>

      <div className="space-y-4">
        <EditableField
          label="Nombre completo"
          value={basics.name}
          onChange={(value) => updateField("name", value)}
          isPinned={isFieldPinned("name")}
          isAiModified={isFieldAiModified("name")}
          onPinToggle={() => toggleFieldPin("name")}
          isEditMode={isEditingMode}
        />

        <EditableField
          label="Título profesional"
          value={basics.label}
          onChange={(value) => updateField("label", value)}
          isPinned={isFieldPinned("label")}
          isAiModified={isFieldAiModified("label")}
          onPinToggle={() => toggleFieldPin("label")}
          isEditMode={isEditingMode}
          placeholder="ej: Desarrollador Full Stack"
        />

        <div className="grid grid-cols-2 gap-4">
          <EditableField
            label="Email"
            type="email"
            value={basics.email}
            onChange={(value) => updateField("email", value)}
            isPinned={isFieldPinned("email")}
            isAiModified={isFieldAiModified("email")}
            onPinToggle={() => toggleFieldPin("email")}
            isEditMode={isEditingMode}
          />
          <EditableField
            label="Teléfono"
            type="tel"
            value={basics.phone}
            onChange={(value) => updateField("phone", value)}
            isPinned={isFieldPinned("phone")}
            isAiModified={isFieldAiModified("phone")}
            onPinToggle={() => toggleFieldPin("phone")}
            isEditMode={isEditingMode}
          />
        </div>

        <EditableField
          label="Portfolio / URL"
          type="url"
          value={basics.url || ""}
          onChange={(value) => updateField("url", value)}
          isPinned={isFieldPinned("url")}
          isAiModified={isFieldAiModified("url")}
          onPinToggle={() => toggleFieldPin("url")}
          isEditMode={isEditingMode}
        />

        <div className="flex items-end gap-3">
          {basics.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={basics.image}
              alt="Foto de perfil"
              className="h-12 w-12 rounded-full object-cover border shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-full border bg-muted shrink-0" />
          )}
          <div className="flex-1">
            <EditableField
              label="Foto de perfil (URL)"
              type="url"
              value={basics.image || ""}
              onChange={(value) => updateField("image", value)}
              isEditMode={isEditingMode}
              placeholder="https://… o sube una imagen"
            />
          </div>
          {isEditingMode && (
            <>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                disabled={uploading}
                onClick={() => photoInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="ml-1">Subir</span>
              </Button>
            </>
          )}
        </div>

        <EditableField
          label="Resumen profesional"
          type="textarea"
          value={basics.summary}
          onChange={(value) => updateField("summary", value)}
          isPinned={isFieldPinned("summary")}
          isAiModified={isFieldAiModified("summary")}
          onPinToggle={() => toggleFieldPin("summary")}
          isEditMode={isEditingMode}
          rows={4}
        />

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Ubicación</h3>
          <div className="grid grid-cols-2 gap-4">
            <EditableField
              label="Ciudad"
              value={basics.location.city || ""}
              onChange={(value) => updateLocation("city", value)}
              isEditMode={isEditingMode}
            />
            <EditableField
              label="País"
              value={basics.location.countryCode || ""}
              onChange={(value) => updateLocation("countryCode", value)}
              isEditMode={isEditingMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
