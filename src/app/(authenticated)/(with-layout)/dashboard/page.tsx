import Link from "next/link";
import { Plus, FileText, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Datos de ejemplo - en producción vendrían de la DB
const stats = [
  {
    title: "Total CVs",
    value: "12",
    description: "CVs creados",
    icon: FileText,
    trend: "+2 este mes",
  },
  {
    title: "Versiones",
    value: "34",
    description: "Versiones totales",
    icon: TrendingUp,
    trend: "+8 este mes",
  },
  {
    title: "Generados con IA",
    value: "18",
    description: "Usando IA",
    icon: Sparkles,
    trend: "53% del total",
  },
];

const recentResumes = [
  {
    id: "1",
    title: "CV Desarrollador Full Stack",
    description: "Para ofertas de desarrollo web",
    versionsCount: 5,
    lastUpdated: "Hace 2 horas",
    isAIGenerated: true,
  },
  {
    id: "2",
    title: "CV Data Scientist",
    description: "Enfocado en machine learning",
    versionsCount: 3,
    lastUpdated: "Hace 1 día",
    isAIGenerated: true,
  },
  {
    id: "3",
    title: "CV General",
    description: "Mi CV base para cualquier oferta",
    versionsCount: 8,
    lastUpdated: "Hace 3 días",
    isAIGenerated: false,
  },
];

export default function DashboardPage() {
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
          <Button variant="ghost" asChild>
            <Link href="/resumes">Ver todos</Link>
          </Button>
        </div>
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
                    <span>{resume.versionsCount} versiones</span>
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
