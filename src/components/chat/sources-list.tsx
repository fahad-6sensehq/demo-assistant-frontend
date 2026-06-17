'use client';

import type { MessageSource } from '@/lib/types';
import { CitationChip } from '@/components/chat/citation-chip';

interface SourcesListProps {
  sources: MessageSource[];
  onCitationClick: (fileId: string) => void;
}

export function SourcesList({ sources, onCitationClick }: SourcesListProps) {
  if (!sources.length) return null;

  return (
    <div className="mt-3 border-t border-zinc-800 pt-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <CitationChip
            key={source.index}
            fileId={source.fileId}
            sourceIndex={source.index}
            fileName={source.fileName}
            onClick={onCitationClick}
          />
        ))}
      </div>
    </div>
  );
}
