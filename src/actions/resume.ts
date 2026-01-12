"use server";

import { db } from "@/db";
import { resume, resumeVersion } from "@/db/schema/resume";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getResumes(userId: string) {
  const resumes = await db.query.resume.findMany({
    where: eq(resume.userId, userId),
    orderBy: (resume, { desc }) => [desc(resume.createdAt)],
  });

  return resumes;
}

export async function getResume(id: string) {
  const result = await db.query.resume.findFirst({
    where: eq(resume.id, id),
  });

  return result;
}

export async function getResumeBySlug(slug: string) {
  const result = await db.query.resume.findFirst({
    where: eq(resume.slug, slug),
  });

  return result;
}

export async function createResume(data: {
  userId: string;
  title: string;
  slug?: string;
  description?: string;
}) {
  const [newResume] = await db
    .insert(resume)
    .values({
      userId: data.userId,
      title: data.title,
      slug: data.slug,
      description: data.description,
    })
    .returning();

  return newResume;
}

export async function updateResume(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    currentVersionId?: string;
  }
) {
  const [updated] = await db
    .update(resume)
    .set(data)
    .where(eq(resume.id, id))
    .returning();

  return updated;
}

export async function deleteResume(id: string) {
  await db.delete(resume).where(eq(resume.id, id));
}

// ============= VERSION ACTIONS =============

export async function getResumeVersions(resumeId: string) {
  const versions = await db.query.resumeVersion.findMany({
    where: eq(resumeVersion.resumeId, resumeId),
    orderBy: desc(resumeVersion.createdAt),
  });

  return versions;
}

export async function getResumeVersion(versionId: string) {
  const version = await db.query.resumeVersion.findFirst({
    where: eq(resumeVersion.id, versionId),
  });

  return version;
}

export async function createResumeVersion(data: {
  resumeId: string;
  title?: string;
  description?: string;
  basedOn?: string;
  customSlug?: string;
  isCommunityPublic?: boolean;
  isResultPublic?: boolean;
  prompt?: string;
  jobOfferText?: string;
  jobOfferLink?: string;
}) {
  // Generate version ID based on parent
  let versionId = "1";

  if (data.basedOn) {
    // Parse the base version to get parent path and last segment
    const parts = data.basedOn.split(".");
    const lastSegment = parseInt(parts[parts.length - 1], 10);
    const parentPath = parts.slice(0, -1).join(".");

    // Try to create sibling version first (e.g., 2.4 -> 2.5)
    const siblingId = parentPath
      ? `${parentPath}.${lastSegment + 1}`
      : String(lastSegment + 1);

    // Check if sibling already exists
    const siblingExists = await db.execute(
      sql`SELECT 1 FROM resume_version
          WHERE resume_id = ${data.resumeId} AND id = ${siblingId}::ltree`
    );

    if (siblingExists.length === 0) {
      // Sibling doesn't exist, use it
      versionId = siblingId;
    } else {
      // Sibling exists, create child version (e.g., 2.4 -> 2.4.1)
      const result = await db.execute(
        sql`SELECT COALESCE(MAX((subpath(id, -1)::text)::int), 0) + 1 as next_child
           FROM resume_version
           WHERE resume_id = ${data.resumeId}
           AND id <@ ${data.basedOn}::ltree
           AND nlevel(id) = nlevel(${data.basedOn}::ltree) + 1`
      );
      const nextChild = (result[0] as any)?.next_child || 1;
      versionId = `${data.basedOn}.${nextChild}`;
    }
  } else {
    // Root version, find next root number
    const result = await db.execute(
      sql`SELECT COALESCE(MAX((id::text)::int), 0) + 1 as next_id
          FROM resume_version
          WHERE resume_id = ${data.resumeId} AND nlevel(id) = 1`
    );
    versionId = String((result[0] as any)?.next_id || 1);
  }

  const [newVersion] = await db
    .insert(resumeVersion)
    .values({
      id: versionId,
      resumeId: data.resumeId,
      title: data.title || `Versión ${versionId}`,
      description: data.description,
      basedOn: data.basedOn,
      customSlug: data.customSlug,
      isCommunityPublic: data.isCommunityPublic ?? true,
      isResultPublic: data.isResultPublic ?? false,
      prompt: data.prompt,
      jobOfferText: data.jobOfferText,
      jobOfferLink: data.jobOfferLink,
    })
    .returning();

  return newVersion;
}

export async function updateResumeVersion(
  versionId: string,
  data: {
    title?: string;
    description?: string;
    customSlug?: string;
    isCommunityPublic?: boolean;
    isResultPublic?: boolean;
    prompt?: string;
    jobOfferText?: string;
    jobOfferLink?: string;
  }
) {
  const [updated] = await db
    .update(resumeVersion)
    .set(data)
    .where(eq(resumeVersion.id, versionId))
    .returning();

  return updated;
}

export async function deleteResumeVersion(versionId: string) {
  await db.delete(resumeVersion).where(eq(resumeVersion.id, versionId));
}

export async function setCurrentVersion(resumeId: string, versionId: string) {
  const [updated] = await db
    .update(resume)
    .set({ currentVersionId: versionId })
    .where(eq(resume.id, resumeId))
    .returning();

  return updated;
}

export async function getResumesWithVersions(userId: string) {
  // Get all resumes for the user
  const resumes = await db.query.resume.findMany({
    where: eq(resume.userId, userId),
    orderBy: (resume, { desc }) => [desc(resume.createdAt)],
  });

  // For each resume, get all its versions with their relationships
  const resumesWithVersions = await Promise.all(
    resumes.map(async (r) => {
      const versions = await db.query.resumeVersion.findMany({
        where: eq(resumeVersion.resumeId, r.id),
        orderBy: desc(resumeVersion.createdAt),
      });

      return {
        ...r,
        versions,
      };
    })
  );

  return resumesWithVersions;
}

// ============= GET VERSION DATA WITH ALL RELATED ENTITIES =============

export async function getVersionData(versionId: string) {
  // Import all related tables
  const { 
    resumeBasics, 
    resumeProfile, 
    resumeWork, 
    resumeEducation, 
    resumeSkill, 
    resumeLanguage, 
    resumeProject,
    resumeVersionBasic,
    resumeVersionProfile,
    resumeVersionWork,
    resumeVersionEducation,
    resumeVersionSkill,
    resumeVersionLanguage,
    resumeVersionProject,
  } = await import("@/db/schema/resume");

  // Get basics
  const basics = await db
    .select()
    .from(resumeVersionBasic)
    .innerJoin(resumeBasics, eq(resumeVersionBasic.resumeBasicId, resumeBasics.id))
    .where(eq(resumeVersionBasic.resumeVersionId, versionId))
    .limit(1);

  // Get profiles
  const profiles = await db
    .select()
    .from(resumeVersionProfile)
    .innerJoin(resumeProfile, eq(resumeVersionProfile.resumeProfileId, resumeProfile.id))
    .where(eq(resumeVersionProfile.resumeVersionId, versionId));

  // Get work
  const work = await db
    .select()
    .from(resumeVersionWork)
    .innerJoin(resumeWork, eq(resumeVersionWork.resumeWorkId, resumeWork.id))
    .where(eq(resumeVersionWork.resumeVersionId, versionId));

  // Get education
  const education = await db
    .select()
    .from(resumeVersionEducation)
    .innerJoin(resumeEducation, eq(resumeVersionEducation.resumeEducationId, resumeEducation.id))
    .where(eq(resumeVersionEducation.resumeVersionId, versionId));

  // Get skills
  const skills = await db
    .select()
    .from(resumeVersionSkill)
    .innerJoin(resumeSkill, eq(resumeVersionSkill.resumeSkillId, resumeSkill.id))
    .where(eq(resumeVersionSkill.resumeVersionId, versionId));

  // Get languages
  const languages = await db
    .select()
    .from(resumeVersionLanguage)
    .innerJoin(resumeLanguage, eq(resumeVersionLanguage.resumeLanguageId, resumeLanguage.id))
    .where(eq(resumeVersionLanguage.resumeVersionId, versionId));

  // Get projects
  const projects = await db
    .select()
    .from(resumeVersionProject)
    .innerJoin(resumeProject, eq(resumeVersionProject.resumeProjectId, resumeProject.id))
    .where(eq(resumeVersionProject.resumeVersionId, versionId));

  return {
    basics: basics[0]?.resume_basics || null,
    profiles: profiles.map(p => p.resume_profile),
    work: work.map(w => w.resume_work),
    education: education.map(e => e.resume_education),
    skills: skills.map(s => s.resume_skill),
    languages: languages.map(l => l.resume_language),
    projects: projects.map(p => p.resume_project),
  };
}

// ============= UPDATE VERSION DATA =============

export async function updateVersionBasics(basicsId: string, data: {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: {
    address?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
    region?: string;
  };
  pinnedFields?: string[];
  aiModifiedFields?: string[];
}) {
  const { resumeBasics } = await import("@/db/schema/resume");
  
  const [updated] = await db
    .update(resumeBasics)
    .set(data)
    .where(eq(resumeBasics.id, basicsId))
    .returning();

  return updated;
}

export async function createVersionBasics(versionId: string, data: {
  name?: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: {
    address?: string;
    postalCode?: string;
    city?: string;
    countryCode?: string;
    region?: string;
  };
  pinnedFields?: string[];
  aiModifiedFields?: string[];
}) {
  const { resumeBasics, resumeVersionBasic } = await import("@/db/schema/resume");
  
  // Create the basics record
  const [newBasics] = await db
    .insert(resumeBasics)
    .values(data)
    .returning();

  // Link it to the version
  await db
    .insert(resumeVersionBasic)
    .values({
      resumeVersionId: versionId,
      resumeBasicId: newBasics.id,
    });

  return newBasics;
}
