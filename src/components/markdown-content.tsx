"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="font-display text-[42px] font-light leading-[1.1] mb-6">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-display text-2xl font-normal mt-12 mb-4">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-display text-xl font-medium mt-8 mb-3">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-[1.7]">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 pl-6 list-disc space-y-1 text-text">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 pl-6 list-decimal space-y-1 text-text">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-[1.7]">{children}</li>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-accent border-b border-border hover:border-accent transition-colors"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead>{children}</thead>,
        th: ({ children }) => (
          <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted px-4 py-3 border-b-2 border-border">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 border-b border-border align-top">
            {children}
          </td>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent pl-4 my-4 text-muted italic">
            {children}
          </blockquote>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-text">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        hr: () => <hr className="border-t border-border my-8" />,
      }}
    />
  );
}
