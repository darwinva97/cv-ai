import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = {
  title: "Términos de Servicio · CV AI",
  description: "Condiciones de uso del servicio CV AI.",
};

const LAST_UPDATED = "18 de junio de 2026";
const CONTACT_EMAIL = "darwin.sva.97@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold">CV AI</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold">Términos de Servicio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: {LAST_UPDATED}
        </p>

        <div className="mt-8 space-y-8">
          <Section title="1. Aceptación">
            <p>
              Al crear una cuenta o usar CV AI (&quot;el Servicio&quot;) aceptas estos
              Términos de Servicio y nuestra{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                Política de Privacidad
              </Link>
              . Si no estás de acuerdo, no uses el Servicio.
            </p>
          </Section>

          <Section title="2. Descripción del servicio">
            <p>
              CV AI permite crear, editar y optimizar currículums con ayuda de modelos de
              inteligencia artificial. El contenido generado por IA son sugerencias que
              debes revisar; tú decides qué guardar y publicar.
            </p>
          </Section>

          <Section title="3. Tu cuenta">
            <p>
              Eres responsable de mantener la confidencialidad de tus credenciales y de la
              actividad realizada desde tu cuenta. Debes proporcionar información veraz y
              tener la edad mínima legal en tu jurisdicción para celebrar este acuerdo.
            </p>
          </Section>

          <Section title="4. Uso aceptable">
            <ul className="list-disc space-y-2 pl-5">
              <li>No uses el Servicio para fines ilícitos ni para infringir derechos de terceros.</li>
              <li>No subas contenido falso, difamatorio o que no tengas derecho a usar.</li>
              <li>No intentes vulnerar, sobrecargar o eludir las medidas de seguridad.</li>
              <li>No abuses de las funciones de IA ni de las claves del sistema.</li>
            </ul>
          </Section>

          <Section title="5. Contenido del usuario">
            <p>
              Conservas la titularidad del contenido que ingresas. Nos otorgas una licencia
              limitada para procesar y almacenar dicho contenido con el único fin de
              prestarte el Servicio (incluido su envío a proveedores de IA para generar
              resultados). Eres responsable de la exactitud y legalidad de lo que subes.
            </p>
          </Section>

          <Section title="6. Contenido generado por IA">
            <p>
              Los resultados de la IA pueden contener errores o imprecisiones. No
              garantizamos su exactitud, idoneidad ni resultados de empleo. Revisa y edita
              siempre el contenido antes de usarlo.
            </p>
          </Section>

          <Section title="7. Créditos, planes y pagos">
            <p>
              Algunas funciones de IA consumen créditos. Los créditos de suscripción pueden
              caducar al final de su período; los créditos comprados como paquete no caducan,
              salvo que se indique lo contrario. Mientras no haya una pasarela de pago activa,
              los créditos se asignan manualmente y no constituyen una obligación de compra.
              Cuando uses tu propia clave de IA, esas generaciones no consumen créditos.
            </p>
          </Section>

          <Section title="8. Disponibilidad">
            <p>
              El Servicio se ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;.
              Podemos modificar, suspender o discontinuar funciones en cualquier momento.
            </p>
          </Section>

          <Section title="9. Limitación de responsabilidad">
            <p>
              En la máxima medida permitida por la ley, no seremos responsables por daños
              indirectos, incidentales o consecuentes derivados del uso del Servicio,
              incluidos los resultados generados por IA.
            </p>
          </Section>

          <Section title="10. Terminación">
            <p>
              Puedes dejar de usar el Servicio y solicitar la eliminación de tu cuenta en
              cualquier momento. Podemos suspender o cerrar cuentas que incumplan estos
              Términos.
            </p>
          </Section>

          <Section title="11. Cambios en los términos">
            <p>
              Podemos actualizar estos Términos. La versión vigente se publicará en esta
              página con su fecha de última actualización; el uso continuado implica su
              aceptación.
            </p>
          </Section>

          <Section title="12. Contacto">
            <p>
              Para consultas sobre estos Términos, escríbenos a{" "}
              <a className="underline hover:text-primary" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          <Link href="/privacy" className="underline hover:text-primary">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  );
}
