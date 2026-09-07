"use client";

import { CheckIcon, RetryIcon, XIcon } from "@/components/icons";
import { formatBytes, getSavings } from "@/lib/format";
import type { BatchFile } from "@/lib/types";

interface BatchFileRowProps {
  file: BatchFile;
  retrying: boolean;
  onRetry: (fileId: string) => void;
}

export default function BatchFileRow({
  file,
  retrying,
  onRetry,
}: BatchFileRowProps) {
  const savings = getSavings(file.inputSizeBytes, file.outputSizeBytes);

  return (
    <div className={`result-row status-${file.status}`}>
      <div className="result-status-icon" aria-hidden="true">
        {file.status === "completed" && <CheckIcon />}
        {file.status === "failed" && <XIcon />}
        {file.status === "processing" && <span className="spinner small" />}
        {file.status === "pending" && <span className="pending-dot" />}
      </div>

      <div className="result-file">
        <div className="result-name-line">
          <strong title={file.name}>{file.name}</strong>
          {file.attempts > 1 && (
            <span className="attempt-pill">Attempt {file.attempts}</span>
          )}
        </div>

        {file.status === "completed" ? (
          <span>
            {formatBytes(file.inputSizeBytes)}
            <span className="size-arrow">→</span>
            {formatBytes(file.outputSizeBytes)}
            {savings !== null && savings > 0 && (
              <span className="saving"> · {savings}% smaller</span>
            )}
          </span>
        ) : file.status === "failed" ? (
          <span className="error-copy" title={file.error ?? undefined}>
            {file.error ?? "Processing failed"}
          </span>
        ) : file.status === "processing" ? (
          <span>Optimizing image…</span>
        ) : (
          <span>Waiting for a worker…</span>
        )}
      </div>

      <div className="result-action">
        {file.status === "completed" && (
          <span className="status-label success-label">Completed</span>
        )}

        {file.status === "processing" && (
          <span className="status-label">Processing</span>
        )}

        {file.status === "pending" && (
          <span className="status-label">Pending</span>
        )}

        {file.status === "failed" && (
          <button
            className="retry-file-button"
            type="button"
            onClick={() => onRetry(file.id)}
            disabled={retrying}
          >
            {retrying ? <span className="spinner tiny" /> : <RetryIcon />}
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
