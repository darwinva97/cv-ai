// Types based on JSON Resume schema and database schema

// Base interface for AI control fields
export interface AIControlFields {
  pinnedFields?: string[]; // Fields that cannot be edited by AI
  aiModifiedFields?: string[]; // Fields modified by AI
}

export interface Location {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface Basics extends AIControlFields {
  id?: string;
  name: string;
  label: string;
  image?: string;
  email: string;
  phone: string;
  url?: string;
  summary: string;
  location: Location;
}

export interface Profile extends AIControlFields {
  id?: string;
  network: string;
  username: string;
  url: string;
}

export interface Work extends AIControlFields {
  id?: string;
  name: string;
  position: string;
  url?: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
}

export interface Volunteer extends AIControlFields {
  id?: string;
  organization: string;
  position: string;
  url?: string;
  startDate: string;
  endDate?: string;
  summary: string;
  highlights: string[];
}

export interface Education extends AIControlFields {
  id?: string;
  institution: string;
  url?: string;
  area: string;
  studyType: string;
  startDate: string;
  endDate?: string;
  score?: string;
  courses: string[];
}

export interface Award {
  id?: string;
  title: string;
  date: string;
  awarder: string;
  summary?: string;
}

export interface Certificate {
  id?: string;
  name: string;
  date: string;
  issuer: string;
  url?: string;
}

export interface Publication {
  id?: string;
  name: string;
  publisher: string;
  releaseDate: string;
  url?: string;
  summary?: string;
}

export interface Skill extends AIControlFields {
  id?: string;
  name: string;
  level: string;
  keywords: string[];
}

export interface Language {
  id?: string;
  language: string;
  fluency: string;
}

export interface Interest {
  id?: string;
  name: string;
  keywords: string[];
}

export interface Reference {
  id?: string;
  name: string;
  reference: string;
}

export interface Project extends AIControlFields {
  id?: string;
  name: string;
  startDate?: string;
  endDate?: string;
  description: string;
  highlights: string[];
  url?: string;
  keywords: string[];
  roles?: string[];
  entity?: string;
  type?: string;
}

// Resume types
export interface Resume {
  id: string;
  userId: string;
  title: string;
  slug?: string;
  description?: string;
  createdAt: Date;
  currentVersionId?: string;
}

export interface ResumeVersion {
  id: string;
  title?: string;
  description?: string;
  isCommunityPublic: boolean;
  isResultPublic: boolean;
  thumbnailFilename?: string;
  basedOn?: string;
  customSlug?: string;
  resumeId: string;
  createdAt: Date;
  prompt?: string;
  jobOfferText?: string;
  jobOfferLink?: string;
  jobOfferLinkExtracted?: string;
}

// Complete resume data for display
export interface ResumeData {
  basics: Basics;
  profiles: Profile[];
  work: Work[];
  volunteer: Volunteer[];
  education: Education[];
  awards: Award[];
  certificates: Certificate[];
  publications: Publication[];
  skills: Skill[];
  languages: Language[];
  interests: Interest[];
  references: Reference[];
  projects: Project[];
}

// AI Provider types
export type AIProviderType = "anthropic" | "openai" | "other";

export interface AIProvider {
  id: string;
  userId: string;
  name: string;
  model: string;
  token: string;
  url?: string;
  providerAi: AIProviderType;
  isActive: boolean;
  createdAt: Date;
}
