"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { listPlans, createPlan, updatePlan, deletePlan } from "@/actions/admin/plans";
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

type PlanRow = Awaited<ReturnType<typeof listPlans>>[number];

const emptyForm = {
  name: "",
  description: "",
  monthlyCredits: 1000,
  priceCents: 500,
  currency: "USD",
};

export default function AdminPlansPage() {
  const [rows, setRows] = useState<PlanRow[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      setRows(await listPlans());
    } catch {
      toast.error("No se pudieron cargar los planes.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await createPlan({
        name: form.name,
        description: form.description || undefined,
        monthlyCredits: Number(form.monthlyCredits),
        priceCents: Number(form.priceCents),
        currency: form.currency,
      });
      setForm(emptyForm);
      setOpen(false);
      await load();
      toast.success("Plan creado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r: PlanRow) => {
    setRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, isActive: !p.isActive } : p)));
    try {
      await updatePlan(r.id, { isActive: !r.isActive });
    } catch {
      toast.error("No se pudo actualizar.");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    setRows((prev) => prev.filter((p) => p.id !== id));
    try {
      await deletePlan(id);
    } catch {
      toast.error("No se pudo eliminar (¿tiene suscripciones?).");
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
          <h1 className="text-3xl font-bold">Planes</h1>
          <p className="text-muted-foreground">
            Bolsas mensuales de créditos. El precio es solo display hasta conectar la pasarela.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Añadir plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir plan</DialogTitle>
              <DialogDescription>Define la bolsa mensual de créditos.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  placeholder="Pro"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  placeholder="Para uso intensivo"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Créditos/mes</Label>
                  <Input
                    type="number"
                    value={form.monthlyCredits}
                    onChange={(e) => setForm({ ...form, monthlyCredits: Number(e.target.value) })}
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
          <CardTitle>Planes ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin planes configurados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Créditos/mes</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Activo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.monthlyCredits}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(r.priceCents / 100).toFixed(2)} {r.currency}
                    </TableCell>
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
