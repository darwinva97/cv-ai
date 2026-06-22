"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Acciones de la vista pública del CV. "Descargar PDF" usa el diálogo de
 * impresión del navegador (Guardar como PDF). Si llega ?print=1 (lo abre así
 * el botón "Exportar PDF" del editor), dispara la impresión automáticamente.
 */
export function ResultActions({ autoPrint = false }: { autoPrint?: boolean }) {
  useEffect(() => {
    if (!autoPrint) return;
    // Pequeña espera para que tipografías/estilos terminen de pintar.
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [autoPrint]);

  return (
    <Button variant="outline" size="sm" onClick={() => window.print()}>
      <Download className="mr-2 h-4 w-4" />
      Descargar PDF
    </Button>
  );
}
