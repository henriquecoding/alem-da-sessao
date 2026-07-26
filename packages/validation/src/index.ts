import { z } from "zod";

export const localeSchema = z.enum(["pt-PT", "pt-BR"]);

export const requestAppointmentSchema = z.object({
  professionalId: z.uuid(),
  email: z.email(),
  availability: z.string().trim().min(3).max(280),
  message: z.string().trim().max(500).optional(),
  locale: localeSchema,
});

export const loadStructuresSchema = z.object({
  loads: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(220),
        impactScale: z.number().int().min(1).max(5),
        durationMonths: z.number().int().min(1).max(600),
        ownership: z.enum(["mine", "shared", "inherited", "unclear"]),
        movement: z.enum(["protect", "ask", "negotiate", "return", "observe"]),
        includeInShare: z.boolean(),
      }),
    )
    .min(1)
    .max(4),
  effects: z.array(z.string().trim().min(1).max(80)).min(1).max(5),
  support: z.string().trim().min(1).max(80),
  hiddenFrom: z.enum([
    "children",
    "partner",
    "parents",
    "team",
    "public",
    "nobody",
    "unclear",
  ]),
  nextSessionNote: z.string().trim().max(280),
});

export type LoadStructuresInput = z.infer<typeof loadStructuresSchema>;

export const publicLoadStructureSchema = z.object({
  locale: localeSchema,
  consent: z.literal(true),
  loads: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(220),
        impactScale: z.number().int().min(1).max(5),
        durationMonths: z.number().int().min(1).max(600),
        ownership: z.enum(["mine", "shared", "inherited", "unclear"]),
        movement: z.enum(["protect", "ask", "negotiate", "return", "observe"]),
        custom: z.boolean(),
      }),
    )
    .min(1)
    .max(4),
});

export type PublicLoadStructureInput = z.infer<
  typeof publicLoadStructureSchema
>;

export const publicLoadStructurePostSchema = z.object({
  id: z.uuid(),
  locale: localeSchema,
  loads: publicLoadStructureSchema.shape.loads,
  supportCount: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
});

export type PublicLoadStructurePost = z.infer<
  typeof publicLoadStructurePostSchema
>;

export const snapshotShareSchema = z.object({
  assignmentId: z.uuid(),
  runVersion: z.number().int().positive(),
  confirmation: z.literal(true),
  idempotencyKey: z.uuid(),
});
