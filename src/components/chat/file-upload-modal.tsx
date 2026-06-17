'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { UserFile } from '@/lib/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.txt';

interface PendingFile {
  id: string;
  file: File;
}

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return (
    ACCEPTED_TYPES.includes(file.type) ||
    extension === 'pdf' ||
    extension === 'docx' ||
    extension === 'txt'
  );
}

function FileIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-zinc-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function CloseButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

export function FileUploadModal({ open, onClose }: FileUploadModalProps) {
  const [existingFiles, setExistingFiles] = useState<UserFile[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    setPendingFiles([]);
    setError('');

    void (async () => {
      setLoading(true);
      try {
        const files = await api.listEmbeddingFiles();
        setExistingFiles(files);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load files',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  function handleAddFiles(selected: FileList | null) {
    if (!selected?.length) return;

    const nextPending: PendingFile[] = [];
    const errors: string[] = [];

    for (const file of Array.from(selected)) {
      if (!isAcceptedFile(file)) {
        errors.push(`"${file.name}" is not a supported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" exceeds the 10 MB limit`);
        continue;
      }
      nextPending.push({
        id: crypto.randomUUID(),
        file,
      });
    }

    if (errors.length) {
      setError(errors.join('. '));
    } else {
      setError('');
    }

    if (nextPending.length) {
      setPendingFiles((prev) => [...prev, ...nextPending]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removePending(id: string) {
    setPendingFiles((prev) => prev.filter((item) => item.id !== id));
  }

  async function removeExisting(fileId: string) {
    setDeletingId(fileId);
    setError('');

    try {
      await api.deleteEmbeddingFile(fileId);
      setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave() {
    if (!pendingFiles.length) {
      onClose();
      return;
    }

    setSaving(true);
    setError('');

    try {
      const uploaded = await Promise.all(
        pendingFiles.map((item) => api.uploadEmbeddingFile(item.file)),
      );
      setExistingFiles((prev) => [...prev, ...uploaded]);
      setPendingFiles([]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setPendingFiles([]);
    setError('');
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60"
        onClick={handleCancel}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-700 bg-[#2f2f2f] shadow-2xl">
        <div className="border-b border-zinc-700 px-6 py-4">
          <h2 className="text-lg font-medium text-zinc-100">Knowledge files</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Upload PDF, DOCX, or TXT files (max 10 MB) to use as context
          </p>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
          {loading && (
            <p className="py-4 text-center text-sm text-zinc-500">
              Loading files...
            </p>
          )}

          {!loading && existingFiles.length === 0 && pendingFiles.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">
              No files uploaded yet
            </p>
          )}

          <ul className="space-y-2">
            {existingFiles.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-[#212121] px-3 py-2.5"
              >
                <FileIcon />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-100">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {file.status}
                    {file.chunkCount > 0 && ` · ${file.chunkCount} chunks`}
                  </p>
                </div>
                <CloseButton
                  label={`Remove ${file.name}`}
                  disabled={deletingId === file.id || saving}
                  onClick={() => void removeExisting(file.id)}
                />
              </li>
            ))}

            {pendingFiles.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-dashed border-emerald-700/50 bg-emerald-950/20 px-3 py-2.5"
              >
                <FileIcon />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-100">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-emerald-500">
                    New · {formatFileSize(item.file.size)}
                  </p>
                </div>
                <CloseButton
                  label={`Remove ${item.file.name}`}
                  disabled={saving}
                  onClick={() => removePending(item.id)}
                />
              </li>
            ))}
          </ul>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-700 px-6 py-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              multiple
              className="hidden"
              onChange={(event) => handleAddFiles(event.target.files)}
            />
            <button
              type="button"
              disabled={loading || saving}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add files
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || loading}
              onClick={() => void handleSave()}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'Uploading...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
