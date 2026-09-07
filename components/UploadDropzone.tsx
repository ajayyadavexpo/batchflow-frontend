"use client";

import {
  ChangeEvent,
  DragEvent,
  useRef,
  useState,
} from "react";
import { ImageIcon, TrashIcon, UploadIcon, XIcon } from "@/components/icons";
import { formatBytes } from "@/lib/format";

interface UploadDropzoneProps {
  files: File[];
  disabled?: boolean;
  onFilesChange: (files: File[]) => void;
}

const MAX_FILES = 20;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function signature(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export default function UploadDropzone({
  files,
  disabled = false,
  onFilesChange,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function addFiles(incoming: File[]) {
    setLocalError(null);

    const supported = incoming.filter(
      (file) =>
        ACCEPTED_TYPES.includes(file.type) ||
        /\.(jpe?g|png|webp)$/i.test(file.name),
    );

    if (supported.length !== incoming.length) {
      setLocalError("Some files were skipped. Use JPG, PNG, or WEBP images.");
    }

    const seen = new Set(files.map(signature));
    const unique = supported.filter((file) => !seen.has(signature(file)));
    const combined = [...files, ...unique].slice(0, MAX_FILES);

    if (files.length + unique.length > MAX_FILES) {
      setLocalError(`You can upload at most ${MAX_FILES} files per batch.`);
    }

    onFilesChange(combined);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(Array.from(event.dataTransfer.files));
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <section className="upload-section">
      <div
        className={`dropzone ${isDragging ? "dragging" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleInput}
          disabled={disabled}
          hidden
        />

        <span className="upload-icon">
          <UploadIcon />
        </span>
        <h3>Drop images here</h3>
        <p>or click to browse your files</p>
        <span className="upload-hint">JPG, PNG, WEBP · up to 20 files</span>
      </div>

      {localError && (
        <div className="inline-alert warning" role="alert">
          <XIcon />
          <span>{localError}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="selected-files">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Ready to process</span>
              <h3>
                {files.length} {files.length === 1 ? "file" : "files"} selected
              </h3>
            </div>
            <button
              className="text-button danger-text"
              type="button"
              onClick={() => onFilesChange([])}
              disabled={disabled}
            >
              <TrashIcon />
              Clear all
            </button>
          </div>

          <div className="selected-list">
            {files.map((file, index) => (
              <div className="selected-row" key={signature(file)}>
                <div className="file-thumbnail">
                  <ImageIcon />
                </div>
                <div className="file-main">
                  <strong title={file.name}>{file.name}</strong>
                  <span>{formatBytes(file.size)}</span>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
