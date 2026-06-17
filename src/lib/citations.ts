import type { MessageSource } from './types';

export const CITATION_REGEX = /\[\[cite:(\d+)\]\]/g;

export interface ParsedCitation {
  sourceIndex: number;
  start: number;
  end: number;
}

export function parseCitations(content: string): ParsedCitation[] {
  const citations: ParsedCitation[] = [];
  const regex = new RegExp(CITATION_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    citations.push({
      sourceIndex: Number(match[1]),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return citations;
}

export function hasInlineCitations(content: string): boolean {
  return /\[\[cite:\d+\]\]/.test(content);
}

export function findSourceByIndex(
  sources: MessageSource[] | undefined,
  index: number,
): MessageSource | undefined {
  return sources?.find((source) => source.index === index);
}

export function separateAdjacentCitations(content: string): string {
  return content.replace(
    /(\[\[cite:\d+\]\])(?=\[\[cite:\d+\]\])/g,
    '$1, ',
  );
}

export function replaceCitationsForMarkdown(
  content: string,
  sources?: MessageSource[],
): string {
  const withSeparators = separateAdjacentCitations(content);

  return withSeparators.replace(CITATION_REGEX, (_match, indexStr) => {
    const index = Number(indexStr);
    const source = findSourceByIndex(sources, index);

    if (!source) {
      return `[${index}](cite:unknown)`;
    }

    return `[${index}](cite:${source.fileId})`;
  });
}
