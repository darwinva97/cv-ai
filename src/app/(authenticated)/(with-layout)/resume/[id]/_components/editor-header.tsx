"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  GitBranch,
  Loader2,
  MoreHorizontal,
  Plus,
  Share2,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import type { EditMode } from "../_hooks/use-resume-editor";

interface EditorHeaderProps {
  resume: { id: string; title: string };
  versionTitle: string;
  versions: any[];
  currentVersionId: string;
  editMode: EditMode;
  isEditingMode: boolean;
  isSaving: boolean;
  showPreview: boolean;
  isResultPublic: boolean;
  onVersionChange: (versionId: string) => void;
  onStartEdit: () => void;
  onStartCreate: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTogglePreview: () => void;
  onDelete: () => void;
}

export function EditorHeader({
  resume,
  versionTitle,
  versions,
  currentVersionId,
  editMode,
  isEditingMode,
  isSaving,
  showPreview,
  isResultPublic,
  onVersionChange,
  onStartEdit,
  onStartCreate,
  onSave,
  onCancel,
  onTogglePreview,
  onDelete,
}: EditorHeaderProps) {
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/resume-result/${resume.id}`
      : "";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success(
        isResultPublic
          ? "Link público copiado al portapapeles"
          : "Link copiado. Activa \"CV público\" en Ajustes para que otros puedan verlo."
      );
    } catch {
      toast.error("No se pudo copiar el link");
    }
  };

  const handleExportPdf = () => {
    // Reutiliza la página pública con auto-impresión (?print=1). El dueño
    // siempre puede verla aunque el CV no sea público.
    window.open(`/resume-result/${resume.id}?print=1`, "_blank");
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "¿Eliminar este CV y todas sus versiones? Esta acción no se puede deshacer."
      )
    ) {
      onDelete();
    }
  };

  return (
    <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/resumes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm truncate max-w-[200px]">
              {resume.title}
            </h1>
            <Badge variant="secondary" className="text-xs font-normal">
              {versionTitle}
            </Badge>
          </div>
        </div>

        {/* Center: Version selector */}
        <div className="flex items-center gap-2">
          <Select
            value={currentVersionId}
            onValueChange={onVersionChange}
            disabled={isEditingMode || versions.length === 0}
          >
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <GitBranch className="h-3 w-3 mr-2" />
              <SelectValue placeholder="Sin versiones" />
            </SelectTrigger>
            <SelectContent>
              {[...versions]
                .sort((a, b) => b.id.localeCompare(a.id))
                .map((version) => (
                  <SelectItem key={version.id} value={version.id} className="text-xs">
                    v{version.id}{version.title ? ` - ${version.title}` : ""}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {editMode === "none" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={onStartEdit}
                disabled={versions.length === 0}
              >
                Editar
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={onStartCreate}
              >
                <Plus className="h-3 w-3 mr-1" />
                Nueva versión
              </Button>
            </>
          )}

          {editMode === "edit" && (
            <>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
                Cancelar
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={onSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                Guardar
              </Button>
            </>
          )}

          {editMode === "create" && (
            <>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
                Cancelar
              </Button>
              <Button size="sm" className="h-8 text-xs" onClick={onSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                Crear
              </Button>
            </>
          )}

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onTogglePreview}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExportPdf}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar CV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
