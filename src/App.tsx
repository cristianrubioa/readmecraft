import { useState } from 'react'
import { GithubForm } from './components/GithubForm'
import { SectionEditor } from './components/SectionEditor'
import { MarkdownPreview } from './components/MarkdownPreview'
import { CopyButton } from './components/CopyButton'
import { useGithubUser } from './hooks/useGithubUser'
import { useGithubRepos } from './hooks/useGithubRepos'
import { generateMarkdown } from './utils/generateMarkdown'
import { TEMPLATE_CONFIGS } from './utils/templateConfig'
import { styles, TEMPLATES_ORDER, PROJECTS_PER_PAGE } from './utils/constants'
import type {
  TemplateName,
  SectionState,
} from './types/github'
import { standardTemplate } from './templates/standard'

function App() {
  const [searchUsername, setSearchUsername] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>('standard')
  const [sections, setSections] = useState<SectionState>(
    standardTemplate.sections
  )
  const [selectedRepos, setSelectedRepos] = useState<number[]>([])
  const [projectsPage, setProjectsPage] = useState(0)

  const { user, loading: userLoading, error: userError } =
    useGithubUser(searchUsername)
  const { repos, loading: reposLoading, error: reposError } =
    useGithubRepos(searchUsername)

  const loading = userLoading || reposLoading
  const error = userError || reposError

  const handleSearch = (username: string) => {
    setSearchUsername(username)
    setSelectedRepos([])
  }

  const handleTemplateChange = (template: TemplateName) => {
    setSelectedTemplate(template)
    setSections(TEMPLATE_CONFIGS[template])
    
    // Auto-select first 5 repos if detailed and projects enabled
    if (template === 'detailed' && repos.length > 0) {
      const firstFive = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .map((r) => r.id)
      setSelectedRepos(firstFive)
    } else {
      setSelectedRepos([])
    }
  }

  const handleSectionChange = (section: keyof SectionState, enabled: boolean) => {
    setSections((prev) => ({
      ...prev,
      [section]: enabled,
    }))
  }

  const handleRepoToggle = (repoId: number) => {
    setSelectedRepos((prev) =>
      prev.includes(repoId)
        ? prev.filter((id) => id !== repoId)
        : [...prev, repoId]
    )
  }

  const markdown =
    user && repos
      ? generateMarkdown(user, repos, sections, selectedRepos)
      : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Header - Glassmorphism */}
      <header className="backdrop-blur-lg bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-light tracking-tight">
              ReadmeCraft
            </h1>
          </div>
        </div>
      </header>

      <main className={`w-full flex-1 flex flex-col items-center justify-start px-6 ${!user ? 'pt-40' : 'pt-8'}`}>
        {!user ? (
          <div className="text-center space-y-8 w-full">
            <p className="text-2xl font-light text-slate-700 dark:text-slate-300">
              Generate your GitHub profile README
            </p>
            <div className="flex justify-center w-full">
              <GithubForm onSubmit={handleSearch} loading={loading} />
            </div>
            {error && (
              <div className="max-w-lg mx-auto p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 text-center text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl w-full mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Controls - 2 cols */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Card - Glassmorphism */}
              <div className="backdrop-blur-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-28 h-28 rounded-full mx-auto mb-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg"
                />
                <h2 className="text-3xl font-light mb-2">{user.name || user.login}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  @{user.login}
                </p>
                {user.bio && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    {user.bio}
                  </p>
                )}
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  {user.location && <div>📍 {user.location}</div>}
                  {user.company && <div>🏢 {user.company}</div>}
                </div>
              </div>

              {/* Template Selector */}
              <div className={styles.card + ' p-6'}>
                <p className={styles.text.base + ' mb-4'}>
                  Template
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {TEMPLATES_ORDER.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTemplateChange(t as TemplateName)}
                      className={`px-3 py-3 rounded-2xl text-xs font-light transition-all ${
                        selectedTemplate === t
                          ? 'bg-transparent text-slate-900 dark:text-slate-100 border-2 border-slate-400 dark:border-slate-500'
                          : 'bg-transparent text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Editor */}
              <div className={styles.card + ' p-6'}>
                <p className={styles.text.sm + ' mb-4'}>
                  Sections
                </p>
                <SectionEditor
                  sections={sections}
                  onSectionChange={handleSectionChange}
                />
              </div>

              {/* Featured Projects */}
              {repos.length > 0 && (
                <div className={styles.card + ' p-6'}>
                  <p className={styles.text.sm + ' mb-4'}>
                    Featured Projects
                  </p>
                  <div className="space-y-2">
                    {repos
                      .sort((a, b) => b.stargazers_count - a.stargazers_count)
                      .slice(projectsPage * PROJECTS_PER_PAGE, (projectsPage + 1) * PROJECTS_PER_PAGE)
                      .map((repo) => (
                        <label
                          key={repo.id}
                          className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRepos.includes(repo.id)}
                            onChange={() => handleRepoToggle(repo.id)}
                            className="w-5 h-5 rounded-md"
                          />
                          <span className="text-sm font-light flex-1 truncate text-slate-700 dark:text-slate-300">
                            {repo.name}
                          </span>
                          {repo.stargazers_count > 0 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              ⭐{repo.stargazers_count}
                            </span>
                          )}
                        </label>
                      ))}
                  </div>
                  {Math.ceil(repos.length / PROJECTS_PER_PAGE) > 1 && (
                    <div className="flex gap-2 mt-4 justify-center">
                      <button
                        onClick={() => setProjectsPage(Math.max(0, projectsPage - 1))}
                        disabled={projectsPage === 0}
                        className="px-3 py-2 rounded-lg text-xs font-light bg-slate-100 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <span className="text-xs text-slate-500 dark:text-slate-400 self-center">
                        {projectsPage + 1} / {Math.ceil(repos.length / PROJECTS_PER_PAGE)}
                      </span>
                      <button
                        onClick={() => setProjectsPage(Math.min(Math.ceil(repos.length / 7) - 1, projectsPage + 1))}
                        disabled={projectsPage >= Math.ceil(repos.length / PROJECTS_PER_PAGE) - 1}
                        className="px-3 py-2 rounded-lg text-xs font-light bg-slate-100 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Preview - 3 cols */}
            <div className="lg:col-span-3">
              <div className="backdrop-blur-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden flex flex-col h-full shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-light text-slate-900 dark:text-slate-100">
                    Preview
                  </h3>
                  <CopyButton text={markdown} label="Copy" />
                </div>
                <div className="overflow-auto flex-1 bg-slate-50 dark:bg-slate-900">
                  <MarkdownPreview content={markdown} />
                </div>
              </div>
            </div>
           </div>
            </div>
        )}
      </main>

      {/* Footer - Minimal */}
      <footer className="backdrop-blur-lg bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-light">
          <p>Created with <span className="text-red-500">❤️</span> by <a href="https://github.com/cristianrubioa" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">@cristianrubioa</a> for developers</p>
        </div>
      </footer>
    </div>
  )
}

export default App
