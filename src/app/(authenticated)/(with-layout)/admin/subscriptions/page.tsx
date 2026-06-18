"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  listSubscriptions,
  assignSubscription,
  cancelSubscription,
} from "@/actions/admin/subscriptions";
import { listPlans } from "@/actions/admin/plans";
import { listUsersWithBalances, type UserWithBalance } from "@/actions/admin/credits";
import { ArrowLeft, Loader2, Plus, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

type SubRow = Awaited<ReturnType<typeof listSubscriptions>>[number];
type PlanRow = Awaited<ReturnType<typeof listPlans>>[number];

export default function AdminSubscriptionsPage() {
  const [rows, setRows] = useState<SubRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [planId, setPlanId] = useState("");
  const [periodDays, setPeriodDays] = useState(30);

  const load = useCallback(async () => {
    try {
      const [subs, pl, us] = await Promise.all([
        listSubscriptions(),
        listPlans(),
        listUsersWithBalances(),
      ]);
      setRows(subs);
      setPlans(pl);
      setUsers(us);
    } catch {
      toast.error("No se pudieron cargar las suscripciones.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssign = async () => {
    if (!userId || !planId) return;
    setSaving(true);
    try {
      await assignSubscription({ userId, planId, periodDays: Number(periodDays) });
      setOpen(false);
      setUserId("");
      setPlanId("");
      await load();
      toast.success("Suscripción asignada y créditos otorgados.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo asignar la suscripción.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelSubscription(id, true);
      await load();
      toast.success("Suscripción cancelada.");
    } catch {
      toast.error("No se pudo cancelar.");
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
          <h1 className="text-3xl font-bold">Suscripciones</h1>
          <p className="text-muted-foreground">
            Asignar otorga la bolsa mensual del plan como créditos que expiran al final del período.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={plans.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Asignar suscripción
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Asignar suscripción</DialogTitle>
              <DialogDescription>Crea el período y otorga los créditos del plan.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Usuario</Label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} · {p.monthlyCredits} cr/mes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duración del período (días)</Label>
                <Input
                  type="number"
                  value={periodDays}
                  onChange={(e) => setPeriodDays(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAssign} disabled={saving || !userId || !planId}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Asignar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suscripciones ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin suscripciones.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Período termina</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{s.userEmail}</TableCell>
                    <TableCell>{s.planName}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(s.currentPeriodEnd).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.status === "active" && (
                        <Button variant="ghost" size="sm" onClick={() => handleCancel(s.id)}>
                          <Ban className="mr-1 h-4 w-4 text-destructive" /> Cancelar
                        </Button>
                      )}
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
