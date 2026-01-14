"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ResumeStyleGallery } from "@/components/resume-style-gallery";
import { ResumeStyleCustomizer } from "@/components/resume-style-customizer";
import { defaultStyleConfig } from "@/db/schema/style";
import type { ResumeStyleConfig } from "@/db/schema/style";

interface SettingsSectionProps {
  versionTitle: string;
  isResultPublic: boolean;
  isCommunityPublic: boolean;
  currentStyleId?: string;
  currentStyleConfig: ResumeStyleConfig;
  onVersionTitleChange: (title: string) => void;
  onIsResultPublicChange: (value: boolean) => void;
  onIsCommunityPublicChange: (value: boolean) => void;
  onStyleSelect: (styleId: string, config: ResumeStyleConfig) => void;
  onStyleConfigChange: (config: ResumeStyleConfig) => void;
}

export function SettingsSection({
  versionTitle,
  isResultPublic,
  isCommunityPublic,
  currentStyleId,
  currentStyleConfig,
  onVersionTitleChange,
  onIsResultPublicChange,
  onIsCommunityPublicChange,
  onStyleSelect,
  onStyleConfigChange,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Ajustes</h2>
        <p className="text-sm text-muted-foreground">Configuración de esta versión</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Nombre de la versión</Label>
          <Input
            value={versionTitle}
            onChange={(e) => onVersionTitleChange(e.target.value)}
            placeholder="ej: Para empresa X"
            className="h-9"
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Visibilidad</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">CV público</Label>
              <p className="text-xs text-muted-foreground">Cualquiera con el link puede verlo</p>
            </div>
            <Switch checked={isResultPublic} onCheckedChange={onIsResultPublicChange} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Mostrar en comunidad</Label>
              <p className="text-xs text-muted-foreground">Otros usuarios pueden verlo como ejemplo</p>
            </div>
            <Switch checked={isCommunityPublic} onCheckedChange={onIsCommunityPublicChange} />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Estilo visual</h3>
          <ResumeStyleGallery
            currentStyleId={currentStyleId}
            onSelectStyle={onStyleSelect}
            trigger={
              <Button variant="outline" className="w-full justify-between h-9 text-sm">
                <span>{currentStyleId ? "Estilo seleccionado" : "Seleccionar estilo"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          />

          {currentStyleId && (
            <ResumeStyleCustomizer
              config={currentStyleConfig}
              onChange={onStyleConfigChange}
              onReset={() => onStyleConfigChange(defaultStyleConfig)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
