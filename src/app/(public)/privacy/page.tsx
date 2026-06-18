import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad · CV AI",
  description:
    "Cómo CV AI recopila, usa, comparte y protege tus datos personales.",
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

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold">Política de Privacidad</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: {LAST_UPDATED}
        </p>

        <div className="mt-8 space-y-8">
          <Section title="1. Quiénes somos">
            <p>
              CV AI (&quot;el Servicio&quot;, &quot;nosotros&quot;) es una aplicación web que
              ayuda a crear y optimizar currículums (CVs) con asistencia de inteligencia
              artificial. Esta política explica qué datos personales tratamos, con qué
              fines y cómo los protegemos. El responsable del tratamiento es el operador
              de CV AI, contactable en{" "}
              <a className="underline hover:text-primary" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="2. Datos que recopilamos">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Datos de cuenta.</strong> Al registrarte con email y contraseña,
                guardamos tu nombre, correo electrónico y una contraseña cifrada (hash).
              </li>
              <li>
                <strong>Inicio de sesión con Google.</strong> Si usas &quot;Continuar con
                Google&quot;, recibimos de Google tu nombre, dirección de correo y foto de
                perfil (avatar), únicamente para crear y autenticar tu cuenta. No accedemos
                a tu Gmail, contactos ni a otros datos de tu cuenta de Google.
              </li>
              <li>
                <strong>Contenido de tus CVs.</strong> La información que ingresas o subes
                (datos personales del CV, experiencia, educación, habilidades, ofertas de
                trabajo e instrucciones para la IA).
              </li>
              <li>
                <strong>Claves de API de IA (opcional).</strong> Si configuras tu propia
                clave de un proveedor de IA, la almacenamos cifrada y la usamos solo para
                ejecutar tus generaciones.
              </li>
              <li>
                <strong>Datos de uso y facturación.</strong> Registros de generaciones con
                IA (modelo, tokens consumidos, créditos) para medir el consumo y gestionar
                créditos/suscripciones.
              </li>
              <li>
                <strong>Datos técnicos.</strong> Una cookie de sesión necesaria para
                mantenerte autenticado, y registros básicos del servidor (p. ej. dirección
                IP, agente de usuario) por seguridad y diagnóstico.
              </li>
            </ul>
          </Section>

          <Section title="3. Cómo usamos tus datos">
            <ul className="list-disc space-y-2 pl-5">
              <li>Crear y administrar tu cuenta y autenticarte.</li>
              <li>Prestar el servicio: generar y optimizar tus CVs con IA.</li>
              <li>Medir el consumo de IA y gestionar créditos, planes y suscripciones.</li>
              <li>Proteger el servicio frente a abusos, fraude y fallos de seguridad.</li>
              <li>Cumplir obligaciones legales aplicables.</li>
            </ul>
            <p>
              No vendemos tus datos personales ni los usamos para publicidad de terceros.
            </p>
          </Section>

          <Section title="4. Inteligencia artificial y proveedores">
            <p>
              Para generar contenido, el texto de tu CV y tus instrucciones se envían al
              proveedor de IA que corresponda (por ejemplo Google Gemini, OpenAI o
              Anthropic), ya sea mediante una clave del sistema o tu propia clave. Estos
              proveedores procesan ese contenido para devolver la respuesta. Te
              recomendamos no incluir datos sensibles que no quieras procesar. El uso de
              cada proveedor se rige también por sus propias políticas de privacidad.
            </p>
          </Section>

          <Section title="5. Con quién compartimos datos (encargados)">
            <p>
              Compartimos datos solo con proveedores que nos prestan infraestructura,
              actuando como encargados del tratamiento:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Google</strong> — autenticación (OAuth) cuando inicias sesión con
                Google.
              </li>
              <li>
                <strong>Proveedores de IA</strong> (Google, OpenAI, Anthropic u otros) —
                generación de contenido.
              </li>
              <li>
                <strong>Vercel</strong> — alojamiento de la aplicación.
              </li>
              <li>
                <strong>Neon</strong> — base de datos (PostgreSQL) donde se almacenan tus
                datos.
              </li>
            </ul>
          </Section>

          <Section title="6. Seguridad">
            <p>
              Aplicamos medidas técnicas razonables: conexiones cifradas (HTTPS),
              contraseñas almacenadas como hash y cifrado AES-256-GCM para las claves de
              API. Las claves del sistema nunca se exponen al cliente. Ningún sistema es
              100% infalible, pero trabajamos para proteger tu información.
            </p>
          </Section>

          <Section title="7. Conservación">
            <p>
              Conservamos tus datos mientras tu cuenta esté activa. Si solicitas la
              eliminación de tu cuenta, borramos tus datos personales asociados, salvo lo
              que debamos conservar por motivos legales o de seguridad.
            </p>
          </Section>

          <Section title="8. Tus derechos">
            <p>
              Puedes solicitar acceder, corregir, exportar o eliminar tus datos
              personales, así como retirar tu consentimiento. Para ejercerlos, escríbenos a{" "}
              <a className="underline hover:text-primary" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="9. Cookies">
            <p>
              Usamos una cookie estrictamente necesaria para mantener tu sesión iniciada.
              No usamos cookies de publicidad ni de seguimiento de terceros.
            </p>
          </Section>

          <Section title="10. Cambios en esta política">
            <p>
              Podemos actualizar esta política. Publicaremos la versión vigente en esta
              página con su fecha de última actualización.
            </p>
          </Section>

          <Section title="11. Contacto">
            <p>
              ¿Preguntas sobre privacidad? Escríbenos a{" "}
              <a className="underline hover:text-primary" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          <Link href="/terms" className="underline hover:text-primary">
            Términos de Servicio
          </Link>
        </div>
      </div>
    </div>
  );
}
