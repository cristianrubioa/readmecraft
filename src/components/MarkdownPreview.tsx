import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="p-8 text-sm leading-relaxed text-slate-900 dark:text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-3xl font-light mb-6 mt-8 text-slate-900 dark:text-slate-100 tracking-tight"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-2xl font-light mb-4 mt-8 text-slate-900 dark:text-slate-100 tracking-tight border-b border-slate-200 dark:border-slate-700 pb-3"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-lg font-light mb-3 mt-6 text-slate-900 dark:text-slate-100"
              {...props}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              className="text-base font-light mb-2 mt-4 text-slate-900 dark:text-slate-100"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p
              className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-inside mb-4 ml-1 text-slate-700 dark:text-slate-300"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside mb-4 ml-1 text-slate-700 dark:text-slate-300"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li
              className="mb-2 text-slate-700 dark:text-slate-300"
              {...props}
            />
          ),
          code: ({
            className,
            children,
          }: {
            className?: string
            children?: React.ReactNode
          }) => {
            const isInline = !className?.includes('language-')
            return isInline ? (
              <code className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-mono text-slate-800 dark:text-slate-200">
                {children}
              </code>
            ) : (
              <code className="block bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl mb-4 overflow-x-auto text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                {children}
              </code>
            )
          },
          pre: ({ ...props }) => (
            <pre
              className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl mb-4 overflow-x-auto border border-slate-300 dark:border-slate-600"
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 py-2 mb-4 text-slate-600 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-700 py-3 px-4 rounded-r-lg"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto mb-4 rounded-2xl border border-slate-300 dark:border-slate-600">
              <table className="min-w-full" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-slate-200 dark:bg-slate-600" {...props} />
          ),
          th: ({ ...props }) => (
            <th
              className="border-b border-slate-300 dark:border-slate-600 px-4 py-2 text-left font-light text-slate-900 dark:text-slate-100"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="border-b border-slate-300 dark:border-slate-600 px-4 py-2 text-slate-700 dark:text-slate-300"
              {...props}
            />
          ),
        }}
      >
        {content ||
          '# Your README preview will appear here\n\nSearch for a GitHub user to get started.'}
      </ReactMarkdown>
    </div>
  )
}
