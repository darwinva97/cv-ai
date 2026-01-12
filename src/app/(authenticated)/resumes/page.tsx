"use client";

import { useState, useEffect } from "react";
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
  LayoutGrid,
  Network,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeGraphView } from "@/components/resume-graph-view";
import { getResumesWithVersions } from "@/actions/resume";
import { useSession } from "@/lib/auth-client";

type ViewMode = "grid" | "graph";

export default function ResumesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    async function loadResumes() {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const data = await getResumesWithVersions(session.user.id);
        setResumes(data);
      } catch (error) {
        console.error("Error loading resumes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, [session?.user?.id]);

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

      {/* Search and View Mode Toggle */}
      <div className="flex items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar CVs..." className="pl-10" />
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Grilla
            </TabsTrigger>
            <TabsTrigger value="graph" className="gap-2">
              <Network className="h-4 w-4" />
              Gráfico
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Cargando CVs...</div>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
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
                      {resume.currentVersionId && (
                        <Badge variant="secondary">
                          v{resume.currentVersionId}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {resume.versions.length}{" "}
                        {resume.versions.length === 1 ? "versión" : "versiones"}
                      </Badge>
                      {resume.slug && (
                        <Badge variant="default">
                          <Eye className="mr-1 h-3 w-3" />
                          Público
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(resume.createdAt).toLocaleDateString("es-ES", {
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
          )}

          {/* Graph View */}
          {viewMode === "graph" && <ResumeGraphView resumes={resumes} />}

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
        </>
      )}
    </div>
  );
}
