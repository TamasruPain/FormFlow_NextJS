export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date";

export interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Used for select, radio, and checkbox
  helpText?: string;
}

export type FormSchema = FieldDefinition[];

export interface FormWithCount {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  schema: FormSchema;
  isPublished: boolean;
  isMultiStep: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    responses: number;
  };
}
