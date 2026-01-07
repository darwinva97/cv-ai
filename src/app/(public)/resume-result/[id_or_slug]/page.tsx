import { notFound } from "next/navigation";
import {
  Download,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Iconos de redes sociales
const socialIcons: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  github: Github,
  twitter: Twitter,
};

// Datos de ejemplo - en producción vendrían de la DB
const mockResumeData = {
  basics: {
    name: "Juan Pérez García",
    label: "Desarrollador Full Stack Senior",
    email: "juan@example.com",
    phone: "+34 612 345 678",
    url: "https://juanperez.dev",
    summary:
      "Desarrollador Full Stack con más de 5 años de experiencia especializado en React, Node.js y TypeScript. Apasionado por crear productos de alta calidad, con enfoque en la experiencia de usuario y las mejores prácticas de desarrollo. He liderado equipos de desarrollo y participado en proyectos desde su concepción hasta su lanzamiento.",
    location: {
      city: "Madrid",
      region: "Comunidad de Madrid",
      countryCode: "ES",
    },
  },
  profiles: [
    {
      network: "LinkedIn",
      username: "juanperez",
      url: "https://linkedin.com/in/juanperez",
    },
    {
      network: "GitHub",
      username: "juanperez",
      url: "https://github.com/juanperez",
    },
    {
      network: "Twitter",
      username: "juanperezdev",
      url: "https://twitter.com/juanperezdev",
    },
  ],
  work: [
    {
      name: "Tech Corp",
      position: "Senior Full Stack Developer",
      url: "https://techcorp.com",
      startDate: "2022-01",
      endDate: null,
      summary:
        "Liderazgo técnico en el desarrollo de aplicaciones web enterprise con React y Node.js. Responsable de la arquitectura frontend y la implementación de CI/CD.",
      highlights: [
        "Lideré la migración de JavaScript a TypeScript, mejorando la calidad del código en un 40%",
        "Implementé pipeline de CI/CD reduciendo el tiempo de deploy de 30min a 5min",
        "Mentoré a 4 desarrolladores junior",
        "Diseñé e implementé el sistema de autenticación con OAuth2",
      ],
    },
    {
      name: "StartupXYZ",
      position: "Full Stack Developer",
      url: "https://startupxyz.com",
      startDate: "2019-06",
      endDate: "2021-12",
      summary:
        "Desarrollo full stack del MVP y features principales de una plataforma SaaS de gestión de proyectos.",
      highlights: [
        "Desarrollé el producto desde cero hasta 10,000 usuarios activos",
        "Implementé sistema de pagos con Stripe",
        "Creé API RESTful consumida por aplicaciones web y móviles",
        "Optimicé queries de base de datos mejorando rendimiento en 60%",
      ],
    },
    {
      name: "Freelance",
      position: "Web Developer",
      startDate: "2017-01",
      endDate: "2019-05",
      summary:
        "Desarrollo de sitios web y aplicaciones para diversos clientes.",
      highlights: [
        "Más de 20 proyectos completados",
        "Desarrollo de e-commerce con WordPress y WooCommerce",
        "Creación de landing pages optimizadas para conversión",
      ],
    },
  ],
  education: [
    {
      institution: "Universidad Politécnica de Madrid",
      area: "Ingeniería Informática",
      studyType: "Grado",
      startDate: "2013-09",
      endDate: "2017-06",
      score: "Notable",
    },
    {
      institution: "Platzi",
      area: "Full Stack JavaScript",
      studyType: "Certificación",
      startDate: "2018-01",
      endDate: "2018-06",
    },
  ],
  skills: [
    {
      name: "Frontend",
      level: "Experto",
      keywords: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"],
    },
    {
      name: "Backend",
      level: "Avanzado",
      keywords: ["Node.js", "Express", "NestJS", "PostgreSQL", "MongoDB"],
    },
    {
      name: "DevOps",
      level: "Intermedio",
      keywords: ["Docker", "AWS", "CI/CD", "GitHub Actions", "Vercel"],
    },
    {
      name: "Otros",
      level: "Avanzado",
      keywords: ["Git", "Agile/Scrum", "Testing", "REST APIs", "GraphQL"],
    },
  ],
  languages: [
    { language: "Español", fluency: "Nativo" },
    { language: "Inglés", fluency: "C1 - Avanzado" },
    { language: "Francés", fluency: "B1 - Intermedio" },
  ],
  projects: [
    {
      name: "CV AI",
      description:
        "Aplicación web para crear currículums personalizados con IA",
      url: "https://cv-ai.dev",
      keywords: ["Next.js", "OpenAI", "PostgreSQL", "Tailwind"],
      highlights: [
        "Generación de CVs con inteligencia artificial",
        "Sistema de versiones para múltiples candidaturas",
      ],
    },
    {
      name: "TaskFlow",
      description: "Herramienta de gestión de proyectos para equipos remotos",
      url: "https://taskflow.app",
      keywords: ["React", "Node.js", "Socket.io", "Redis"],
      highlights: [
        "Colaboración en tiempo real",
        "Integración con Slack y Discord",
      ],
    },
  ],
  certificates: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2023-03",
    },
    {
      name: "Meta React Developer",
      issuer: "Meta",
      date: "2022-08",
    },
  ],
};

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Presente";
  const [year, month] = dateString.split("-");
  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

export default async function ResumeResultPage({
  params,
}: {
  params: Promise<{ id_or_slug: string }>;
}) {
  const { id_or_slug } = await params;

  // TODO: Fetch resume data from DB
  // const resume = await db.query.resume.findFirst({ where: ... });
  // if (!resume) notFound();

  const resume = mockResumeData;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header con acciones */}
      <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-zinc-950/80 dark:border-zinc-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="font-semibold">{resume.basics.name}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border bg-white shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
          {/* Header / Basics */}
          <header className="border-b p-8 dark:border-zinc-800">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{resume.basics.name}</h1>
                <p className="text-xl text-muted-foreground">
                  {resume.basics.label}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
                  {resume.basics.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {resume.basics.location.city},{" "}
                      {resume.basics.location.countryCode}
                    </span>
                  )}
                  {resume.basics.email && (
                    <a
                      href={`mailto:${resume.basics.email}`}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      {resume.basics.email}
                    </a>
                  )}
                  {resume.basics.phone && (
                    <a
                      href={`tel:${resume.basics.phone}`}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      {resume.basics.phone}
                    </a>
                  )}
                  {resume.basics.url && (
                    <a
                      href={resume.basics.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>

              {/* Social links */}
              <div className="flex gap-2">
                {resume.profiles.map((profile) => {
                  const Icon =
                    socialIcons[profile.network.toLowerCase()] || ExternalLink;
                  return (
                    <a
                      key={profile.network}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border p-2 transition-colors hover:bg-muted"
                      title={profile.network}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            {resume.basics.summary && (
              <p className="mt-6 text-muted-foreground leading-relaxed">
                {resume.basics.summary}
              </p>
            )}
          </header>

          <div className="grid gap-0 md:grid-cols-3">
            {/* Main content */}
            <div className="md:col-span-2 md:border-r dark:border-zinc-800">
              {/* Work Experience */}
              {resume.work.length > 0 && (
                <section className="border-b p-8 dark:border-zinc-800">
                  <h2 className="mb-6 text-lg font-semibold">
                    Experiencia Laboral
                  </h2>
                  <div className="space-y-6">
                    {resume.work.map((job, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-medium">{job.position}</h3>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(job.startDate)} -{" "}
                            {formatDate(job.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {job.name}
                          </span>
                          {job.url && (
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {job.summary && (
                          <p className="text-sm text-muted-foreground">
                            {job.summary}
                          </p>
                        )}
                        {job.highlights && job.highlights.length > 0 && (
                          <ul className="mt-2 space-y-1 text-sm">
                            {job.highlights.map((highlight, hIndex) => (
                              <li
                                key={hIndex}
                                className="flex items-start gap-2"
                              >
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {resume.projects && resume.projects.length > 0 && (
                <section className="border-b p-8 dark:border-zinc-800">
                  <h2 className="mb-6 text-lg font-semibold">Proyectos</h2>
                  <div className="space-y-6">
                    {resume.projects.map((project, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{project.name}</h3>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                        {project.keywords && project.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.keywords.map((keyword, kIndex) => (
                              <Badge
                                key={kIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.highlights && project.highlights.length > 0 && (
                          <ul className="mt-2 space-y-1 text-sm">
                            {project.highlights.map((highlight, hIndex) => (
                              <li
                                key={hIndex}
                                className="flex items-start gap-2"
                              >
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {resume.education.length > 0 && (
                <section className="p-8">
                  <h2 className="mb-6 text-lg font-semibold">Educación</h2>
                  <div className="space-y-4">
                    {resume.education.map((edu, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-medium">{edu.area}</h3>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(edu.startDate)} -{" "}
                            {formatDate(edu.endDate)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {edu.institution}
                          {edu.studyType && ` • ${edu.studyType}`}
                          {edu.score && ` • ${edu.score}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-0">
              {/* Skills */}
              {resume.skills.length > 0 && (
                <section className="border-b p-6 dark:border-zinc-800">
                  <h2 className="mb-4 text-lg font-semibold">Habilidades</h2>
                  <div className="space-y-4">
                    {resume.skills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{skill.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {skill.level}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {skill.keywords.map((keyword, kIndex) => (
                            <Badge
                              key={kIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {resume.languages.length > 0 && (
                <section className="border-b p-6 dark:border-zinc-800">
                  <h2 className="mb-4 text-lg font-semibold">Idiomas</h2>
                  <div className="space-y-2">
                    {resume.languages.map((lang, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>{lang.language}</span>
                        <span className="text-sm text-muted-foreground">
                          {lang.fluency}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certificates */}
              {resume.certificates && resume.certificates.length > 0 && (
                <section className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">Certificados</h2>
                  <div className="space-y-3">
                    {resume.certificates.map((cert, index) => (
                      <div key={index} className="space-y-0.5">
                        <h3 className="text-sm font-medium">{cert.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {cert.issuer} • {formatDate(cert.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          CV generado con{" "}
          <a href="/" className="text-primary hover:underline">
            CV AI
          </a>
        </p>
      </div>
    </div>
  );
}
