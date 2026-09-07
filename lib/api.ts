import type { ApiError, Batch } from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(
      payload.error ??
        payload.message ??
        `Request failed with status ${response.status}`,
    );
  }

  return payload;
}

export async function createBatch(
  files: File[],
  simulateFailure: boolean,
): Promise<Batch> {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  if (simulateFailure) {
    formData.append("simulateFailure", "true");
  }

  const response = await fetch(`${API_BASE_URL}/api/batches`, {
    method: "POST",
    body: formData,
  });

  return parseJson<Batch>(response);
}

export async function getBatch(batchId: string): Promise<Batch> {
  const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}`, {
    cache: "no-store",
  });

  return parseJson<Batch>(response);
}

export async function retryFailedBatchFiles(batchId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/batches/${batchId}/retry`,
    {
      method: "POST",
    },
  );

  await parseJson<Record<string, unknown>>(response);
}

export async function retryFile(fileId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/retry`, {
    method: "POST",
  });

  await parseJson<Record<string, unknown>>(response);
}

function getFilenameFromDisposition(
  disposition: string | null,
  fallback: string,
): string {
  if (!disposition) return fallback;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
  }

  const regularMatch = disposition.match(/filename="?([^"]+)"?/i);
  return regularMatch?.[1] ?? fallback;
}

export async function downloadBatch(batchId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/batches/${batchId}/download`,
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(
      payload.error ?? `Download failed with status ${response.status}`,
    );
  }

  const blob = await response.blob();
  const filename = getFilenameFromDisposition(
    response.headers.get("content-disposition"),
    `batch-${batchId.slice(0, 8)}-successful.zip`,
  );

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
