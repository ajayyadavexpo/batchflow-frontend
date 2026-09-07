"use client";

import BatchFileRow from "@/components/BatchFileRow";
import {
  AlertIcon,
  CheckIcon,
  DownloadIcon,
  RetryIcon,
  SparkIcon,
} from "@/components/icons";
import { formatStatus } from "@/lib/format";
import type { Batch } from "@/lib/types";

interface BatchResultsProps {
  batch: Batch;
  retryingAll: boolean;
  retryingFileId: string | null;
  downloading: boolean;
  onRetryAll: () => void;
  onRetryFile: (fileId: string) => void;
  onDownload: () => void;
  onNewBatch: () => void;
}

export default function BatchResults({
  batch,
  retryingAll,
  retryingFileId,
  downloading,
  onRetryAll,
  onRetryFile,
  onDownload,
  onNewBatch,
}: BatchResultsProps) {
  const pendingFiles = batch.files.filter(
    (file) => file.status === "pending",
  ).length;
  const processingFiles = batch.files.filter(
    (file) => file.status === "processing",
  ).length;
  const finishedFiles = batch.completedFiles + batch.failedFiles;
  const progress =
    batch.totalFiles > 0
      ? Math.round((finishedFiles / batch.totalFiles) * 100)
      : 0;
  const isRunning =
    batch.status === "pending" || batch.status === "processing";
  const isComplete = batch.status === "completed";
  const hasFailures = batch.failedFiles > 0;

  return (
    <section className="results-card">
      <div className="results-header">
        <div>
          <span className="eyebrow">Batch #{batch.id.slice(0, 8)}</span>
          <div className="batch-title-row">
            <h2>
              {isComplete
                ? "Everything processed"
                : hasFailures && !isRunning
                  ? "Batch finished with issues"
                  : "Processing your images"}
            </h2>
            <span className={`batch-status batch-${batch.status}`}>
              {isRunning && <span className="spinner tiny" />}
              {isComplete && <CheckIcon />}
              {hasFailures && !isRunning && <AlertIcon />}
              {formatStatus(batch.status)}
            </span>
          </div>
        </div>

        <button className="text-button" type="button" onClick={onNewBatch}>
          New batch
        </button>
      </div>

      <div className="progress-panel">
        <div className="progress-topline">
          <div>
            <strong>{progress}%</strong>
            <span>processed</span>
          </div>
          <span>
            {finishedFiles} of {batch.totalFiles} finished
          </span>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-number success-number">
              {batch.completedFiles}
            </span>
            <span>Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{processingFiles}</span>
            <span>Processing</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{pendingFiles}</span>
            <span>Pending</span>
          </div>
          <div className="stat-item">
            <span className="stat-number failure-number">
              {batch.failedFiles}
            </span>
            <span>Failed</span>
          </div>
        </div>
      </div>

      {batch.rejectedFiles && batch.rejectedFiles.length > 0 && (
        <div className="inline-alert warning">
          <AlertIcon />
          <div>
            <strong>
              {batch.rejectedFiles.length} upload
              {batch.rejectedFiles.length === 1 ? " was" : "s were"} rejected
            </strong>
            {batch.rejectedFiles.map((file) => (
              <span className="alert-detail" key={`${file.name}-${file.error}`}>
                {file.name}: {file.error}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="result-list">
        {batch.files.map((file) => (
          <BatchFileRow
            key={file.id}
            file={file}
            retrying={retryingFileId === file.id}
            onRetry={onRetryFile}
          />
        ))}
      </div>

      <div className="result-actions">
        <div className="result-action-left">
          {hasFailures && !isRunning && (
            <button
              className="secondary-button"
              type="button"
              onClick={onRetryAll}
              disabled={retryingAll}
            >
              {retryingAll ? <span className="spinner tiny" /> : <RetryIcon />}
              Retry all failed
            </button>
          )}

          {batch.completedFiles > 0 && (
            <button
              className="primary-button"
              type="button"
              onClick={onDownload}
              disabled={downloading}
            >
              {downloading ? (
                <span className="spinner tiny light" />
              ) : (
                <DownloadIcon />
              )}
              Download successful
            </button>
          )}
        </div>

        {!isRunning && (
          <div className="reliability-note">
            <SparkIcon />
            <span>
              Successful files are preserved. Retries only reprocess failures.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
