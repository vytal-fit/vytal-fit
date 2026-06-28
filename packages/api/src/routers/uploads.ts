import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { coaches, gymMembers, organization, user } from "@vytal-fit/db";
import { z } from "zod";
import { adminProcedure, protectedProcedure, staffProcedure, router } from "../trpc";
import {
  decodeImagePayload,
  storeCoachPhoto,
  storeMemberPhoto,
  storeOrgLogo,
  storeUserAvatar,
} from "../lib/assets";

// CRITICAL tenant isolation: orgId comes from ctx.activeOrganizationId and userId
// from ctx.session.user.id — NEVER a client-supplied id. For member/coach photos
// the target row is re-verified against the active org before storing, so a token
// can only ever write under the caller's own tenant.

const imageInput = z.object({
  /** A `data:image/...;base64,...` URL. Preferred from web/mobile clients. */
  dataUrl: z.string().optional(),
  /** Raw base64 (no data: prefix) paired with contentType. */
  base64: z.string().optional(),
  /** Required when using `base64`; ignored when `dataUrl` carries the mime. */
  contentType: z.string().optional(),
});

/** Decode + validate, mapping the helper's thrown reasons to BAD_REQUEST. */
function decode(input: z.infer<typeof imageInput>) {
  try {
    return decodeImagePayload(input);
  } catch (err) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: err instanceof Error ? err.message : "invalid_image",
    });
  }
}

export const uploadsRouter = router({
  /** Any authenticated user: upload a personal avatar; updates user.image. */
  uploadAvatar: protectedProcedure
    .input(imageInput)
    .mutation(async ({ ctx, input }) => {
      const { bytes, contentType } = decode(input);
      const url = await storeUserAvatar({
        userId: ctx.session.user.id,
        bytes,
        contentType,
      });
      await ctx.db
        .update(user)
        .set({ image: url, updatedAt: new Date() })
        .where(eq(user.id, ctx.session.user.id));
      return { url };
    }),

  /** Admin+: upload the gym logo for the active org; updates organization.logo. */
  uploadOrgLogo: adminProcedure
    .input(imageInput)
    .mutation(async ({ ctx, input }) => {
      const { bytes, contentType } = decode(input);
      const url = await storeOrgLogo({
        orgId: ctx.activeOrganizationId,
        bytes,
        contentType,
      });
      await ctx.db
        .update(organization)
        .set({ logo: url })
        .where(eq(organization.id, ctx.activeOrganizationId));
      return { url };
    }),

  /** Coach+: upload a member (athlete) photo; updates gymMembers.photo. */
  uploadMemberPhoto: staffProcedure
    .input(imageInput.extend({ memberId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { bytes, contentType } = decode(input);
      // Re-verify the member belongs to the active org before storing — never
      // trust a client id; this pins the storage key under the caller's tenant.
      const [member] = await ctx.db
        .select({ id: gymMembers.id })
        .from(gymMembers)
        .where(
          and(
            eq(gymMembers.id, input.memberId),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found." });
      }
      const url = await storeMemberPhoto({
        orgId: ctx.activeOrganizationId,
        memberId: input.memberId,
        bytes,
        contentType,
      });
      await ctx.db
        .update(gymMembers)
        .set({ photo: url })
        .where(
          and(
            eq(gymMembers.id, input.memberId),
            eq(gymMembers.organizationId, ctx.activeOrganizationId),
          ),
        );
      return { url };
    }),

  /** Coach+: upload a coach photo; updates coaches.photo. */
  uploadCoachPhoto: staffProcedure
    .input(imageInput.extend({ coachId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { bytes, contentType } = decode(input);
      const [coach] = await ctx.db
        .select({ id: coaches.id })
        .from(coaches)
        .where(
          and(
            eq(coaches.id, input.coachId),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);
      if (!coach) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coach not found." });
      }
      const url = await storeCoachPhoto({
        orgId: ctx.activeOrganizationId,
        coachId: input.coachId,
        bytes,
        contentType,
      });
      await ctx.db
        .update(coaches)
        .set({ photo: url })
        .where(
          and(
            eq(coaches.id, input.coachId),
            eq(coaches.organizationId, ctx.activeOrganizationId),
          ),
        );
      return { url };
    }),
});
