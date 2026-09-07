import type { BatchStatus, FileStatus } from "@/lib/types";

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${
    units[index]
  }`;
}

export function formatStatus(status: BatchStatus | FileStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getSavings(
  inputBytes: number,
  outputBytes: number | null,
): number | null {
  if (!outputBytes || inputBytes <= 0) return null;
  return Math.max(0, Math.round((1 - outputBytes / inputBytes) * 100));
}
