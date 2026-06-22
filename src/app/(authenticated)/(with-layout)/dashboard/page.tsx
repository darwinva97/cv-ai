import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FileText, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getResumesWithVersions } from "@/actions/resume";
import { getSessionUser } from "@/lib/auth-helpers";

/** Relative time in Spanish from a past date. */
function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "hace un momento";
  const steps: Array<[number, string, string]> = [
    [60, "minuto", "minutos"],
    [24, "hora", "horas"],
    [30, "día", "días"],
    [12, "mes", "meses"],
  ];
  let value = minutes;
  for (const [size, singular, plural] of steps) {
    if (value < size) return `hace ${value} ${value === 1 ? singular : plural}`;
    value = Math.floor(value / size);
  }
  return `hace ${value} ${value === 1 ? "año" : "años"}`;
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const resumes = await getResumesWithVersions(user.id);

  // ---- Métricas reales ----
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const allVersions = resumes.flatMap((r) => r.versions);
  const totalCVs = resumes.length;
  const totalVersions = allVersions.length;
  const aiVersions = allVersions.filter((v) => v.ai != null).length;
  const aiPct = totalVersions ? Math.round((aiVersions / totalVersions) * 100) : 0;

  const cvsThisMonth = resumes.filter(
    (r) => new Date(r.createdAt) >= startOfMonth
  ).length;
  const versionsThisMonth = allVersions.filter(
    (v) => new Date(v.createdAt) >= startOfMonth
  ).length;

  const stats = [
    {
      title: "Total CVs",
      value: totalCVs,
      icon: FileText,
      trend: cvsThisMonth > 0 ? `+${cvsThisMonth} este mes` : "CVs creados",
    },
    {
      title: "Versiones",
      value: totalVersions,
      icon: TrendingUp,
      trend:
        versionsThisMonth > 0
          ? `+${versionsThisMonth} este mes`
          : "Versiones totales",
    },
    {
      title: "Generados con IA",
      value: aiVersions,
      icon: Sparkles,
      trend: `${aiPct}% del total`,
    },
  ];

  // ---- CVs recientes (los 6 más nuevos, ya ordenados por createdAt desc) ----
  const recentResumes = resumes.slice(0, 6).map((r) => {
    const latest = r.versions[0]; // versions vienen ordenadas desc
    const lastDate = latest?.createdAt ?? r.createdAt;
    return {
      id: r.id,
      title: r.title,
      description: r.description || "Sin descripción",
      versionsCount: r.versions.length,
      lastUpdated: timeAgo(new Date(lastDate)),
      isAIGenerated: r.versions.some((v) => v.ai != null),
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta. Aquí tienes un resumen de tus CVs.
          </p>
        </div>
        <Button asChild>
          <Link href="/resumes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo CV
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Resumes */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">CVs Recientes</h2>
          {recentResumes.length > 0 && (
            <Button variant="ghost" asChild>
              <Link href="/resumes">Ver todos</Link>
            </Button>
          )}
        </div>

        {recentResumes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aún no tienes CVs</CardTitle>
              <CardDescription>
                Crea tu primer CV desde cero o genéralo con IA a partir de una
                oferta de trabajo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/resumes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear mi primer CV
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentResumes.map((resume) => (
              <Link key={resume.id} href={`/resume/${resume.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {resume.title}
                          {resume.isAIGenerated && (
                            <Sparkles className="h-4 w-4 text-primary" />
                          )}
                        </CardTitle>
                        <CardDescription>{resume.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {resume.versionsCount}{" "}
                        {resume.versionsCount === 1 ? "versión" : "versiones"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {resume.lastUpdated}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription>
            Crea un nuevo CV o genera uno con IA basado en una oferta de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/resumes/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear CV desde cero
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/resumes/new?ai=true">
              <Sparkles className="mr-2 h-4 w-4" />
              Generar con IA
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
