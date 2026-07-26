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
  responsibility: z.string().trim().min(10).max(500),
  observableEffects: z.string().trim().min(10).max(800),
  currentSupport: z.string().trim().max(500),
  desiredRedistribution: z.string().trim().max(500),
  nextSessionFocus: z.string().trim().max(500),
});

export type LoadStructuresInput = z.infer<typeof loadStructuresSchema>;

export const snapshotShareSchema = z.object({
  assignmentId: z.uuid(),
  runVersion: z.number().int().positive(),
  confirmation: z.literal(true),
  idempotencyKey: z.uuid(),
});
