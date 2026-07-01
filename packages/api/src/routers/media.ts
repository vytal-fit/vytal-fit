import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { mediaAssets } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router, staffProcedure } from "../trpc";

const TYPES = ["image", "video", "document"] as const;

export const mediaRouter = router({
  list: orgProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(mediaAssets.createdAt));
  }),

  create: staffProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        type: z.enum(TYPES).default("document"),
        folder: z.string().min(1).max(80).default("Documents"),
        url: z.string().url().optional(),
        sizeBytes: z.number().int().min(0).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(mediaAssets)
        .values({
          id: crypto.randomUUID(),
          organizationId: ctx.activeOrganizationId,
          name: input.name,
          type: input.type,
          folder: input.folder,
          url: input.url ?? null,
          sizeBytes: input.sizeBytes,
          uploadedBy: ctx.session?.user.name ?? null,
        })
        .returning();
      return created;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(mediaAssets)
        .where(and(eq(mediaAssets.id, input.id), eq(mediaAssets.organizationId, ctx.activeOrganizationId)))
        .returning();
      if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found." });
      return { id: deleted.id };
    }),
});
