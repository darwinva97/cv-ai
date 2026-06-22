/**
 * Shape of the resume data extracted from an uploaded file (image or PDF).
 *
 * The extraction itself runs server-side via `analyzeResumeFile` in
 * `@/actions/ai` (which uses the AI SDK with BYOK/system-key resolution and
 * credit metering). This module only holds the shared type consumed by the
 * editor form.
 */
export interface ParsedResumeData {
  basics?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  work?: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name?: string;
    description?: string;
    url?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
  languages?: Array<{
    language?: string;
    proficiency?: string;
  }>;
}
