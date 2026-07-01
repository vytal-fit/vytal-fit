import { count, desc, eq } from "drizzle-orm";
import { backups, classes, gymMembers, leads, payments, wods } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, orgProcedure, router } from "../trpc";

const SECTIONS = ["members", "classes", "payments", "wods", "crm"] as const;
type Section = (typeof SECTIONS)[number];

export const backupsRouter = router({
  /** Real record counts per exportable section for the active org. */
  summary: orgProcedure.query(async ({ ctx }) => {
    const org = ctx.activeOrganizationId;
    const one = async (tbl: typeof gymMembers | typeof classes | typeof payments | typeof wods | typeof leads) => {
      const [row] = await ctx.db.select({ n: count() }).from(tbl).where(eq(tbl.organizationId, org));
      return row?.n ?? 0;
    };
    const [members, classesN, paymentsN, wodsN, crm] = await Promise.all([
      one(gymMembers),
      one(classes),
      one(payments),
      one(wods),
      one(leads),
    ]);
    return { members, classes: classesN, payments: paymentsN, wods: wodsN, crm };
  }),

  /**
   * Assemble the org's real data for the chosen sections, log the export to
   * history, and return the data for the client to download.
   */
  create: adminProcedure
    .input(
      z.object({
        sections: z.array(z.enum(SECTIONS)).min(1),
        format: z.enum(["json", "csv"]).default("json"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = ctx.activeOrganizationId;
      const want = (s: Section) => input.sections.includes(s);
      const data: Record<string, unknown[]> = {};
      if (want("members")) data.members = await ctx.db.select().from(gymMembers).where(eq(gymMembers.organizationId, org));
      if (want("classes")) data.classes = await ctx.db.select().from(classes).where(eq(classes.organizationId, org));
      if (want("payments")) data.payments = await ctx.db.select().from(payments).where(eq(payments.organizationId, org));
      if (want("wods")) data.wods = await ctx.db.select().from(wods).where(eq(wods.organizationId, org));
      if (want("crm")) data.crm = await ctx.db.select().from(leads).where(eq(leads.organizationId, org));

      const exportedAt = new Date().toISOString();
      const payload = { exportedAt, organizationId: org, format: input.format, sections: input.sections, data };
      const sizeBytes = Buffer.byteLength(JSON.stringify(payload), "utf8");

      const [saved] = await ctx.db
        .insert(backups)
        .values({
          id: crypto.randomUUID(),
          organizationId: org,
          sections: input.sections,
          format: input.format,
          sizeBytes,
          createdBy: ctx.session?.user.id ?? null,
        })
        .returning();

      return { id: saved.id, sizeBytes, ...payload };
    }),

  /** Past exports for the org, newest first. */
  history: orgProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(backups)
      .where(eq(backups.organizationId, ctx.activeOrganizationId))
      .orderBy(desc(backups.createdAt))
      .limit(50);
    return rows.map((r) => ({
      id: r.id,
      sections: r.sections,
      format: r.format,
      sizeBytes: r.sizeBytes,
      createdAt: r.createdAt,
      type: r.sections.length >= SECTIONS.length ? "full" : "partial",
    }));
  }),
});
