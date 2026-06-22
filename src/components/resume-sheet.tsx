"use client";

import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResumePreview } from "@/components/resume-preview";
import type { ResumeStyleConfig } from "@/db/schema/style";
import type { Basics, Work, Education, Skill, Project, Language } from "@/types/resume";

// Tamaños de página (mm). "continuous" = sin paginar (una sola hoja larga).
const PAGE_SIZES = {
  a4: { label: "A4", w: 210, h: 297 },
  letter: { label: "Carta", w: 216, h: 279 },
  legal: { label: "Oficio", w: 216, h: 356 },
  continuous: { label: "Continuo", w: 0, h: 0 },
} as const;

type SizeKey = keyof typeof PAGE_SIZES;
const PX_PER_MM = 96 / 25.4; // px CSS por mm a 96dpi

interface ResumeSheetProps {
  config: ResumeStyleConfig;
  basics: Basics;
  work?: Work[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  languages?: Language[];
  defaultSize?: SizeKey;
}

/**
 * Envuelve el CV en una "hoja" del tamaño de página elegido (A4, Carta, …) y
 * dibuja guías de salto de página para visualizar cómo quedaría paginado, además
 * de fijar el tamaño de papel al imprimir/exportar a PDF (@page).
 */
export function ResumeSheet({ defaultSize = "a4", ...preview }: ResumeSheetProps) {
  const [sizeKey, setSizeKey] = useState<SizeKey>(defaultSize);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageHeightPx, setPageHeightPx] = useState(0);
  const [pages, setPages] = useState(1);

  const size = PAGE_SIZES[sizeKey];
  const isPaged = sizeKey !== "continuous";
  const pageWidthPx = size.w * PX_PER_MM;

  useEffect(() => {
    const el = contentRef.current;
    if (!isPaged || !el) {
      setPages(1);
      setPageHeightPx(0);
      return;
    }
    const measure = () => {
      const renderedWidth = el.clientWidth;
      // Alto de página proporcional al ancho realmente renderizado (la hoja
      // mantiene el aspecto de la página aunque se reduzca en pantalla).
      const ph = renderedWidth * (size.h / size.w);
      setPageHeightPx(ph);
      setPages(Math.max(1, Math.ceil(el.scrollHeight / ph)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isPaged, size.h, size.w]);

  return (
    <div className="space-y-3">
      <div className="no-print flex items-center justify-between gap-2">
        <Select value={sizeKey} onValueChange={(v) => setSizeKey(v as SizeKey)}>
          <SelectTrigger className="h-8 w-[170px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PAGE_SIZES).map(([key, s]) => (
              <SelectItem key={key} value={key} className="text-xs">
                {s.label}
                {key !== "continuous" ? ` · ${s.w}×${s.h} mm` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isPaged && (
          <span className="text-xs text-muted-foreground">
            {pages} {pages === 1 ? "página" : "páginas"}
          </span>
        )}
      </div>

      {/* Tamaño de papel al imprimir + hoja a ancho completo en impresión. */}
      <style>{`
        @media print {
          .resume-sheet { max-width: none !important; box-shadow: none !important; }
          ${isPaged ? `@page { size: ${size.w}mm ${size.h}mm; margin: 12mm; }` : ""}
        }
      `}</style>

      <div className="flex justify-center">
        <div
          className="resume-sheet relative w-full bg-white"
          style={{
            maxWidth: isPaged ? `${pageWidthPx}px` : "100%",
            boxShadow: isPaged ? "0 1px 10px rgba(0,0,0,0.12)" : "none",
          }}
        >
          <div ref={contentRef}>
            <ResumePreview {...preview} fullWidth />
          </div>

          {/* Guías de salto de página */}
          {isPaged &&
            pageHeightPx > 0 &&
            Array.from({ length: Math.max(0, pages - 1) }).map((_, i) => (
              <div
                key={i}
                className="no-print pointer-events-none absolute left-0 right-0 border-t-2 border-dashed border-zinc-400/70"
                style={{ top: `${(i + 1) * pageHeightPx}px` }}
              >
                <span className="absolute right-2 -top-2.5 rounded bg-zinc-100 px-1.5 text-[10px] font-medium text-zinc-500">
                  pág. {i + 2}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
