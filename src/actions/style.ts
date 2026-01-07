"use server";

import { db } from "@/db";
import {
  resumeStyle,
  resumeStyleLike,
  resumeStyleSaved,
  resumeVersionStyle,
  defaultStyleConfig,
  type ResumeStyleConfig,
} from "@/db/schema/style";
import { eq, and, desc, sql, or, ilike } from "drizzle-orm";

export async function getStyles(options?: {
  userId?: string;
  isPublic?: boolean;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "popular" | "recent" | "likes";
}) {
  const {
    userId,
    isPublic,
    category,
    search,
    limit = 20,
    offset = 0,
    orderBy = "popular",
  } = options || {};

  let query = db.select().from(resumeStyle);

  // Build where conditions
  const conditions = [];
  
  if (userId) {
    conditions.push(eq(resumeStyle.userId, userId));
  }
  
  if (isPublic !== undefined) {
    conditions.push(eq(resumeStyle.isPublic, isPublic));
  }
  
  if (category) {
    conditions.push(eq(resumeStyle.category, category as any));
  }
  
  if (search) {
    conditions.push(
      or(
        ilike(resumeStyle.name, `%${search}%`),
        ilike(resumeStyle.description, `%${search}%`)
      )
    );
  }

  // Apply conditions
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Order
  const orderColumn =
    orderBy === "likes"
      ? desc(resumeStyle.likesCount)
      : orderBy === "recent"
      ? desc(resumeStyle.createdAt)
      : desc(resumeStyle.usageCount);

  const styles = await query
    .orderBy(orderColumn)
    .limit(limit)
    .offset(offset);

  return styles;
}

export async function getPublicStyles(options?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}) {
  return getStyles({
    ...options,
    isPublic: true,
  });
}

export async function getUserStyles(userId: string) {
  return getStyles({ userId });
}

export async function getStyle(id: string) {
  const style = await db.query.resumeStyle.findFirst({
    where: eq(resumeStyle.id, id),
  });
  return style;
}

export async function getStyleBySlug(slug: string) {
  const style = await db.query.resumeStyle.findFirst({
    where: eq(resumeStyle.slug, slug),
  });
  return style;
}

export async function createStyle(data: {
  userId: string;
  name: string;
  description?: string;
  slug?: string;
  isPublic?: boolean;
  category?: "minimal" | "modern" | "classic" | "creative" | "professional" | "tech" | "academic" | "other";
  tags?: string[];
  config?: Partial<ResumeStyleConfig>;
  forkedFromId?: string;
}) {
  // Merge with default config
  const config: ResumeStyleConfig = {
    ...defaultStyleConfig,
    ...data.config,
    colors: { ...defaultStyleConfig.colors, ...data.config?.colors },
    typography: { ...defaultStyleConfig.typography, ...data.config?.typography },
    spacing: { ...defaultStyleConfig.spacing, ...data.config?.spacing },
    layout: { ...defaultStyleConfig.layout, ...data.config?.layout },
    sections: { ...defaultStyleConfig.sections, ...data.config?.sections },
    extras: { ...defaultStyleConfig.extras, ...data.config?.extras },
  };

  const [style] = await db
    .insert(resumeStyle)
    .values({
      userId: data.userId,
      name: data.name,
      description: data.description,
      slug: data.slug,
      isPublic: data.isPublic ?? false,
      category: data.category ?? "modern",
      tags: data.tags ?? [],
      config,
      forkedFromId: data.forkedFromId,
    })
    .returning();

  // If forked, increment fork count on original
  if (data.forkedFromId) {
    await db
      .update(resumeStyle)
      .set({
        forksCount: sql`${resumeStyle.forksCount} + 1`,
      })
      .where(eq(resumeStyle.id, data.forkedFromId));
  }

  return style;
}

export async function updateStyle(
  id: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    slug?: string;
    isPublic?: boolean;
    category?: "minimal" | "modern" | "classic" | "creative" | "professional" | "tech" | "academic" | "other";
    tags?: string[];
    config?: ResumeStyleConfig;
    thumbnailUrl?: string;
  }
) {
  const { config, ...restData } = data;
  const updateData: Record<string, unknown> = {
    ...restData,
    updatedAt: new Date(),
  };
  
  if (config) {
    updateData.config = config;
  }

  const [updated] = await db
    .update(resumeStyle)
    .set(updateData)
    .where(and(eq(resumeStyle.id, id), eq(resumeStyle.userId, userId)))
    .returning();

  return updated;
}

export async function deleteStyle(id: string, userId: string) {
  await db
    .delete(resumeStyle)
    .where(and(eq(resumeStyle.id, id), eq(resumeStyle.userId, userId)));
}

export async function forkStyle(styleId: string, userId: string, newName?: string) {
  const original = await getStyle(styleId);
  if (!original) throw new Error("Style not found");

  return createStyle({
    userId,
    name: newName || `${original.name} (Fork)`,
    description: original.description || undefined,
    category: original.category as any,
    tags: (original.tags as string[]) || [],
    config: original.config as ResumeStyleConfig,
    forkedFromId: original.id,
    isPublic: false,
  });
}

// Likes
export async function likeStyle(styleId: string, userId: string) {
  await db.insert(resumeStyleLike).values({ styleId, userId }).onConflictDoNothing();
  
  await db
    .update(resumeStyle)
    .set({ likesCount: sql`${resumeStyle.likesCount} + 1` })
    .where(eq(resumeStyle.id, styleId));
}

export async function unlikeStyle(styleId: string, userId: string) {
  const result = await db
    .delete(resumeStyleLike)
    .where(and(eq(resumeStyleLike.styleId, styleId), eq(resumeStyleLike.userId, userId)));
  
  await db
    .update(resumeStyle)
    .set({ likesCount: sql`${resumeStyle.likesCount} - 1` })
    .where(eq(resumeStyle.id, styleId));
}

export async function hasUserLikedStyle(styleId: string, userId: string) {
  const like = await db.query.resumeStyleLike.findFirst({
    where: and(eq(resumeStyleLike.styleId, styleId), eq(resumeStyleLike.userId, userId)),
  });
  return !!like;
}

// Saved/Favorites
export async function saveStyle(styleId: string, userId: string) {
  await db.insert(resumeStyleSaved).values({ styleId, userId }).onConflictDoNothing();
}

export async function unsaveStyle(styleId: string, userId: string) {
  await db
    .delete(resumeStyleSaved)
    .where(and(eq(resumeStyleSaved.styleId, styleId), eq(resumeStyleSaved.userId, userId)));
}

export async function getSavedStyles(userId: string) {
  const saved = await db
    .select()
    .from(resumeStyleSaved)
    .innerJoin(resumeStyle, eq(resumeStyleSaved.styleId, resumeStyle.id))
    .where(eq(resumeStyleSaved.userId, userId))
    .orderBy(desc(resumeStyleSaved.createdAt));

  return saved.map((s) => s.resume_style);
}

// Apply style to resume version
export async function applyStyleToVersion(
  resumeVersionId: string,
  styleId: string,
  configOverrides?: Partial<ResumeStyleConfig>
) {
  // Remove existing style
  await db.delete(resumeVersionStyle).where(eq(resumeVersionStyle.resumeVersionId, resumeVersionId));

  // Apply new style
  await db.insert(resumeVersionStyle).values({
    resumeVersionId,
    styleId,
    configOverrides,
  });

  // Increment usage count
  await db
    .update(resumeStyle)
    .set({ usageCount: sql`${resumeStyle.usageCount} + 1` })
    .where(eq(resumeStyle.id, styleId));
}

export async function getVersionStyle(resumeVersionId: string) {
  const result = await db
    .select()
    .from(resumeVersionStyle)
    .innerJoin(resumeStyle, eq(resumeVersionStyle.styleId, resumeStyle.id))
    .where(eq(resumeVersionStyle.resumeVersionId, resumeVersionId))
    .limit(1);

  if (result.length === 0) return null;

  return {
    style: result[0].resume_style,
    overrides: result[0].resume_version_style.configOverrides,
  };
}

// Featured/Official styles
export async function getFeaturedStyles(limit = 6) {
  return db
    .select()
    .from(resumeStyle)
    .where(and(eq(resumeStyle.isPublic, true), eq(resumeStyle.isFeatured, true)))
    .orderBy(desc(resumeStyle.likesCount))
    .limit(limit);
}

export async function getOfficialStyles() {
  return db
    .select()
    .from(resumeStyle)
    .where(eq(resumeStyle.isOfficial, true))
    .orderBy(resumeStyle.name);
}
