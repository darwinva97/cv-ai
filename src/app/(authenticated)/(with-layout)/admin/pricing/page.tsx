"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  listPricing,
  createPricing,
  updatePricing,
  deletePricing,
} from "@/actions/admin/pricing";
import type { ProviderType } from "@/lib/ai-generate";
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

type PricingRow = Awaited<ReturnType<typeof listPricing>>[number];

const emptyForm = {
  providerAi: "google" as ProviderType,
  model: "gemini-2.5-flash",
  baseCredits: 5,
  inputCreditsPer1k: 1,
  outputCreditsPer1k: 4,
};

export default function AdminPricingPage() {
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try {
      setRows(await listPricing());
    } catch {
      toast.error("No se pudieron cargar las tarifas.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.model) return;
    setSaving(true);
    try {
      await createPricing({
        providerAi: form.providerAi,
        model: form.model,
        baseCredits: Number(form.baseCredits),
        inputCreditsPer1k: Number(form.inputCreditsPer1k),
        outputCreditsPer1k: Number(form.outputCreditsPer1k),
      });
      setForm(emptyForm);
      setOpen(false);
      await load();
      toast.success("Tarifa creada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la tarifa (¿modelo duplicado?).");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r: PricingRow) => {
    setRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, isActive: !p.isActive } : p)));
    try {
      await updatePricing(r.id, { isActive: !r.isActive });
    } catch {
      toast.error("No se pudo actualizar.");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    setRows((prev) => prev.filter((p) => p.id !== id));
    try {
      await deletePricing(id);
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
          <h1 className="text-3xl font-bold">Tarifas por modelo</h1>
          <p className="text-muted-foreground">
            Costo en créditos: base + ⌈in/1k⌉·tarifa_in + ⌈out/1k⌉·tarifa_out.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Añadir tarifa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Añadir tarifa</DialogTitle>
              <DialogDescription>Una por cada (proveedor, modelo).</DialogDescription>
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
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  placeholder="gemini-2.5-flash"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Base</Label>
                  <Input
                    type="number"
                    value={form.baseCredits}
                    onChange={(e) => setForm({ ...form, baseCredits: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>In /1k</Label>
                  <Input
                    type="number"
                    value={form.inputCreditsPer1k}
                    onChange={(e) => setForm({ ...form, inputCreditsPer1k: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Out /1k</Label>
                  <Input
                    type="number"
                    value={form.outputCreditsPer1k}
                    onChange={(e) => setForm({ ...form, outputCreditsPer1k: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={saving || !form.model}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tarifas ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin tarifas. El modelo del sistema necesita una tarifa para poder cobrar créditos.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">In /1k</TableHead>
                  <TableHead className="text-right">Out /1k</TableHead>
                  <TableHead className="text-right">Activa</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.providerAi}</TableCell>
                    <TableCell className="font-mono text-xs">{r.model}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.baseCredits}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.inputCreditsPer1k}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.outputCreditsPer1k}</TableCell>
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
