import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GitBranch,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "Generación con IA",
    description:
      "Crea CVs personalizados para cada oferta de trabajo usando inteligencia artificial avanzada.",
  },
  {
    icon: Target,
    title: "Optimizado para ATS",
    description:
      "Tus CVs están optimizados para pasar los sistemas de seguimiento de candidatos.",
  },
  {
    icon: GitBranch,
    title: "Sistema de versiones",
    description:
      "Mantén múltiples versiones de tu CV para diferentes tipos de ofertas.",
  },
  {
    icon: Zap,
    title: "Rápido y sencillo",
    description:
      "Genera un CV profesional en minutos, no en horas. Solo pega la oferta de trabajo.",
  },
  {
    icon: FileText,
    title: "Formato profesional",
    description:
      "Diseños limpios y profesionales que destacan tu experiencia.",
  },
  {
    icon: CheckCircle2,
    title: "Usa tu propia IA",
    description:
      "Conecta tu API key de OpenAI, Anthropic u otros proveedores.",
  },
];

const steps = [
  {
    step: 1,
    title: "Crea tu perfil base",
    description:
      "Añade tu información profesional: experiencia, educación, habilidades y proyectos.",
  },
  {
    step: 2,
    title: "Pega la oferta de trabajo",
    description:
      "Copia y pega la descripción del puesto al que quieres aplicar.",
  },
  {
    step: 3,
    title: "Genera tu CV personalizado",
    description:
      "La IA analiza la oferta y optimiza tu CV para destacar las habilidades relevantes.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-zinc-950/80 dark:border-zinc-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CV AI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Empezar gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-sm dark:bg-zinc-900 dark:border-zinc-800">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Potenciado por Inteligencia Artificial</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Crea el CV perfecto para{" "}
            <span className="text-primary">cada oferta de trabajo</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Genera currículums profesionales personalizados en minutos. La IA
            analiza cada oferta de trabajo y optimiza tu CV para destacar las
            habilidades que buscan los reclutadores.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/probar">
                Probar gratis (sin registro)
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#como-funciona">Ver cómo funciona</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Sube tu CV (PDF o imagen), elige el diseño y optimízalo para una oferta — sin crear cuenta.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Todo lo que necesitas</h2>
          <p className="mt-4 text-muted-foreground">
            Herramientas potentes para crear CVs que destacan
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="container mx-auto px-4 py-24 scroll-mt-16"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">¿Cómo funciona?</h2>
          <p className="mt-4 text-muted-foreground">
            Tres simples pasos para conseguir tu próximo trabajo
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
              {item.step < 3 && (
                <div className="absolute left-1/2 top-8 hidden w-full -translate-x-1/2 md:block">
                  <ArrowRight className="ml-[calc(50%+3rem)] h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <Sparkles className="h-12 w-12" />
            <h2 className="text-3xl font-bold">
              Empieza a crear CVs que consiguen entrevistas
            </h2>
            <p className="max-w-xl text-primary-foreground/80">
              Únete a miles de profesionales que ya usan CV AI para destacar en
              sus procesos de selección.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-4"
              asChild
            >
              <Link href="/login">
                Crear mi CV gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 dark:border-zinc-800">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">CV AI</span>
          </div>
          <p>© 2026 CV AI. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-primary">
              Términos
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
