"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  getBillingOverview,
  startSubscriptionCheckout,
  startCreditCheckout,
  type BillingOverview,
} from "@/actions/billing";
import {
  ArrowLeft,
  CreditCard,
  Coins,
  Sparkles,
  Clock,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BillingPage() {
  const [data, setData] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await getBillingOverview());
    } catch (err) {
      console.error("Error loading billing overview:", err);
      toast.error("No se pudo cargar la información de facturación.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubscribe = async (planId: string) => {
    try {
      const res = await startSubscriptionCheckout(planId);
      if (res.stub || !res.url) {
        toast.info("Las suscripciones estarán disponibles próximamente.");
        return;
      }
      window.location.href = res.url;
    } catch {
      toast.error("No se pudo iniciar la suscripción.");
    }
  };

  const handleBuyPack = async (packId: string) => {
    try {
      const res = await startCreditCheckout(packId);
      if (res.stub || !res.url) {
        toast.info("La compra de créditos estará disponible próximamente.");
        return;
      }
      window.location.href = res.url;
    } catch {
      toast.error("No se pudo iniciar la compra.");
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
          <h1 className="text-3xl font-bold">Facturación</h1>
          <p className="text-muted-foreground">
            Tu saldo de créditos, suscripción y consumo de IA
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Coins className="h-4 w-4" /> Saldo total
            </CardDescription>
            <CardTitle className="text-3xl">
              {loading ? "—" : data?.summary.total ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            créditos disponibles
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> De suscripción (expiran)
            </CardDescription>
            <CardTitle className="text-3xl">
              {loading ? "—" : data?.summary.expiringBalance ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {data?.summary.nextExpiry
              ? `Próxima expiración: ${formatDate(data.summary.nextExpiry)}`
              : "Sin créditos que expiren"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Coins className="h-4 w-4" /> Comprados (no expiran)
            </CardDescription>
            <CardTitle className="text-3xl">
              {loading ? "—" : data?.summary.nonExpiringBalance ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            packs de pago por uso
          </CardContent>
        </Card>
      </div>

      {/* Subscription + CTAs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Suscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.subscription ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium">{data.subscription.planName}</span>
              <Badge variant={data.subscription.status === "active" ? "default" : "secondary"}>
                {data.subscription.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Renueva el {formatDate(data.subscription.currentPeriodEnd)}
                {data.subscription.cancelAtPeriodEnd && " · se cancelará al final del período"}
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tienes una suscripción activa.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {(data?.packs ?? []).map((pack) => (
              <Button key={pack.id} onClick={() => handleBuyPack(pack.id)}>
                <Coins className="mr-2 h-4 w-4" />
                {pack.name} · {pack.credits} cr · {(pack.priceCents / 100).toFixed(2)} {pack.currency}
              </Button>
            ))}
            {(data?.plans ?? []).map((p) => (
              <Button key={p.id} variant="outline" onClick={() => handleSubscribe(p.id)}>
                <Sparkles className="mr-2 h-4 w-4" />
                {p.name} · {p.monthlyCredits} cr/mes
              </Button>
            ))}
            <Button variant="ghost" asChild>
              <Link href="/settings/ai">
                <KeyRound className="mr-2 h-4 w-4" /> Usar tu propia API key (gratis)
              </Link>
            </Button>
          </div>
          {(data?.packs ?? []).length === 0 && (data?.plans ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no hay paquetes ni planes disponibles.
            </p>
          )}
          {data?.paymentsStubbed && (
            <p className="text-xs text-muted-foreground">
              Los pagos en línea estarán disponibles próximamente. Mientras tanto, un
              administrador puede asignarte créditos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Usage history */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de consumo</CardTitle>
          <CardDescription>Tus últimas generaciones con IA</CardDescription>
        </CardHeader>
        <CardContent>
          {(data?.usage ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no has generado con IA.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead className="text-right">Tokens (in/out)</TableHead>
                  <TableHead className="text-right">Créditos</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data!.usage.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="font-mono text-xs">{u.model}</TableCell>
                    <TableCell>
                      <Badge variant={u.source === "user_key" ? "secondary" : "outline"}>
                        {u.source === "user_key" ? "Tu clave" : "Sistema"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.inputTokens} / {u.outputTokens}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.creditsCharged}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.status === "success"
                            ? "default"
                            : u.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {u.status}
                      </Badge>
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
