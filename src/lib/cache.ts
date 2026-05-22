import { redis } from "./redis";
import { db } from "./db";
import { Form } from "@prisma/client";

const CACHE_TTL = 600; // 10 minutes (in seconds)

/**
 * Retrieves a form from Redis cache, falling back to Neon PostgreSQL if not found.
 * If cached, parses and returns the Form. If fetched from DB, stores in cache.
 */
export async function getCachedForm(formIdOrSlug: string): Promise<Form | null> {
  if (!redis) {
    // Graceful fallback to direct DB query if Redis is not configured
    return db.form.findFirst({
      where: {
        OR: [{ id: formIdOrSlug }, { slug: formIdOrSlug }],
      },
    });
  }

  const cacheKey = `formflow:form:${formIdOrSlug}`;

  try {
    const cached = await redis.get<any>(cacheKey);
    if (cached) {
      // Upstash Redis SDK auto-deserializes JSON if stored as object, or returns parsed string
      return typeof cached === "string" ? JSON.parse(cached) : cached;
    }
  } catch (err) {
    console.error("[CACHE_GET_ERROR] Redis read failed, falling back to DB:", err);
  }

  // Fetch from DB
  const form = await db.form.findFirst({
    where: {
      OR: [{ id: formIdOrSlug }, { slug: formIdOrSlug }],
    },
  });

  if (form) {
    try {
      const serialized = JSON.stringify(form);
      // Cache by both ID and Slug to allow fast lookups on either key
      await Promise.all([
        redis.set(`formflow:form:${form.id}`, serialized, { ex: CACHE_TTL }),
        redis.set(`formflow:form:${form.slug}`, serialized, { ex: CACHE_TTL }),
      ]);
    } catch (err) {
      console.error("[CACHE_SET_ERROR] Failed to save form to Redis cache:", err);
    }
  }

  return form;
}

/**
 * Invalidates the cache for a given form.
 */
export async function invalidateFormCache(formId: string, slug?: string): Promise<void> {
  if (!redis) return;

  const keys = [`formflow:form:${formId}`];
  if (slug) {
    keys.push(`formflow:form:${slug}`);
  }

  try {
    await redis.del(...keys);
  } catch (err) {
    console.error("[CACHE_INVALIDATE_ERROR] Failed to invalidate form cache:", err);
  }
}
