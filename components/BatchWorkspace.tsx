"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BatchResults from "@/components/BatchResults";
import {
  ArrowIcon,
  CheckIcon,
  SparkIcon,
} from "@/components/icons";
import UploadDropzone from "@/components/UploadDropzone";
import {
  createBatch,
  downloadBatch,
  getBatch,
  retryFailedBatchFiles,
  retryFile,
} from "@/lib/api";
import type { Batch } from "@/lib/types";

const TERMINAL_STATUSES = new Set([
  "completed",
  "partial_failure",
  "failed",
]);

export default function BatchWorkspace() {
  const [files, setFiles] = useState<File[]>([]);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retryingAll, setRetryingAll] = useState(false);
  const [retryingFileId, setRetryingFileId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollGeneration = useRef(0);

  const refreshBatch = useCallback(async (batchId: string) => {
    const nextBatch = await getBatch(batchId);
    setBatch((current) => ({
      ...nextBatch,
      rejectedFiles: current?.rejectedFiles ?? nextBatch.rejectedFiles,
    }));
    return nextBatch;
  }, []);

  useEffect(() => {
    if (!batch || TERMINAL_STATUSES.has(batch.status)) return;

    const generation = ++pollGeneration.current;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    async function poll() {
      try {
        const nextBatch = await refreshBatch(batch!.id);

        if (
          !stopped &&
          generation === pollGeneration.current &&
          !TERMINAL_STATUSES.has(nextBatch.status)
        ) {
          timeout = setTimeout(poll, 900);
        }
      } catch (pollError) {
        if (!stopped) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Could not refresh batch status.",
          );
          timeout = setTimeout(poll, 1800);
        }
      }
    }

    timeout = setTimeout(poll, 600);

    return () => {
      stopped = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [batch?.id, batch?.status, refreshBatch]);

  async function handleCreateBatch() {
    if (files.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const created = await createBatch(files, simulateFailure);
      setBatch(created);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create the batch.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRetryAll() {
    if (!batch) return;

    setRetryingAll(true);
    setError(null);

    try {
      await retryFailedBatchFiles(batch.id);
      const refreshed = await refreshBatch(batch.id);
      setBatch(refreshed);
    } catch (retryError) {
      setError(
        retryError instanceof Error
          ? retryError.message
          : "Could not retry the failed files.",
      );
    } finally {
      setRetryingAll(false);
    }
  }

  async function handleRetryFile(fileId: string) {
    if (!batch) return;

    setRetryingFileId(fileId);
    setError(null);

    try {
      await retryFile(fileId);
      const refreshed = await refreshBatch(batch.id);
      setBatch(refreshed);
    } catch (retryError) {
      setError(
        retryError instanceof Error
          ? retryError.message
          : "Could not retry this file.",
      );
    } finally {
      setRetryingFileId(null);
    }
  }

  async function handleDownload() {
    if (!batch) return;

    setDownloading(true);
    setError(null);

    try {
      await downloadBatch(batch.id);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Could not download the output ZIP.",
      );
    } finally {
      setDownloading(false);
    }
  }

  function handleNewBatch() {
    pollGeneration.current += 1;
    setBatch(null);
    setFiles([]);
    setError(null);
    setSimulateFailure(false);
    setRetryingAll(false);
    setRetryingFileId(null);
  }

  return (
    <div className="workspace">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <SparkIcon />
            Reliable batch processing
          </span>
          <h1>
            One bad file shouldn&apos;t
            <br />
            <span>break the whole batch.</span>
          </h1>
          <p>
            Process multiple images independently, keep successful results, and
            retry only the files that fail.
          </p>

          <div className="hero-points">
            <span>
              <CheckIcon />
              Bounded concurrency
            </span>
            <span>
              <CheckIcon />
              Partial failure recovery
            </span>
            <span>
              <CheckIcon />
              Per-file observability
            </span>
          </div>
        </div>

        <div className="architecture-card">
          <span className="architecture-label">FLOW</span>
          <div className="flow-node">
            <span>01</span>
            <div>
              <strong>Upload</strong>
              <small>JPG · PNG · WEBP</small>
            </div>
          </div>
          <div className="flow-line" />
          <div className="flow-node">
            <span>02</span>
            <div>
              <strong>Process independently</strong>
              <small>3 bounded workers</small>
            </div>
          </div>
          <div className="flow-line" />
          <div className="flow-node accent-node">
            <span>03</span>
            <div>
              <strong>Recover failures</strong>
              <small>Retry without starting over</small>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="global-error" role="alert">
          <div>
            <strong>Request failed</strong>
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {!batch ? (
        <section className="workspace-card">
          <div className="workspace-heading">
            <div>
              <span className="eyebrow">New batch</span>
              <h2>Choose your images</h2>
              <p>
                Each file is handled independently, so one failure never blocks
                successful outputs.
              </p>
            </div>

            <span className="api-pill">
              <span className="status-dot" />
              Flask API
            </span>
          </div>

          <UploadDropzone
            files={files}
            onFilesChange={setFiles}
            disabled={submitting}
          />

          <div className="demo-controls">
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(event) => setSimulateFailure(event.target.checked)}
                disabled={submitting}
              />
              <span className="toggle" aria-hidden="true">
                <span />
              </span>
              <span className="toggle-copy">
                <strong>Demo retry flow</strong>
                <small>
                  Intentionally fail the first image once, then let retry
                  succeed.
                </small>
              </span>
            </label>
          </div>

          <div className="submit-row">
            <div className="submit-note">
              <span className="mini-lock">✓</span>
              Files are processed temporarily by the Flask backend for this prototype.
            </div>
            <button
              className="primary-button large"
              type="button"
              onClick={handleCreateBatch}
              disabled={files.length === 0 || submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner tiny light" />
                  Creating batch…
                </>
              ) : (
                <>
                  Process {files.length || ""}{" "}
                  {files.length === 1 ? "image" : "images"}
                  <ArrowIcon />
                </>
              )}
            </button>
          </div>
        </section>
      ) : (
        <BatchResults
          batch={batch}
          retryingAll={retryingAll}
          retryingFileId={retryingFileId}
          downloading={downloading}
          onRetryAll={handleRetryAll}
          onRetryFile={handleRetryFile}
          onDownload={handleDownload}
          onNewBatch={handleNewBatch}
        />
      )}
    </div>
  );
}
