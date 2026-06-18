"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { listUsage } from "@/actions/admin/usage";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UsageRow = Awaited<ReturnType<typeof listUsage>>[number];

export default function AdminUsagePage() {
  const [rows, setRows] = useState<UsageRow[]>([]);

  const load = useCallback(async () => {
    try {
      setRows(await listUsage());
    } catch {
      toast.error("No se pudo cargar el consumo.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    listUsage()
      .then((r) => {
        if (active) setRows(r);
      })
      .catch(() => toast.error("No se pudo cargar el consumo."));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Consumo de IA</h1>
          <p className="text-muted-foreground">
            Auditoría de generaciones: tokens reales y créditos cobrados.
          </p>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refrescar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generaciones recientes ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay generaciones registradas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead className="text-right">In/Out</TableHead>
                  <TableHead className="text-right">Créditos</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-xs">
                      {new Date(u.createdAt).toLocaleString("es-ES")}
                    </TableCell>
                    <TableCell className="text-sm">{u.userEmail}</TableCell>
                    <TableCell className="font-mono text-xs">{u.model}</TableCell>
                    <TableCell>
                      <Badge variant={u.source === "user_key" ? "secondary" : "outline"}>
                        {u.source === "user_key" ? "Tu clave" : "Sistema"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.inputTokens}/{u.outputTokens}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{u.creditsCharged}</TableCell>
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
