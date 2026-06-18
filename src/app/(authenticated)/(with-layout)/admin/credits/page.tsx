"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  listUsersWithBalances,
  adminGrantCredits,
  getUserLedger,
  type UserWithBalance,
} from "@/actions/admin/credits";
import { ArrowLeft, Loader2, Coins, ScrollText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Ledger = Awaited<ReturnType<typeof getUserLedger>>;

export default function AdminCreditsPage() {
  const [users, setUsers] = useState<UserWithBalance[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Grant dialog
  const [target, setTarget] = useState<UserWithBalance | null>(null);
  const [amount, setAmount] = useState(1000);
  const [expiring, setExpiring] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  // Ledger dialog
  const [ledgerUser, setLedgerUser] = useState<UserWithBalance | null>(null);
  const [ledger, setLedger] = useState<Ledger>([]);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      setUsers(await listUsersWithBalances(q));
    } catch {
      toast.error("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleGrant = async () => {
    if (!target || amount <= 0) return;
    if (expiring && !expiresAt) {
      toast.error("Indica una fecha de expiración para créditos que expiran.");
      return;
    }
    setSaving(true);
    try {
      await adminGrantCredits({
        userId: target.id,
        amount: Number(amount),
        expiring,
        expiresAt: expiring ? new Date(expiresAt).toISOString() : null,
      });
      setTarget(null);
      setExpiring(false);
      setExpiresAt("");
      await load(search);
      toast.success(`Otorgados ${amount} créditos.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo otorgar créditos.");
    } finally {
      setSaving(false);
    }
  };

  const openLedger = async (u: UserWithBalance) => {
    setLedgerUser(u);
    setLedger([]);
    try {
      setLedger(await getUserLedger(u.id));
    } catch {
      toast.error("No se pudo cargar el ledger.");
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
        <div>
          <h1 className="text-3xl font-bold">Créditos de usuarios</h1>
          <p className="text-muted-foreground">
            Asigna créditos a mano (stand-in de la pasarela) y revisa el ledger.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Buscar por email o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
        />
        <Button variant="outline" onClick={() => load(search)}>
          <Search className="mr-2 h-4 w-4" /> Buscar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios {loading && <Loader2 className="inline h-4 w-4 animate-spin" />}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Expiran</TableHead>
                <TableHead className="text-right">No expiran</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    {u.role === "admin" ? <Badge>admin</Badge> : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{u.expiringBalance}</TableCell>
                  <TableCell className="text-right tabular-nums">{u.nonExpiringBalance}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{u.total}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openLedger(u)} title="Ver ledger">
                        <ScrollText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setTarget(u); setAmount(1000); }}>
                        <Coins className="mr-1 h-4 w-4" /> Dar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Grant dialog */}
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Otorgar créditos</DialogTitle>
            <DialogDescription>{target?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>¿Expiran?</Label>
                <p className="text-xs text-muted-foreground">
                  Estilo suscripción (se gastan primero). Si no, pack que no expira.
                </p>
              </div>
              <Switch checked={expiring} onCheckedChange={setExpiring} />
            </div>
            {expiring && (
              <div className="space-y-2">
                <Label>Fecha de expiración</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleGrant} disabled={saving || amount <= 0}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}
              Otorgar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ledger dialog */}
      <Dialog open={!!ledgerUser} onOpenChange={(o) => !o && setLedgerUser(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ledger · {ledgerUser?.email}</DialogTitle>
            <DialogDescription>Movimientos más recientes (la verdad es el ledger).</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Bucket</TableHead>
                  <TableHead>Fuente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">
                      {new Date(t.createdAt).toLocaleString("es-ES")}
                    </TableCell>
                    <TableCell>{t.kind}</TableCell>
                    <TableCell className={`text-right tabular-nums ${t.amount < 0 ? "text-destructive" : "text-green-600"}`}>
                      {t.amount > 0 ? `+${t.amount}` : t.amount}
                    </TableCell>
                    <TableCell className="text-xs">{t.bucket}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.source}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
