'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content safely.
 *
 * SECURITY: This component handles untrusted content.
 * It uses rehype-sanitize to strip dangerous HTML:
 * - <script> tags
 * - Event handlers (onclick, onerror, etc.)
 * - javascript: URLs
 *
 * The sanitization happens on the AST level, before React rendering.
 */
export function SafeMarkdown({ content, className = '' }: SafeMarkdownProps) {
  // Custom components for better styling
  const components: Components = {
    pre: ({ children, ...props }) => (
      <pre
        className="bg-gray-800 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm"
        {...props}
      >
        {children}
      </pre>
    ),
    code: ({ children, className, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside space-y-1" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside space-y-1" {...props}>
        {children}
      </ol>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-lg font-semibold text-gray-900 mb-2" {...props}>
        {children}
      </h2>
    ),
    p: ({ children, ...props }) => (
      <p className="text-gray-700 mb-2" {...props}>
        {children}
      </p>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-gray-900" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeSanitize,
            {
              ...defaultSchema,
              // Ensure no dangerous attributes
              attributes: {
                ...defaultSchema.attributes,
                '*': ['className'],
                a: ['href', 'title'],
                img: ['src', 'alt', 'title'],
                code: ['className'],
              },
            },
          ],
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
