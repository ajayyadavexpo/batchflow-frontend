export type FileStatus = "pending" | "processing" | "completed" | "failed";

export type BatchStatus =
  | "pending"
  | "processing"
  | "completed"
  | "partial_failure"
  | "failed";

export interface BatchFile {
  id: string;
  batchId: string;
  name: string;
  mimeType: string | null;
  inputSizeBytes: number;
  outputSizeBytes: number | null;
  status: FileStatus;
  attempts: number;
  error: string | null;
  simulateFailureOnce?: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface RejectedFile {
  name: string;
  error: string;
}

export interface Batch {
  id: string;
  status: BatchStatus;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  createdAt: string | null;
  updatedAt: string | null;
  files: BatchFile[];
  rejectedFiles?: RejectedFile[];
}

export interface ApiError {
  error?: string;
  message?: string;
}
