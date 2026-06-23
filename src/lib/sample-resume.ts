import type { Basics, Work, Education, Skill, Language } from "@/types/resume";

/** CV de muestra para previsualizar plantillas/estilos en la galería. */
export const SAMPLE_BASICS: Basics = {
  name: "Ana Torres",
  label: "Desarrolladora Full Stack",
  email: "ana.torres@email.com",
  phone: "+51 987 654 321",
  url: "https://anatorres.dev",
  summary:
    "Desarrolladora full stack con 6 años de experiencia construyendo aplicaciones web con React, Node.js y TypeScript. Enfoque en producto, performance y calidad de código.",
  location: { city: "Lima", countryCode: "PE" },
};

export const SAMPLE_WORK: Work[] = [
  {
    name: "Tech Corp",
    position: "Senior Full Stack Developer",
    startDate: "2022-01",
    endDate: "",
    summary:
      "Lidero el desarrollo de aplicaciones web enterprise y la arquitectura frontend, mentoría de un equipo de 4 personas.",
    highlights: [],
  },
  {
    name: "StartupXYZ",
    position: "Full Stack Developer",
    startDate: "2019-06",
    endDate: "2021-12",
    summary:
      "Desarrollo del MVP y features clave de una plataforma SaaS, de 0 a 10k usuarios activos.",
    highlights: [],
  },
];

export const SAMPLE_EDUCATION: Education[] = [
  {
    institution: "Universidad Nacional de Ingeniería",
    area: "Ingeniería de Software",
    studyType: "Bachiller",
    startDate: "2013-03",
    endDate: "2018-12",
    courses: [],
  },
];

export const SAMPLE_SKILLS: Skill[] = [
  { name: "React", level: "Experto", keywords: [] },
  { name: "Node.js", level: "Avanzado", keywords: [] },
  { name: "TypeScript", level: "Avanzado", keywords: [] },
  { name: "PostgreSQL", level: "Intermedio", keywords: [] },
];

export const SAMPLE_LANGUAGES: Language[] = [
  { language: "Español", fluency: "Nativo" },
  { language: "Inglés", fluency: "Avanzado" },
];
