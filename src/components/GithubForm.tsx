import { useState } from 'react'

interface GithubFormProps {
  onSubmit: (username: string) => void
  loading?: boolean
}

export function GithubForm({ onSubmit, loading = false }: GithubFormProps) {
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onSubmit(username.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-3xl">
      <input
        type="text"
        placeholder="Enter your github username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
        className="flex-1 min-w-0 px-6 py-5 text-xl border border-slate-300 dark:border-slate-600 rounded-2xl backdrop-blur-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
      />
      <button
        type="submit"
        disabled={loading}
        aria-label="Generate README"
        className="px-10 py-5 backdrop-blur-lg bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-light rounded-2xl border border-slate-300 dark:border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {loading ? '...' : <i className="fas fa-arrow-right text-xl"></i>}
      </button>
    </form>
  )
}
