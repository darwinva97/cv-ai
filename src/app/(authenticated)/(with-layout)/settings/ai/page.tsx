"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  getAIProviders,
  createAIProvider,
  updateAIProvider,
  deleteAIProvider,
} from "@/actions/ai";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";

type ProviderKind = "anthropic" | "openai" | "google" | "other";

interface AIProvider {
  id: string;
  name: string;
  model: string;
  provider: ProviderKind;
  isActive: boolean;
  createdAt: string;
}

export default function AISettingsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state for new provider
  const [newProvider, setNewProvider] = useState<{
    name: string;
    model: string;
    token: string;
    url: string;
    provider: ProviderKind;
  }>({
    name: "",
    model: "",
    token: "",
    url: "",
    provider: "google",
  });

  const loadProviders = useCallback(async () => {
    if (!userId) return;
    try {
      const rows = await getAIProviders(userId);
      setProviders(
        rows.map((p) => ({
          id: p.id,
          name: p.name,
          model: p.model,
          provider: p.providerAi as ProviderKind,
          isActive: p.isActive,
          createdAt:
            p.createdAt instanceof Date
              ? p.createdAt.toISOString()
              : String(p.createdAt),
        }))
      );
    } catch (err) {
      console.error("Error loading AI providers:", err);
      toast.error("No se pudieron cargar los proveedores.");
    }
  }, [userId]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleAddProvider = async () => {
    if (!userId) {
      toast.error("Inicia sesión para configurar proveedores.");
      return;
    }
    if (!newProvider.name || !newProvider.model || !newProvider.token) return;

    setIsSaving(true);
    try {
      await createAIProvider({
        userId,
        name: newProvider.name,
        model: newProvider.model,
        token: newProvider.token,
        url: newProvider.url || undefined,
        providerAi: newProvider.provider,
      });
      await loadProviders();
      setNewProvider({
        name: "",
        model: "",
        token: "",
        url: "",
        provider: "google",
      });
      setIsAddDialogOpen(false);
      toast.success("Proveedor añadido y activado.");
    } catch (err) {
      console.error("Error creating AI provider:", err);
      toast.error("No se pudo guardar el proveedor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!userId) return;
    const target = providers.find((p) => p.id === id);
    if (!target) return;
    // Optimistic: activating one deactivates the rest.
    setProviders((prev) =>
      prev.map((p) => ({ ...p, isActive: p.id === id ? !target.isActive : false }))
    );
    try {
      await updateAIProvider(id, userId, { isActive: !target.isActive });
      await loadProviders();
    } catch (err) {
      console.error("Error updating AI provider:", err);
      toast.error("No se pudo actualizar el proveedor.");
      loadProviders();
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!userId) return;
    setProviders((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteAIProvider(id, userId);
    } catch (err) {
      console.error("Error deleting AI provider:", err);
      toast.error("No se pudo eliminar el proveedor.");
      loadProviders();
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "openai":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
          </svg>
        );
      case "anthropic":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.304 3.541h-3.672l6.696 16.918H24l-6.696-16.918zM6.696 3.541 0 20.459h3.768l1.34-3.527h6.68l1.336 3.527h3.768L10.2 3.541H6.696zm-.576 10.602 2.328-6.12 2.328 6.12H6.12z" />
          </svg>
        );
      case "google":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 11v2.4h5.66c-.23 1.48-1.72 4.34-5.66 4.34-3.41 0-6.19-2.82-6.19-6.3S8.59 5.7 12 5.7c1.94 0 3.24.83 3.98 1.54l2.71-2.61C16.96 2.99 14.7 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.77 0 9.6-4.06 9.6-9.77 0-.66-.07-1.16-.16-1.66H12z" />
          </svg>
        );
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Configuración de IA</h1>
          <p className="text-muted-foreground">
            Configura tus proveedores de IA para generar CVs
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            ¿Cómo funciona?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            CV AI utiliza modelos de lenguaje para generar y optimizar tu CV
            basándose en ofertas de trabajo específicas.
          </p>
          <p>
            Puedes usar tu propia API key de OpenAI, Anthropic u otros
            proveedores compatibles. Tus claves se almacenan de forma segura y
            encriptada.
          </p>
        </CardContent>
      </Card>

      {/* Providers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tus proveedores</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Añadir proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Añadir proveedor de IA</DialogTitle>
                <DialogDescription>
                  Configura un nuevo proveedor de IA con tu API key
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-type">Proveedor</Label>
                  <Select
                    value={newProvider.provider}
                    onValueChange={(value: ProviderKind) =>
                      setNewProvider({ ...newProvider, provider: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google (Gemini)</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="other">Otro (Compatible OpenAI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-name">Nombre</Label>
                  <Input
                    id="provider-name"
                    placeholder="Ej: Mi OpenAI GPT-4"
                    value={newProvider.name}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-model">Modelo</Label>
                  <Input
                    id="provider-model"
                    placeholder="Ej: gemini-2.5-flash, gpt-4.1-mini, claude-sonnet-4-5"
                    value={newProvider.model}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, model: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-token">API Key</Label>
                  <Input
                    id="provider-token"
                    type="password"
                    placeholder="sk-..."
                    value={newProvider.token}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, token: e.target.value })
                    }
                  />
                </div>
                {newProvider.provider === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="provider-url">URL del API (opcional)</Label>
                    <Input
                      id="provider-url"
                      placeholder="https://api.example.com/v1"
                      value={newProvider.url}
                      onChange={(e) =>
                        setNewProvider({ ...newProvider, url: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddProvider}
                  disabled={
                    isSaving ||
                    !newProvider.name ||
                    !newProvider.model ||
                    !newProvider.token
                  }
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Añadir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {providers.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No tienes proveedores configurados
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Añade tu API key de OpenAI, Anthropic u otro proveedor para
                empezar a generar CVs con IA
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Añadir proveedor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border p-2">
                      {getProviderIcon(provider.provider)}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {provider.name}
                        {provider.isActive && (
                          <Badge variant="default" className="ml-2">
                            <Check className="mr-1 h-3 w-3" />
                            Activo
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {provider.model} • Añadido el{" "}
                        {new Date(provider.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${provider.id}`} className="sr-only">
                        Activar
                      </Label>
                      <Switch
                        id={`active-${provider.id}`}
                        checked={provider.isActive}
                        onCheckedChange={() => handleToggleActive(provider.id)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver API key
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteProvider(provider.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Consejos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              1
            </span>
            <p>
              <strong>OpenAI GPT-4</strong> ofrece excelentes resultados para
              generación de texto profesional.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              2
            </span>
            <p>
              <strong>Claude 3</strong> de Anthropic es ideal para textos
              largos y análisis detallado.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              3
            </span>
            <p>
              Solo un proveedor puede estar activo a la vez. El proveedor activo
              se usará para todas las generaciones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
