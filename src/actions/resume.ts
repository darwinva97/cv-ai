"use server";

import { db } from "@/db";
import { resume, resumeVersion } from "@/db/schema/resume";
import { eq } from "drizzle-orm";

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
