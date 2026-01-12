"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pin, PinOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: "text" | "textarea" | "email" | "tel" | "url";
  placeholder?: string;
  disabled?: boolean;
  isPinned?: boolean;
  isAiModified?: boolean;
  onPinToggle?: () => void;
  isEditMode?: boolean;
  rows?: number;
}

export function EditableField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  isPinned = false,
  isAiModified = false,
  onPinToggle,
  isEditMode = false,
  rows = 3,
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const InputComponent = type === "textarea" ? Textarea : Input;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {isAiModified && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Editado por IA
            </Badge>
          )}
          {isEditMode && onPinToggle && (
            <button
              type="button"
              onClick={onPinToggle}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                isPinned
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              title={isPinned ? "Fijado (no editable por IA)" : "No fijado (editable por IA)"}
            >
              {isPinned ? (
                <>
                  <Pin className="h-3 w-3" />
                  Fijado
                </>
              ) : (
                <>
                  <PinOff className="h-3 w-3" />
                  No fijado
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <InputComponent
        type={type !== "textarea" ? type : undefined}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={type === "textarea" ? rows : undefined}
        className={cn(
          isAiModified && "border-yellow-500/50",
          isPinned && isEditMode && "border-primary"
        )}
      />
    </div>
  );
}
