import Link from "next/link";
import {
  KeyRound,
  Tags,
  Package,
  Coins,
  CreditCard,
  Activity,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    href: "/admin/system-keys",
    title: "Keys del sistema",
    description: "Pool de API keys del dueño (cifradas), por modelo, con failover.",
    icon: KeyRound,
  },
  {
    href: "/admin/pricing",
    title: "Tarifas por modelo",
    description: "Costo en créditos: base + componente por tokens (in/out).",
    icon: Tags,
  },
  {
    href: "/admin/plans",
    title: "Planes",
    description: "Bolsas mensuales de créditos para suscripciones.",
    icon: Package,
  },
  {
    href: "/admin/credits",
    title: "Créditos de usuarios",
    description: "Asignar créditos a mano y revisar saldos/ledger.",
    icon: Coins,
  },
  {
    href: "/admin/subscriptions",
    title: "Suscripciones",
    description: "Asignar y gestionar suscripciones de usuarios.",
    icon: CreditCard,
  },
  {
    href: "/admin/usage",
    title: "Consumo de IA",
    description: "Auditoría de generaciones, tokens y créditos cobrados.",
    icon: Activity,
  },
];

export default function AdminHome() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Administración</h1>
        <p className="text-muted-foreground">
          Motor de monetización: keys del sistema, tarifas, planes y créditos.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <s.icon className="h-5 w-5 text-primary" />
                  {s.title}
                </CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
