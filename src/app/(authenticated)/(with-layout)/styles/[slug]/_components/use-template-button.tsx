"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createStyleFromTemplate } from "@/actions/style";

/** Crea un estilo editable en la BD a partir de una plantilla en código. */
export function UseTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = () =>
    startTransition(async () => {
      const res = await createStyleFromTemplate(templateId);
      if (!res.ok || !res.id) {
        toast.error(res.error || "No se pudo crear el estilo");
        return;
      }
      toast.success("Estilo creado en tu colección");
      router.push(`/styles/${res.id}`);
    });

  return (
    <Button variant="outline" onClick={onClick} disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitFork className="mr-2 h-4 w-4" />}
      Crear mi estilo a partir de esta
    </Button>
  );
}
