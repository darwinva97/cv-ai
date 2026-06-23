import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { FreeGenerator } from "./_components/free-generator";

export const metadata: Metadata = {
  title: "Prueba gratis — genera tu CV con IA",
  description:
    "Sube tu CV actual (PDF o imagen), elige un diseño y optimízalo para una oferta de trabajo con IA. Gratis y sin registro.",
};

export default function ProbarPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white/70 backdrop-blur dark:bg-zinc-950/70 dark:border-zinc-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            CV AI
          </Link>
          <Link href="/login" className="text-sm text-primary hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="text-3xl font-bold">Genera tu CV gratis</h1>
          <p className="mt-2 text-muted-foreground">
            Sube tu CV actual (PDF o imagen), opcionalmente pega una oferta de
            trabajo, y la IA lo reescribe y elige un diseño. Sin registro.
          </p>
        </div>
        <FreeGenerator />
      </main>
    </div>
  );
}
