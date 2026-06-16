'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageContentProps {
  content: string;
  isUser?: boolean;
}

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-zinc-700 bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-zinc-700 bg-[#2a2a2a] px-3 py-1.5">
        <span className="text-xs font-medium text-zinc-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md px-2 py-1 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-200"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function MessageContent({ content, isUser = false }: MessageContentProps) {
  const components = useMemo(
    () => ({
      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
          {children}
        </ol>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li className="leading-relaxed">{children}</li>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="mb-3 border-l-4 border-zinc-600 pl-4 text-zinc-300 italic last:mb-0">
          {children}
        </blockquote>
      ),
      a: ({
        href,
        children,
      }: {
        href?: string;
        children?: React.ReactNode;
      }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
        >
          {children}
        </a>
      ),
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1 className="mb-3 text-xl font-semibold last:mb-0">{children}</h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2 className="mb-3 text-lg font-semibold last:mb-0">{children}</h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3 className="mb-2 text-base font-semibold last:mb-0">{children}</h3>
      ),
      table: ({ children }: { children?: React.ReactNode }) => (
        <div className="mb-3 overflow-x-auto last:mb-0">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      th: ({ children }: { children?: React.ReactNode }) => (
        <th className="border border-zinc-700 bg-zinc-800 px-3 py-2 text-left font-medium">
          {children}
        </th>
      ),
      td: ({ children }: { children?: React.ReactNode }) => (
        <td className="border border-zinc-700 px-3 py-2">{children}</td>
      ),
      hr: () => <hr className="my-4 border-zinc-700" />,
      code: ({
        className,
        children,
      }: {
        className?: string;
        children?: React.ReactNode;
      }) => {
        const match = /language-(\w+)/.exec(className ?? '');
        const code = String(children).replace(/\n$/, '');

        if (match) {
          return <CodeBlock language={match[1]} code={code} />;
        }

        if (code.includes('\n')) {
          return <CodeBlock language="text" code={code} />;
        }

        return (
          <code
            className={`rounded px-1.5 py-0.5 font-mono text-[0.9em] ${
              isUser ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-800 text-emerald-300'
            }`}
          >
            {children}
          </code>
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    }),
    [isUser],
  );

  return (
    <div className="markdown-content text-[15px] text-zinc-100">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
