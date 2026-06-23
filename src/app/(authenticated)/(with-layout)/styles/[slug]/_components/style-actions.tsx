"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, GitFork, Flag, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  toggleLikeStyle,
  toggleSaveStyle,
  forkStyleAsMine,
  deleteMyStyle,
  reportStyle,
} from "@/actions/style";

interface StyleActionsProps {
  styleId: string;
  isOwner: boolean;
  initialLiked: boolean;
  initialSaved: boolean;
  initialLikes: number;
}

export function StyleActions({
  styleId,
  isOwner,
  initialLiked,
  initialSaved,
  initialLikes,
}: StyleActionsProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likes, setLikes] = useState(initialLikes);
  const [pending, startTransition] = useTransition();

  const onLike = async () => {
    const res = await toggleLikeStyle(styleId);
    if (!res.ok) return toast.error(res.error || "Error");
    setLiked(!!res.liked);
    setLikes((n) => n + (res.liked ? 1 : -1));
  };

  const onSave = async () => {
    const res = await toggleSaveStyle(styleId);
    if (!res.ok) return toast.error(res.error || "Error");
    setSaved(!!res.saved);
    toast.success(res.saved ? "Guardado en tus favoritos" : "Quitado de favoritos");
  };

  const onFork = () => {
    startTransition(async () => {
      const res = await forkStyleAsMine(styleId);
      if (!res.ok || !res.id) {
        toast.error(res.error || "No se pudo forkear");
        return;
      }
      toast.success("Fork creado en tus estilos");
      router.push(`/styles/${res.id}`);
    });
  };

  const onReport = async () => {
    const reason = window.prompt("¿Por qué reportas este estilo? (opcional)") ?? "";
    const res = await reportStyle(styleId, reason);
    toast[res.ok ? "success" : "error"](res.ok ? "Reporte enviado. Gracias." : res.error || "Error");
  };

  const onDelete = () => {
    if (!window.confirm("¿Eliminar este estilo? No se puede deshacer.")) return;
    startTransition(async () => {
      const res = await deleteMyStyle(styleId);
      if (!res.ok) {
        toast.error(res.error || "No se pudo eliminar");
        return;
      }
      toast.success("Estilo eliminado");
      router.push("/styles");
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant={liked ? "default" : "outline"} size="sm" onClick={onLike}>
        <Heart className={`mr-1 h-4 w-4 ${liked ? "fill-current" : ""}`} />
        {likes}
      </Button>
      <Button variant={saved ? "default" : "outline"} size="sm" onClick={onSave}>
        <Bookmark className={`mr-1 h-4 w-4 ${saved ? "fill-current" : ""}`} />
        {saved ? "Guardado" : "Guardar"}
      </Button>
      <Button variant="outline" size="sm" onClick={onFork} disabled={pending}>
        {pending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <GitFork className="mr-1 h-4 w-4" />}
        Fork
      </Button>
      {isOwner ? (
        <Button variant="outline" size="sm" className="text-destructive" onClick={onDelete} disabled={pending}>
          <Trash2 className="mr-1 h-4 w-4" />
          Eliminar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onReport}>
          <Flag className="mr-1 h-4 w-4" />
          Reportar
        </Button>
      )}
    </div>
  );
}
