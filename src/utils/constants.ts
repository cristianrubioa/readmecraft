// Reusable Tailwind class groups
export const styles = {
  card: 'backdrop-blur-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50',
  buttonTransparent: 'bg-transparent text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all',
  buttonDisabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  input: 'border border-slate-300 dark:border-slate-600 rounded-2xl backdrop-blur-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600',
  text: {
    sm: 'text-sm font-light text-slate-700 dark:text-slate-300',
    base: 'text-base font-light text-slate-700 dark:text-slate-300',
    lg: 'text-lg font-light text-slate-500 dark:text-slate-400',
  },
}

export const TEMPLATES_ORDER = ['minimal', 'standard', 'detailed'] as const
export const PROJECTS_PER_PAGE = 7
export const MAX_SELECTED_REPOS = 15
export const CLIPBOARD_TIMEOUT = 2000
