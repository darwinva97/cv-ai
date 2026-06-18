"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  listCreditPacks,
  createCreditPack,
  updateCreditPack,
  deleteCreditPack,
} from "@/actions/admin/credit-packs";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PackRow = Awaited<ReturnType<typeof listCreditPacks>>[number];

const emptyForm = {
  name: "",
  description: "",
  credits: 1000,
  priceCents: 500,
  currency: "USD",
  externalId: "",
};

export default function AdminCreditPacksPage() {
  const [rows, setRows] = useState<PackRow[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      setRows(await listCreditPacks());
    } catch {
      toast.error("No se pudieron cargar los paquetes.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await createCreditPack({
        name: form.name,
        description: form.description || undefined,
        credits: Number(form.credits),
        priceCents: Number(form.priceCents),
        currency: form.currency,
        externalId: form.externalId || undefined,
      });
      setForm(emptyForm);
      setOpen(false);
      await load();
      toast.success("Paquete creado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el paquete.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r: PackRow) => {
    setRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, isActive: !p.isActive } : p)));
    try {
      await updateCreditPack(r.id, { isActive: !r.isActive });
    } catch {
      toast.error("No se pudo actualizar.");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    setRows((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteCreditPack(id);
    } catch {
      toast.error("No se pudo eliminar.");
      load();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Paquetes de créditos</h1>
          <p className="text-muted-foreground">
            Packs de pago por uso (no expiran). El &quot;LS variant id&quot; los conecta con Lemon Squeezy.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Añadir paquete
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir paquete</DialogTitle>
              <DialogDescription>Bundle de créditos que no expiran.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Pack 1.000"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Créditos</Label>
                  <Input
                    type="number"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio (¢)</Label>
                  <Input
                    type="number"
                    value={form.priceCents}
                    onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Input
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>LS variant id (opcional)</Label>
                <Input
                  placeholder="123456"
                  value={form.externalId}
                  onChange={(e) => setForm({ ...form, externalId: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving || !form.name}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paquetes ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin paquetes configurados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Créditos</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead>LS variant</TableHead>
                  <TableHead className="text-right">Activo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.credits}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(r.priceCents / 100).toFixed(2)} {r.currency}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{r.externalId ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Switch checked={r.isActive} onCheckedChange={() => handleToggle(r)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
