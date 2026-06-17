'use client';

interface CitationChipProps {
  fileId: string;
  sourceIndex: number;
  fileName?: string;
  onClick: (fileId: string) => void;
}

export function CitationChip({
  fileId,
  sourceIndex,
  fileName,
  onClick,
}: CitationChipProps) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick(fileId);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(fileId);
        }
      }}
      title={fileName}
      className="mx-0.5 inline-flex cursor-pointer items-center rounded px-0.5 align-baseline text-xs font-medium text-emerald-400 transition hover:bg-emerald-950/40 hover:text-emerald-300"
    >
      [{sourceIndex}]
    </span>
  );
}
