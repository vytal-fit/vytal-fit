import { desc, eq } from "drizzle-orm";
import { auditLogs } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, router } from "../trpc";

export const auditLogRouter = router({
  /** Org audit trail, newest first (admin only). Client filters + paginates. */
  list: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(1000).default(500) }).default({ limit: 500 }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.organizationId, ctx.activeOrganizationId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(input.limit);
      return rows.map((r) => ({
        id: r.id,
        actorName: r.actorName,
        action: r.action,
        resource: r.resource,
        details: r.details,
        expandedDetails: r.expandedDetails,
        ip: r.ip,
        createdAt: r.createdAt,
      }));
    }),
});
