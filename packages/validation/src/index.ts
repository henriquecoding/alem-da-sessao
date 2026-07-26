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
        label: z.string().trim().min(1).max(120),
        intensity: z.number().int().min(1).max(3),
        ownership: z.enum(["mine", "shared", "inherited", "unclear"]),
        movement: z.enum(["protect", "ask", "negotiate", "return", "observe"]),
        includeInShare: z.boolean(),
      }),
    )
    .min(1)
    .max(6),
  effects: z.array(z.string().trim().min(1).max(80)).min(1).max(5),
  support: z.string().trim().min(1).max(80),
  nextSessionNote: z.string().trim().max(280),
});

export type LoadStructuresInput = z.infer<typeof loadStructuresSchema>;

export const snapshotShareSchema = z.object({
  assignmentId: z.uuid(),
  runVersion: z.number().int().positive(),
  confirmation: z.literal(true),
  idempotencyKey: z.uuid(),
});
