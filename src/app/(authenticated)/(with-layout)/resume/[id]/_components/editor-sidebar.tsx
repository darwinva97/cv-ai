"use client";

import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Settings,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActiveSection } from "../_hooks/use-resume-editor";

const sectionItems = [
  { id: "basics" as const, label: "Datos básicos", icon: User },
  { id: "work" as const, label: "Experiencia", icon: Briefcase },
  { id: "education" as const, label: "Educación", icon: GraduationCap },
  { id: "skills" as const, label: "Habilidades", icon: Wrench },
  { id: "settings" as const, label: "Ajustes", icon: Settings },
  { id: "ai" as const, label: "IA", icon: Wand2 },
];

interface EditorSidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export function EditorSidebar({ activeSection, onSectionChange }: EditorSidebarProps) {
  return (
    <aside className="w-48 border-r bg-muted/30 flex-shrink-0">
      <nav className="p-2 space-y-1">
        {sectionItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left",
              activeSection === item.id
                ? "bg-background text-foreground shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
