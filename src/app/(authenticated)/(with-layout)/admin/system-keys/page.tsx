"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  listSystemKeys,
  createSystemKey,
  deleteSystemKey,
  updateSystemKey,
  resetSystemKeyCooldown,
  type SystemKeyMeta,
} from "@/actions/admin/system-keys";
import type { ProviderType } from "@/lib/ai-generate";
import { ArrowLeft, Loader2, Plus, MoreVertical, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const emptyForm = {
  name: "",
  providerAi: "google" as ProviderType,
  model: "gemini-2.5-flash",
  token: "",
  url: "",
  weight: 1,
  priority: 0,
};

export default function AdminSystemKeysPage() {
  const [keys, setKeys] = useState<SystemKeyMeta[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      setKeys(await listSystemKeys());
    } catch {
      toast.error("No se pudieron cargar las keys del sistema.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.name || !form.model || !form.token) return;
    setSaving(true);
    try {
      await createSystemKey({
        name: form.name,
        providerAi: form.providerAi,
        model: form.model,
        token: form.token,
        url: form.url || undefined,
        weight: Number(form.weight) || 1,
        priority: Number(form.priority) || 0,
      });
      setForm(emptyForm);
      setOpen(false);
      await load();
      toast.success("Key del sistema añadida y cifrada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la key.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (k: SystemKeyMeta) => {
    setKeys((prev) =>
      prev.map((p) => (p.id === k.id ? { ...p, isActive: !p.isActive } : p))
    );
    try {
      await updateSystemKey(k.id, { isActive: !k.isActive });
    } catch {
      toast.error("No se pudo actualizar.");
      load();
    }
  };

  const handleReset = async (id: string) => {
    try {
      await resetSystemKeyCooldown(id);
      await load();
      toast.success("Cooldown reiniciado.");
    } catch {
      toast.error("No se pudo reiniciar el cooldown.");
    }
  };

  const handleDelete = async (id: string) => {
    setKeys((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteSystemKey(id);
    } catch {
      toast.error("No se pudo eliminar.");
      load();
    }
  };

  const isCooling = (k: SystemKeyMeta) =>
    k.disabledUntil && new Date(k.disabledUntil) > new Date();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Keys del sistema</h1>
          <p className="text-muted-foreground">
            Pool de claves del dueño. Los tokens se guardan cifrados y nunca se exponen.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Añadir key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir key del sistema</DialogTitle>
              <DialogDescription>
                El token se cifra (AES-256-GCM) antes de guardarse.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Select
                  value={form.providerAi}
                  onValueChange={(v: ProviderType) => setForm({ ...form, providerAi: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google (Gemini)</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="other">Otro (compatible OpenAI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Ej: Gemini principal"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  placeholder="gemini-2.5-flash"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                />
              </div>
              {form.providerAi === "other" && (
                <div className="space-y-2">
                  <Label>URL del API</Label>
                  <Input
                    placeholder="https://api.example.com/v1"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridad (menor = preferida)</Label>
                  <Input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso</Label>
                  <Input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving || !form.name || !form.model || !form.token}
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pool ({keys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay keys configuradas. Añade al menos una para servir a usuarios sin clave propia.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Proveedor / Modelo</TableHead>
                  <TableHead className="text-right">Prio</TableHead>
                  <TableHead className="text-right">Peso</TableHead>
                  <TableHead className="text-right">Fallos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Activa</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="text-sm">
                      <span className="text-muted-foreground">{k.providerAi}</span> /{" "}
                      <span className="font-mono text-xs">{k.model}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{k.priority}</TableCell>
                    <TableCell className="text-right tabular-nums">{k.weight}</TableCell>
                    <TableCell className="text-right tabular-nums">{k.failureCount}</TableCell>
                    <TableCell>
                      {isCooling(k) ? (
                        <Badge variant="destructive">en cooldown</Badge>
                      ) : k.isActive ? (
                        <Badge variant="default">ok</Badge>
                      ) : (
                        <Badge variant="secondary">inactiva</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch checked={k.isActive} onCheckedChange={() => handleToggle(k)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleReset(k.id)}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar cooldown
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(k.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
