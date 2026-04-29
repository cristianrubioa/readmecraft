import { useState } from 'react'

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`px-5 py-2.5 rounded-2xl text-sm font-light transition-all backdrop-blur-lg ${
        copied
          ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-300'
          : 'bg-transparent border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
      }`}
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}
