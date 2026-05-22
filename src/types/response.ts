export interface ResponseData {
  [fieldId: string]: string | number | boolean | string[];
}

export interface ResponseMetadata {
  userAgent?: string;
  ip?: string;
  browser?: string;
  os?: string;
  country?: string;
  submittedAt: string;
}

export interface SubmissionResponse {
  id: string;
  formId: string;
  data: ResponseData;
  metadata: ResponseMetadata | null;
  aiInsight: string | null;
  status: "pending" | "analyzed" | "failed";
  createdAt: Date;
}
