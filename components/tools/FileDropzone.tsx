'use client';

import { FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { Button } from '@/components/shared/Button';
import { toolsConfig } from '@/lib/config/tools';
import { preloadParsers } from '@/lib/upload/parse-file';
import { cn } from '@/lib/utils/cn';

interface FileDropzoneProps {
  onFile: (file: File) => void;
  busy: boolean;
  /** Id of the error message that describes this control, when there is one. */
  describedBy?: string | undefined;
}

/**
 * A large drop target with a real button. The parser chunks are fetched when the visitor hovers
 * or focuses the control, so choosing a file feels immediate.
 */
export function FileDropzone({ onFile, busy, describedBy }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!busy) pick(event.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onPointerEnter={preloadParsers}
      className={cn(
        'relative flex flex-col items-center gap-5 rounded-sm border-2 border-dashed px-6 py-12 text-center transition-colors duration-150 md:py-16',
        dragging ? 'border-primary bg-primary-tint' : 'border-line-strong bg-surface-alt',
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-sm border border-line-strong bg-surface text-primary"
      >
        {busy ? (
          <LoaderCircle className="size-7 animate-spin motion-reduce:animate-none" />
        ) : (
          <FileSpreadsheet className="size-7" />
        )}
      </span>
      <div>
        <p className="t-title">{busy ? 'Checking your file…' : 'Drop a CSV or XLSX file here'}</p>
        <p className="mt-2 text-ink-muted">
          {busy
            ? 'Reading the headings and rows in your browser.'
            : 'or choose one from your device. Nothing is sent yet.'}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={toolsConfig.upload.extensions.join(',')}
        aria-label="Customs file"
        aria-describedby={describedBy}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => pick(event.target.files)}
      />
      <Button
        type="button"
        size="lg"
        disabled={busy}
        aria-describedby={describedBy}
        leftSection={<Upload aria-hidden="true" className="size-5" />}
        onFocus={preloadParsers}
        onClick={() => inputRef.current?.click()}
      >
        Choose a file
      </Button>
      <p role="status" aria-live="polite" className="sr-only">
        {busy ? 'Checking your file' : ''}
      </p>
    </div>
  );
}
