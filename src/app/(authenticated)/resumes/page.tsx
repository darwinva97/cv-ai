import Link from "next/link";
import {
  Plus,
  FileText,
  Clock,
  Sparkles,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Datos de ejemplo - en producción vendrían de la DB
const resumes = [
  {
    id: "1",
    title: "CV Desarrollador Full Stack",
    slug: "dev-fullstack",
    description: "Para ofertas de desarrollo web",
    versionsCount: 5,
    lastUpdated: "2026-01-07",
    isPublic: true,
    currentVersion: "v1.3",
  },
  {
    id: "2",
    title: "CV Data Scientist",
    slug: "data-scientist",
    description: "Enfocado en machine learning y análisis de datos",
    versionsCount: 3,
    lastUpdated: "2026-01-06",
    isPublic: false,
    currentVersion: "v1.1",
  },
  {
    id: "3",
    title: "CV General",
    slug: null,
    description: "Mi CV base para cualquier oferta",
    versionsCount: 8,
    lastUpdated: "2026-01-04",
    isPublic: true,
    currentVersion: "v2.0",
  },
  {
    id: "4",
    title: "CV Backend Engineer",
    slug: "backend-eng",
    description: "Especializado en Node.js y bases de datos",
    versionsCount: 2,
    lastUpdated: "2026-01-03",
    isPublic: false,
    currentVersion: "v1.0",
  },
];

export default function ResumesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis CVs</h1>
          <p className="text-muted-foreground">
            Gestiona todos tus currículums en un solo lugar
          </p>
        </div>
        <Button asChild>
          <Link href="/resumes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo CV
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar CVs..." className="pl-10" />
        </div>
      </div>

      {/* Resumes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id} className="group relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {resume.title}
                  </CardTitle>
                  <CardDescription>{resume.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/resume/${resume.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    {resume.slug && (
                      <DropdownMenuItem asChild>
                        <Link href={`/resume-result/${resume.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver público
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{resume.currentVersion}</Badge>
                <Badge variant="outline">
                  {resume.versionsCount} versiones
                </Badge>
                {resume.isPublic && (
                  <Badge variant="default">
                    <Eye className="mr-1 h-3 w-3" />
                    Público
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(resume.lastUpdated).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/resume/${resume.id}`}>Abrir</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* New Resume Card */}
        <Link href="/resumes/new">
          <Card className="flex h-full min-h-[200px] cursor-pointer items-center justify-center border-dashed transition-colors hover:border-primary hover:bg-primary/5">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Plus className="h-8 w-8" />
              <span>Crear nuevo CV</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Empty state (cuando no hay CVs) */}
      {resumes.length === 0 && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No tienes CVs todavía
            </h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer CV o genera uno con IA basado en una oferta de
              trabajo
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/resumes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear CV
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/resumes/new?ai=true">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generar con IA
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
