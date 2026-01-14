"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createResume } from "@/actions/resume";
import { useSession } from "@/lib/auth-client";

function NewResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAIMode = searchParams.get("ai") === "true";

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Basic resume form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // AI generation form state
  const [prompt, setPrompt] = useState("");
  const [jobOfferText, setJobOfferText] = useState("");
  const [jobOfferLink, setJobOfferLink] = useState("");

  const handleCreateBasicResume = async () => {
    if (!title.trim() || !session?.user?.id) return;

    setIsLoading(true);
    try {
      const newResume = await createResume({
        userId: session.user.id,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/resume/${newResume.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!title.trim() || !session?.user?.id || (!jobOfferText.trim() && !jobOfferLink.trim())) return;

    setIsLoading(true);
    try {
      // Create resume first
      const newResume = await createResume({
        userId: session.user.id,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      // TODO: Call AI generation API with jobOfferText/jobOfferLink and prompt
      // For now, just navigate to the new resume
      router.push(`/resume/${newResume.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/resumes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear nuevo CV</h1>
          <p className="text-muted-foreground">
            Crea un CV desde cero o genera uno con IA
          </p>
        </div>
      </div>

      <Tabs defaultValue={isAIMode ? "ai" : "manual"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">
            <FileText className="mr-2 h-4 w-4" />
            Crear manualmente
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="mr-2 h-4 w-4" />
            Generar con IA
          </TabsTrigger>
        </TabsList>

        {/* Manual Creation */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Dale un nombre y descripción a tu nuevo CV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del CV *</Label>
                <Input
                  id="title"
                  placeholder="Ej: CV Desarrollador Full Stack"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Ej: Para ofertas de desarrollo web con React y Node.js"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/resumes">Cancelar</Link>
            </Button>
            <Button
              onClick={handleCreateBasicResume}
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Crear CV
            </Button>
          </div>
        </TabsContent>

        {/* AI Generation */}
        <TabsContent value="ai" className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Información básica</CardTitle>
                <CardDescription>
                  Primero, dale un nombre a tu CV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-title">Título del CV *</Label>
                  <Input
                    id="ai-title"
                    placeholder="Ej: CV para Google - Software Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-description">Descripción (opcional)</Label>
                  <Textarea
                    id="ai-description"
                    placeholder="Notas adicionales sobre este CV"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Oferta de trabajo</CardTitle>
                <CardDescription>
                  Proporciona la oferta de trabajo para que la IA pueda
                  personalizar tu CV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="job-link">Link a la oferta (opcional)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="job-link"
                      placeholder="https://linkedin.com/jobs/..."
                      value={jobOfferLink}
                      onChange={(e) => setJobOfferLink(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      O pega el texto
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-text">
                    Texto de la oferta de trabajo
                  </Label>
                  <Textarea
                    id="job-text"
                    placeholder="Pega aquí el texto de la oferta de trabajo..."
                    value={jobOfferText}
                    onChange={(e) => setJobOfferText(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-images">
                    Imágenes de la oferta (opcional)
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="job-images"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Arrastra imágenes o haz clic para subir
                        </p>
                      </div>
                      <input
                        id="job-images"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Instrucciones adicionales (opcional)</CardTitle>
                <CardDescription>
                  Proporciona instrucciones adicionales para la IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt adicional</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ej: Enfatiza mi experiencia en React y TypeScript. Usa un tono profesional pero cercano..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/resumes">Cancelar</Link>
            </Button>
            <Button
              onClick={handleGenerateWithAI}
              disabled={
                isLoading ||
                !title.trim() ||
                (!jobOfferText.trim() && !jobOfferLink.trim())
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generar con IA
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NewResumePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <NewResumeContent />
    </Suspense>
  );
}
