import { z } from "zod";

export const SubmissionValidator = z.object({
  data: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
  ),
  metadata: z
    .object({
      userAgent: z.string().optional(),
      ip: z.string().optional(),
      browser: z.string().optional(),
      os: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

export type SubmissionInput = z.infer<typeof SubmissionValidator>;
