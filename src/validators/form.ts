import { z } from "zod";

export const FieldTypeSchema = z.enum([
  "text",
  "email",
  "number",
  "textarea",
  "select",
  "checkbox",
  "radio",
  "date",
  "file",
]);

export const FieldDefinitionSchema = z.object({
  id: z.string(),
  type: FieldTypeSchema,
  label: z.string().min(1, "Label is required"),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  helpText: z.string().optional(),
});

export const FormSchemaValidator = z.array(FieldDefinitionSchema);

export const CreateFormValidator = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  isPublished: z.boolean().optional().default(false),
  isMultiStep: z.boolean().optional().default(false),
  schema: FormSchemaValidator.default([]),
});

export const UpdateFormValidator = CreateFormValidator.partial();
export type CreateFormInput = z.infer<typeof CreateFormValidator>;
export type UpdateFormInput = z.infer<typeof UpdateFormValidator>;
export type FieldDefinitionInput = z.infer<typeof FieldDefinitionSchema>;
